// Live layers for Ukraine:
// - air quality from SaveEcoBot's open API (stations of the SaveDnipro network and partners);
// - the front line from DeepState (deepstatemap.live), with every published version since 2022;
// - fire stories built by data-pipeline/build_fire_stories.py from NASA FIRMS archives.

import type { Box } from '../components/globe/tiles';

// ---------- air quality (SaveEcoBot) ----------

export type AqiStation = {
  id: string;
  city: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  temp: number | null;
  humidity: number | null;
  time: string;
};

type SebStation = {
  id: string;
  cityName: string;
  stationName: string;
  localName: string;
  latitude: string;
  longitude: string;
  pollutants: { pol: string; value: number; time: string }[];
};

export const AQI_URL = 'https://api.saveecobot.com/output.json';

let aqiCache: { at: number; promise: Promise<AqiStation[]> } | null = null;

/** Stations that reported in the last three hours; fetched again after five minutes. */
export function loadAqi(): Promise<AqiStation[]> {
  if (aqiCache && Date.now() - aqiCache.at < 5 * 60_000) return aqiCache.promise;
  const promise = fetch(AQI_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`saveecobot ${r.status}`);
      return r.json() as Promise<SebStation[]>;
    })
    .then((list) => {
      // A day of readings: many stations report every few hours. Older than OLD_HOURS they are
      // drawn faded and the card says when they were measured.
      const fresh = Date.now() - 24 * 3600_000;
      const out: AqiStation[] = [];
      for (const s of list) {
        const get = (name: string) => s.pollutants.find((p) => p.pol === name);
        const aqi = get('Air Quality Index');
        const lat = Number(s.latitude);
        const lon = Number(s.longitude);
        if (!aqi || !Number.isFinite(lat) || !Number.isFinite(lon) || Date.parse(aqi.time) < fresh) continue;
        const v = (name: string) => {
          const p = get(name);
          return p && Number.isFinite(p.value) ? p.value : null;
        };
        out.push({
          id: s.id,
          city: s.cityName,
          name: s.stationName || s.localName,
          lat,
          lon,
          aqi: aqiFromPm(v('PM2.5'), v('PM10')) ?? aqi.value,
          pm25: v('PM2.5'),
          pm10: v('PM10'),
          temp: v('Temperature'),
          humidity: v('Humidity') || null,
          time: aqi.time,
        });
      }
      return out;
    });
  aqiCache = { at: Date.now(), promise };
  promise.catch(() => (aqiCache = null));
  return promise;
}

// US EPA AQI breakpoints (2024), the same as data-pipeline/build_live.py uses for Sensor.Community.
const PM25_BP: [number, number, number, number][] = [[0, 9, 0, 50], [9.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 125.4, 151, 200], [125.5, 225.4, 201, 300], [225.5, 325.4, 301, 500]];
const PM10_BP: [number, number, number, number][] = [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500]];
function fromTable(c: number, table: [number, number, number, number][]): number {
  for (const [lo, hi, ilo, ihi] of table) if (c <= hi) return Math.round(ilo + ((ihi - ilo) * (Math.max(c, lo) - lo)) / (hi - lo));
  return 500;
}
/** US EPA AQI from PM2.5 and PM10 (µg/m³), so every station on the map uses one scale. */
export function aqiFromPm(pm25: number | null, pm10: number | null): number | null {
  if (pm25 === null && pm10 === null) return null;
  return Math.max(pm25 !== null ? fromTable(pm25, PM25_BP) : 0, pm10 !== null ? fromTable(pm10, PM10_BP) : 0);
}

/** US EPA AQI band, 0 (good) to 5 (hazardous). */
export function aqiBand(aqi: number): number {
  return aqi <= 50 ? 0 : aqi <= 100 ? 1 : aqi <= 150 ? 2 : aqi <= 200 ? 3 : aqi <= 300 ? 4 : 5;
}

export const AQI_COLORS = [0x34d17a, 0xffd23f, 0xff9f0a, 0xff5a5f, 0xb25cf0, 0x8c1c3a];

// ---------- front line (DeepState) ----------

export type FrontVersion = { id: number; date: string; text: { uk: string; en: string } };
export type FrontKind = 'occupied' | 'liberated' | 'unknown';
export type FrontArea = { kind: FrontKind; rings: number[][] };

export const DEEPSTATE = 'https://deepstatemap.live';

let historyCache: Promise<FrontVersion[]> | null = null;

const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** Every published version of the map, oldest first. */
export function loadFrontHistory(): Promise<FrontVersion[]> {
  if (!historyCache) {
    historyCache = fetch(`${DEEPSTATE}/api/history/public`)
      .then((r) => {
        if (!r.ok) throw new Error(`deepstate ${r.status}`);
        return r.json() as Promise<{ id: number; createdAt: string; description: string; descriptionEn: string; status: boolean }[]>;
      })
      .then((list) =>
        list
          .filter((x) => x.status !== false)
          .map((x) => ({ id: x.id, date: x.createdAt, text: { uk: plain(x.description ?? ''), en: plain(x.descriptionEn || x.description || '') } }))
          .sort((a, b) => a.id - b.id),
      );
    historyCache.catch(() => (historyCache = null));
  }
  return historyCache;
}

const geoCache = new Map<number, Promise<FrontArea[]>>();

function classify(name: string): FrontKind | null {
  const n = name.toLowerCase();
  if (n.includes('звільнено') || n.includes('liberated')) return 'liberated';
  if (n.includes('окупован') || n.includes('occupied') || n.includes('ордло') || n.includes('крим')) return 'occupied';
  if (n.includes('невідомий') || n.includes('unknown')) return 'unknown';
  return null;
}

