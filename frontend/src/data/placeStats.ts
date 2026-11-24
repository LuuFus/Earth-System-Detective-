// Numbers that describe a place, for comparing two cities (or any two points) side by side.
// Every number comes from a named open source and is fetched when asked for:
// - population and built-up area: Natural Earth (cities only);
// - population density, vegetation (NDVI) and summer surface heat: NASA GIBS maps read back
//   into numbers with each map's official colour scale, averaged over the circle;
// - factories and industrial land: OpenStreetMap through the Overpass API (what volunteers mapped);
// - fires of the last 48 hours, air quality and radiation now: the site's own live data;
// - yearly temperature and rain: NASA POWER climatology (1991-2020); height: Open-Meteo.

import { wmtsSource, tileSpan, TILE } from '../components/globe/tiles';
import { nearestStation, loadFiresNear } from './city';
import { DISPLAY, loadColorMap, lookup, type ColorMap, type MapEntry } from './colormaps';
import type { LiveManifest } from './live';
import { loadRadiation } from './radiation';
import { distanceKm } from './nearby';
import { variableById, type Text, type VariableId } from './variables';

export type PlaceInput = { lat: number; lon: number; radiusKm: number; city?: { pop: number; areaKm2: number; code: string } };

export type MetricId = 'pop' | 'area' | 'density' | 'green' | 'ndvi' | 'heat' | 'industry' | 'works' | 'fires' | 'aqi' | 'rad' | 'temp' | 'rain' | 'elev';

/** Whether more of it is better for people (green), worse (fires), or neither (height). */
export type Better = 'more' | 'less' | 'none';

export type MetricDef = { id: MetricId; group: 'people' | 'industry' | 'nature' | 'now' | 'climate'; better: Better; digits: number };

export const METRICS: MetricDef[] = [
  { id: 'pop', group: 'people', better: 'none', digits: 0 },
  { id: 'area', group: 'people', better: 'none', digits: 0 },
  { id: 'density', group: 'people', better: 'none', digits: 0 },
  { id: 'industry', group: 'industry', better: 'less', digits: 0 },
  { id: 'works', group: 'industry', better: 'less', digits: 0 },
  { id: 'green', group: 'nature', better: 'more', digits: 0 },
  { id: 'ndvi', group: 'nature', better: 'more', digits: 2 },
  { id: 'heat', group: 'nature', better: 'less', digits: 1 },
  { id: 'fires', group: 'now', better: 'less', digits: 0 },
  { id: 'aqi', group: 'now', better: 'less', digits: 0 },
  { id: 'rad', group: 'now', better: 'less', digits: 2 },
  { id: 'temp', group: 'climate', better: 'none', digits: 1 },
  { id: 'rain', group: 'climate', better: 'none', digits: 0 },
  { id: 'elev', group: 'climate', better: 'none', digits: 0 },
];

/** A result: the number, and a few words on where it came from (station distance, year). */
export type Measure = { value: number; note?: Text; km?: number } | null;

// ---------- reading GIBS maps back into numbers ----------

const MAX_LEVEL: Record<string, number> = { '2km': 5, '1km': 6, '500m': 7, '250m': 8 };

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Values of a GIBS layer at every pixel inside the circle (in the layer's display unit). */
export async function sampleLayer(id: VariableId, date: string, lat: number, lon: number, radiusKm: number): Promise<number[]> {
  const img = variableById[id].imagery;
  const map = await loadColorMap(id);
  if (!img || !map) return [];
  const z = Math.min(MAX_LEVEL[img.matrixSet] ?? 5, 6);
  const span = tileSpan(z);
  const px = span / TILE;
  const dLat = radiusKm / 111.2;
  const dLon = radiusKm / (111.2 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
  const r0 = Math.floor((90 - (lat + dLat)) / span);
  const r1 = Math.floor((90 - (lat - dLat)) / span);
  const c0 = Math.floor((lon - dLon + 180) / span);
  const c1 = Math.floor((lon + dLon + 180) / span);
  const source = wmtsSource(img.layer, img.matrixSet, img.format, img.static ? 'default' : date);
  const values: number[] = [];
  const widths = map.entries.map((e) => e.hi - e.lo).filter((w) => Number.isFinite(w) && w > 0).sort((a, b) => a - b);
  const typical = widths[Math.floor(widths.length / 2)] ?? 0;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const tile = await loadImage(source.url(z, r, c));
      if (!tile) continue;
      ctx.clearRect(0, 0, TILE, TILE);
      ctx.drawImage(tile, 0, 0, TILE, TILE);
      const data = ctx.getImageData(0, 0, TILE, TILE).data;
      const north = 90 - r * span;
      const west = -180 + c * span;
      const y0 = Math.max(0, Math.floor((north - (lat + dLat)) / px));
      const y1 = Math.min(TILE - 1, Math.ceil((north - (lat - dLat)) / px));
      const x0 = Math.max(0, Math.floor((lon - dLon - west) / px));
      const x1 = Math.min(TILE - 1, Math.ceil((lon + dLon - west) / px));
      for (let y = y0; y <= y1; y++) {
        const plat = north - (y + 0.5) * px;
        for (let x = x0; x <= x1; x++) {
          const plon = west + (x + 0.5) * px;
          if (distanceKm(lat, lon, plat, plon) > radiusKm) continue;
          const k = (y * TILE + x) * 4;
          if (data[k + 3] < 128) continue;
          const hit = lookup(map, data[k], data[k + 1], data[k + 2]);
          const v = hit ? classValue(id, map, typical, hit.entry) : null;
          if (v !== null && Number.isFinite(v)) values.push(v);
        }
      }
    }
  }
  return values;
}

