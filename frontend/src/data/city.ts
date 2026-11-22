// "My city": a place chosen by name (Open-Meteo geocoding) and kept in this browser, with its
// weather (Open-Meteo), the CAMS air quality model (Open-Meteo), the nearest measuring station,
// fires nearby (NASA FIRMS) and the advice of the day worked out from them.

import { useCallback, useEffect, useState } from 'react';
import { mergeAir, type AirStation } from './air';
import { loadAir, loadFires, type LiveFires, type LiveManifest } from './live';
import { distanceKm, PointIndex } from './nearby';
import { loadAqi } from './ukraine';
import { WAQI_TOKEN } from './waqi';

export type City = { name: string; admin?: string; country?: string; cc?: string; lat: number; lon: number; population?: number };

// ---------- choosing and keeping a city ----------

type GeoResult = { name: string; latitude: number; longitude: number; country?: string; country_code?: string; admin1?: string; population?: number };

/** Places by name, in the page's language (Open-Meteo geocoding, GeoNames). */
export async function searchCities(query: string, lang: 'uk' | 'en', signal?: AbortSignal): Promise<City[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${lang}&format=json`, { signal });
  if (!r.ok) throw new Error(`geocoding ${r.status}`);
  const d = (await r.json()) as { results?: GeoResult[] };
  return (d.results ?? []).map((x) => ({ name: x.name, admin: x.admin1, country: x.country, cc: x.country_code, lat: x.latitude, lon: x.longitude, population: x.population }));
}

const KEY = 'my-city';
const EVENT = 'my-city-change';

function readCity(): City | null {
  try {
    const raw = localStorage.getItem(KEY);
    const c = raw ? (JSON.parse(raw) as City) : null;
    return c && Number.isFinite(c.lat) && Number.isFinite(c.lon) ? c : null;
  } catch {
    return null;
  }
}

/** The pinned city of this browser, shared by every page that shows it. */
export function useMyCity(): [City | null, (c: City | null) => void] {
  const [city, setCity] = useState<City | null>(readCity);
  useEffect(() => {
    const sync = () => setCity(readCity());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const pin = useCallback((c: City | null) => {
    if (c) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [city, pin];
}

export const sameCity = (a: City | null, b: City | null) => !!a && !!b && Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01;

// ---------- weather and the air model ----------

/** Open-Meteo gives local times without an offset: back to moments (ms) with the offset it gives. */
const moments = (times: string[], offset: number) => times.map((t) => Date.parse(`${t}:00Z`) - offset * 1000);

export type CityWeather = {
  timezone: string;
  offset: number;
  now: { temp: number; feels: number; humidity: number; code: number; wind: number; gust: number; precip: number; isDay: boolean };
  hourly: { t: number[]; temp: number[]; feels: number[]; rainChance: (number | null)[]; rain: number[]; code: number[]; gust: number[]; uv: (number | null)[] };
  daily: { date: string[]; code: number[]; tMax: number[]; tMin: number[]; rain: number[]; rainChance: (number | null)[]; gust: number[]; sunrise: string[]; sunset: string[] };
};

export async function loadCityWeather(lat: number, lon: number, signal?: AbortSignal): Promise<CityWeather> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lon.toFixed(3),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_gusts_10m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max,sunrise,sunset',
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: '7',
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!r.ok) throw new Error(`forecast ${r.status}`);
  type H = Record<string, (number | null)[]> & { time: string[] };
  const d = (await r.json()) as { timezone: string; utc_offset_seconds: number; current: Record<string, number>; hourly: H; daily: H & { sunrise: string[]; sunset: string[] } };
  const num = (a: (number | null)[]) => a.map((v) => v ?? Number.NaN);
  return {
    timezone: d.timezone,
    offset: d.utc_offset_seconds,
    now: {
      temp: d.current.temperature_2m,
      feels: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      code: d.current.weather_code,
      wind: d.current.wind_speed_10m,
      gust: d.current.wind_gusts_10m,
      precip: d.current.precipitation,
      isDay: d.current.is_day === 1,
    },
    hourly: {
      t: moments(d.hourly.time, d.utc_offset_seconds),
      temp: num(d.hourly.temperature_2m),
      feels: num(d.hourly.apparent_temperature),
      rainChance: d.hourly.precipitation_probability,
      rain: num(d.hourly.precipitation),
      code: num(d.hourly.weather_code),
      gust: num(d.hourly.wind_gusts_10m),
      uv: d.hourly.uv_index,
    },
    daily: {
      date: d.daily.time,
      code: num(d.daily.weather_code),
      tMax: num(d.daily.temperature_2m_max),
      tMin: num(d.daily.temperature_2m_min),
      rain: num(d.daily.precipitation_sum),
      rainChance: d.daily.precipitation_probability_max,
      gust: num(d.daily.wind_gusts_10m_max),
      sunrise: d.daily.sunrise,
      sunset: d.daily.sunset,
    },
  };
}

export type CityAir = {
  now: { aqi: number | null; pm25: number | null; pm10: number | null; no2: number | null; o3: number | null; dust: number | null };
  /** The last day and the next days, hour by hour (the model). */
  hourly: { t: number[]; aqi: (number | null)[]; pm25: (number | null)[]; dust: (number | null)[] };
};

/** The CAMS air quality model at a place (Open-Meteo): now, the past day and the next 3 days. */
export async function loadCityAir(lat: number, lon: number, signal?: AbortSignal): Promise<CityAir> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lon.toFixed(3),
    current: 'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,dust',
    hourly: 'us_aqi,pm2_5,dust',
    past_days: '1',
    forecast_days: '4',
    timezone: 'auto',
  });
  const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`, { signal });
  if (!r.ok) throw new Error(`air ${r.status}`);
  const d = (await r.json()) as { utc_offset_seconds: number; current: Record<string, number | null>; hourly: { time: string[]; us_aqi: (number | null)[]; pm2_5: (number | null)[]; dust: (number | null)[] } };
  const c = d.current;
  return {
    now: { aqi: c.us_aqi ?? null, pm25: c.pm2_5 ?? null, pm10: c.pm10 ?? null, no2: c.nitrogen_dioxide ?? null, o3: c.ozone ?? null, dust: c.dust ?? null },
    hourly: { t: moments(d.hourly.time, d.utc_offset_seconds), aqi: d.hourly.us_aqi, pm25: d.hourly.pm2_5, dust: d.hourly.dust },
  };
}

