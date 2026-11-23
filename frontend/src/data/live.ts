// Live data built every hour by data-pipeline/build_live.py: the NOAA GFS forecast (wind, air
// temperature, rain and snow, gusts, cloud) and NASA FIRMS fires of the last 48 hours.

import { useEffect, useState } from 'react';
import { fieldPixels, GridFrame, worldView, type FieldKind, type FieldView, type GridVar } from './field';

export { colorAt, fieldValue, GridFrame, SCALES, AIR_KINDS, isAirKind, type FieldKind } from './field';
/** A moment of the GFS forecast (whole Earth, 1°). */
export type WeatherFrame = GridFrame;

const BASE = `${import.meta.env.BASE_URL}data/live/`;

export type WeatherVar = Extract<GridVar, 'u' | 'v' | 't' | 'precip' | 'gust' | 'cloud'>;

export type LiveManifest = {
  built: string;
  weather?: {
    source: string;
    url: string;
    run: string;
    grid: { ni: number; nj: number; lat0: number; lon0: number; step: number };
    vars: WeatherVar[];
    frames: { hour: number; time: string; file: string }[];
    compression?: 'deflate';
  };
  fires?: {
    source: string;
    url: string;
    file: string;
    count: number;
    hours: number;
    ukraine: { date: string; count: number }[];
    compression?: 'deflate';
  };
  air?: { source: string; url: string; file: string; count: number };
  /** CAMS air quality forecast over Ukraine and its neighbours (a model, not measurements). */
  airq?: {
    source: string;
    url: string;
    licence: string;
    built: string;
    file: string;
    compression?: 'deflate';
    grid: { north: number; west: number; step: number; ni: number; nj: number };
    vars: GridVar[];
    times: string[];
  };
};

/** Bytes of a file, inflated when the pipeline compressed it (zlib). */
async function fetchBytes(url: string, compression?: 'deflate'): Promise<ArrayBuffer> {
  const r = await fetch(url);
  if (!r.ok || !r.body) throw new Error(`${url} ${r.status}`);
  if (!compression) return r.arrayBuffer();
  return new Response(r.body.pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
}

let manifestCache: { at: number; promise: Promise<LiveManifest> } | null = null;

/** The manifest, fetched again at most once a minute. */
export function loadManifest(force = false): Promise<LiveManifest> {
  const now = Date.now();
  // A forced check still shares a request made a moment ago: every page part that shows live data
  // asks at once, and they would otherwise fetch the same file several times.
  if (manifestCache && now - manifestCache.at < (force ? 5_000 : 60_000)) return manifestCache.promise;
  const promise = fetch(`${BASE}manifest.json?m=${Math.floor(now / 60_000)}`, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`manifest ${r.status}`);
    return r.json() as Promise<LiveManifest>;
  });
  manifestCache = { at: now, promise };
  promise.catch(() => (manifestCache = null));
  return promise;
}