/**
 * A colour's value: the middle of its class, but the edge of an open class at either end of the
 * scale ("1000 and more", "below 200 K"), whose middle would be meaningless.
 */
function classValue(id: VariableId, map: ColorMap, typical: number, e: MapEntry): number | null {
  let v: number;
  if (Number.isFinite(e.lo) && Number.isFinite(e.hi)) {
    const i = map.entries.indexOf(e);
    const wide = typical > 0 && e.hi - e.lo > 5 * typical;
    v = wide && i === map.entries.length - 1 ? e.lo : wide && i === 0 ? e.hi : (e.lo + e.hi) / 2;
  } else v = Number.isFinite(e.lo) ? e.lo : e.hi;
  if (!Number.isFinite(v)) return null;
  const d = DISPLAY[id];
  return v * (d?.k ?? 1) + (d?.add ?? 0);
}

const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN);

/** July of the last year whose July a monthly layer already has. */
export function lastJuly(last: string): string {
  const y = Number(last.slice(0, 4));
  return `${Number(last.slice(5, 7)) >= 7 ? y : y - 1}-07-01`;
}

// ---------- OpenStreetMap ----------

/** The main Overpass server, then public mirrors when it is busy. */
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const osmCache = new Map<string, Promise<{ industry: number; works: number } | null>>();

async function overpass(query: string): Promise<{ elements?: { tags?: { total?: string } }[] } | null> {
  for (const url of OVERPASS) {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 25_000);
    try {
      const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: query }), signal: ctrl.signal });
      if (r.ok) return (await r.json()) as { elements?: { tags?: { total?: string } }[] };
    } catch {
      // busy or too slow: the next server
    } finally {
      window.clearTimeout(timer);
    }
  }
  return null;
}

/** Industrial land (landuse=industrial) and factories (man_made=works) mapped in OpenStreetMap. */
export function osmIndustry(lat: number, lon: number, radiusKm: number): Promise<{ industry: number; works: number } | null> {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
  let p = osmCache.get(key);
  if (!p) {
    const around = `around:${Math.round(radiusKm * 1000)},${lat.toFixed(4)},${lon.toFixed(4)}`;
    const query = `[out:json][timeout:40];(way["landuse"="industrial"](${around});relation["landuse"="industrial"](${around}););out count;nwr["man_made"="works"](${around});out count;`;
    p = overpass(query)
      .then((d) => {
        const els = d?.elements ?? [];
        if (els.length < 2) return null;
        return { industry: Number(els[0].tags?.total ?? NaN), works: Number(els[1].tags?.total ?? NaN) };
      })
      .catch(() => null);
    osmCache.set(key, p);
    p.then((v) => !v && osmCache.delete(key));
  }
  return p;
}

// ---------- climate and height ----------

const climateCache = new Map<string, Promise<{ temp: number; rain: number } | null>>();

/** Yearly mean air temperature (°C) and rain (mm a year), NASA POWER climatology. */
export function powerClimate(lat: number, lon: number): Promise<{ temp: number; rain: number } | null> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  let p = climateCache.get(key);
  if (!p) {
    p = fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR&community=RE&longitude=${lon.toFixed(3)}&latitude=${lat.toFixed(3)}&format=JSON`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { properties?: { parameter?: Record<string, Record<string, number>> } } | null) => {
        const par = d?.properties?.parameter;
        const t = par?.T2M?.ANN;
        const pr = par?.PRECTOTCORR?.ANN;
        return Number.isFinite(t) && Number.isFinite(pr) ? { temp: t!, rain: pr! * 365.25 } : null;
      })
      .catch(() => null);
    climateCache.set(key, p);
  }
  return p;
}

export async function elevation(lat: number, lon: number): Promise<number | null> {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`);
    const d = (await r.json()) as { elevation?: number[] };
    const v = d.elevation?.[0];
    return Number.isFinite(v) ? v! : null;
  } catch {
    return null;
  }
}

