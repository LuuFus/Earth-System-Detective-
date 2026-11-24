// Where the most fire is burning now, and what the coming days may bring there, worked out from
// data rather than guessed:
// - hotspots: the fires of the last 48 hours (NASA FIRMS) gathered around the strongest 1° cells,
//   with the count of the last day against the day before and the total fire power;
// - fire weather: the Fosberg Fire Weather Index from the Open-Meteo forecast (air temperature,
//   humidity, wind) for three days — how much the weather helps a fire spread;
// - air: the CAMS model's PM2.5 forecast for the towns around (Open-Meteo), now and at worst.

import type { SmokeSource } from '../components/globe/smoke';
import { aqiFromPm25 } from '../components/globe/smoke';
import type { WorldCity } from './cities';
import type { LiveFires } from './live';
import { distanceKm } from './nearby';

export type Hotspot = {
  id: string;
  /** Fire-power-weighted middle. */
  lat: number;
  lon: number;
  box: { s: number; w: number; n: number; e: number };
  /** Detections seen in the last 24 hours, and in the 24 hours before. */
  lastDay: number;
  dayBefore: number;
  /** Total fire radiative power of the detections, MW. */
  power: number;
  /** Indices into the fire arrays. */
  points: number[];
};

/**
 * Volcanoes whose lava glows for the satellites most of the time: their hot pixels are not fires.
 * Points within 15 km of one are left out of the hotspots.
 */
const VOLCANOES: [number, number][] = [
  [19.41, -155.28], // Kilauea
  [19.48, -155.6], // Mauna Loa
  [37.75, 15.0], // Etna
  [38.79, 15.21], // Stromboli
  [13.6, 40.67], // Erta Ale
  [-1.52, 29.25], // Nyiragongo
  [-1.41, 29.2], // Nyamuragira
  [11.98, -86.16], // Masaya
  [-39.42, -71.93], // Villarrica
  [-16.25, 168.12], // Ambrym
  [-21.24, 55.71], // Piton de la Fournaise
  [19.02, -98.62], // Popocatépetl
  [14.47, -90.88], // Fuego
  [56.06, 160.64], // Klyuchevskoy
  [56.65, 161.36], // Shiveluch
  [-7.54, 110.44], // Merapi
  [-8.11, 112.92], // Semeru
  [13.26, 123.69], // Mayon
  [63.88, -22.4], // Reykjanes peninsula
  [-77.53, 167.15], // Erebus
];

const near = (lat: number, lon: number, km: number) =>
  VOLCANOES.some(([a, b]) => Math.abs(a - lat) < 0.2 && distanceKm(lat, lon, a, b) < km);

const CELL = 1; // degrees
/** A hotspot is the strongest cell and its neighbours; the next one starts at least this many cells away. */
const REACH = 1;

/**
 * Where most fire burns now: 1° cells ranked by fire power; the strongest cell, with the cells
 * around it, makes a hotspot, and no other hotspot starts within three cells of it. Volcanoes
 * are left out. `since` is the hours from the data's build to now (ages are counted at the build).
 */
