// Series for a region, straight from NASA data:
// GISTEMP cells (area-weighted), NASA POWER monthly and daily MERRA-2 values (point, grid mean
// or a country's territory), monthly grids from the data pipeline, or the NASA Ozone Watch
// Antarctic ozone hole table.

import { inCountry, loadCountries, samplePoints, type GeoCountry } from '../data/geo';
import { loadGistemp } from '../data/gistemp';
import type { SeriesSource, Text, Variable } from '../data/variables';
import type { Point } from './stats';

export type Box = { s: number; w: number; n: number; e: number };

export type Region =
  /** `city`: a city of the Cities layer (population and built-up area, Natural Earth). */
  | { kind: 'point'; lat: number; lon: number; radiusKm: number; name?: Text; city?: { pop: number; areaKm2: number; code: string } }
  | { kind: 'box'; s: number; w: number; n: number; e: number; name: Text }
  /** A whole country inside its borders (Natural Earth). lat/lon: where its name goes. */
  | { kind: 'country'; code: string; lat: number; lon: number; box: Box; name?: Text };

export type Season = 'year' | 'djf' | 'mam' | 'jja' | 'son';

/** Twelve monthly values of one year, NaN where a month is missing. */
export type MonthlyRow = { year: number; values: number[] };

/** A value in time: x is a fractional year, season the month (0-11). */
export type TimePoint = Point & { season: number };

export type Series = {
  points: Point[];
  /** How the numbers were made, for the method note under the chart. */
  method: Text;
  /** Monthly values for the seasonal chart, when the source has them. */
  monthly?: MonthlyRow[];
  /** Unit of the monthly values when it differs from the yearly one (totals: per month). */
  monthUnit?: Text;
};

export type DailySeries = {
  points: TimePoint[];
  method: Text;
  /** Unit of the daily values when it differs from the yearly one. */
  unit?: Text;
};

