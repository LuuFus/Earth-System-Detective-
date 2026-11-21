// What is near a place right now: fires, air-quality stations, notable events, the weather.
// Only what the loaded data says; nothing is guessed.

import type { LiveFires, WeatherFrame } from './live';

const KM_PER_DEG = 111.2;

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** A grid of points in half-degree cells, for fast "what is within N km" questions. */
export class PointIndex {
  private cells = new Map<number, number[]>();
  readonly lat: ArrayLike<number>;
  readonly lon: ArrayLike<number>;
  constructor(lat: ArrayLike<number>, lon: ArrayLike<number>) {
    this.lat = lat;
    this.lon = lon;
    for (let i = 0; i < lat.length; i++) {
      const k = PointIndex.key(lat[i], lon[i]);
      const list = this.cells.get(k);
      if (list) list.push(i);
      else this.cells.set(k, [i]);
    }
  }

  private static key(lat: number, lon: number) {
    return Math.floor((lat + 90) * 2) * 1000 + Math.floor((lon + 180) * 2);
  }

  /** Indices within `km` of a place, nearest first. */
  within(lat: number, lon: number, km: number): { i: number; km: number }[] {
    const dLat = km / KM_PER_DEG;
    const dLon = km / (KM_PER_DEG * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));
    const out: { i: number; km: number }[] = [];
    for (let a = Math.floor((lat - dLat + 90) * 2); a <= Math.floor((lat + dLat + 90) * 2); a++) {
      for (let b = Math.floor((lon - dLon + 180) * 2); b <= Math.floor((lon + dLon + 180) * 2); b++) {
        const list = this.cells.get(a * 1000 + (((b % 720) + 720) % 720));
        if (!list) continue;
        for (const i of list) {
          const d = distanceKm(lat, lon, this.lat[i], this.lon[i]);
          if (d <= km) out.push({ i, km: d });
        }
      }
    }
    return out.sort((x, y) => x.km - y.km);
  }
}

const fireIndexCache = new WeakMap<LiveFires, PointIndex>();

export function fireIndex(f: LiveFires): PointIndex {
  let idx = fireIndexCache.get(f);
  if (!idx) {
    idx = new PointIndex(f.lat, f.lon);
    fireIndexCache.set(f, idx);
  }
  return idx;
}

export type WeatherNow = { temp: number; wind: number; gust: number; precip: number; cloud: number };

export function weatherAt(frame: WeatherFrame, lat: number, lon: number): WeatherNow {
  const u = frame.sample('u', lat, lon);
  const v = frame.sample('v', lat, lon);
  return {
    temp: frame.sample('t', lat, lon),
    wind: Math.hypot(u, v),
    gust: frame.sample('gust', lat, lon),
    precip: frame.sample('precip', lat, lon),
    cloud: frame.sample('cloud', lat, lon),
  };
}
