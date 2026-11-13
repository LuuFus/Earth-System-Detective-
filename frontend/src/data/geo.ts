// Map reference layers from Natural Earth (public domain), built by data-pipeline/build_geo.py:
// country outlines for comparing two countries, and borders, coastlines, capitals, seas and
// rivers for the globe.
// Natural Earth draws Crimea as Russian; the build moves it to Ukraine.

import type { Text } from './variables';

export type GeoCountry = {
  code: string;
  uk: string;
  en: string;
  /** Where the name goes, [lat, lon]. */
  label: [number, number];
  /** [s, w, n, e] */
  box: [number, number, number, number];
  /** Approximate area, km². */
  area: number;
  /** Rings as flat [lon, lat, lon, lat, ...]; even-odd fill (holes are rings too). */
  rings: number[][];
};

export type GeoPlace = { uk: string; en: string; lat: number; lon: number; rank: number };
export type GeoCapital = GeoPlace & { code: string };
export type GeoSea = GeoPlace & { kind: string };
export type GeoLabels = {
  capitals: GeoCapital[];
  seas: GeoSea[];
  rivers: { lines: number[][]; labels: GeoPlace[] };
};

/** Land borders (international, and disputed drawn fainter) and coastlines; flat lon, lat lines. */
export type GeoBorders = { land: number[][]; disputed: number[][]; coast: number[][] };

const base = `${import.meta.env.BASE_URL}data/geo/`;

let countriesPromise: Promise<Map<string, GeoCountry>> | null = null;
let labelsPromise: Promise<GeoLabels> | null = null;

export function loadCountries(): Promise<Map<string, GeoCountry>> {
  if (!countriesPromise) {
    countriesPromise = fetch(`${base}countries.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`countries ${r.status}`);
        return r.json() as Promise<{ countries: GeoCountry[] }>;
      })
      .then((d) => new Map(d.countries.map((c) => [c.code, c])));
    countriesPromise.catch(() => (countriesPromise = null));
  }
  return countriesPromise;
}

export function loadLabels(): Promise<GeoLabels> {
  if (!labelsPromise) {
    labelsPromise = fetch(`${base}labels.json`).then((r) => {
      if (!r.ok) throw new Error(`labels ${r.status}`);
      return r.json() as Promise<GeoLabels>;
    });
    labelsPromise.catch(() => (labelsPromise = null));
  }
  return labelsPromise;
}

let bordersPromise: Promise<GeoBorders> | null = null;

export function loadBorders(): Promise<GeoBorders> {
  if (!bordersPromise) {
    bordersPromise = fetch(`${base}borders.json`).then((r) => {
      if (!r.ok) throw new Error(`borders ${r.status}`);
      return r.json() as Promise<GeoBorders>;
    });
    bordersPromise.catch(() => (bordersPromise = null));
  }
  return bordersPromise;
}

export function inCountry(c: GeoCountry, lat: number, lon: number): boolean {
  const [s, w, n, e] = c.box;
  if (lat < s || lat > n || lon < w || lon > e) return false;
  let inside = false;
  for (const ring of c.rings) {
    const count = ring.length / 2;
    for (let i = 0, j = count - 1; i < count; j = i++) {
      const xi = ring[i * 2];
      const yi = ring[i * 2 + 1];
      const xj = ring[j * 2];
      const yj = ring[j * 2 + 1];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/**
 * The country under a point. Coastal cities (New York, Odesa) can fall just outside the
 * simplified outlines, so a point on the water within about 30 km of a country counts as in it;
 * the open sea gives null.
 */
export async function countryAt(lat: number, lon: number): Promise<GeoCountry | null> {
  const all = await loadCountries();
  const at = (la: number, lo: number) => {
    for (const c of all.values()) if (inCountry(c, la, lo)) return c;
    return null;
  };
  const hit = at(lat, lon);
  if (hit) return hit;
  const k = 1 / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (const r of [0.1, 0.2, 0.3]) {
    for (let a = 0; a < 8; a++) {
      const t = (a * Math.PI) / 4;
      const near = at(lat + r * Math.sin(t), lon + r * Math.cos(t) * k);
      if (near) return near;
    }
  }
  return null;
}

/**
 * Up to about `target` points spread evenly over a country's area (equal-area grid: the
 * east-west step widens with latitude). Small countries get at least their label point.
 */
export function samplePoints(c: GeoCountry, target: number): { lat: number; lon: number }[] {
  let step = Math.sqrt(c.area / target) / 111;
  const [s, w, n, e] = c.box;
  for (let attempt = 0; attempt < 7; attempt++) {
    const out: { lat: number; lon: number }[] = [];
    for (let lat = s + step / 2; lat < n; lat += step) {
      const lonStep = step / Math.max(0.15, Math.cos((lat * Math.PI) / 180));
      for (let lon = w + lonStep / 2; lon < e; lon += lonStep) if (inCountry(c, lat, lon)) out.push({ lat, lon });
    }
    if (out.length > target * 1.6) step *= 1.25;
    else if (out.length >= Math.max(1, target * 0.5)) return out;
    else step *= 0.7;
  }
  return [{ lat: c.label[0], lon: c.label[1] }];
}

/** Country name in the site language (Intl first, Natural Earth as fallback). */
export function countryName(code: string, lang: 'uk' | 'en', fallback?: Text): string {
  try {
    const name = new Intl.DisplayNames([lang], { type: 'region' }).of(code);
    if (name && name !== code) return name;
  } catch {
    // unknown code
  }
  return fallback?.[lang] ?? code;
}
