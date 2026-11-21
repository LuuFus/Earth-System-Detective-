// Live data built every hour by data-pipeline/build_live.py: the NOAA GFS forecast (wind, air
// temperature, rain and snow, gusts, cloud) and NASA FIRMS fires of the last 48 hours.

import { useEffect, useState } from 'react';

const BASE = `${import.meta.env.BASE_URL}data/live/`;

export type WeatherVar = 'u' | 'v' | 't' | 'precip' | 'gust' | 'cloud';

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
  if (!force && manifestCache && now - manifestCache.at < 60_000) return manifestCache.promise;
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

export class WeatherFrame {
  readonly time: Date;
  readonly ni: number;
  readonly nj: number;
  private readonly bytes: Uint8Array;
  private readonly size: number;
  private readonly offsets: Record<WeatherVar, number>;

  constructor(bytes: Uint8Array, time: string, ni: number, nj: number, vars: WeatherVar[]) {
    this.bytes = bytes;
    this.time = new Date(time);
    this.ni = ni;
    this.nj = nj;
    this.size = ni * nj;
    this.offsets = Object.fromEntries(vars.map((v, i) => [v, i * this.size])) as Record<WeatherVar, number>;
  }

  /** Raw byte at grid cell (i column from 0°E, j row from the north pole). */
  private raw(v: WeatherVar, i: number, j: number): number {
    return this.bytes[this.offsets[v] + j * this.ni + i];
  }

  static decode(v: WeatherVar, b: number): number {
    switch (v) {
      case 'u':
      case 'v':
        return (b - 128) * 0.5;
      case 't':
        return b / 2 - 70;
      case 'precip':
        return (b / 32) ** 2;
      case 'gust':
        return b / 4;
      default:
        return b;
    }
  }

  /** Bilinear value at a place, in the variable's own unit. */
  sample(v: WeatherVar, lat: number, lon: number): number {
    const x = (((lon % 360) + 360) % 360) / 1;
    const y = Math.min(this.nj - 1.0001, Math.max(0, 90 - lat));
    const i0 = Math.floor(x);
    const j0 = Math.floor(y);
    const fx = x - i0;
    const fy = y - j0;
    const i1 = (i0 + 1) % this.ni;
    const j1 = j0 + 1;
    const a = WeatherFrame.decode(v, this.raw(v, i0 % this.ni, j0));
    const b = WeatherFrame.decode(v, this.raw(v, i1, j0));
    const c = WeatherFrame.decode(v, this.raw(v, i0 % this.ni, j1));
    const d = WeatherFrame.decode(v, this.raw(v, i1, j1));
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  }

  wind = (lat: number, lon: number): [number, number] => [this.sample('u', lat, lon), this.sample('v', lat, lon)];
}

const frameCache = new Map<string, Promise<WeatherFrame>>();