const DEG = Math.PI / 180;
const EARTH_KM = 6371;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a =
    Math.sin(((lat2 - lat1) * DEG) / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(((lon2 - lon1) * DEG) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function inBox(lat: number, lon: number, r: Box): boolean {
  if (lat < r.s || lat > r.n) return false;
  return r.w <= r.e ? lon >= r.w && lon <= r.e : lon >= r.w || lon <= r.e;
}

/** Bounding box of a region, for camera moves, events and POWER requests. */
export function regionBox(region: Region): Box {
  if (region.kind === 'box') return region;
  if (region.kind === 'country') return region.box;
  const dLat = region.radiusKm / 111;
  const dLon = region.radiusKm / (111 * Math.max(0.15, Math.cos(region.lat * DEG)));
  return { s: region.lat - dLat, n: region.lat + dLat, w: region.lon - dLon, e: region.lon + dLon };
}

export function regionCentre(region: Region): { lat: number; lon: number } {
  if (region.kind === 'point' || region.kind === 'country') return { lat: region.lat, lon: region.lon };
  const lon = region.w <= region.e ? (region.w + region.e) / 2 : ((region.w + region.e + 360) / 2) % 360;
  return { lat: (region.s + region.n) / 2, lon: lon > 180 ? lon - 360 : lon };
}

/** The region from a Natural Earth country. */
export function countryRegion(c: GeoCountry): Extract<Region, { kind: 'country' }> {
  const [s, w, n, e] = c.box;
  return { kind: 'country', code: c.code, lat: c.label[0], lon: c.label[1], box: { s, w, n, e }, name: { uk: c.uk, en: c.en } };
}

/** Which places belong to a region: a test, and where to look when no grid cell passes it. */
type Mask = { test: (lat: number, lon: number) => boolean; near: { lat: number; lon: number }; country: GeoCountry | null };

async function regionMask(region: Region): Promise<Mask> {
  if (region.kind === 'country') {
    const c = (await loadCountries()).get(region.code);
    if (!c) throw new Error(`unknown country ${region.code}`);
    return { test: (lat, lon) => inCountry(c, lat, lon), near: { lat: c.label[0], lon: c.label[1] }, country: c };
  }
  if (region.kind === 'box') return { test: (lat, lon) => inBox(lat, lon, region), near: regionCentre(region), country: null };
  return { test: (lat, lon) => distanceKm(region.lat, region.lon, lat, lon) <= region.radiusKm, near: region, country: null };
}

/** Runs promise-making tasks at most `limit` at a time (NASA POWER asks clients not to flood it). */
async function pool<T>(tasks: (() => Promise<T>)[], limit = 4): Promise<T[]> {
  const out: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      out[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return out;
}

// ---------- GISTEMP ----------

async function gistempSeries(region: Region): Promise<Series> {
  const [{ meta, data }, mask] = await Promise.all([loadGistemp(), regionMask(region)]);
  const cells = meta.nlat * meta.nlon;
  const chosen: { index: number; weight: number }[] = [];
  let nearest = { index: 0, d: Infinity, weight: 1 };
  for (let row = 0; row < meta.nlat; row++) {
    const lat = meta.lat0 + row * meta.step;
    const w = Math.cos(lat * DEG);
    for (let col = 0; col < meta.nlon; col++) {
      const lon = meta.lon0 + col * meta.step;
      const index = row * meta.nlon + col;
      if (mask.test(lat, lon)) chosen.push({ index, weight: w });
      const d = distanceKm(mask.near.lat, mask.near.lon, lat, lon);
      if (d < nearest.d) nearest = { index, d, weight: w };
    }
  }
  if (!chosen.length) chosen.push({ index: nearest.index, weight: nearest.weight });
  const totalWeight = chosen.reduce((a, c) => a + c.weight, 0);

  const points: Point[] = [];
  for (let y = meta.startYear; y <= meta.endYear; y++) {
    const offset = (y - meta.startYear) * cells;
    let sum = 0;
    let weight = 0;
    for (const c of chosen) {
      const v = data[offset + c.index];
      if (v !== meta.missing) {
        sum += v * meta.scale * c.weight;
        weight += c.weight;
      }
    }
    // A year counts only when cells covering at least half the region's area have data.
    points.push({ x: y, y: weight >= totalWeight * 0.5 ? sum / weight : NaN });
  }
  const n = chosen.length;
  const where = mask.country ? { uk: ' у межах країни', en: ' inside the country' } : { uk: '', en: '' };
  return {
    points,
    method: {
      uk: `Середнє за площею з ${n} ${n === 1 ? 'клітинки' : 'клітинок'} 2°×2° GISTEMP${where.uk} (вага клітинки — косинус широти, бо ближче до полюсів клітинки менші); рік рахується, якщо дані є для половини площі регіону.`,
      en: `Area-weighted mean of ${n} GISTEMP 2°×2° cell${n === 1 ? '' : 's'}${where.en} (each weighted by the cosine of its latitude, as cells shrink towards the poles); a year counts when half the region's area has data.`,
    },
  };
}

// ---------- NASA POWER ----------

const POWER = 'https://power.larc.nasa.gov/api/temporal';
export const POWER_START = 1981;
const POWER_END = 2025;

type Monthly = Map<string, number>; // "YYYYMM" -> value

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function powerJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`NASA POWER ${response.status}`);
  return response.json();
}

/** Monthly values of several parameters at one point, 1981 to the last full year. */
export async function powerPointMonthly(parameters: string[], lat: number, lon: number, signal?: AbortSignal): Promise<Record<string, Monthly>> {
  const url = `${POWER}/monthly/point?parameters=${parameters.join(',')}&community=AG&latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&start=${POWER_START}&end=${POWER_END}&format=JSON`;
  const json = (await powerJson(url, signal)) as { properties: { parameter: Record<string, Record<string, number>> } };
  const out: Record<string, Monthly> = {};
  for (const parameter of parameters) {
    const m: Monthly = new Map();
    for (const [k, v] of Object.entries(json.properties.parameter[parameter] ?? {})) {
      if (!k.endsWith('13') && v > -900) m.set(k, v);
    }
    out[parameter] = m;
  }
  return out;
}

async function powerPoint(parameter: string, lat: number, lon: number): Promise<Monthly> {
  return (await powerPointMonthly([parameter], lat, lon))[parameter];
}

type PowerFeature = { geometry: { coordinates: [number, number] }; properties: { parameter: Record<string, Record<string, number>> } };

/**
 * Area-weighted mean of the POWER grid inside a box (split into requests of at most 10° a side),
 * keeping only grid points that pass `keep` (a country's borders); with none inside, the grid
 * point nearest to `near`.
 */
async function powerBox(parameter: string, box: Box, keep?: (lat: number, lon: number) => boolean, near?: { lat: number; lon: number }): Promise<{ monthly: Monthly; count: number }> {
  const lonSpan = box.e >= box.w ? box.e - box.w : box.e + 360 - box.w;
  const latParts = Math.max(1, Math.ceil((box.n - box.s) / 10));
  const lonParts = Math.max(1, Math.ceil(lonSpan / 10));
  const requests: (() => Promise<unknown>)[] = [];
  for (let i = 0; i < latParts; i++) {
    for (let j = 0; j < lonParts; j++) {
      let s = box.s + ((box.n - box.s) * i) / latParts;
      let n = box.s + ((box.n - box.s) * (i + 1)) / latParts;
      let w = box.w + (lonSpan * j) / lonParts;
      let e = box.w + (lonSpan * (j + 1)) / lonParts;
      if (w > 180) w -= 360;
      if (e > 180) e -= 360;
      // POWER wants at least 2° in each direction.
      if (n - s < 2) [s, n] = [(s + n) / 2 - 1, (s + n) / 2 + 1];
      if (e - w < 2) [w, e] = [(w + e) / 2 - 1, (w + e) / 2 + 1];
      const url = `${POWER}/monthly/regional?parameters=${parameter}&community=AG&latitude-min=${s.toFixed(2)}&latitude-max=${n.toFixed(2)}&longitude-min=${w.toFixed(2)}&longitude-max=${e.toFixed(2)}&start=${POWER_START}&end=${POWER_END}&format=JSON`;
      requests.push(() => powerJson(url));
    }
  }
  const features = ((await pool(requests)) as { features: PowerFeature[] }[]).flatMap((j) => j.features);
  let chosen = keep ? features.filter((f) => keep(f.geometry.coordinates[1], f.geometry.coordinates[0])) : features;
  if (!chosen.length && near && features.length) {
    const d = (f: PowerFeature) => distanceKm(near.lat, near.lon, f.geometry.coordinates[1], f.geometry.coordinates[0]);
    chosen = [features.reduce((best, f) => (d(f) < d(best) ? f : best))];
  }
  const sums = new Map<string, { sum: number; weight: number }>();
  for (const f of chosen) {
    const w = Math.cos(f.geometry.coordinates[1] * DEG);
    for (const [k, v] of Object.entries(f.properties.parameter[parameter])) {
      if (k.endsWith('13') || v <= -900) continue;
      const acc = sums.get(k) ?? { sum: 0, weight: 0 };
      acc.sum += v * w;
      acc.weight += w;
      sums.set(k, acc);
    }
  }
  const out: Monthly = new Map();
  sums.forEach((acc, k) => out.set(k, acc.sum / acc.weight));
  return { monthly: out, count: chosen.length };
}

/** Mean of monthly values over several points (equal-area samples need no weights). */
function meanMonthly(list: Monthly[]): Monthly {
  const sums = new Map<string, { sum: number; count: number }>();
  for (const m of list) {
    m.forEach((v, k) => {
      const acc = sums.get(k) ?? { sum: 0, count: 0 };
      acc.sum += v;
      acc.count++;
      sums.set(k, acc);
    });
  }
  const out: Monthly = new Map();
  // A month counts when at least half the points have it.
  sums.forEach((acc, k) => acc.count >= list.length / 2 && out.set(k, acc.sum / acc.count));
  return out;
}

/** Sample points for a large country: the grid requests would be too many. */
const COUNTRY_SAMPLES = 16;

function tilesFor(box: Box): number {
  const lonSpan = box.e >= box.w ? box.e - box.w : box.e + 360 - box.w;
  return Math.max(1, Math.ceil((box.n - box.s) / 10)) * Math.max(1, Math.ceil(lonSpan / 10));
}

const SEASON_MONTHS: Record<Season, [number, number][]> = {
  // [month, year offset]: winter of year Y is December Y-1 plus January and February Y.
  year: Array.from({ length: 12 }, (_, i) => [i + 1, 0] as [number, number]),
  djf: [
    [12, -1],
    [1, 0],
    [2, 0],
  ],
  mam: [
    [3, 0],
    [4, 0],
    [5, 0],
  ],
  jja: [
    [6, 0],
    [7, 0],
    [8, 0],
  ],
  son: [
    [9, 0],
    [10, 0],
    [11, 0],
  ],
};

function aggregate(
  monthly: Monthly,
  season: Season,
  how: Extract<SeriesSource, { kind: 'power' }>['aggregate'],
  first = POWER_START,
  last = POWER_END,
): Point[] {
  const points: Point[] = [];
  for (let year = first; year <= last; year++) {
    let sum = 0;
    let complete = true;
    for (const [month, offset] of SEASON_MONTHS[season]) {
      const y = year + offset;
      const v = monthly.get(`${y}${String(month).padStart(2, '0')}`);
      if (v === undefined) {
        complete = false;
        break;
      }
      sum += how === 'total' ? v * daysInMonth(y, month) : v;
    }
    const count = SEASON_MONTHS[season].length;
    const value = !complete ? NaN : how === 'total' ? sum : how === 'percent' ? (sum / count) * 100 : sum / count;
    points.push({ x: year, y: value });
  }
  return points;
}

/** Monthly values in the units the site shows: totals per month, fractions in percent. */
function monthlyRows(monthly: Monthly, how: Extract<SeriesSource, { kind: 'power' }>['aggregate']): MonthlyRow[] {
  const rows: MonthlyRow[] = [];
  for (let year = POWER_START; year <= POWER_END; year++) {
    const values = Array.from({ length: 12 }, (_, i) => {
      const v = monthly.get(`${year}${String(i + 1).padStart(2, '0')}`);
      if (v === undefined) return NaN;
      return how === 'total' ? v * daysInMonth(year, i + 1) : how === 'percent' ? v * 100 : v;
    });
    rows.push({ year, values });
  }
  return rows;
}

async function powerSeries(source: Extract<SeriesSource, { kind: 'power' }>, region: Region, season: Season): Promise<Series> {
  const how = source.aggregate === 'total' ? { uk: 'сума', en: 'total' } : { uk: 'середнє', en: 'mean' };
  let monthly: Monthly;
  let method: Text;
  if (region.kind === 'country') {
    const mask = await regionMask(region);
    const c = mask.country!;
    if (tilesFor(region.box) <= 4) {
      const r = await powerBox(source.parameter, region.box, mask.test, mask.near);
      monthly = r.monthly;
      method = {
        uk: `Місячні значення MERRA-2 з NASA POWER: середнє за площею з ${r.count} точок сітки 0,5°×0,625° всередині кордонів країни (Natural Earth), ${how.uk} за сезон.`,
        en: `Monthly MERRA-2 values from NASA POWER: area-weighted mean of ${r.count} points of the 0.5°×0.625° grid inside the country's borders (Natural Earth), seasonal ${how.en}.`,
      };
    } else {
      const pts = samplePoints(c, COUNTRY_SAMPLES);
      monthly = meanMonthly(await pool(pts.map((p) => () => powerPoint(source.parameter, p.lat, p.lon))));
      method = {
        uk: `Країна велика, тому замість усієї сітки взято ${pts.length} точок, рівномірно розкиданих по її території (однакова площа на точку); для кожної — місячні значення MERRA-2 з NASA POWER, потім середнє; ${how.uk} за сезон.`,
        en: `The country is large, so instead of the whole grid ${pts.length} points spread evenly over its territory are used (equal area each); monthly MERRA-2 values from NASA POWER for each, then the mean; seasonal ${how.en}.`,
      };
    }
  } else {
    const usePoint = region.kind === 'point' && region.radiusKm < 100;
    monthly = usePoint ? await powerPoint(source.parameter, region.lat, region.lon) : (await powerBox(source.parameter, regionBox(region))).monthly;
    method = usePoint
      ? {
          uk: `Місячні значення MERRA-2 з NASA POWER для клітинки 0,5°×0,625°, ${how.uk} за сезон; рік рахується лише з усіма місяцями.`,
          en: `Monthly MERRA-2 values from NASA POWER for one 0.5°×0.625° cell, seasonal ${how.en}; a year counts only with every month present.`,
        }
      : {
          uk: `Місячні значення MERRA-2 з NASA POWER, середнє за площею по сітці 0,5°×0,625° у регіоні, ${how.uk} за сезон.`,
          en: `Monthly MERRA-2 values from NASA POWER, area-weighted over the 0.5°×0.625° grid in the region, seasonal ${how.en}.`,
        };
  }
  return {
    points: aggregate(monthly, season, source.aggregate),
    monthly: monthlyRows(monthly, source.aggregate),
    monthUnit: source.aggregate === 'total' ? { uk: 'мм за місяць', en: 'mm per month' } : undefined,
    method,
  };
}

// ---------- NASA POWER daily ----------

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Fractional year of a YYYYMMDD key: the middle of that day. */
export function dayToX(key: string): { x: number; month: number } {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6)) - 1;
  const day = Number(key.slice(6, 8));
  const start = Date.UTC(year, 0, 1);
  const length = Date.UTC(year + 1, 0, 1) - start;
  return { x: year + (Date.UTC(year, month, day) - start + 43_200_000) / length, month };
}