// ---------- one metric ----------

/** One number for a place, or null where the source has none. */
export async function measure(id: MetricId, p: PlaceInput, manifest: LiveManifest | null): Promise<Measure> {
  switch (id) {
    case 'pop':
      return p.city && p.city.pop > 0 ? { value: p.city.pop } : null;
    case 'area':
      return p.city && p.city.areaKm2 > 0 ? { value: p.city.areaKm2 } : null;
    case 'density': {
      // A city: its people over its built-up area. The NASA map stops at "1000 and more".
      if (p.city && p.city.pop > 0 && p.city.areaKm2 > 0) return { value: p.city.pop / p.city.areaKm2, note: { uk: 'на 1 км² забудови', en: 'per km² built up' } };
      const v = mean(await sampleLayer('population', 'default', p.lat, p.lon, Math.min(p.radiusKm, 25)));
      return Number.isFinite(v) ? { value: v, note: { uk: 'середнє в колі, 2020 (понад 1000 не розрізняється)', en: 'mean over the circle, 2020 (no detail above 1000)' } } : null;
    }
    case 'green':
    case 'ndvi': {
      const img = variableById.ndvi.imagery!;
      const date = lastJuly(img.last);
      const v = await sampleLayer('ndvi', date, p.lat, p.lon, p.radiusKm);
      if (!v.length) return null;
      const note = { uk: `липень ${date.slice(0, 4)}`, en: `July ${date.slice(0, 4)}` };
      // Green: the share of the circle where plants are dense (NDVI 0.5 and more).
      return id === 'green' ? { value: (100 * v.filter((x) => x >= 0.5).length) / v.length, note } : { value: mean(v), note };
    }
    case 'heat': {
      const img = variableById.lst.imagery!;
      const date = lastJuly(img.last);
      const v = mean(await sampleLayer('lst', date, p.lat, p.lon, p.radiusKm));
      return Number.isFinite(v) ? { value: v, note: { uk: `удень, липень ${date.slice(0, 4)}`, en: `daytime, July ${date.slice(0, 4)}` } } : null;
    }
    case 'industry':
    case 'works': {
      const o = await osmIndustry(p.lat, p.lon, p.radiusKm);
      const v = o?.[id];
      // No answer from every server: say so, it is not "nothing there".
      if (!o) return { value: NaN, note: { uk: 'OpenStreetMap зараз перевантажений — спробуйте пізніше', en: 'OpenStreetMap is busy right now — try again later' } };
      return v !== undefined && Number.isFinite(v) ? { value: v } : null;
    }
    case 'fires': {
      if (!manifest?.fires) return null;
      const f = await loadFiresNear(manifest, p.lat, p.lon, 30).catch(() => null);
      return f ? { value: f.count, note: { uk: 'за 48 год у 30 км', en: '48 h within 30 km' } } : null;
    }
    case 'aqi': {
      const m = await nearestStation(p.lat, p.lon, manifest, 25).catch(() => null);
      return m ? { value: m.station.aqi, km: m.km, note: { uk: `станція за ${Math.round(m.km)} км`, en: `station ${Math.round(m.km)} km away` } } : null;
    }
    case 'rad': {
      const list = await loadRadiation().catch(() => []);
      let best: { usv: number; km: number } | null = null;
      for (const s of list) {
        const km = distanceKm(p.lat, p.lon, s.lat, s.lon);
        if (km <= 30 && (!best || km < best.km)) best = { usv: s.usv, km };
      }
      return best ? { value: best.usv, km: best.km, note: { uk: `станція за ${Math.round(best.km)} км`, en: `station ${Math.round(best.km)} km away` } } : null;
    }
    case 'temp':
    case 'rain': {
      const c = await powerClimate(p.lat, p.lon);
      return c ? { value: c[id], note: { uk: 'середнє 2001–2020', en: 'mean 2001–2020' } } : null;
    }
    case 'elev': {
      const v = await elevation(p.lat, p.lon);
      return v === null ? null : { value: v };
    }
  }
}