export function loadFrame(manifest: LiveManifest, index: number): Promise<WeatherFrame> {
  const w = manifest.weather!;
  const f = w.frames[index];
  const key = `${w.run}|${f.file}`;
  let p = frameCache.get(key);
  if (!p) {
    p = fetchBytes(`${BASE}${f.file}?r=${encodeURIComponent(w.run)}`, w.compression)
      .then((buf) => new WeatherFrame(new Uint8Array(buf), f.time, w.grid.ni, w.grid.nj, w.vars));
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

// ---------- colour scales for the weather fields ----------

export type FieldKind = 'wind' | 'gust' | 'temp' | 'precip' | 'cloud';
type Stop = [number, [number, number, number, number]];

/** Scales in the spirit of Windy's: calm blues to strong purples, cold violets to hot reds. */
export const SCALES: Record<FieldKind, { unit: string; stops: Stop[] }> = {
  wind: {
    unit: 'm/s',
    stops: [
      [0, [52, 82, 170, 170]],
      [3, [54, 133, 196, 175]],
      [6, [62, 170, 140, 180]],
      [9, [120, 190, 70, 185]],
      [12, [222, 196, 54, 190]],
      [16, [232, 128, 46, 200]],
      [20, [214, 60, 58, 205]],
      [26, [168, 46, 120, 210]],
      [34, [110, 50, 160, 215]],
    ],
  },
  gust: {
    unit: 'm/s',
    stops: [
      [0, [52, 82, 170, 160]],
      [5, [54, 133, 196, 170]],
      [10, [62, 170, 140, 180]],
      [15, [222, 196, 54, 190]],
      [20, [232, 128, 46, 200]],
      [27, [214, 60, 58, 210]],
      [35, [168, 46, 120, 215]],
      [45, [110, 50, 160, 220]],
    ],
  },
  temp: {
    unit: '°C',
    stops: [
      [-40, [140, 98, 196, 190]],
      [-25, [96, 110, 210, 190]],
      [-12, [70, 150, 220, 185]],
      [-2, [110, 200, 230, 180]],
      [2, [140, 210, 170, 175]],
      [10, [170, 210, 90, 180]],
      [18, [238, 210, 70, 185]],
      [26, [240, 140, 50, 195]],
      [34, [214, 60, 52, 205]],
      [44, [140, 24, 40, 215]],
    ],
  },
  precip: {
    unit: 'mm/h',
    stops: [
      [0.08, [90, 160, 230, 0]],
      [0.2, [90, 160, 230, 120]],
      [1, [60, 120, 230, 175]],
      [3, [80, 190, 120, 195]],
      [6, [230, 210, 60, 210]],
      [12, [235, 120, 40, 220]],
      [25, [210, 40, 60, 230]],
      [50, [170, 50, 170, 235]],
    ],
  },
  cloud: {
    unit: '%',
    stops: [
      [10, [220, 226, 236, 0]],
      [40, [220, 226, 236, 70]],
      [70, [230, 234, 242, 140]],
      [100, [245, 247, 250, 200]],
    ],
  },
};

export function colorAt(kind: FieldKind, value: number): [number, number, number, number] {
  const stops = SCALES[kind].stops;
  if (value <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (value <= stops[i][0]) {
      const [x0, c0] = stops[i - 1];
      const [x1, c1] = stops[i];
      const t = (value - x0) / (x1 - x0);
      return [0, 1, 2, 3].map((k) => c0[k] + (c1[k] - c0[k]) * t) as [number, number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}

export function fieldValue(frame: WeatherFrame, kind: FieldKind, lat: number, lon: number): number {
  switch (kind) {
    case 'wind':
      return Math.hypot(frame.sample('u', lat, lon), frame.sample('v', lat, lon));
    case 'gust':
      return frame.sample('gust', lat, lon);
    case 'temp':
      return frame.sample('t', lat, lon);
    case 'precip':
      return frame.sample('precip', lat, lon);
    default:
      return frame.sample('cloud', lat, lon);
  }
}

/**
 * The field painted on a canvas. `projection`: 'equirect' covers lon -180..180, lat 90..-90
 * (the globe); 'mercator' covers the Web Mercator square (the flat map).
 */
export function paintField(frame: WeatherFrame, kind: FieldKind, projection: 'equirect' | 'mercator', width = 1440): HTMLCanvasElement {
  const height = projection === 'equirect' ? Math.round(width / 2) : width;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(width, height);
  const px = img.data;
  for (let y = 0; y < height; y++) {
    let lat: number;
    if (projection === 'equirect') lat = 90 - ((y + 0.5) / height) * 180;
    else {
      const m = Math.PI * (1 - (2 * (y + 0.5)) / height);
      lat = (Math.atan(Math.sinh(m)) * 180) / Math.PI;
    }
    for (let x = 0; x < width; x++) {
      const lon = -180 + ((x + 0.5) / width) * 360;
      const c = colorAt(kind, fieldValue(frame, kind, lat, lon));
      const k = (y * width + x) * 4;
      px[k] = c[0];
      px[k + 1] = c[1];
      px[k + 2] = c[2];
      px[k + 3] = c[3];
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
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