/** Daily values of several parameters at one point (YYYYMMDD -> value per parameter). */
export async function powerPointDaily(parameters: string[], lat: number, lon: number, from: number, to: number, signal?: AbortSignal): Promise<Record<string, Map<string, number>>> {
  // POWER's daily record ends a few days before today.
  const end = new Date(Math.min(Date.UTC(to, 11, 31), Date.now() - 3 * 86_400_000));
  const url = `${POWER}/daily/point?parameters=${parameters.join(',')}&community=AG&latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&start=${Math.max(POWER_START, from)}0101&end=${ymd(end)}&format=JSON`;
  const json = (await powerJson(url, signal)) as { properties: { parameter: Record<string, Record<string, number>> } };
  const out: Record<string, Map<string, number>> = {};
  for (const parameter of parameters) {
    const m = new Map<string, number>();
    for (const [k, v] of Object.entries(json.properties.parameter[parameter] ?? {})) if (v > -900) m.set(k, v);
    out[parameter] = m;
  }
  return out;
}

/** Where daily values are read for a region: one point, or a few spread over it. */
async function dailySpots(region: Region): Promise<{ lat: number; lon: number }[]> {
  if (region.kind === 'country') {
    const c = (await loadCountries()).get(region.code);
    return c ? samplePoints(c, 6) : [{ lat: region.lat, lon: region.lon }];
  }
  if (region.kind === 'point' && region.radiusKm < 100) return [region];
  const b = regionBox(region);
  const mask = await regionMask(region);
  const out: { lat: number; lon: number }[] = [];
  for (const fy of [0.2, 0.5, 0.8]) {
    for (const fx of [0.2, 0.5, 0.8]) {
      const lat = b.s + (b.n - b.s) * fy;
      const lon = b.w + (b.e - b.w) * fx;
      if (mask.test(lat, lon)) out.push({ lat, lon });
    }
  }
  return out.length ? out : [regionCentre(region)];
}

