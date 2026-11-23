// Background radiation at fixed stations: the gamma dose rate that SaveEcoBot gathers for its
// radiation map of Ukraine (hundreds of stations, updated every few minutes). Each station is a
// point with its own reading, unlike a map of measured roads.

import { PointIndex } from './nearby';

export type RadStation = {
  lat: number;
  lon: number;
  /** Gamma dose rate, µSv/h. */
  usv: number;
  /** When it was measured (ISO). */
  time: string;
};

/** The data behind SaveEcoBot's public radiation map (CORS open). */
export const RAD_URL = 'https://www.saveecobot.com/storage/maps_data.js';
export const RAD_MAP = 'https://www.saveecobot.com/radiation-maps';

/** Readings older than this are left out; older than RAD_OLD_HOURS are drawn faded. */
const MAX_HOURS = 24;
export const RAD_OLD_HOURS = 3;

type Device = { a: string; n: string; gamma?: number; gamma_t?: number };

let cache: { at: number; promise: Promise<RadStation[]> } | null = null;

/** Stations with a gamma reading from the last day; fetched again after five minutes. */
export function loadRadiation(): Promise<RadStation[]> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.promise;
  const promise = fetch(RAD_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`radiation ${r.status}`);
      return r.json() as Promise<{ devices: Device[] }>;
    })
    .then((d) => parseRadiation(d.devices, Date.now()));
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
