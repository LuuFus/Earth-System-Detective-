// Data for the smoke scenes: where the fires were (NASA FIRMS), how the wind blew (ERA5 for past
// days, the NOAA GFS forecast for the fires burning now) and what the air was like in nearby towns
// (the CAMS model), all through public APIs.

import { STEP, type SmokeBox, type SmokeSim, type SmokeSource, type SmokeTown, type WindAt } from '../components/globe/smoke';
import { loadFrame, nearestFrame, type LiveManifest, type WeatherFrame } from './live';
import type { StoryPoints } from './ukraine';

const DEG = Math.PI / 180;

/** Hours between two ISO times. */
export const hoursBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 3600_000;

/** `YYYY-MM-DDTHH` as a full ISO time in UTC. */
export const isoHour = (h: string) => (h.length === 13 ? `${h}:00:00Z` : h);

// ---------- wind of past days (ERA5 through Open-Meteo) ----------

type ArchiveSeries = { hourly?: { time: string[]; wind_speed_100m: (number | null)[]; wind_direction_100m: (number | null)[] } };

/**
 * Hourly wind 100 m above the ground on a grid over `box`, from `start` (an ISO hour) for
 * `hours`; the scene clock starts at `start`. Smoke rises above the ground layer, so the wind at
 * 100 m carries it better than the wind at 10 m.
 */
export async function pastWind(box: SmokeBox, start: string, hours: number, n = 7): Promise<WindAt> {
  const lats: number[] = [];
  const lons: number[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    lats.push(box.s + ((box.n - box.s) * j) / (n - 1));
    lons.push(box.w + ((box.e - box.w) * i) / (n - 1));
  }
  const t0 = Date.parse(isoHour(start));
  const day = (t: number) => new Date(t).toISOString().slice(0, 10);
  const url =
    'https://archive-api.open-meteo.com/v1/archive?' +
    new URLSearchParams({
      latitude: lats.map((x) => x.toFixed(3)).join(','),
      longitude: lons.map((x) => x.toFixed(3)).join(','),
      hourly: 'wind_speed_100m,wind_direction_100m',
      wind_speed_unit: 'ms',
      start_date: day(t0),
      end_date: day(t0 + (hours + 24) * 3600_000),
      timezone: 'GMT',
    });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`wind ${r.status}`);
  const raw = (await r.json()) as ArchiveSeries | ArchiveSeries[];
  const list = Array.isArray(raw) ? raw : [raw];
  const times = list[0]?.hourly?.time ?? [];
  const offset = (Date.parse(`${times[0]}:00Z`) - t0) / 3600_000; // scene hour of the first value
  const nt = times.length;
  const u = new Float32Array(n * n * nt).fill(NaN);
  const v = new Float32Array(n * n * nt).fill(NaN);
  list.forEach((s, k) => {
    const sp = s.hourly?.wind_speed_100m ?? [];
    const dir = s.hourly?.wind_direction_100m ?? [];
    for (let h = 0; h < nt; h++) {
      const speed = sp[h];
      const d = dir[h];
      if (speed === null || d === null || speed === undefined || d === undefined) continue;
      // The direction is where the wind blows from: the air moves the other way.
      u[h * n * n + k] = -speed * Math.sin(d * DEG);
      v[h * n * n + k] = -speed * Math.cos(d * DEG);
    }
  });
  return gridWind(box, n, nt, offset, u, v);
}

/** Bilinear in space, linear in time; places outside the grid take the nearest edge. */
export function gridWind(box: SmokeBox, n: number, nt: number, offset: number, u: Float32Array, v: Float32Array): WindAt {
  return (lat, lon, t) => {
    const fx = Math.max(0, Math.min(n - 1.001, ((lon - box.w) / (box.e - box.w)) * (n - 1)));
    const fy = Math.max(0, Math.min(n - 1.001, ((lat - box.s) / (box.n - box.s)) * (n - 1)));
    const ft = Math.max(0, Math.min(nt - 1.001, t - offset));
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const h = Math.floor(ft);
    const a = fx - i;
    const b = fy - j;
    const c = ft - h;
    let su = 0;
    let sv = 0;
    let sw = 0;
    for (let dh = 0; dh <= 1; dh++) {
      for (let dj = 0; dj <= 1; dj++) {
        for (let di = 0; di <= 1; di++) {
          const w = (dh ? c : 1 - c) * (dj ? b : 1 - b) * (di ? a : 1 - a);
          const k = (h + dh) * n * n + (j + dj) * n + (i + di);
          if (!Number.isFinite(u[k]) || w === 0) continue;
          su += u[k] * w;
          sv += v[k] * w;
          sw += w;
        }
      }
    }
    return sw > 0.2 ? [su / sw, sv / sw] : null;
  };
}