/** The areas of one version of the map: occupied, liberated (recently), status unknown. */
export function loadFront(id: number): Promise<FrontArea[]> {
  let p = geoCache.get(id);
  if (!p) {
    p = fetch(`${DEEPSTATE}/api/history/${id}/geojson`)
      .then((r) => {
        if (!r.ok) throw new Error(`deepstate ${id} ${r.status}`);
        return r.json() as Promise<{ features: { geometry: { type: string; coordinates: number[][][] | number[][][][] }; properties: { name?: string } }[] }>;
      })
      .then((g) => {
        const out: FrontArea[] = [];
        for (const f of g.features) {
          const kind = classify(f.properties?.name ?? '');
          if (!kind || !f.geometry) continue;
          const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] : f.geometry.type === 'MultiPolygon' ? (f.geometry.coordinates as number[][][][]) : [];
          for (const poly of polys) out.push({ kind, rings: poly.map((ring) => ring.flatMap((c) => [c[0], c[1]])) });
        }
        // Occupied first, so the other statuses draw on top of it.
        return out.sort((a, b) => (a.kind === 'occupied' ? -1 : 0) - (b.kind === 'occupied' ? -1 : 0));
      });
    geoCache.set(id, p);
    p.catch(() => geoCache.delete(id));
    if (geoCache.size > 12) geoCache.delete(geoCache.keys().next().value as number);
  }
  return p;
}

/** Box the front canvas covers: Ukraine and the occupied border areas, with a margin. */
export const FRONT_BOX: Box = { w: 21.5, s: 43.8, e: 41.5, n: 53.2 };

function token(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Paints the areas into an equirectangular canvas over `box`, as the war layer does. */
export function drawFront(areas: FrontArea[], box: Box = FRONT_BOX, maxWidth = 4096): HTMLCanvasElement {
  const { w, s, e, n } = box;
  const lonScale = Math.cos((((s + n) / 2) * Math.PI) / 180);
  let width = maxWidth;
  let height = Math.round((width * (n - s)) / ((e - w) * lonScale));
  if (height > 4096) {
    height = 4096;
    width = Math.round((height * (e - w) * lonScale) / (n - s));
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d')!;
  const kx = canvas.width / (e - w);
  const ky = canvas.height / (n - s);
  const colors: Record<FrontKind, string> = {
    occupied: token('--color-front-occupied', '#d9483b'),
    liberated: token('--color-front-liberated', '#3d8bfd'),
    unknown: token('--color-front-unknown', '#9b8f86'),
  };
  const line = Math.max(1, canvas.width / 2400);
  for (const a of areas) {
    ctx.beginPath();
    for (const ring of a.rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const x = (ring[i] - w) * kx;
        const y = (n - ring[i + 1]) * ky;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    ctx.globalAlpha = a.kind === 'occupied' ? 0.42 : a.kind === 'liberated' ? 0.16 : 0.3;
    ctx.fillStyle = colors[a.kind];
    ctx.fill('evenodd');
    ctx.globalAlpha = a.kind === 'occupied' ? 0.95 : 0.6;
    ctx.lineWidth = line * (a.kind === 'occupied' ? 1.6 : 1);
    ctx.strokeStyle = colors[a.kind];
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

/** One version per day (the last of the day), for the history slider. */
export function dailyVersions(list: FrontVersion[]): FrontVersion[] {
  const byDay = new Map<string, FrontVersion>();
  for (const v of list) byDay.set(v.date.slice(0, 10), v);
  return [...byDay.values()];
}

// ---------- fire stories (NASA FIRMS archives) ----------

export type FireStory = {
  id: string;
  box: { w: number; s: number; e: number; n: number };
  start: string;
  days: number;
  count: number;
  perDay: number[];
  camera: { lat: number; lon: number; distance: number };
  title: { uk: string; en: string };
  text: { uk: string; en: string };
  file: string;
};

export type StoryPoints = { lat: Float32Array; lon: Float32Array; hours: Float32Array; frp: Uint16Array };

const FIRES = `${import.meta.env.BASE_URL}data/fires/`;
let storiesCache: Promise<{ source: string; url: string; stories: FireStory[] }> | null = null;

export function loadStories() {
  if (!storiesCache) {
    storiesCache = fetch(`${FIRES}stories.json`).then((r) => {
      if (!r.ok) throw new Error(`stories ${r.status}`);
      return r.json();
    });
    storiesCache.catch(() => (storiesCache = null));
  }
  return storiesCache;
}

const storyCache = new Map<string, Promise<StoryPoints>>();

export function loadStory(story: FireStory): Promise<StoryPoints> {
  let p = storyCache.get(story.id);
  if (!p) {
    p = fetch(`${FIRES}${story.file}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${story.file} ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => {
        const n = story.count;
        const all = new Uint16Array(buf);
        const b = story.box;
        const lat = new Float32Array(n);
        const lon = new Float32Array(n);
        const hours = new Float32Array(n);
        const frp = new Uint16Array(n);
        for (let i = 0; i < n; i++) {
          lat[i] = b.s + (all[i] / 65535) * (b.n - b.s);
          lon[i] = b.w + (all[n + i] / 65535) * (b.e - b.w);
          hours[i] = all[2 * n + i];
          frp[i] = all[3 * n + i];
        }
        return { lat, lon, hours, frp };
      });
    storyCache.set(story.id, p);
    p.catch(() => storyCache.delete(story.id));
  }
  return p;
}
