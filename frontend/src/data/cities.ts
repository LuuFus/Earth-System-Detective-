// Big cities of the world for the Cities layer, the search and comparisons: Natural Earth's
// populated places (public domain) with 100 000 people or more, every Ukrainian city it has and
// every capital, built by data-pipeline/build_geo.py. Population is Natural Earth's estimate of
// the whole urban area (POP_MAX), area its built-up area.

import { distanceKm } from './nearby';
import type { Text } from './variables';

export type WorldCity = {
  /** Position in the list (largest first): a stable id within one build. */
  id: number;
  uk: string;
  en: string;
  lat: number;
  lon: number;
  /** ISO 3166 code of the country ('' when Natural Earth has none). */
  code: string;
  /** People in the urban area (0 when unknown). */
  pop: number;
  /** Built-up area, km² (0 when unknown). */
  areaKm2: number;
  /** Natural Earth scale rank: 0 the biggest names, 10 the smallest. */
  rank: number;
  capital: boolean;
};

type Row = [string, string, number, number, string, number, number, number, number];

let cache: Promise<WorldCity[]> | null = null;

export function loadCities(): Promise<WorldCity[]> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/geo/cities.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`cities ${r.status}`);
        return r.json() as Promise<{ cities: Row[] }>;
      })
      .then((d) => parseCities(d.cities));
    cache.catch(() => (cache = null));
  }
  return cache;
}

export function parseCities(rows: Row[]): WorldCity[] {
  return rows.map(([uk, en, lat, lon, code, pop, areaKm2, rank, cap], id) => ({ id, uk, en, lat, lon, code, pop, areaKm2, rank, capital: cap === 1 }));
}

/**
 * The radius that holds a city for comparisons: a circle of its built-up area, a little
 * wider so the edge of town is in, between 6 and 40 km.
 */
export function cityRadiusKm(c: Pick<WorldCity, 'areaKm2' | 'pop'>): number {
  const fromArea = c.areaKm2 > 0 ? Math.sqrt(c.areaKm2 / Math.PI) * 1.15 : 0;
  const fromPop = c.pop > 0 ? 4 + Math.sqrt(c.pop / 1e6) * 9 : 8;
  return Math.round(Math.min(40, Math.max(6, fromArea || fromPop)));
}

/** Lower case, without apostrophes, dashes and accents, ґ as г, ё as е: for matching typed names. */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    // Keep the Cyrillic letters with marks (й, ї); drop the accents of Latin ones (São, Zürich).
    .replace(/\u0438\u0306/g, '\u0439')
    .replace(/\u0456\u0308/g, '\u0457')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʼ'’`‘-]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ґ/g, 'г')
    .replace(/ё/g, 'е')
    .trim();
}

/** Cities whose Ukrainian or English name starts with the query (then contains it), biggest first. */
export function findCities(list: WorldCity[], query: string, limit = 8): WorldCity[] {
  const q = fold(query);
  if (q.length < 2) return [];
  const starts: WorldCity[] = [];
  const contains: WorldCity[] = [];
  for (const c of list) {
    const a = fold(c.uk);
    const b = fold(c.en);
    if (a.startsWith(q) || b.startsWith(q)) starts.push(c);
    else if (a.includes(q) || b.includes(q)) contains.push(c);
  }
  // An exact name first (Paris before Parisot), then the biggest.
  const exact = (c: WorldCity) => (fold(c.uk) === q || fold(c.en) === q ? 0 : 1);
  starts.sort((x, y) => exact(x) - exact(y) || y.pop - x.pop);
  contains.sort((x, y) => y.pop - x.pop);
  return [...starts, ...contains].slice(0, limit);
}

/** The city nearest a place within `km`, or null. */
export function nearestCity(list: WorldCity[], lat: number, lon: number, km: number): { city: WorldCity; km: number } | null {
  let best: { city: WorldCity; km: number } | null = null;
  const dLat = km / 111;
  for (const c of list) {
    if (Math.abs(c.lat - lat) > dLat) continue;
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d <= km && (!best || d < best.km)) best = { city: c, km: d };
  }
  return best;
}

/** A city of the list, or a place the geocoder found (no population then): what the city card shows. */
export type CityPlace = { name: Text; lat: number; lon: number; code?: string; pop?: number; areaKm2?: number; capital?: boolean };

/** A city of the list as the card and the comparisons take it. */
export const cityPlace = (c: WorldCity): CityPlace => ({ name: { uk: c.uk, en: c.en }, lat: c.lat, lon: c.lon, code: c.code, pop: c.pop, areaKm2: c.areaKm2, capital: c.capital });

/** The region a city stands for in comparisons: a circle around it, with its numbers. */
export function cityRegion(place: CityPlace) {
  return {
    kind: 'point' as const,
    lat: place.lat,
    lon: place.lon,
    radiusKm: cityRadiusKm({ areaKm2: place.areaKm2 ?? 0, pop: place.pop ?? 0 }),
    name: place.name,
    city: place.pop ? { pop: place.pop, areaKm2: place.areaKm2 ?? 0, code: place.code ?? '' } : undefined,
  };
}