// ---------- wind of the coming hours (the site's GFS forecast) ----------

/** The forecast wind from now on, for `hours`; the scene clock starts now. */
export async function forecastWind(manifest: LiveManifest, hours: number): Promise<WindAt> {
  const frames = manifest.weather?.frames ?? [];
  const first = nearestFrame(manifest) ?? 0;
  const now = Date.now();
  const wanted: number[] = [];
  for (let i = Math.max(0, first - 1); i < frames.length; i++) {
    wanted.push(i);
    if (Date.parse(frames[i].time) > now + (hours + 3) * 3600_000) break;
  }
  const loaded = (await Promise.all(wanted.map((i) => loadFrame(manifest, i).catch(() => null)))).filter((f): f is WeatherFrame => !!f);
  if (!loaded.length) throw new Error('no forecast');
  const at = loaded.map((f) => (f.time.getTime() - now) / 3600_000);
  return (lat, lon, t) => {
    let k = at.findIndex((x) => x > t);
    if (k <= 0) k = k === 0 ? 1 : at.length - 1;
    const f0 = loaded[Math.max(0, k - 1)];
    const f1 = loaded[Math.min(loaded.length - 1, k)];
    const span = at[Math.min(loaded.length - 1, k)] - at[Math.max(0, k - 1)] || 1;
    const c = Math.max(0, Math.min(1, (t - at[Math.max(0, k - 1)]) / span));
    const a = f0.wind(lat, lon);
    const b = f1.wind(lat, lon);
    if (!a || !b) return a ?? b;
    return [a[0] + (b[0] - a[0]) * c, a[1] + (b[1] - a[1]) * c];
  };
}

// ---------- air in the towns (CAMS through Open-Meteo) ----------

type AqSeries = { hourly?: { time: string[]; pm2_5: (number | null)[] } };

/** PM2.5 of each town for every hour of the scene (index 0 = `start`), NaN where unknown. */
export async function townsAir(towns: { lat: number; lon: number }[], start: string, hours: number): Promise<Float32Array[]> {
  if (!towns.length) return [];
  const t0 = Date.parse(isoHour(start));
  const day = (t: number) => new Date(t).toISOString().slice(0, 10);
  const url =
    'https://air-quality-api.open-meteo.com/v1/air-quality?' +
    new URLSearchParams({
      latitude: towns.map((x) => x.lat.toFixed(3)).join(','),
      longitude: towns.map((x) => x.lon.toFixed(3)).join(','),
      hourly: 'pm2_5',
      start_date: day(t0),
      end_date: day(t0 + hours * 3600_000),
      timezone: 'GMT',
    });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`air ${r.status}`);
  const raw = (await r.json()) as AqSeries | AqSeries[];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((s) => {
    const out = new Float32Array(hours + 1).fill(NaN);
    const time = s.hourly?.time ?? [];
    const pm = s.hourly?.pm2_5 ?? [];
    time.forEach((iso, k) => {
      const h = Math.round((Date.parse(`${iso}:00Z`) - t0) / 3600_000);
      const val = pm[k];
      if (h >= 0 && h <= hours && val !== null && val !== undefined) out[h] = val;
    });
    return out;
  });
}

export function makeTowns(list: { lat: number; lon: number; name: string }[], pm: Float32Array[]): SmokeTown[] {
  return list.map((t, i) => ({ ...t, pm25: pm[i] ?? new Float32Array(0) }));
}

// ---------- the fires: from satellite points to burning places ----------