/** The manifest, checked every minute; `null` while it loads or when there is none yet. */
export function useLiveManifest(): { manifest: LiveManifest | null; error: boolean } {
  const [state, setState] = useState<{ manifest: LiveManifest | null; error: boolean }>({ manifest: null, error: false });
  useEffect(() => {
    let cancelled = false;
    const check = () =>
      loadManifest(true)
        .then((m) => {
          if (cancelled) return;
          setState((s) => (s.manifest?.built === m.built ? s : { manifest: m, error: false }));
        })
        .catch(() => !cancelled && setState((s) => ({ manifest: s.manifest, error: !s.manifest })));
    void check();
    const id = window.setInterval(check, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  return state;
}

// ---------- weather ----------

const frameCache = new Map<string, Promise<WeatherFrame>>();

export function loadFrame(manifest: LiveManifest, index: number): Promise<WeatherFrame> {
  const w = manifest.weather!;
  const f = w.frames[index];
  const key = `${w.run}|${f.file}`;
  let p = frameCache.get(key);
  if (!p) {
    p = fetchBytes(`${BASE}${f.file}?r=${encodeURIComponent(w.run)}`, w.compression)
        .then((buf) => new GridFrame(new Uint8Array(buf), f.time, { north: w.grid.lat0, west: w.grid.lon0, step: w.grid.step, ni: w.grid.ni, nj: w.grid.nj, wrap: true }, w.vars));
    frameCache.set(key, p);
    p.catch(() => frameCache.delete(key));
    if (frameCache.size > 40) frameCache.delete(frameCache.keys().next().value as string);
  }
  return p;
}

/** Index of the forecast frame closest to a moment. */
export function nearestFrame(manifest: LiveManifest, at = Date.now()): number {
  const frames = manifest.weather?.frames ?? [];
  let best = 0;
  let bestD = Infinity;
  frames.forEach((f, i) => {
    const d = Math.abs(Date.parse(f.time) - at);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export function frameTime(time: string): Date {
  return new Date(time);
}

/** The field painted on a canvas, on this thread (the worker in fieldPainter.ts does it off it). */
export function paintField(frame: WeatherFrame, kind: FieldKind, projection: 'equirect' | 'mercator', width = 1440): HTMLCanvasElement {
  return paintView(frame, kind, worldView(projection, width));
}

export function paintView(frame: GridFrame, kind: FieldKind, view: FieldView): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = view.width;
  canvas.height = view.height;
  canvas.getContext('2d')!.putImageData(new ImageData(fieldPixels(frame, kind, view), view.width, view.height), 0, 0);
  return canvas;
}

// ---------- air quality forecast (CAMS) ----------

let airqCache: { key: string; promise: Promise<GridFrame[]> } | null = null;

/** Every 3-hour step of the air quality forecast, as frames on its regional grid. */
export function loadAirq(manifest: LiveManifest): Promise<GridFrame[]> {
  const a = manifest.airq!;
  const key = `${a.built}|${a.file}`;
  if (airqCache?.key === key) return airqCache.promise;
  const grid = { ...a.grid, wrap: false };
  const per = a.grid.ni * a.grid.nj * a.vars.length;
  const promise = fetchBytes(`${BASE}${a.file}?b=${encodeURIComponent(a.built)}`, a.compression).then((buf) =>
    a.times.map((t, i) => new GridFrame(new Uint8Array(buf, i * per, per), t, grid, a.vars)),
  );
  airqCache = { key, promise };
  promise.catch(() => (airqCache = null));
  return promise;
}

/** The air forecast's box on the map: its grid cells' centres, with half a cell around them. */
export function airqBounds(manifest: LiveManifest): { north: number; south: number; west: number; east: number } {
  const g = manifest.airq!.grid;
  return { north: g.north, south: g.north - (g.nj - 1) * g.step, west: g.west, east: g.west + (g.ni - 1) * g.step };
}

// ---------- fires ----------

export type LiveFires = { count: number; lat: Float32Array; lon: Float32Array; ageMin: Uint16Array; frp: Uint16Array; flags: Uint8Array };

let firesCache: { key: string; promise: Promise<LiveFires> } | null = null;

export function loadFires(manifest: LiveManifest): Promise<LiveFires> {
  const f = manifest.fires!;
  const key = `${manifest.built}|${f.count}`;
  if (firesCache?.key === key) return firesCache.promise;
  const promise = fetchBytes(`${BASE}${f.file}?b=${encodeURIComponent(manifest.built)}`, f.compression)
    .then((buf) => {
      const n = f.count;
      // Float32 and Uint16 views need aligned offsets: copy through slices.
      const lat = new Float32Array(buf.slice(0, n * 4));
      let o = n * 4;
      const lon = new Float32Array(buf.slice(o, o + n * 4));
      o += n * 4;
      const ageMin = new Uint16Array(buf.slice(o, o + n * 2));
      o += n * 2;
      const frp = new Uint16Array(buf.slice(o, o + n * 2));
      o += n * 2;
      const flags = new Uint8Array(buf.slice(o, o + n));
      return { count: n, lat, lon, ageMin, frp, flags };
    });
  firesCache = { key, promise };
  promise.catch(() => (firesCache = null));
  return promise;
}

/** How long ago, in words. */
export function ago(iso: string, lang: 'uk' | 'en'): string {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (lang === 'uk') return min < 1 ? 'щойно' : min < 60 ? `${min} хв тому` : min < 60 * 48 ? `${Math.round(min / 60)} год тому` : `${Math.round(min / 1440)} дн. тому`;
  return min < 1 ? 'just now' : min < 60 ? `${min} min ago` : min < 60 * 48 ? `${Math.round(min / 60)} h ago` : `${Math.round(min / 1440)} days ago`;
}

// ---------- air sensors (Sensor.Community) ----------

/** [lat, lon, PM2.5, PM10 or null, AQI, country code] */
export type AirPoint = [number, number, number, number | null, number, string];

let airCache: { key: string; promise: Promise<{ built: string; p: AirPoint[] }> } | null = null;

export function loadAir(manifest: LiveManifest): Promise<{ built: string; p: AirPoint[] }> {
  const a = manifest.air!;
  const key = `${manifest.built}|${a.count}`;
  if (airCache?.key === key) return airCache.promise;
  const promise = fetch(`${BASE}${a.file}?b=${encodeURIComponent(manifest.built)}`).then((r) => {
    if (!r.ok) throw new Error(`air ${r.status}`);
    return r.json();
  });
  airCache = { key, promise };
  promise.catch(() => (airCache = null));
  return promise;
}