// ---------- measured nearby ----------

export type Measured = { station: AirStation; km: number };

/**
 * The nearest station or sensor within `maxKm` that reported in the last day (some report only
 * every few hours); the page says how long ago, and only a fresh one counts for the advice.
 */
export async function nearestStation(lat: number, lon: number, manifest: LiveManifest | null, maxKm = 20): Promise<Measured | null> {
  const [seb, world, waqi] = await Promise.all([
    loadAqi().catch(() => []),
    manifest?.air ? loadAir(manifest).catch(() => null) : Promise.resolve(null),
    WAQI_TOKEN ? waqiNearest(lat, lon).catch(() => null) : Promise.resolve(null),
  ]);
  const all = mergeAir(seb, world, waqi ? [waqi] : null).filter((s) => Date.now() - Date.parse(s.time) < 24 * 3600_000);
  if (!all.length) return null;
  const near = new PointIndex(all.map((s) => s.lat), all.map((s) => s.lon)).within(lat, lon, maxKm).sort((a, b) => a.km - b.km)[0];
  return near ? { station: all[near.i], km: near.km } : null;
}

async function waqiNearest(lat: number, lon: number): Promise<AirStation | null> {
  const r = await fetch(`https://api.waqi.info/feed/geo:${lat.toFixed(3)};${lon.toFixed(3)}/?token=${WAQI_TOKEN}`);
  const d = (await r.json()) as { status: string; data: { aqi: number | string; idx: number; city: { geo: [number, number]; name: string }; time: { iso: string } } };
  const aqi = Number(d.data?.aqi);
  if (d.status !== 'ok' || !Number.isFinite(aqi)) return null;
  return { lat: d.data.city.geo[0], lon: d.data.city.geo[1], aqi, pm25: null, pm10: null, source: 'waqi', uid: d.data.idx, name: d.data.city.name, time: d.data.time.iso };
}

// ---------- fires nearby ----------

export type FiresNear = { count: number; nearestKm: number | null; newestMin: number | null };

export function firesNear(f: LiveFires, lat: number, lon: number, km: number): FiresNear {
  let count = 0;
  let nearestKm: number | null = null;
  let newestMin: number | null = null;
  const dLat = km / 111;
  for (let i = 0; i < f.count; i++) {
    if (Math.abs(f.lat[i] - lat) > dLat) continue;
    const d = distanceKm(lat, lon, f.lat[i], f.lon[i]);
    if (d > km) continue;
    count++;
    if (nearestKm === null || d < nearestKm) nearestKm = d;
    if (newestMin === null || f.ageMin[i] < newestMin) newestMin = f.ageMin[i];
  }
  return { count, nearestKm, newestMin };
}

export const loadFiresNear = (manifest: LiveManifest, lat: number, lon: number, km = 50) => loadFires(manifest).then((f) => firesNear(f, lat, lon, km));

/** The town at a place (OpenStreetMap Nominatim), for "where am I". */
export async function placeAt(lat: number, lon: number, lang: 'uk' | 'en'): Promise<City> {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&accept-language=${lang}`);
  const d = (await r.json()) as { address?: Record<string, string> };
  const a = d.address ?? {};
  const name = a.city || a.town || a.village || a.municipality || a.county || a.state;
  if (!name) throw new Error('no place');
  return { name, admin: a.state, country: a.country, cc: a.country_code?.toUpperCase(), lat, lon };
}
