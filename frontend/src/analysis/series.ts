// Yearly series for a region, straight from NASA data:
// GISTEMP cells (area-weighted), NASA POWER monthly MERRA-2 values (point or grid mean),
// or the NASA Ozone Watch Antarctic ozone hole table.

import { loadGistemp } from '../data/gistemp';
import type { SeriesSource, Text, Variable } from '../data/variables';
import type { Point } from './stats';

export type Region =
  | { kind: 'point'; lat: number; lon: number; radiusKm: number; name?: Text }
  | { kind: 'box'; s: number; w: number; n: number; e: number; name: Text };

export type Season = 'year' | 'djf' | 'mam' | 'jja' | 'son';

/** Twelve monthly values of one year, NaN where a month is missing. */
export type MonthlyRow = { year: number; values: number[] };

export type Series = {
  points: Point[];
  /** How the numbers were made, for the method note under the chart. */
  method: Text;
  /** Monthly values for the seasonal chart, when the source has them. */
  monthly?: MonthlyRow[];
  /** Unit of the monthly values when it differs from the yearly one (totals: per month). */
  monthUnit?: Text;
};

const DEG = Math.PI / 180;
const EARTH_KM = 6371;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a =
    Math.sin(((lat2 - lat1) * DEG) / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(((lon2 - lon1) * DEG) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function inBox(lat: number, lon: number, r: Extract<Region, { kind: 'box' }>): boolean {
  if (lat < r.s || lat > r.n) return false;
  return r.w <= r.e ? lon >= r.w && lon <= r.e : lon >= r.w || lon <= r.e;
}

/** Centre and bounding box of a region, for camera moves and POWER requests. */
export function regionBox(region: Region): { s: number; w: number; n: number; e: number } {
  if (region.kind === 'box') return region;
  const dLat = region.radiusKm / 111;
  const dLon = region.radiusKm / (111 * Math.max(0.15, Math.cos(region.lat * DEG)));
  return { s: region.lat - dLat, n: region.lat + dLat, w: region.lon - dLon, e: region.lon + dLon };
}

export function regionCentre(region: Region): { lat: number; lon: number } {
  if (region.kind === 'point') return { lat: region.lat, lon: region.lon };
  const lon = region.w <= region.e ? (region.w + region.e) / 2 : ((region.w + region.e + 360) / 2) % 360;
  return { lat: (region.s + region.n) / 2, lon: lon > 180 ? lon - 360 : lon };
}

// ---------- GISTEMP ----------

async function gistempSeries(region: Region): Promise<Series> {
  const { meta, data } = await loadGistemp();
  const cells = meta.nlat * meta.nlon;
  const chosen: { index: number; weight: number }[] = [];
  let nearest = { index: 0, d: Infinity, weight: 1 };
  for (let row = 0; row < meta.nlat; row++) {
    const lat = meta.lat0 + row * meta.step;
    const w = Math.cos(lat * DEG);
    for (let col = 0; col < meta.nlon; col++) {
      const lon = meta.lon0 + col * meta.step;
      const index = row * meta.nlon + col;
      if (region.kind === 'box') {
        if (inBox(lat, lon, region)) chosen.push({ index, weight: w });
      } else {
        const d = distanceKm(region.lat, region.lon, lat, lon);
        if (d <= region.radiusKm) chosen.push({ index, weight: w });
        if (d < nearest.d) nearest = { index, d, weight: w };
      }
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
  return {
    points,
    method: {
      uk: `Середнє за площею з ${n} ${n === 1 ? 'клітинки' : 'клітинок'} 2°×2° GISTEMP; рік рахується, якщо дані є для половини площі регіону.`,
      en: `Area-weighted mean of ${n} GISTEMP 2°×2° cell${n === 1 ? '' : 's'}; a year counts when half the region's area has data.`,
    },
  };
}

// ---------- NASA POWER ----------

const POWER = 'https://power.larc.nasa.gov/api/temporal/monthly';
const POWER_START = 1981;
const POWER_END = 2025;

type Monthly = Map<string, number>; // "YYYYMM" -> value

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

async function powerJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NASA POWER ${response.status}`);
  return response.json();
}

async function powerPoint(parameter: string, lat: number, lon: number): Promise<Monthly> {
  const url = `${POWER}/point?parameters=${parameter}&community=AG&latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&start=${POWER_START}&end=${POWER_END}&format=JSON`;
  const json = (await powerJson(url)) as { properties: { parameter: Record<string, Record<string, number>> } };
  const out: Monthly = new Map();
  for (const [k, v] of Object.entries(json.properties.parameter[parameter])) {
    if (!k.endsWith('13') && v > -900) out.set(k, v);
  }
  return out;
}

type PowerFeature = { geometry: { coordinates: [number, number] }; properties: { parameter: Record<string, Record<string, number>> } };

/** Area-weighted mean of the POWER grid inside a box (split into requests of at most 10° a side). */
async function powerBox(parameter: string, box: { s: number; w: number; n: number; e: number }): Promise<Monthly> {
  const lonSpan = box.e >= box.w ? box.e - box.w : box.e + 360 - box.w;
  const latParts = Math.max(1, Math.ceil((box.n - box.s) / 10));
  const lonParts = Math.max(1, Math.ceil(lonSpan / 10));
  const requests: Promise<unknown>[] = [];
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
      const url = `${POWER}/regional?parameters=${parameter}&community=AG&latitude-min=${s.toFixed(2)}&latitude-max=${n.toFixed(2)}&longitude-min=${w.toFixed(2)}&longitude-max=${e.toFixed(2)}&start=${POWER_START}&end=${POWER_END}&format=JSON`;
      requests.push(powerJson(url));
    }
  }
  const sums = new Map<string, { sum: number; weight: number }>();
  for (const json of (await Promise.all(requests)) as { features: PowerFeature[] }[]) {
    for (const f of json.features) {
      const w = Math.cos(f.geometry.coordinates[1] * DEG);
      for (const [k, v] of Object.entries(f.properties.parameter[parameter])) {
        if (k.endsWith('13') || v <= -900) continue;
        const acc = sums.get(k) ?? { sum: 0, weight: 0 };
        acc.sum += v * w;
        acc.weight += w;
        sums.set(k, acc);
      }
    }
  }
  const out: Monthly = new Map();
  sums.forEach((acc, k) => out.set(k, acc.sum / acc.weight));
  return out;
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
  const usePoint = region.kind === 'point' && region.radiusKm < 100;
  const monthly = usePoint
    ? await powerPoint(source.parameter, region.lat, region.lon)
    : await powerBox(source.parameter, regionBox(region));
  const how = source.aggregate === 'total' ? { uk: 'сума', en: 'total' } : { uk: 'середнє', en: 'mean' };
  return {
    points: aggregate(monthly, season, source.aggregate),
    monthly: monthlyRows(monthly, source.aggregate),
    monthUnit: source.aggregate === 'total' ? { uk: 'мм за місяць', en: 'mm per month' } : undefined,
    method: usePoint
      ? {
          uk: `Місячні значення MERRA-2 з NASA POWER для клітинки 0,5°×0,625°, ${how.uk} за сезон; рік рахується лише з усіма місяцями.`,
          en: `Monthly MERRA-2 values from NASA POWER for one 0.5°×0.625° cell, seasonal ${how.en}; a year counts only with every month present.`,
        }
      : {
          uk: `Місячні значення MERRA-2 з NASA POWER, середнє за площею по сітці 0,5°×0,625° у регіоні, ${how.uk} за сезон.`,
          en: `Monthly MERRA-2 values from NASA POWER, area-weighted over the 0.5°×0.625° grid in the region, seasonal ${how.en}.`,
        },
  };
}

// ---------- Monthly grids from the data pipeline (OMI NO2) ----------

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
  const { meta, data } = await loadGrid(source.file);
  const cells: { index: number; weight: number }[] = [];
  let nearest = { index: -1, d: Infinity, weight: 1 };
  for (let row = 0; row < meta.rows; row++) {
    // Rows run north to south; cell centres.
    const lat = meta.box.n - (row + 0.5) * meta.step;
    const w = Math.cos(lat * DEG);
    for (let col = 0; col < meta.cols; col++) {
      const lon = meta.box.w + (col + 0.5) * meta.step;
      const index = row * meta.cols + col;
      if (region.kind === 'box') {
        if (inBox(lat, lon, region)) cells.push({ index, weight: w });
      } else {
        const d = distanceKm(region.lat, region.lon, lat, lon);
        if (d <= region.radiusKm) cells.push({ index, weight: w });
        if (d < nearest.d) nearest = { index, d, weight: w };
      }
    }
  }
  // A point inside the grid uses its own cell; a point outside it has no numbers.
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
