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
    features.push({ type: 'Feature' as const, properties: { i, age: f.ageMin[i] / 60 + since, frp: f.frp[i] }, geometry: { type: 'Point' as const, coordinates: [f.lon[i], f.lat[i]] } });
  }
  return { type: 'FeatureCollection', features };
}

/** Strikes with their smoke scenes: a ring at each, with its date. */
export function strikesGeo(list: { id: string; start: string; camera: { lat: number; lon: number }; title: { uk: string; en: string } }[], lang: 'uk' | 'en'): FC {
  return {
    type: 'FeatureCollection',
    features: list.map((s) => ({
      type: 'Feature' as const,
      properties: { id: s.id, label: new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { month: 'short', year: 'numeric' }).format(new Date(`${s.start}T12:00:00Z`)) },
      geometry: { type: 'Point' as const, coordinates: [s.camera.lon, s.camera.lat] },
    })),
  };
}

/** Cities of the Cities layer, named in the page's language. */
export function citiesGeo(list: { id: number; uk: string; en: string; lat: number; lon: number; pop: number }[], lang: 'uk' | 'en'): FC {
  return {
    type: 'FeatureCollection',
    features: list.map((c) => ({ type: 'Feature' as const, properties: { id: c.id, name: c[lang], pop: c.pop }, geometry: { type: 'Point' as const, coordinates: [c.lon, c.lat] } })),
  };
}

/**
 * Flame markers for the fires of the last 48 hours: fresh (white-yellow core), a day old
 * (orange-red), two days old (dark red, fainter). Drawn once into the map's sprite.
 */
export function addFlameImages(map: { hasImage: (id: string) => boolean; addImage: (id: string, img: ImageData, o: { pixelRatio: number }) => void }): void {
  const looks: [string, string, string, number][] = [
    ['flame-0', '#fff6c2', '#ff9a1f', 1],
    ['flame-1', '#ffc46b', '#ff5a1a', 0.95],
    ['flame-2', '#ff8a5c', '#a3261b', 0.75],
  ];
  for (const [id, core, edge, alpha] of looks) {
    if (map.hasImage(id)) continue;
    const c = document.createElement('canvas');
    c.width = 40;
    c.height = 56;
    const ctx = c.getContext('2d')!;
    ctx.globalAlpha = alpha;
    // Outer flame: a teardrop with a pointed top, ringed in dark so it reads on any map.
    const flame = (s: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(20, 4 + dy + (1 - s) * 22);
      ctx.bezierCurveTo(20 + 15 * s, 22 + dy, 20 + 17 * s, 36 + dy, 20, 52);
      ctx.bezierCurveTo(20 - 17 * s, 36 + dy, 20 - 15 * s, 22 + dy, 20, 4 + dy + (1 - s) * 22);
      ctx.closePath();
    };
    flame(1, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(4,6,11,0.75)';
    ctx.stroke();
    const g = ctx.createLinearGradient(0, 52, 0, 4);
    g.addColorStop(0, edge);
    g.addColorStop(1, core);
    ctx.fillStyle = g;
    ctx.fill();
    flame(0.55, 8);
    ctx.fillStyle = core;
    ctx.fill();
    map.addImage(id, ctx.getImageData(0, 0, 40, 56), { pixelRatio: 2 });
  }
}
