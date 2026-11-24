// Background radiation at fixed stations around the world. Ukraine: the gamma dose rate that
// SaveEcoBot gathers for its radiation map (hundreds of stations, read here every five minutes).
// Elsewhere: the hourly file from data-pipeline/build_live.py, with official networks (Germany's
// BfS, Finland's STUK) and volunteers' counters (Safecast, Sensor.Community). Each station is a
// point with its own reading, unlike a map of measured roads.

import { loadManifest } from './live';
import { PointIndex } from './nearby';

/** Which network a station belongs to. */
export type RadSource = 'saveecobot' | 'bfs' | 'stuk' | 'safecast' | 'sensor';

export type RadStation = {
  lat: number;
  lon: number;
  /** Gamma dose rate, µSv/h. */
  usv: number;
  /** When it was measured (ISO). */
  time: string;
  /** Missing means SaveEcoBot. */
  src?: RadSource;
};

/** The networks: name, link, and whether the counters are volunteers' (home Geiger counters). */
export const RAD_SOURCES: Record<RadSource, { name: string; url: string; volunteer: boolean }> = {
  saveecobot: { name: 'SaveEcoBot', url: 'https://www.saveecobot.com/radiation-maps', volunteer: false },
  bfs: { name: 'BfS ODL', url: 'https://odlinfo.bfs.de/', volunteer: false },
  stuk: { name: 'STUK', url: 'https://www.stuk.fi/', volunteer: false },
  safecast: { name: 'Safecast', url: 'https://safecast.org/', volunteer: true },
  sensor: { name: 'Sensor.Community', url: 'https://sensor.community/', volunteer: true },
};
const WORLD_IDS: RadSource[] = ['bfs', 'stuk', 'safecast', 'sensor'];

/** The data behind SaveEcoBot's public radiation map (CORS open). */
export const RAD_URL = 'https://www.saveecobot.com/storage/maps_data.js';
export const RAD_MAP = 'https://www.saveecobot.com/radiation-maps';

/** Readings older than this are left out; older than RAD_OLD_HOURS are drawn faded. */
const MAX_HOURS = 24;
export const RAD_OLD_HOURS = 3;

type Device = { a: string; n: string; gamma?: number; gamma_t?: number };

let cache: { at: number; promise: Promise<RadStation[]> } | null = null;

/** The stations around the world from the hourly file, or none if it is missing. */
async function loadWorld(): Promise<RadStation[]> {
  const manifest = await loadManifest();
  const file = manifest.radiation?.file;
  if (!file) return [];
  const r = await fetch(`${import.meta.env.BASE_URL}data/live/${file}?v=${encodeURIComponent(manifest.built)}`);
  if (!r.ok) throw new Error(`radiation ${r.status}`);
  return parseWorld((await r.json()) as WorldFile, Date.now());
}

export type WorldFile = { built: string; p: [number, number, number, number, number][] };

/** Points of the hourly file: [lat, lon, µSv/h, minutes old at the build, network]. */
export function parseWorld(d: WorldFile, now: number): RadStation[] {
  const built = Date.parse(d.built);
  const out: RadStation[] = [];
  for (const [lat, lon, usv, age, k] of d.p) {
    const t = built - age * 60_000;
    if (now - t > MAX_HOURS * 2 * 3600_000 || !(usv > 0)) continue;
    out.push({ lat, lon, usv, time: new Date(t).toISOString(), src: WORLD_IDS[k] ?? 'safecast' });
  }
  return out;
}

/** World stations, without those that repeat a SaveEcoBot station (the same counter in two networks). */
export function mergeRadiation(ukraine: RadStation[], world: RadStation[]): RadStation[] {
  const cell = (lat: number, lon: number) => `${Math.round(lat * 200)},${Math.round(lon * 200)}`;
  const taken = new Set(ukraine.map((s) => cell(s.lat, s.lon)));
  return [...ukraine, ...world.filter((s) => !taken.has(cell(s.lat, s.lon)))];
}

/** Stations with a recent gamma reading, Ukraine and the world; fetched again after five minutes. */
export function loadRadiation(): Promise<RadStation[]> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.promise;
  const ukraine = fetch(RAD_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`radiation ${r.status}`);
      return r.json() as Promise<{ devices: Device[] }>;
    })
    .then((d) => parseRadiation(d.devices, Date.now()));
  const promise = Promise.allSettled([ukraine, loadWorld()]).then(([a, b]) => {
    if (a.status === 'rejected' && b.status === 'rejected') throw a.reason;
    return mergeRadiation(a.status === 'fulfilled' ? a.value : [], b.status === 'fulfilled' ? b.value : []);
  });
  cache = { at: Date.now(), promise };
  promise.catch(() => (cache = null));
  return promise;
}

/** The stations with a recent, plausible reading (SaveEcoBot gives nSv/h). */
export function parseRadiation(devices: Device[], now: number): RadStation[] {
  const out: RadStation[] = [];
  for (const d of devices) {
    if (d.gamma === undefined || d.gamma_t === undefined) continue;
    const t = d.gamma_t * 1000;
    if (now - t > MAX_HOURS * 3600_000 || t > now + 3600_000) continue;
    const lat = Number(d.a);
    const lon = Number(d.n);
    // 5 nSv/h is below any real background: a broken sensor.
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !(d.gamma >= 5)) continue;
    out.push({ lat, lon, usv: d.gamma / 1000, time: new Date(t).toISOString() });
  }
  return out;
}

export const isOldRad = (s: RadStation, now = Date.now()) => now - Date.parse(s.time) > RAD_OLD_HOURS * 3600_000;

/**
 * Levels of the dose rate, µSv/h: low and normal natural background, raised (granite, mountains,
 * some spots), high (contaminated land such as parts of the Chornobyl zone).
 */
export const RAD_STEPS = [0.15, 0.3, 1];
export const RAD_COLORS = [0x34d17a, 0x9ad94a, 0xffb020, 0xff5a5f];

export function radBand(usv: number): number {
  return usv < RAD_STEPS[0] ? 0 : usv < RAD_STEPS[1] ? 1 : usv < RAD_STEPS[2] ? 2 : 3;
}

/** The number in a station's bubble: µSv/h with two digits below 1. */
export function radLabel(usv: number, lang: 'uk' | 'en'): string {
  const digits = usv < 1 ? 2 : usv < 10 ? 1 : 0;
  return new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(usv);
}

/** What a year at this dose rate adds up to, mSv. */
export const yearlyMsv = (usv: number) => (usv * 24 * 365) / 1000;

/** The nearest station within `km`, for the readout under the pointer. */
export function nearestRad(index: PointIndex | null, list: RadStation[], lat: number, lon: number, km = 25): { s: RadStation; km: number } | null {
  if (!index) return null;
  const hit = index.within(lat, lon, km)[0];
  return hit ? { s: list[hit.i], km: hit.km } : null;
}