const dailyCache = new Map<string, Promise<DailySeries>>();

/** Daily NASA POWER values for a region over whole years `from`-`to` (from 1981). */
export function loadDaily(variable: Variable, region: Region, from: number, to: number): Promise<DailySeries> {
  const source = variable.series;
  if (source?.kind !== 'power') return Promise.reject(new Error('no daily values for this variable'));
  const key = `${variable.id}|${regionKey(region)}|${from}-${to}`;
  let p = dailyCache.get(key);
  if (!p) {
    p = (async () => {
      const spots = await dailySpots(region);
      const maps = await pool(spots.map((s) => () => powerPointDaily([source.parameter], s.lat, s.lon, from, to).then((r) => r[source.parameter])));
      const sums = new Map<string, { sum: number; count: number }>();
      for (const m of maps) {
        m.forEach((v, k) => {
          const acc = sums.get(k) ?? { sum: 0, count: 0 };
          acc.sum += v;
          acc.count++;
          sums.set(k, acc);
        });
      }
      const scale = source.aggregate === 'percent' ? 100 : 1;
      const points: TimePoint[] = [...sums.entries()]
        .filter(([, acc]) => acc.count >= maps.length / 2)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, acc]) => {
          const { x, month } = dayToX(k);
          return { x, y: (acc.sum / acc.count) * scale, season: month };
        });
      const n = spots.length;
      return {
        points,
        unit: source.aggregate === 'total' ? { uk: 'мм за добу', en: 'mm per day' } : undefined,
        method:
          n === 1
            ? {
                uk: 'Добові значення MERRA-2 з NASA POWER для однієї клітинки 0,5°×0,625°. Для перевірки тренду дні усереднено до місяців (щонайменше 20 днів у місяці) і застосовано сезонний тест Манна-Кендалла: сусідні дні надто схожі між собою, тож тест на сирих днях давав би хибну певність.',
                en: 'Daily MERRA-2 values from NASA POWER for one 0.5°×0.625° cell. For the trend test the days are averaged into months (at least 20 days each) and the seasonal Mann-Kendall test is applied: neighbouring days are too alike, so a test on raw days would claim false certainty.',
              }
            : {
                uk: `Добові значення MERRA-2 з NASA POWER, середнє з ${n} точок, рівномірно розкиданих по регіону. Для перевірки тренду дні усереднено до місяців (щонайменше 20 днів у місяці) і застосовано сезонний тест Манна-Кендалла: сусідні дні надто схожі між собою, тож тест на сирих днях давав би хибну певність.`,
                en: `Daily MERRA-2 values from NASA POWER, the mean of ${n} points spread over the region. For the trend test the days are averaged into months (at least 20 days each) and the seasonal Mann-Kendall test is applied: neighbouring days are too alike, so a test on raw days would claim false certainty.`,
              },
      };
    })();
    dailyCache.set(key, p);
    p.catch(() => dailyCache.delete(key));
  }
  return p;
}