export function findHotspots(f: LiveFires, since: number, max = 12, minPoints = 20): Hotspot[] {
  const cells = new Map<string, { r: number; c: number; power: number; points: number[] }>();
  for (let i = 0; i < f.count; i++) {
    if (near(f.lat[i], f.lon[i], 15)) continue;
    const r = Math.floor(f.lat[i] / CELL);
    const c = Math.floor(f.lon[i] / CELL);
    const key = `${r},${c}`;
    let cell = cells.get(key);
    if (!cell) cells.set(key, (cell = { r, c, power: 0, points: [] }));
    cell.power += Math.max(1, f.frp[i]);
    cell.points.push(i);
  }
  const ranked = [...cells.values()].sort((a, b) => b.power - a.power);
  const taken = new Set<string>();
  const out: Hotspot[] = [];
  for (const top of ranked) {
    if (out.length >= max) break;
    if (taken.has(`${top.r},${top.c}`)) continue;
    const points: number[] = [];
    for (let dr = -REACH; dr <= REACH; dr++) {
      for (let dc = -REACH; dc <= REACH; dc++) {
        const key = `${top.r + dr},${top.c + dc}`;
        if (taken.has(key)) continue;
        points.push(...(cells.get(key)?.points ?? []));
      }
    }
    // Nothing else starts within the block, nor right next to it.
    for (let dr = -REACH - 2; dr <= REACH + 2; dr++) for (let dc = -REACH - 2; dc <= REACH + 2; dc++) taken.add(`${top.r + dr},${top.c + dc}`);
    if (points.length < minPoints) continue;
    let power = 0;
    let wlat = 0;
    let wlon = 0;
    let lastDay = 0;
    let dayBefore = 0;
    const box = { s: 90, w: 180, n: -90, e: -180 };
    for (const i of points) {
      const p = Math.max(1, f.frp[i]);
      power += p;
      wlat += f.lat[i] * p;
      wlon += f.lon[i] * p;
      const age = f.ageMin[i] / 60 + since;
      if (age <= 24) lastDay++;
      else if (age <= 48) dayBefore++;
      box.s = Math.min(box.s, f.lat[i]);
      box.n = Math.max(box.n, f.lat[i]);
      box.w = Math.min(box.w, f.lon[i]);
      box.e = Math.max(box.e, f.lon[i]);
    }
    out.push({ id: `${top.r},${top.c}`, lat: wlat / power, lon: wlon / power, box, lastDay, dayBefore, power, points });
  }
  return out.sort((a, b) => b.power - a.power);
}

/** Change of the last day against the day before, %, or null when there is too little to say. */
export function dayChange(h: Pick<Hotspot, 'lastDay' | 'dayBefore'>): number | null {
  // A handful of detections the day before (clouds, a missed pass) says nothing about a trend.
  if (h.dayBefore < 20) return null;
  return Math.round(((h.lastDay - h.dayBefore) / Math.max(1, h.dayBefore)) * 100);
}

/**
 * The hotspot's fires as burning places for the smoke model: detections gathered in cells of
 * 0.1°, each burning from now for `hours` (the scenario "if they keep burning as now").
 */
export function hotspotSources(f: LiveFires, h: Hotspot, hours: number, max = 70): SmokeSource[] {
  const cells = new Map<string, { lat: number; lon: number; n: number; power: number }>();
  for (const i of h.points) {
    const key = `${Math.round(f.lat[i] * 10)},${Math.round(f.lon[i] * 10)}`;
    const c = cells.get(key);
    const p = Math.max(1, f.frp[i]);
    if (c) {
      c.lat += f.lat[i];
      c.lon += f.lon[i];
      c.n++;
      c.power += p;
    } else cells.set(key, { lat: f.lat[i], lon: f.lon[i], n: 1, power: p });
  }
  return [...cells.values()]
    .sort((a, b) => b.power - a.power)
    .slice(0, max)
    .map((c) => ({ lat: c.lat / c.n, lon: c.lon / c.n, t0: 0, t1: hours, power: c.power }));
}

// ---------- fire weather ----------

/**
 * Fosberg Fire Weather Index (Fosberg 1978): how much the weather alone helps a fire, from the
 * equilibrium moisture content of dead fuel (air temperature and humidity) and the wind.
 * 0 to 100; above about 50 the weather is critical for fires.
 */
export function ffwi(tempC: number, rh: number, windKmh: number): number {
  const t = tempC * 1.8 + 32;
  const h = Math.max(0, Math.min(100, rh));
  const m = h < 10 ? 0.03229 + 0.281073 * h - 0.000578 * h * t : h < 50 ? 2.22749 + 0.160107 * h - 0.01478 * t : 21.0606 + 0.005565 * h * h - 0.00035 * h * t - 0.483199 * h;
  const x = Math.max(0, m) / 30;
  const eta = 1 - 2 * x + 1.5 * x * x - 0.5 * x * x * x;
  const u = windKmh / 1.609344;
  return Math.max(0, Math.min(100, (eta * Math.sqrt(1 + u * u)) / 0.3002));
}

/** Levels of the index: low, moderate, high, very high. */
export const ffwiLevel = (v: number) => (v < 25 ? 0 : v < 40 ? 1 : v < 55 ? 2 : 3);