/** Longest gap, hours, between two sightings of one place that still counts as one fire. */
const BRIDGE = 96;

/**
 * Burning places from a story's detections between `from` and `to` (story hours). Detections are
 * gathered into cells of `cell` degrees; in each cell, sightings up to four days apart are
 * one fire that kept burning (clouds often hide a fire from the satellite for a few days), from
 * a few hours before the first sighting to some hours after the last, as strong as its strongest
 * pass. The strongest `max` fires are kept. Times come back on the scene clock (story hour minus `from`).
 */
export function storySources(points: StoryPoints, from: number, to: number, cell = 0.05, max = 90): SmokeSource[] {
  const cells = new Map<string, { lat: number; lon: number; n: number; passes: Map<number, number> }>();
  for (let i = 0; i < points.lat.length; i++) {
    const h = points.hours[i];
    if (h < from - BRIDGE || h > to) continue;
    const key = `${Math.round(points.lat[i] / cell)},${Math.round(points.lon[i] / cell)}`;
    let c = cells.get(key);
    if (!c) cells.set(key, (c = { lat: 0, lon: 0, n: 0, passes: new Map() }));
    c.lat += points.lat[i];
    c.lon += points.lon[i];
    c.n++;
    // One satellite pass: the detections of the same hour, their power added up.
    const pass = Math.round(h);
    c.passes.set(pass, (c.passes.get(pass) ?? 0) + Math.max(1, points.frp[i]));
  }
  const out: SmokeSource[] = [];
  for (const c of cells.values()) {
    const lat = c.lat / c.n;
    const lon = c.lon / c.n;
    const passes = [...c.passes.entries()].sort((a, b) => a[0] - b[0]);
    let start = passes[0][0];
    let end = start;
    let power = passes[0][1];
    const close = () => out.push({ lat, lon, t0: start - 6 - from, t1: end + 10 - from, power });
    for (const [h, p] of passes.slice(1)) {
      if (h - end <= BRIDGE) {
        end = h;
        power = Math.max(power, p);
      } else {
        close();
        start = end = h;
        power = p;
      }
    }
    close();
  }
  return out
    .filter((s) => s.t1 > 0 && s.t0 < to - from)
    .sort((a, b) => b.power - a.power)
    .slice(0, max);
}

/** The town with the worst air during the scene, and when. */
export function worstTown(towns: SmokeTown[], start: string): { name: string; pm25: number; time: string } | null {
  let best: { name: string; pm25: number; time: string } | null = null;
  const t0 = Date.parse(isoHour(start));
  for (const t of towns) {
    t.pm25.forEach((v, h) => {
      if (Number.isFinite(v) && (!best || v > best.pm25)) best = { name: t.name, pm25: v, time: new Date(t0 + h * 3600_000).toISOString() };
    });
  }
  return best;
}

/**
 * The towns a plume passes within `km` of in its first `hours`, with the hour it first gets there,
 * soonest first.
 */
export function townsInPlume<T extends { id: number; lat: number; lon: number }>(sim: SmokeSim, towns: T[], hours: number, km = 12): { town: T; hours: number }[] {
  const reach = new Map<number, { town: T; hours: number }>();
  for (const tr of sim.tracks) {
    for (let k = 0; k < tr.lat.length; k++) {
      const la = tr.lat[k];
      const h = tr.te + k * STEP;
      if (!Number.isFinite(la) || h > hours || k * STEP > sim.life) break;
      const cos = Math.cos((la * Math.PI) / 180);
      for (const town of towns) {
        const d = Math.hypot(town.lat - la, (town.lon - tr.lon[k]) * cos) * 111.2;
        if (d < km && (reach.get(town.id)?.hours ?? Infinity) > h) reach.set(town.id, { town, hours: h });
      }
    }
  }
  return [...reach.values()].sort((a, b) => a.hours - b.hours);
}

/** A box `km` around a place. */
export function boxAround(lat: number, lon: number, km: number): SmokeBox {
  const dLat = km / 111.2;
  const dLon = km / (111.2 * Math.max(0.2, Math.cos(lat * DEG)));
  return { s: lat - dLat, n: lat + dLat, w: lon - dLon, e: lon + dLon };
}