/** Monthly means of daily values (a month needs at least 20 days), for the seasonal test. */
export function monthlyFromDaily(points: TimePoint[]): TimePoint[] {
  const acc = new Map<string, { sum: number; count: number; year: number; month: number }>();
  for (const p of points) {
    if (!Number.isFinite(p.y)) continue;
    const year = Math.floor(p.x);
    const key = `${year}-${p.season}`;
    const a = acc.get(key) ?? { sum: 0, count: 0, year, month: p.season };
    a.sum += p.y;
    a.count++;
    acc.set(key, a);
  }
  return [...acc.values()]
    .filter((a) => a.count >= 20)
    .map((a) => ({ x: a.year + (a.month + 0.5) / 12, y: a.sum / a.count, season: a.month }))
    .sort((a, b) => a.x - b.x);
}

/** Monthly rows as points in time (x = year + middle of the month). */
export function monthlyPoints(rows: MonthlyRow[]): TimePoint[] {
  const out: TimePoint[] = [];
  for (const r of rows) r.values.forEach((y, m) => out.push({ x: r.year + (m + 0.5) / 12, y, season: m }));
  return out;
}

// ---------- Monthly grids from the data pipeline (OMI NO2, MODIS, FIRMS) ----------

type GridMeta = {
  box: { s: number; n: number; w: number; e: number };
  step: number;
  rows: number;
  cols: number;
  start: string;
  months: number;
  scale: number;
  noData: number;
  minDays?: number;
  source: string;
};