export type FireWeatherDay = { date: string; maxIndex: number; rainMm: number; maxWindKmh: number; minRh: number };

type Forecast = { hourly?: { time: string[]; temperature_2m: number[]; relative_humidity_2m: number[]; wind_speed_10m: number[]; precipitation: number[] } };

/** Three days of fire weather at a place (the Open-Meteo forecast, local days). */
export async function fireWeather(lat: number, lon: number): Promise<FireWeatherDay[]> {
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=3&timezone=auto`,
  );
  if (!r.ok) throw new Error(`forecast ${r.status}`);
  const d = ((await r.json()) as Forecast).hourly;
  if (!d) return [];
  const days = new Map<string, FireWeatherDay>();
  d.time.forEach((iso, i) => {
    const date = iso.slice(0, 10);
    const v = ffwi(d.temperature_2m[i], d.relative_humidity_2m[i], d.wind_speed_10m[i]);
    const day = days.get(date) ?? { date, maxIndex: 0, rainMm: 0, maxWindKmh: 0, minRh: 100 };
    day.maxIndex = Math.max(day.maxIndex, v);
    day.rainMm += d.precipitation[i] ?? 0;
    day.maxWindKmh = Math.max(day.maxWindKmh, d.wind_speed_10m[i]);
    day.minRh = Math.min(day.minRh, d.relative_humidity_2m[i]);
    days.set(date, day);
  });
  return [...days.values()];
}

// ---------- air in the towns around ----------

export type AirOutlook = { name: string; km: number; nowAqi: number; worstAqi: number; worstTime: string };

type AqSeries = { hourly?: { time: string[]; pm2_5: (number | null)[] } };

/** The biggest towns within `km` of a place, nearest first among equals. */
export function townsAround(list: WorldCity[], lat: number, lon: number, km: number, max: number): (WorldCity & { km: number })[] {
  return list
    .filter((c) => Math.abs(c.lat - lat) < km / 100)
    .map((c) => ({ ...c, km: distanceKm(lat, lon, c.lat, c.lon) }))
    .filter((c) => c.km <= km)
    .sort((a, b) => b.pop - a.pop)
    .slice(0, max);
}

/**
 * The CAMS forecast of PM2.5 for the next three days in each town, as the US AQI: now (the hour
 * that has begun) and the worst hour with its time (UTC).
 */
export async function airOutlook(towns: { name: string; lat: number; lon: number; km: number }[], now = Date.now()): Promise<AirOutlook[]> {
  if (!towns.length) return [];
  const r = await fetch(
    'https://air-quality-api.open-meteo.com/v1/air-quality?' +
      new URLSearchParams({
        latitude: towns.map((t) => t.lat.toFixed(3)).join(','),
        longitude: towns.map((t) => t.lon.toFixed(3)).join(','),
        hourly: 'pm2_5',
        forecast_days: '3',
        timezone: 'GMT',
      }),
  );
  if (!r.ok) throw new Error(`air ${r.status}`);
  const raw = (await r.json()) as AqSeries | AqSeries[];
  const list = Array.isArray(raw) ? raw : [raw];
  return towns
    .map((t, k) => {
      const h = list[k]?.hourly;
      if (!h) return null;
      let nowAqi = NaN;
      let worstAqi = -1;
      let worstTime = '';
      h.time.forEach((iso, i) => {
        const t0 = Date.parse(`${iso}:00Z`);
        const v = h.pm2_5[i];
        if (v === null || v === undefined || t0 + 3600_000 <= now) return;
        const aqi = aqiFromPm25(v);
        if (!Number.isFinite(nowAqi)) nowAqi = aqi;
        if (aqi > worstAqi) {
          worstAqi = aqi;
          worstTime = new Date(t0).toISOString();
        }
      });
      return Number.isFinite(nowAqi) ? { name: t.name, km: t.km, nowAqi, worstAqi, worstTime } : null;
    })
    .filter((x): x is AirOutlook => !!x)
    .sort((a, b) => b.worstAqi - a.worstAqi);
}
