// Fire detections from NASA GIBS as vector tiles (Mapbox Vector Tile, EPSG:4326 grid), drawn
// into the globe's own tiles. GIBS serves its fire layers as vector tiles; reading them here
// means one map can hold every satellite's detections of a day, and it does not depend on the
// GIBS WMS drawing them.

import { TILE, type TileSource } from './tiles';

/** A fire layer and the first day it has data. */
export type FireLayer = { layer: string; first: string };

/** Points of a vector tile, in tile units (0..extent, y down), from every layer in it. */
export function decodePoints(buf: Uint8Array): { extent: number; x: number[]; y: number[] } {
  let pos = 0;
  const varint = (end: number): number => {
    let v = 0;
    let shift = 0;
    while (pos < end) {
      const b = buf[pos++];
      v += (b & 0x7f) * 2 ** shift;
      if (b < 0x80) break;
      shift += 7;
    }
    return v;
  };
  const skip = (wire: number, end: number) => {
    if (wire === 0) varint(end);
    else if (wire === 1) pos += 8;
    else if (wire === 2) {
      const len = varint(end);
      pos += len;
    }
    else if (wire === 5) pos += 4;
    else pos = end;
  };
  const x: number[] = [];
  const y: number[] = [];
  let extent = 4096;
  const layerEnd = buf.length;
  while (pos < layerEnd) {
    const key = varint(layerEnd);
    if (key >> 3 !== 3 || (key & 7) !== 2) {
      skip(key & 7, layerEnd);
      continue;
    }
    // The length first: `pos + varint()` would read pos before the length moved it.
    const layerLen = varint(layerEnd);
    const end = pos + layerLen;
    while (pos < end) {
      const k = varint(end);
      const field = k >> 3;
      if (field === 5 && (k & 7) === 0) {
        extent = varint(end);
      } else if (field === 2 && (k & 7) === 2) {
        const featureLen = varint(end);
        const fEnd = pos + featureLen;
        let type = 0;
        let geomStart = -1;
        let geomEnd = -1;
        while (pos < fEnd) {
          const fk = varint(fEnd);
          if (fk >> 3 === 3 && (fk & 7) === 0) type = varint(fEnd);
          else if (fk >> 3 === 4 && (fk & 7) === 2) {
            const len = varint(fEnd);
            geomStart = pos;
            geomEnd = pos + len;
            pos = geomEnd;
          } else skip(fk & 7, fEnd);
        }
        if (type === 1 && geomStart >= 0) {
          const save = pos;
          pos = geomStart;
          let cx = 0;
          let cy = 0;
          while (pos < geomEnd) {
            const cmd = varint(geomEnd);
            const id = cmd & 7;
            const count = cmd >> 3;
            if (id !== 1 && id !== 2) continue;
            for (let i = 0; i < count && pos < geomEnd; i++) {
              const dx = varint(geomEnd);
              const dy = varint(geomEnd);
              cx += (dx >>> 1) ^ -(dx & 1);
              cy += (dy >>> 1) ^ -(dy & 1);
              x.push(cx);
              y.push(cy);
            }
          }
          pos = save;
        }
        pos = fEnd;
      } else skip(k & 7, end);
    }
    pos = end;
  }
  return { extent, x, y };
}

const MVT_MAX = 7; // finest level of the GIBS 500 m tile matrix set
const host = (i: number) => `https://gibs-${'abc'[i % 3]}.earthdata.nasa.gov`;
const cache = new Map<string, Promise<ReturnType<typeof decodePoints> | null>>();

function loadPoints(url: string) {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((b) => (b ? decodePoints(new Uint8Array(b)) : null))
      .catch(() => null);
    cache.set(url, p);
    if (cache.size > 400) cache.delete(cache.keys().next().value!);
  }
  return p;
}

/** The satellites whose fire layers have data on a day. */
export function layersOn(layers: FireLayer[], date: string): FireLayer[] {
  return layers.filter((l) => date >= l.first);
}

/**
 * Fire detections of one day from several satellites, drawn as dots. Finer globe levels reuse
 * the finest vector tile and draw only their part of it, so the dots stay the same size on screen.
 */
export function firesSource(layers: FireLayer[], date: string): TileSource {
  const on = layersOn(layers, date);
  const id = `fires:${on.map((l) => l.layer).join('+')}:${date}`;
  return {
    id,
    url: (z, r, c) => `${id}/${z}/${r}/${c}`,
    maxLevel: 10,
    transparent: true,
    progressive: false,
    async compose(z, r, c) {
      const mz = Math.min(z, MVT_MAX);
      const k = 2 ** (z - mz);
      const mr = Math.floor(r / k);
      const mc = Math.floor(c / k);
      const tiles = await Promise.all(on.map((l, i) => loadPoints(`${host(mr + mc + i)}/wmts/epsg4326/best/${l.layer}/default/${date}/500m/${mz}/${mr}/${mc}.mvt`)));
      if (!tiles.some((t) => t && t.x.length)) return null;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = TILE;
      const ctx = canvas.getContext('2d')!;
      // Part of the vector tile this tile covers.
      const subX = c - mc * k;
      const subY = r - mr * k;
      // Dots grow a little as the view gets closer, but far less than the ground does.
      const radius = Math.min(4.2, 1.5 + 0.35 * Math.max(0, z - 2));
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.2);
      glow.addColorStop(0, 'rgba(255,240,170,1)');
      glow.addColorStop(0.35, 'rgba(255,120,30,0.95)');
      glow.addColorStop(1, 'rgba(220,40,20,0)');
      ctx.fillStyle = glow;
      for (const t of tiles) {
        if (!t) continue;
        const scale = (TILE * k) / t.extent;
        for (let i = 0; i < t.x.length; i++) {
          const px = t.x[i] * scale - subX * TILE;
          const py = t.y[i] * scale - subY * TILE;
          if (px < -8 || py < -8 || px > TILE + 8 || py > TILE + 8) continue;
          ctx.setTransform(1, 0, 0, 1, px, py);
          ctx.fillRect(-radius * 2.2, -radius * 2.2, radius * 4.4, radius * 4.4);
        }
      }
      return canvas;
    },
  };
}