const grids = new Map<string, Promise<{ meta: GridMeta; data: Int16Array }>>();

function loadGrid(file: string) {
  let p = grids.get(file);
  if (!p) {
    const base = `${import.meta.env.BASE_URL}data/${file}`;
    p = Promise.all([fetch(`${base}.json`), fetch(`${base}.bin`)]).then(async ([m, b]) => {
      if (!m.ok || !b.ok) throw new Error(`grid ${file}`);
      return { meta: (await m.json()) as GridMeta, data: new Int16Array(await b.arrayBuffer()) };
    });
    grids.set(file, p);
    p.catch(() => grids.delete(file));
  }
  return p;
}

/** The region lies outside the grid: the drawer says where the numbers exist instead. */
export class OutsideCoverage extends Error {
  readonly coverage: Text;
  constructor(coverage: Text) {
    super('outside coverage');
    this.coverage = coverage;
  }
}

async function gridSeries(source: Extract<SeriesSource, { kind: 'grid' }>, region: Region, season: Season): Promise<Series> {
  const [{ meta, data }, mask] = await Promise.all([loadGrid(source.file), regionMask(region)]);
  const cells: { index: number; weight: number }[] = [];
  let nearest = { index: -1, d: Infinity, weight: 1 };
  for (let row = 0; row < meta.rows; row++) {
    // Rows run north to south; cell centres.
    const lat = meta.box.n - (row + 0.5) * meta.step;
    const w = Math.cos(lat * DEG);
    for (let col = 0; col < meta.cols; col++) {
      const lon = meta.box.w + (col + 0.5) * meta.step;
      const index = row * meta.cols + col;
      if (mask.test(lat, lon)) cells.push({ index, weight: w });
      const d = distanceKm(mask.near.lat, mask.near.lon, lat, lon);
      if (d < nearest.d) nearest = { index, d, weight: w };
    }
  }
  // A place inside the grid uses its own cell; a place outside it has no numbers.
  if (!cells.length && nearest.index >= 0 && nearest.d <= meta.step * 111) cells.push({ index: nearest.index, weight: nearest.weight });
  if (!cells.length) throw new OutsideCoverage(source.coverage);

  const sum = source.combine === 'sum';
  const total = cells.reduce((a, c) => a + c.weight, 0);
  const per = meta.rows * meta.cols;
  const [y0, m0] = meta.start.split('-').map(Number);
  const monthly: Monthly = new Map();
  for (let i = 0; i < meta.months; i++) {
    let acc = 0;
    let weight = 0;
    for (const c of cells) {
      const v = data[i * per + c.index];
      if (v !== meta.noData) {
        acc += sum ? v : v * c.weight;
        weight += c.weight;
      }
    }
    // A month counts when cells covering half the region have data.
    if (weight >= total * 0.5) {
      const year = y0 + Math.floor((m0 - 1 + i) / 12);
      const month = ((m0 - 1 + i) % 12) + 1;
      monthly.set(`${year}${String(month).padStart(2, '0')}`, ((sum ? acc : acc / weight) * meta.scale) / source.unit);
    }
  }
  const lastYear = y0 + Math.floor((m0 - 1 + meta.months - 1) / 12);
  const rows: MonthlyRow[] = [];
  for (let year = y0; year <= lastYear; year++) {
    rows.push({ year, values: Array.from({ length: 12 }, (_, m) => monthly.get(`${year}${String(m + 1).padStart(2, '0')}`) ?? NaN) });
  }
  const n = cells.length;
  const cellsUk = `${n} ${n === 1 ? 'клітинці' : 'клітинках'} 0,25°`;
  const cellsEn = `${n} 0.25° cell${n === 1 ? '' : 's'}`;
  return {
    points: sum ? sumPoints(rows, season) : meanPoints(rows, season),
    monthly: rows,
    monthUnit: sum ? { uk: 'виявлень за місяць', en: 'detections per month' } : undefined,
    method: sum
      ? {
          uk: `Кількість виявлень NASA FIRMS (VIIRS 375 м) у ${cellsUk}, сума за місяці сезону.`,
          en: `Number of NASA FIRMS detections (VIIRS 375 m) in ${cellsEn}, summed over the months of the season.`,
        }
      : {
          uk: `${meta.source}. Середнє за площею по ${cellsUk}; місяць рахується, коли дані є для половини площі. Рік: середнє місячних відхилень від норми кожного місяця плюс середня норма, коли є щонайменше 9 місяців; сезон — лише з усіма трьома місяцями.`,
          en: `${meta.source}. Area-weighted mean over ${cellsEn}; a month counts when half the area has data. A year: the mean of each month's departure from that month's normal plus the mean normal, with at least 9 months; a season only with all three months.`,
        },
  };
}

