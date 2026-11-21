// Air quality stations for the globe and the map: SaveEcoBot in Ukraine (with station names) and
// Sensor.Community's open sensors everywhere else, on one US EPA AQI scale. And, for a station's
// card, the place name (OpenStreetMap Nominatim) and the CAMS model's mix of pollutants there
// (Open-Meteo), so the card can say what is measured nearby without guessing.

import type { AirPoint } from './live';
import { PointIndex } from './nearby';
import type { AqiStation } from './ukraine';

export type AirStation = {
  lat: number;
  lon: number;
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  source: 'saveecobot' | 'sensor' | 'waqi';
  /** WAQI station id, for its details. */
  uid?: number;
  city?: string;
  name?: string;
  country?: string;
  /** When it was measured (ISO), or the hour of the mean for Sensor.Community. */
  time: string;
  temp?: number | null;
  humidity?: number | null;
};

/** Readings older than this are drawn faded. */
export const OLD_HOURS = 3;
export const isOld = (s: AirStation) => Date.now() - Date.parse(s.time) > OLD_HOURS * 3600_000;

/**
 * Every network on one list: WAQI's official stations first, then SaveEcoBot's named ones, then
 * Sensor.Community's citizen sensors. A station already on the list from a network before is not
 * added twice.
 */
export function mergeAir(seb: AqiStation[], world: { built: string; p: AirPoint[] } | null, waqi: AirStation[] | null = null): AirStation[] {
  const out: AirStation[] = waqi ? [...waqi] : [];
  const taken = out.length ? new PointIndex(out.map((s) => s.lat), out.map((s) => s.lon)) : null;
  const named = seb.filter((s) => !taken || !taken.within(s.lat, s.lon, 0.5).length);
  out.push(...named.map((s): AirStation => ({
    lat: s.lat,
    lon: s.lon,
    aqi: s.aqi,
    pm25: s.pm25,
    pm10: s.pm10,
    source: 'saveecobot',
    city: s.city,
    name: s.name,
    country: 'UA',
    time: s.time,
    temp: s.temp,
    humidity: s.humidity,
  })));
  if (!world) return out;
  // The same sensor can report to more than one network: keep the one already on the list.
  const before = out.length ? new PointIndex(out.map((s) => s.lat), out.map((s) => s.lon)) : null;
  for (const [lat, lon, pm25, pm10, aqi, cc] of world.p) {
    if (before && before.within(lat, lon, 0.3).length) continue;
    out.push({ lat, lon, aqi, pm25, pm10, source: 'sensor', country: cc, time: world.built });
  }
  return out;
}

// ---------- place names ----------

const names = new Map<string, Promise<string | null>>();
let lastAsk = 0;

/**
 * District and town at a place, from OpenStreetMap Nominatim. One request at a time, at most one a
 * second (their usage policy), cached for the session.
 */
export function placeName(lat: number, lon: number, lang: 'uk' | 'en'): Promise<string | null> {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)},${lang}`;
  let p = names.get(key);
  if (!p) {
    const wait = Math.max(0, lastAsk + 1100 - Date.now());
    lastAsk = Date.now() + wait;
    p = new Promise<void>((res) => window.setTimeout(res, wait))
      .then(() => fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&lat=${lat}&lon=${lon}&accept-language=${lang}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { address?: Record<string, string> } | null) => {
        const a = d?.address;
        if (!a) return null;
        const part = a.suburb || a.city_district || a.borough || a.quarter || a.neighbourhood || a.village || a.hamlet;
        const town = a.city || a.town || a.village || a.municipality;
        const region = a.state || a.region || a.county;
        return [part, town !== part ? town : null, !town ? region : null].filter(Boolean).join(', ') || region || null;
      })
      .catch(() => null);
    names.set(key, p);
  }
  return p;
}

// ---------- the model's pollutant mix ----------

export type Mix = { dust: number | null; no2: number | null; so2: number | null; co: number | null; o3: number | null; pm25: number | null };
const mixes = new Map<string, Promise<Mix | null>>();

/** The CAMS (Copernicus) model's pollutants at a place now, via Open-Meteo. */
export function modelMix(lat: number, lon: number): Promise<Mix | null> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  let p = mixes.get(key);
  if (!p) {
    const params = new URLSearchParams({
      latitude: lat.toFixed(3),
      longitude: lon.toFixed(3),
      current: 'pm2_5,dust,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone',
    });
    p = fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { current?: Record<string, number | null> } | null) => {
        const c = d?.current;
        if (!c) return null;
        return { dust: c.dust ?? null, no2: c.nitrogen_dioxide ?? null, so2: c.sulphur_dioxide ?? null, co: c.carbon_monoxide ?? null, o3: c.ozone ?? null, pm25: c.pm2_5 ?? null };
      })
      .catch(() => null);
    mixes.set(key, p);
  }
  return p;
}
