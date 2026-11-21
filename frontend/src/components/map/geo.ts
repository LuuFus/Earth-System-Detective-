// GeoJSON for the 2D map, built from the site's own data: borders, Ukraine's outline and the dark
// mask around it, the front line, the official list of occupied communities, fires.

import type { FeatureCollection, Geometry } from 'geojson';
import type { GeoBorders, GeoCountry } from '../../data/geo';
import type { LiveFires } from '../../data/live';
import type { FrontArea } from '../../data/ukraine';
import type { WarData } from '../../data/war';

type FC = FeatureCollection<Geometry, Record<string, unknown>>;

const pairs = (flat: number[]) => {
  const out: [number, number][] = [];
  for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
  return out;
};
const closed = (ring: [number, number][]) => (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ? [...ring, ring[0]] : ring);

export function bordersGeo(b: GeoBorders): FC {
  const lines = (list: number[][], kind: string) => list.map((l) => ({ type: 'Feature' as const, properties: { kind }, geometry: { type: 'LineString' as const, coordinates: pairs(l) } }));
  return { type: 'FeatureCollection', features: [...lines(b.land, 'land'), ...lines(b.disputed, 'disputed'), ...lines(b.coast, 'coast')] };
}

export function outlineGeo(c: GeoCountry): FC {
  return {
    type: 'FeatureCollection',
    features: c.rings.map((r) => ({ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: closed(pairs(r)) } })),
  };
}

/** The whole world with Ukraine cut out: dims everything around it. */
export function maskGeo(c: GeoCountry): FC {
  const world: [number, number][] = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world, ...c.rings.map((r) => closed(pairs(r)).reverse())] } }],
  };
}

export function frontGeo(areas: FrontArea[]): FC {
  return {
    type: 'FeatureCollection',
    features: areas.map((a) => ({ type: 'Feature' as const, properties: { kind: a.kind }, geometry: { type: 'Polygon' as const, coordinates: a.rings.map((r) => closed(pairs(r))) } })),
  };
}

export function warGeo(d: WarData): FC {
  const polys = (list: number[][][], kind: string) =>
    list.map((rings) => ({ type: 'Feature' as const, properties: { kind }, geometry: { type: 'Polygon' as const, coordinates: rings.map((r) => closed(pairs(r))) } }));
  return { type: 'FeatureCollection', features: [...polys(d.occupied, 'occupied'), ...polys(d.partly, 'partly'), ...polys(d.combat, 'combat')] };
}

export function firesGeo(f: LiveFires, built: string): FC {
  const since = Math.max(0, (Date.now() - Date.parse(built)) / 3600_000);
  const features = [];
  for (let i = 0; i < f.count; i++) {
    features.push({ type: 'Feature' as const, properties: { age: f.ageMin[i] / 60 + since, frp: f.frp[i] }, geometry: { type: 'Point' as const, coordinates: [f.lon[i], f.lat[i]] } });
  }
  return { type: 'FeatureCollection', features };
}