const SEASON_INDEX: Record<Exclude<Season, 'year'>, [number, number][]> = {
  djf: [
    [11, -1],
    [0, 0],
    [1, 0],
  ],
  mam: [
    [2, 0],
    [3, 0],
    [4, 0],
  ],
  jja: [
    [5, 0],
    [6, 0],
    [7, 0],
  ],
  son: [
    [8, 0],
    [9, 0],
    [10, 0],
  ],
};

function valueAt(rows: MonthlyRow[], year: number, month: number): number {
  return rows.find((r) => r.year === year)?.values[month] ?? NaN;
}

/**
 * Yearly or seasonal means from monthly values. A whole year uses departures from each month's
 * normal (its mean over all years), so a missing winter month does not drag the year down or up;
 * it needs at least 9 months. A season needs all three months.
 */
function meanPoints(rows: MonthlyRow[], season: Season): Point[] {
  if (season === 'year') {
    const normal = Array.from({ length: 12 }, (_, m) => {
      const v = rows.map((r) => r.values[m]).filter(Number.isFinite);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
    });
    const level = normal.reduce((a, b) => a + b, 0) / 12;
    return rows.map((r) => {
      const dev = r.values.map((v, m) => v - normal[m]).filter(Number.isFinite);
      return { x: r.year, y: dev.length >= 9 && Number.isFinite(level) ? level + dev.reduce((a, b) => a + b, 0) / dev.length : NaN };
    });
  }
  return rows.map((r) => {
    const v = SEASON_INDEX[season].map(([m, off]) => valueAt(rows, r.year + off, m));
    return { x: r.year, y: v.every(Number.isFinite) ? v.reduce((a, b) => a + b, 0) / v.length : NaN };
  });
}

/** Yearly or seasonal totals of monthly counts; every month must be present. */
function sumPoints(rows: MonthlyRow[], season: Season): Point[] {
  return rows.map((r) => {
    const v = season === 'year' ? r.values : SEASON_INDEX[season].map(([m, off]) => valueAt(rows, r.year + off, m));
    return { x: r.year, y: v.every(Number.isFinite) ? v.reduce((a, b) => a + b, 0) : NaN };
  });
}

// ---------- Ozone Watch ----------

async function ozoneSeries(): Promise<Series> {
  const r = await fetch(`${import.meta.env.BASE_URL}data/ozone/antarctic.json`);
  if (!r.ok) throw new Error(`ozone ${r.status}`);
  const d = (await r.json()) as { years: number[]; area: (number | null)[] };
  const byYear = new Map(d.years.map((y, i) => [y, d.area[i]]));
  const points: Point[] = [];
  for (let y = d.years[0]; y <= d.years[d.years.length - 1]; y++) points.push({ x: y, y: byYear.get(y) ?? NaN });
  return {
    points,
    method: {
      uk: 'Середня площа озонової діри над Антарктидою з 7 вересня по 13 жовтня (NASA Ozone Watch). Від регіону не залежить.',
      en: 'Mean Antarctic ozone hole area from 7 September to 13 October (NASA Ozone Watch). Does not depend on the region.',
    },
  };
}

// ---------- Entry point ----------

const cache = new Map<string, Promise<Series>>();

function regionKey(region: Region): string {
  if (region.kind === 'country') return `c:${region.code}`;
  return region.kind === 'box'
    ? `box:${region.s},${region.w},${region.n},${region.e}`
    : `pt:${region.lat.toFixed(2)},${region.lon.toFixed(2)},${region.radiusKm}`;
}

export function loadSeries(variable: Variable, region: Region, season: Season): Promise<Series> {
  const source = variable.series;
  if (!source) return Promise.reject(new Error('no numeric series for this variable'));
  const key = `${variable.id}|${regionKey(region)}|${hasSeasons(variable) ? season : 'year'}`;
  let p = cache.get(key);
  if (!p) {
    p =
      source.kind === 'gistemp'
        ? gistempSeries(region)
        : source.kind === 'ozonehole'
          ? ozoneSeries()
          : source.kind === 'grid'
            ? gridSeries(source, region, season)
            : powerSeries(source, region, season);
    cache.set(key, p);
    p.catch(() => cache.delete(key));
  }
  return p;
}

/** Whether a variable's series depends on the season choice. */
export function hasSeasons(variable: Variable): boolean {
  return variable.series?.kind === 'power' || variable.series?.kind === 'grid';
}

/** Time resolutions a variable offers: every series has years; monthly sources months; POWER days. */
export function resolutionsFor(variable: Variable): ('year' | 'month' | 'day')[] {
  const k = variable.series?.kind;
  if (k === 'power') return ['year', 'month', 'day'];
  if (k === 'grid') return ['year', 'month'];
  return ['year'];
}
