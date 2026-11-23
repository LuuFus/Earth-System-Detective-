// Streams NASA GIBS imagery (EPSG:4326) into two canvas textures: a whole-Earth map at a low
// level, and a close-up patch for the current view. Raster layers come as 512 px WMTS tiles from
// the GIBS CDN, spread over its gibs-a/b/c host names, which keeps them parallel in browsers that
// fall back to HTTP/1.1 and its six connections per host. Layers GIBS only serves as vector tiles
// (borders, fires) come from WMS, as a few 1024 px images per level or patch spread over the three
// hosts: GIBS draws the points on request, so one large image is slow and many small ones queue.
//
// What is on screen changes all at once: a new close-up patch, or a new layer or year, replaces
// the old picture only when it is complete (or after a short wait), so the globe never shows a
// mix of scales or a bare map while tiles stream in.

import * as THREE from 'three';

export const TILE = 512;
/** Degrees covered by one tile at level z: level 0 is 288°, every level halves it. */
export const tileSpan = (z: number) => 288 / 2 ** z;

const host = (i: number) => `https://gibs-${'abc'[i % 3]}.earthdata.nasa.gov`;
const MAX_LEVEL: Record<string, number> = { '2km': 5, '1km': 6, '500m': 7, '250m': 8, '125m': 9, '62.5m': 10, '31.25m': 11, '15.625m': 12 };

/** How long a new patch or a new layer may take before what has arrived is shown anyway. */
const PATCH_WAIT = 2500;
const GLOBAL_WAIT = 4000;

export type Box = { s: number; w: number; n: number; e: number };

/** Largest side of one WMS piece, in pixels. */
const AREA_CHUNK = 1024;

export type TileSource = {
  /** Unique per layer and date; a new id restarts loading. */
  id: string;
  url: (z: number, row: number, col: number) => string;
  maxLevel: number;
  transparent: boolean;
  /** Load a coarser level first. Off for points and lines, which a coarse level smears. */
  progressive: boolean;
  /** One image for any box (WMS), used instead of a grid of tiles; `shard` picks the host. */
  area?: (box: Box, width: number, height: number, shard: number) => string;
  /**
   * Daily swath imagery: black pixels are gaps between orbits. They are made transparent and,
   * when `under` is given, filled from another satellite's image of the same day.
   */
  gaps?: { under: ((z: number, row: number, col: number) => string) | null };
  /**
   * Coarse data (a 0.5° model grid, a 1° satellite grid): only this level is loaded, about one
   * data cell a pixel, and stretched smoothly over the globe with no close-ups, so the cells do
   * not show as big squares when zoomed in.
   */
  native?: number;
  /** With `native`: grow the data this many pixels into empty neighbours (a land mask then cuts the coast). */
  dilate?: number;
  /** Daily swath layers: the same layer on nearby days, nearest first, fills the gaps between orbits. */
  fills?: ((z: number, row: number, col: number) => string)[];
  /** Tiles drawn from another tile grid (Web Mercator): `url` is then only the cache key. */
  compose?: (z: number, row: number, col: number) => Promise<HTMLCanvasElement | null>;
};

export function wmtsSource(layer: string, matrixSet: string, format: 'image/png' | 'image/jpeg', time = 'default'): TileSource {
  const ext = format === 'image/png' ? 'png' : 'jpeg';
  return {
    id: `wmts:${layer}:${time}`,
    url: (z, r, c) => `${host(r + c)}/wmts/epsg4326/best/${layer}/default/${time}/${matrixSet}/${z}/${r}/${c}.${ext}`,
    maxLevel: MAX_LEVEL[matrixSet] ?? 5,
    transparent: format === 'image/png',
    progressive: true,
  };
}

/**
 * A swath layer whose orbit gaps are filled from `under` (or left open when it is null). Both
 * must use the same tile grid (MODIS and VIIRS true colour are both 250 m).
 */
export function gapFilledSource(main: TileSource, under: TileSource | null): TileSource {
  return {
    ...main,
    id: `${main.id}+${under?.id ?? 'none'}`,
    maxLevel: under ? Math.min(main.maxLevel, under.maxLevel) : main.maxLevel,
    transparent: true,
    gaps: { under: under ? (z, r, c) => under.url(z, r, c) : null },
  };
}

/** A daily layer whose orbit gaps are filled from `others`, the same layer on nearby days, nearest first. */
export function daysSource(main: TileSource, others: TileSource[]): TileSource {
  if (!others.length) return main;
  return {
    ...main,
    id: `${main.id}+${others.map((o) => o.id).join('+')}`,
    fills: others.map((o) => (z: number, r: number, c: number) => o.url(z, r, c)),
  };
}

/** A coarse layer drawn smoothly from one level (see `TileSource.native`). */
export function nativeSource(main: TileSource, level: number, dilate = 0): TileSource {
  return { ...main, id: `${main.id}@${level}${dilate ? `+${dilate}` : ''}`, native: level, dilate, maxLevel: level };
}

/**
 * A Web Mercator XYZ tile map (`{z}/{x}/{y}` in the template) reprojected into the globe's
 * latitude and longitude tiles, row by row.
 */
export function mercatorSource(id: string, template: string, maxZoom: number, tileSize = 256): TileSource {
  const xyz = (z: number, x: number, y: number) => template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
  const merc = (lat: number) => {
    const r = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
  };
  return {
    id: `merc:${id}`,
    url: (z, r, c) => `merc:${id}/${z}/${r}/${c}`,
    // About one Mercator pixel per tile pixel: level z spans 288/2^z degrees in 512 pixels.
    maxLevel: Math.min(11, maxZoom - 1),
    transparent: true,
    progressive: false,
    async compose(z, r, c) {
      const span = tileSpan(z);
      const w = -180 + c * span;
      const n = 90 - r * span;
      const e = Math.min(180, w + span);
      const s = Math.max(-90, n - span);
      if (s >= 85.05 || n <= -85.05) return null;
      // The Mercator level whose pixels are about as fine as this tile's.
      const mz = Math.max(0, Math.min(maxZoom, Math.round(Math.log2((360 * TILE) / (tileSize * span)))));
      const count = 2 ** mz;
      const x0 = Math.floor(((w + 180) / 360) * count);
      const x1 = Math.min(count - 1, Math.floor((((e + 180) / 360) * count) - 1e-9));
      const y0 = Math.floor(merc(n) * count);
      const y1 = Math.min(count - 1, Math.floor(merc(s) * count - 1e-9));
      if ((x1 - x0 + 1) * (y1 - y0 + 1) > 36) return null;
      const tiles = new Map<string, Pic | null>();
      await Promise.all(
        Array.from({ length: (x1 - x0 + 1) * (y1 - y0 + 1) }, (_, k) => {
          const x = x0 + (k % (x1 - x0 + 1));
          const y = y0 + Math.floor(k / (x1 - x0 + 1));
          return loadTile(xyz(mz, x, y)).then((img) => tiles.set(`${x},${y}`, img));
        }),
      );
      if (![...tiles.values()].some(Boolean)) return null;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = TILE;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      const pxW = (e - w) / TILE;
      const pxH = (n - s) / TILE;
      for (let row = 0; row < TILE; row++) {
        const lat = n - (row + 0.5) * pxH;
        if (Math.abs(lat) > 85.05) continue;
        const my = merc(lat) * count;
        const ty = Math.floor(my);
        for (let tx = x0; tx <= x1; tx++) {
          const img = tiles.get(`${tx},${ty}`);
          if (!img) continue;
          const size = (img as HTMLImageElement).naturalWidth || img.width || tileSize;
          const sy = Math.min(size - 1, Math.floor((my - ty) * size));
          const lonA = Math.max(w, (tx / count) * 360 - 180);
          const lonB = Math.min(e, ((tx + 1) / count) * 360 - 180);
          if (lonB <= lonA) continue;
          const sx0 = (((lonA + 180) / 360) * count - tx) * size;
          const sx1 = (((lonB + 180) / 360) * count - tx) * size;
          const dx0 = (lonA - w) / pxW;
          const dx1 = (lonB - w) / pxW;
          ctx.drawImage(img, sx0, sy, Math.max(0.5, sx1 - sx0), 1, dx0, row, dx1 - dx0, 1);
        }
      }
      return canvas;
    },
  };
}

/** `low` up to its finest level, then `high` for the levels beyond it (base map: Blue Marble, then Landsat). */
export function stackSource(id: string, low: TileSource, high: TileSource): TileSource {
  return {
    id,
    url: (z, r, c) => (z <= low.maxLevel ? low.url(z, r, c) : high.url(z, r, c)),
    maxLevel: Math.max(low.maxLevel, high.maxLevel),
    transparent: low.transparent || high.transparent,
    progressive: true,
  };
}

/**
 * WMS GetMap for vector-only layers (borders, fires): one image per box. `closeLayers`, when
 * given, replaces `layers` for views finer than about 250 m a pixel.
 */
export function wmsSource(layers: string, maxLevel: number, time?: string, closeLayers?: string): TileSource {
  const area = (b: Box, width: number, height: number, shard: number) => {
    const close = closeLayers && (b.e - b.w) / width < 0.003;
    const params = new URLSearchParams({
      SERVICE: 'WMS',
      REQUEST: 'GetMap',
      VERSION: '1.3.0',
      LAYERS: close ? closeLayers : layers,
      STYLES: '',
      CRS: 'EPSG:4326',
      // WMS 1.3.0 with EPSG:4326 takes latitude first.
      BBOX: [b.s, b.w, b.n, b.e].map((v) => v.toFixed(6)).join(','),
      WIDTH: String(width),
      HEIGHT: String(height),
      FORMAT: 'image/png',
      TRANSPARENT: 'TRUE',
    });
    if (time) params.set('TIME', time);
    return `${host(shard)}/wms/epsg4326/best/wms.cgi?${params}`;
  };
  return {
    id: `wms:${layers}:${time ?? ''}`,
    url: (z, r, c) => {
      const s = tileSpan(z);
      const w = -180 + c * s;
      const n = 90 - r * s;
      return area({ s: n - s, w, n, e: w + s }, TILE, TILE, r + c);
    },
    area,
    maxLevel,
    transparent: true,
    progressive: false,
  };
}

// ---------- shared tile cache ----------

type Pic = HTMLImageElement | HTMLCanvasElement;

/** Requests by key (URL, or a composite of two URLs), most recently used last. */
const cache = new Map<string, Promise<Pic | null>>();
/** The same tiles once decoded, so a patch can draw them without waiting. */
const ready = new Map<string, Pic>();
const CACHE_LIMIT = 700;
/** Composites are canvases that hold their pixels, so fewer of them are kept. */
const COMPOSITE_LIMIT = 120;
const composites: string[] = [];

function remember(key: string, make: () => Promise<Pic | null>, composite = false): Promise<Pic | null> {
  const known = cache.get(key);
  if (known) {
    cache.delete(key);
    cache.set(key, known);
    return known;
  }
  // A tile that fails leaves the cache so a later view can try it again.
  const promise: Promise<Pic | null> = make().then((pic) => {
    if (cache.get(key) === promise) {
      if (pic) ready.set(key, pic);
      else cache.delete(key);
    }
    return pic;
  });
  cache.set(key, promise);
  if (composite) {
    composites.push(key);
    if (composites.length > COMPOSITE_LIMIT) {
      const old = composites.shift()!;
      cache.delete(old);
      ready.delete(old);
    }
  }
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value as string;
    cache.delete(oldest);
    ready.delete(oldest);
  }
  return promise;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // A request that hangs for 20 s is cancelled.
    const timer = window.setTimeout(() => {
      img.onerror = null;
      img.src = '';
      resolve(null);
    }, 20000);
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

const loadTile = (url: string) => remember(url, () => loadImage(url));

/** Swath tile with its black orbit gaps cleared and, if there is one, the other satellite under it. */
async function composeGaps(mainUrl: string, underUrl: string | null): Promise<Pic | null> {
  const [main, under] = await Promise.all([loadTile(mainUrl), underUrl ? loadTile(underUrl) : Promise.resolve(null)]);
  if (!main && !under) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (main) {
    ctx.drawImage(main, 0, 0, TILE, TILE);
    const image = ctx.getImageData(0, 0, TILE, TILE);
    const px = image.data;
    // No data is pure black, and JPEG smears a dark fringe along its edge: dark pixels within two
    // pixels of pure black are cleared too. Under them lies the other satellite's picture of the
    // same day. The black mask is grown by two pixels in two passes (across, then down).
    const w = TILE;
    const black = new Uint8Array(w * w);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) black[j] = px[i] < 13 && px[i + 1] < 13 && px[i + 2] < 13 ? 1 : 0;
    const across = new Uint8Array(w * w);
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < w; x++) {
        let hit = 0;
        for (let d = -2; d <= 2 && !hit; d++) {
          const xx = x + d;
          if (xx >= 0 && xx < w) hit = black[y * w + xx];
        }
        across[y * w + x] = hit;
      }
    }
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < w; x++) {
        let near = 0;
        for (let d = -2; d <= 2 && !near; d++) {
          const yy = y + d;
          if (yy >= 0 && yy < w) near = across[yy * w + x];
        }
        const k = (y * w + x) * 4;
        if (near && px[k] < 40 && px[k + 1] < 40 && px[k + 2] < 48) px[k + 3] = 0;
      }
    }
    ctx.putImageData(image, 0, 0);
  }
  if (under) {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(under, 0, 0, TILE, TILE);
  }
  return canvas;
}

/** A day's tile with its gaps filled from the other days' tiles, nearest day first. */
async function composeDays(mainUrl: string, fillUrls: string[]): Promise<Pic | null> {
  const [main, ...fills] = await Promise.all([loadTile(mainUrl), ...fillUrls.map(loadTile)]);
  if (!main && !fills.some(Boolean)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE;
  const ctx = canvas.getContext('2d')!;
  if (main) ctx.drawImage(main, 0, 0, TILE, TILE);
  // Each later day goes under everything drawn so far, so it shows only where they are empty.
  ctx.globalCompositeOperation = 'destination-over';
  for (const fill of fills) if (fill) ctx.drawImage(fill, 0, 0, TILE, TILE);
  return canvas;
}

function tileKey(source: TileSource, z: number, r: number, c: number): string {
  const url = source.url(z, r, c);
  if (source.fills) return `days:${url}|${source.fills.map((f) => f(z, r, c)).join('|')}`;
  return source.gaps ? `gaps:${url}|${source.gaps.under?.(z, r, c) ?? ''}` : url;
}

function fetchTile(source: TileSource, z: number, r: number, c: number): Promise<Pic | null> {
  const url = source.url(z, r, c);
  if (source.compose) return remember(url, () => source.compose!(z, r, c), true);
  if (source.fills) return remember(tileKey(source, z, r, c), () => composeDays(url, source.fills!.map((f) => f(z, r, c))), true);
  if (!source.gaps) return loadTile(url);
  const under = source.gaps.under?.(z, r, c) ?? null;
  return remember(tileKey(source, z, r, c), () => composeGaps(url, under), true);
}

/** Grows the drawn pixels of a canvas into the empty ones around them, `radius` pixels deep. */
function dilate(canvas: HTMLCanvasElement, width: number, height: number, radius: number): void {
  const copy = document.createElement('canvas');
  copy.width = width;
  copy.height = height;
  copy.getContext('2d')!.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
  const ctx = canvas.getContext('2d')!;
  const offsets: [number, number][] = [];
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) if (dx || dy) offsets.push([dx, dy]);
  offsets.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  ctx.globalCompositeOperation = 'destination-over';
  for (const [dx, dy] of offsets) ctx.drawImage(copy, dx, dy);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Fills small holes in coarse data (the strips between satellite passes) from the pixels around
 * them: the picture is halved `levels` times and each smaller copy goes under the original, so a
 * hole takes the average of its neighbours and the edges fade instead of breaking off. Holes wider
 * than about 2^levels pixels stay open.
 */
function fillGaps(canvas: HTMLCanvasElement, width: number, height: number, levels: number): void {
  const pyramid: HTMLCanvasElement[] = [];
  let from: HTMLCanvasElement = canvas;
  let fw = width;
  let fh = height;
  for (let i = 0; i < levels; i++) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(fw / 2));
    c.height = Math.max(1, Math.round(fh / 2));
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(from, 0, 0, fw, fh, 0, 0, c.width, c.height);
    // Twice: a half-empty neighbourhood still comes out nearly opaque.
    cx.drawImage(c, 0, 0);
    pyramid.push(c);
    from = c;
    fw = c.width;
    fh = c.height;
  }
  const ctx = canvas.getContext('2d')!;
  ctx.globalCompositeOperation = 'destination-over';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  for (const c of pyramid) ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
}

type Canvas = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; texture: THREE.CanvasTexture };

function makeCanvas(width: number, height: number, anisotropy: number): Canvas {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  return { canvas, ctx, texture };
}

type Range = { c0: number; c1: number; r0: number; r1: number; count: number };

/**
 * Global map plus a close-up patch for one GIBS layer. Uploads to the GPU are batched,
 * so a burst of arriving tiles costs one texture upload instead of one per tile.
 */
export class TiledLayer {
  readonly global: Canvas;
  readonly patch: Canvas;
  /** One pixel per patch tile, white once that tile has arrived. */
  readonly mask: Canvas;
  /** Patch bounds in UV space (u0, v0, u1, v1); zero size when there is no patch. */
  readonly bounds = new THREE.Vector4(0, 0, 0, 0);
  /** 1 when the global map may stand in for patch tiles still loading; 0 for points and lines. */
  readonly fill = { value: 1 };
  /** Linear brightness below which a patch pixel counts as missing; 0 turns the check off. */
  readonly noData = { value: 0 };
  private source: TileSource | null = null;
  /** Off-screen canvas a new layer or year is drawn into before it replaces the global map. */
  private back: HTMLCanvasElement | null = null;
  private globalOnScreen = false;
  private patchKey = '';
  /** Source of the patch the GPU shows now. */
  private patchShown = '';
  /** Bounds of the patch being loaded; they take effect when it is complete. */
  private nextBounds: [number, number, number, number] | null = null;
  private patchCommitted = true;
  private patchPending = 0;
  private patchTimer = 0;
  private globalTimer = 0;
  private readonly resized = { patch: false, mask: false };
  /** Bumped to drop tiles still in flight: the global map only on a new source, the patch on every view change. */
  private globalGen = 0;
  private patchGen = 0;
  private dirtyGlobal = false;
  private dirtyPatch = false;
  private flushTimer = 0;
  /** Last view, so a layer can be preloaded for it. */
  private lastBox: Box | null = null;
  private lastPixels = 0;

  private readonly globalLevel: number;
  private readonly onChange: () => void;
  private readonly onLoading: (delta: number) => void;
  private readonly maxPatchTiles: number;

  constructor(globalLevel: number, anisotropy: number, onChange: () => void, onLoading: (delta: number) => void, maxPatchTiles = 42) {
    this.globalLevel = globalLevel;
    this.onChange = onChange;
    this.onLoading = onLoading;
    this.maxPatchTiles = maxPatchTiles;
    const s = tileSpan(globalLevel);
    this.global = makeCanvas(Math.round((360 / s) * TILE), Math.round((180 / s) * TILE), anisotropy);
    this.patch = makeCanvas(TILE, TILE, anisotropy);
    this.patch.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.mask = makeCanvas(1, 1, 1);
    const m = this.mask.texture;
    m.colorSpace = THREE.NoColorSpace;
    m.wrapS = THREE.ClampToEdgeWrapping;
    m.minFilter = m.magFilter = THREE.NearestFilter;
    m.generateMipmaps = false;
  }

  get hasSource(): boolean {
    return this.source !== null;
  }

  setSource(source: TileSource | null): void {
    if (source?.id === this.source?.id) return;
    this.source = source;
    this.fill.value = source && !source.progressive ? 0 : 1;
    this.globalGen++;
    this.patchGen++;
    this.patchKey = '';
    this.nextBounds = null;
    window.clearTimeout(this.globalTimer);
    window.clearTimeout(this.patchTimer);
    this.globalJobs.clear();
    this.dropPatchJobs();
    if (!source) {
      // Nothing to show: clear at once.
      this.globalOnScreen = false;
      this.patchShown = '';
      this.bounds.set(0, 0, 0, 0);
      this.global.ctx.clearRect(0, 0, this.global.canvas.width, this.global.canvas.height);
      this.global.texture.needsUpdate = true;
      this.onChange();
      return;
    }
    const gen = this.globalGen;
    if (!this.globalOnScreen) {
      // First picture: fill in straight away, a coarse level first so the planet is never bare.
      this.globalOnScreen = true;
      this.global.ctx.clearRect(0, 0, this.global.canvas.width, this.global.canvas.height);
      this.global.texture.needsUpdate = true;
      this.patchShown = '';
      this.bounds.set(0, 0, 0, 0);
      this.onChange();
      const target = this.global;
      if (source.native !== undefined) {
        void this.loadNative(gen, target.canvas, target.ctx);
      } else if (source.progressive && this.globalLevel > 1) {
        void this.loadGlobalLevel(this.globalLevel - 1, gen, target.canvas, target.ctx).then(() => {
          if (gen === this.globalGen) void this.loadGlobalLevel(this.globalLevel, gen, target.canvas, target.ctx);
        });
      } else {
        void this.loadGlobalLevel(this.globalLevel, gen, target.canvas, target.ctx);
      }
      return;
    }
    // Another layer or year: keep the current picture until the new one is complete.
    if (!this.back) {
      this.back = document.createElement('canvas');
      this.back.width = this.global.canvas.width;
      this.back.height = this.global.canvas.height;
    }
    const back = this.back;
    const bctx = back.getContext('2d')!;
    bctx.clearRect(0, 0, back.width, back.height);
    const swap = () => {
      if (gen !== this.globalGen) return;
      window.clearTimeout(this.globalTimer);
      const { ctx, canvas } = this.global;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(back, 0, 0);
      this.global.texture.needsUpdate = true;
      // A close-up of the old layer must not stay over the new one; but for points (fires) the
      // global picture is drawn at a far coarser scale and its dots would show huge, so the old
      // close-up stays until the new one is complete.
      if (this.patchShown !== source.id && (source.progressive || !this.patchKey)) {
        this.bounds.set(0, 0, 0, 0);
        this.patchShown = '';
      }
      this.onChange();
    };
    this.globalTimer = window.setTimeout(swap, GLOBAL_WAIT);
    const loading = source.native !== undefined ? this.loadNative(gen, back, bctx, true) : this.loadGlobalLevel(this.globalLevel, gen, back, bctx, true);
    void loading.then(swap);
  }

  /** Coarse layer: its own level into a small canvas, grown if asked, then stretched smoothly over the global map. */
  private async loadNative(gen: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, offscreen = false): Promise<void> {
    const source = this.source!;
    const z = source.native!;
    const s = tileSpan(z);
    const cols = Math.ceil(360 / s);
    const rows = Math.ceil(180 / s);
    const small = document.createElement('canvas');
    small.width = cols * TILE;
    small.height = rows * TILE;
    const sctx = small.getContext('2d')!;
    const jobs: Promise<void>[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const job = fetchTile(source, z, r, c).then((img) => {
          if (img && gen === this.globalGen) sctx.drawImage(img, c * TILE, r * TILE, TILE, TILE);
        });
        this.track(job, this.globalJobs);
        jobs.push(job);
      }
    }
    await Promise.all(jobs);
    if (gen !== this.globalGen) return;
    // The tiles cover more than the globe: only 360° by 180° of them is the map.
    const width = Math.round((360 / s) * TILE);
    const height = Math.round((180 / s) * TILE);
    if (source.dilate) dilate(small, width, height, source.dilate);
    fillGaps(small, width, height, 2 + z);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(small, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    if (!offscreen) {
      this.dirtyGlobal = true;
      this.scheduleFlush();
    }
  }

  private loadGlobalLevel(z: number, gen: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, offscreen = false): Promise<unknown> {
    const source = this.source!;
    const jobs: Promise<void>[] = [];
    const s = tileSpan(z);
    const cols = Math.ceil(360 / s);
    const rows = Math.ceil(180 / s);
    const drawn = () => {
      if (offscreen) return; // the swap uploads it
      this.dirtyGlobal = true;
      this.scheduleFlush();
    };
    if (source.area) {
      // The global canvas covers exactly 360° by 180°.
      return Promise.all(
        this.loadArea(source, { s: -90, w: -180, n: 90, e: 180 }, canvas.width, canvas.height, (img, x, y, w, h) => {
          if (gen !== this.globalGen) return;
          ctx.clearRect(x, y, w, h);
          ctx.drawImage(img, x, y, w, h);
          drawn();
        }),
      );
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const job = fetchTile(source, z, r, c).then((img) => {
          if (!img || gen !== this.globalGen) return;
          const x = ((c * s) / 360) * canvas.width;
          const y = ((r * s) / 180) * canvas.height;
          const w = (s / 360) * canvas.width;
          const h = (s / 180) * canvas.height;
          if (source.transparent) ctx.clearRect(x, y, w, h);
          ctx.drawImage(img, x, y, w, h);
          drawn();
        });
        this.track(job, this.globalJobs);
        jobs.push(job);
      }
    }
    return Promise.all(jobs);
  }

  /** Level and tile range of the close-up for a view, or null when the global map is enough. */
  private patchFor(source: TileSource, box: Box | null, screenPixels: number): { z: number; range: Range } | null {
    if (!box || box.e <= box.w || source.native !== undefined) return null;
    const degPerPixel = (box.e - box.w) / Math.max(256, screenPixels);
    let z = Math.min(source.maxLevel, Math.ceil(Math.log2(288 / (TILE * degPerPixel))));
    let range = this.range(box, z);
    while (z > this.globalLevel && range.count > this.maxPatchTiles) {
      z--;
      range = this.range(box, z);
    }
    return z > this.globalLevel ? { z, range } : null;
  }

  /** The colour drawn at a point (UV of the globe), from the close-up where it covers the point. */
  sample(u: number, v: number): [number, number, number, number] | null {
    const read = (canvas: HTMLCanvasElement, x: number, y: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
      const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      return [d[0], d[1], d[2], d[3]] as [number, number, number, number];
    };
    const b = this.bounds;
    if (b.z > b.x && u >= b.x && u <= b.z && v >= b.y && v <= b.w) {
      const px = ((u - b.x) / (b.z - b.x)) * this.patch.canvas.width;
      const py = (1 - (v - b.y) / (b.w - b.y)) * this.patch.canvas.height;
      const hit = read(this.patch.canvas, px, py);
      if (hit && hit[3] > 0) return hit;
    }
    return read(this.global.canvas, u * this.global.canvas.width, (1 - v) * this.global.canvas.height);
  }

  /** Close-up for the visible box, at the level that matches screen pixels. */
  updateView(box: Box | null, screenPixels: number): void {
    this.lastBox = box;
    this.lastPixels = screenPixels;
    const source = this.source;
    const plan = source ? this.patchFor(source, box, screenPixels) : null;
    if (!source || !plan) {
      this.clearPatch();
      return;
    }
    const { z, range } = plan;
    const key = `${source.id}|${z}|${range.c0},${range.c1},${range.r0},${range.r1}`;
    if (key === this.patchKey) return;
    this.patchKey = key;
    const gen = ++this.patchGen;
    this.dropPatchJobs();

    const s = tileSpan(z);
    const cols = range.c1 - range.c0 + 1;
    const rows = range.r1 - range.r0 + 1;
    const width = cols * TILE;
    const height = rows * TILE;
    const { canvas, ctx } = this.patch;
    const mask = this.mask;
    // The GPU keeps showing the old patch (texture and bounds untouched) until the new one is
    // complete, so the view never shows a mix of sharp and stretched tiles.
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.resized.patch = true;
    } else {
      ctx.clearRect(0, 0, width, height);
    }
    if (mask.canvas.width !== cols || mask.canvas.height !== rows) {
      mask.canvas.width = cols;
      mask.canvas.height = rows;
      this.resized.mask = true;
    } else {
      mask.ctx.clearRect(0, 0, cols, rows);
    }
    mask.ctx.fillStyle = '#fff';
    const lonW = -180 + range.c0 * s;
    const lonE = -180 + (range.c1 + 1) * s;
    const latN = 90 - range.r0 * s;
    const latS = 90 - (range.r1 + 1) * s;
    this.nextBounds = [(lonW + 180) / 360, (latS + 90) / 180, (lonE + 180) / 360, (latN + 90) / 180];
    this.patchCommitted = false;
    window.clearTimeout(this.patchTimer);
    this.patchTimer = window.setTimeout(() => this.commitPatch(gen, source.id), PATCH_WAIT);
    const settle = () => {
      if (gen !== this.patchGen) return;
      this.patchPending--;
      if (this.patchPending <= 0) this.commitPatch(gen, source.id);
    };

    if (source.area) {
      // Pieces of 2 x 2 tiles on a fixed grid: their URLs repeat, so the cache serves pans.
      const span = 2 * s;
      const pieces: (() => void)[] = [];
      for (let R = Math.floor(range.r0 / 2); R <= Math.floor(range.r1 / 2); R++) {
        for (let C = Math.floor(range.c0 / 2); C <= Math.floor(range.c1 / 2); C++) {
          const w = -180 + C * span;
          const n = 90 - R * span;
          const e = Math.min(180, w + span);
          const south = Math.max(-90, n - span);
          const wPx = Math.round((2 * TILE * (e - w)) / span);
          const hPx = Math.round((2 * TILE * (n - south)) / span);
          if (wPx <= 0 || hPx <= 0) continue;
          const x = (2 * C - range.c0) * TILE;
          const y = (2 * R - range.r0) * TILE;
          pieces.push(() =>
            this.trackPatch(
              loadTile(source.area!({ s: south, w, n, e }, wPx, hPx, R + C))
                .then((img) => {
                  if (!img || gen !== this.patchGen) return;
                  ctx.drawImage(img, x, y, wPx, hPx);
                  const mc = Math.max(0, 2 * C - range.c0);
                  const mr = Math.max(0, 2 * R - range.r0);
                  mask.ctx.fillRect(mc, mr, Math.min(cols, 2 * C + 2 - range.c0) - mc, Math.min(rows, 2 * R + 2 - range.r0) - mr);
                  this.dirtyPatch = true;
                  if (this.patchCommitted) this.scheduleFlush();
                })
                .finally(settle),
            ),
          );
        }
      }
      this.patchPending = pieces.length;
      pieces.forEach((start) => start());
      if (!pieces.length) this.commitPatch(gen, source.id);
      return;
    }

    // Start from what is in memory: the tile itself if it was seen before, otherwise the nearest
    // coarser tile stretched (shown only if the sharp one is late).
    let exact = 0;
    for (let r = range.r0; r <= range.r1; r++) {
      for (let c = range.c0; c <= range.c1; c++) {
        for (let k = 0; k <= 4 && z - k > this.globalLevel; k++) {
          const img = ready.get(tileKey(source, z - k, r >> k, c >> k));
          if (!img) continue;
          const part = TILE >> k;
          ctx.drawImage(img, (c & ((1 << k) - 1)) * part, (r & ((1 << k) - 1)) * part, part, part, (c - range.c0) * TILE, (r - range.r0) * TILE, TILE, TILE);
          mask.ctx.fillRect(c - range.c0, r - range.r0, 1, 1);
          if (k === 0) exact++;
          break;
        }
      }
    }
    this.dirtyPatch = true;
    if (exact === range.count) {
      this.commitPatch(gen, source.id);
      return;
    }

    // Centre tiles first.
    const cc = (range.c0 + range.c1) / 2;
    const rc = (range.r0 + range.r1) / 2;
    const tiles: [number, number][] = [];
    for (let r = range.r0; r <= range.r1; r++) for (let c = range.c0; c <= range.c1; c++) tiles.push([r, c]);
    tiles.sort((a, b) => Math.hypot(a[0] - rc, a[1] - cc) - Math.hypot(b[0] - rc, b[1] - cc));
    this.patchPending = tiles.length;
    for (const [r, c] of tiles) {
      this.trackPatch(
        fetchTile(source, z, r, c)
          .then((img) => {
            if (!img || gen !== this.patchGen) return;
            // A stretched parent may sit under this tile; transparent layers must not show it through.
            if (source.transparent) ctx.clearRect((c - range.c0) * TILE, (r - range.r0) * TILE, TILE, TILE);
            ctx.drawImage(img, (c - range.c0) * TILE, (r - range.r0) * TILE, TILE, TILE);
            mask.ctx.fillRect(c - range.c0, r - range.r0, 1, 1);
            this.dirtyPatch = true;
            if (this.patchCommitted) this.scheduleFlush();
          })
          .finally(settle),
      );
    }
  }

  /** The new patch goes on screen: complete, or after PATCH_WAIT with what has arrived. */
  private commitPatch(gen: number, sourceId: string): void {
    if (gen !== this.patchGen || this.patchCommitted) return;
    this.patchCommitted = true;
    window.clearTimeout(this.patchTimer);
    this.patchShown = sourceId;
    this.dirtyPatch = true;
    this.scheduleFlush();
  }

  /**
   * Loads a layer for the last view into the cache without showing it, so the next step of a
   * playback appears at once. Resolves when done or after `wait` ms.
   */
  preload(source: TileSource, wait = 6000): Promise<void> {
    const jobs: Promise<unknown>[] = [];
    const level = source.native ?? this.globalLevel;
    const s = tileSpan(level);
    if (source.area) {
      // Point layers: the global picture in its pieces, and the close-up pieces for the view.
      const lonPerPx = 360 / this.global.canvas.width;
      const latPerPx = 180 / this.global.canvas.height;
      let shard = 0;
      for (let y = 0; y < this.global.canvas.height; y += AREA_CHUNK) {
        for (let x = 0; x < this.global.canvas.width; x += AREA_CHUNK) {
          const w = Math.min(AREA_CHUNK, this.global.canvas.width - x);
          const h = Math.min(AREA_CHUNK, this.global.canvas.height - y);
          jobs.push(loadTile(source.area({ s: 90 - (y + h) * latPerPx, w: -180 + x * lonPerPx, n: 90 - y * latPerPx, e: -180 + (x + w) * lonPerPx }, w, h, shard++)));
        }
      }
      const plan = this.patchFor(source, this.lastBox, this.lastPixels);
      if (plan) {
        const ps = tileSpan(plan.z);
        const span = 2 * ps;
        for (let R = Math.floor(plan.range.r0 / 2); R <= Math.floor(plan.range.r1 / 2); R++) {
          for (let C = Math.floor(plan.range.c0 / 2); C <= Math.floor(plan.range.c1 / 2); C++) {
            const w = -180 + C * span;
            const n = 90 - R * span;
            const e = Math.min(180, w + span);
            const south = Math.max(-90, n - span);
            const wPx = Math.round((2 * TILE * (e - w)) / span);
            const hPx = Math.round((2 * TILE * (n - south)) / span);
            if (wPx > 0 && hPx > 0) jobs.push(loadTile(source.area({ s: south, w, n, e }, wPx, hPx, R + C)));
          }
        }
      }
    } else {
      for (let r = 0; r < Math.ceil(180 / s); r++) for (let c = 0; c < Math.ceil(360 / s); c++) jobs.push(fetchTile(source, level, r, c));
      const plan = this.patchFor(source, this.lastBox, this.lastPixels);
      if (plan) {
        for (let r = plan.range.r0; r <= plan.range.r1; r++) for (let c = plan.range.c0; c <= plan.range.c1; c++) jobs.push(fetchTile(source, plan.z, r, c));
      }
    }
    return Promise.race([Promise.all(jobs).then(() => undefined), new Promise<void>((res) => window.setTimeout(res, wait))]);
  }

  /** Loads a box from an area source as pieces of at most AREA_CHUNK pixels, on rotating hosts. */
  private loadArea(
    source: TileSource,
    box: Box,
    width: number,
    height: number,
    draw: (img: Pic, x: number, y: number, w: number, h: number) => void,
  ): Promise<void>[] {
    const jobs: Promise<void>[] = [];
    const lonPerPx = (box.e - box.w) / width;
    const latPerPx = (box.n - box.s) / height;
    let shard = 0;
    for (let y = 0; y < height; y += AREA_CHUNK) {
      for (let x = 0; x < width; x += AREA_CHUNK) {
        const w = Math.min(AREA_CHUNK, width - x);
        const h = Math.min(AREA_CHUNK, height - y);
        const piece = { s: box.n - (y + h) * latPerPx, w: box.w + x * lonPerPx, n: box.n - y * latPerPx, e: box.w + (x + w) * lonPerPx };
        const job = loadTile(source.area!(piece, w, h, shard++)).then((img) => {
          if (img) draw(img, x, y, w, h);
        });
        this.track(job, this.globalJobs);
        jobs.push(job);
      }
    }
    return jobs;
  }

  /** A canvas whose size changed needs a new GPU texture before its next upload. */
  private syncSizes(): void {
    if (this.resized.patch) this.patch.texture.dispose();
    if (this.resized.mask) this.mask.texture.dispose();
    this.resized.patch = this.resized.mask = false;
  }

  clearPatch(): void {
    if (!this.patchKey) return;
    this.patchKey = '';
    this.nextBounds = null;
    this.patchGen++;
    this.patchCommitted = true;
    window.clearTimeout(this.patchTimer);
    this.dropPatchJobs();
    this.patchShown = '';
    this.bounds.set(0, 0, 0, 0);
    this.onChange();
  }

  private range(box: Box, z: number): Range {
    const s = tileSpan(z);
    const maxCol = Math.ceil(360 / s) - 1;
    const maxRow = Math.ceil(180 / s) - 1;
    const c0 = Math.max(0, Math.floor((box.w + 180) / s));
    const c1 = Math.min(maxCol, Math.floor((box.e + 180) / s));
    const r0 = Math.max(0, Math.floor((90 - box.n) / s));
    const r1 = Math.min(maxRow, Math.floor((90 - box.s) / s));
    return { c0, c1, r0, r1, count: (c1 - c0 + 1) * (r1 - r0 + 1) };
  }

  // Loading counter for the status chip: it counts only what is on screen, the patch while there
  // is one and the global map otherwise. Work for a view that was left stops counting at once,
  // even while its requests still run.
  private patchJobs = new Set<object>();
  private globalJobs = new Set<object>();
  private reported = 0;

  private report(): void {
    const count = this.patchJobs.size + (this.patchKey ? 0 : this.globalJobs.size);
    if (count === this.reported) return;
    this.onLoading(count - this.reported);
    this.reported = count;
  }

  private track(p: Promise<void>, jobs: Set<object>): void {
    const token = {};
    jobs.add(token);
    this.report();
    p.finally(() => {
      if (jobs.delete(token)) this.report();
    });
  }

  private trackPatch(p: Promise<void>): void {
    this.track(p, this.patchJobs);
  }

  private dropPatchJobs(): void {
    this.patchJobs.clear();
    this.report();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    // Upload at most every 120 ms while tiles stream in; the last batch flushes right after.
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = 0;
      if (this.dirtyGlobal) this.global.texture.needsUpdate = true;
      if (this.dirtyPatch && this.patchCommitted) {
        if (this.nextBounds) {
          this.bounds.set(...this.nextBounds);
          this.nextBounds = null;
        }
        this.syncSizes();
        this.patch.texture.needsUpdate = this.mask.texture.needsUpdate = true;
        this.dirtyPatch = false;
      }
      this.dirtyGlobal = false;
      this.onChange();
    }, 120);
  }

  dispose(): void {
    this.globalGen++;
    this.patchGen++;
    this.patchKey = '';
    this.globalJobs.clear();
    this.dropPatchJobs();
    window.clearTimeout(this.flushTimer);
    window.clearTimeout(this.patchTimer);
    window.clearTimeout(this.globalTimer);
    this.global.texture.dispose();
    this.patch.texture.dispose();
    this.mask.texture.dispose();
  }
}

/**
 * GLSL: sample a tiled layer. Inside the patch bounds a tile that has arrived replaces the
 * global map outright, so transparent layers never show the coarse level through. While a patch
 * is active, points and lines (Fill 0) show only the patch: a gap for a moment, not smeared blobs.
 */
export const tiledGlsl = (prefix: string) => /* glsl */ `
  uniform sampler2D ${prefix}Global;
  uniform sampler2D ${prefix}Patch;
  uniform sampler2D ${prefix}Mask;
  uniform vec4 ${prefix}Bounds;
  uniform float ${prefix}Fill;
  uniform float ${prefix}NoData;
  vec4 ${prefix}Sample(vec2 uv) {
    if (${prefix}Bounds.z > ${prefix}Bounds.x) {
      vec2 d = (uv - ${prefix}Bounds.xy) / (${prefix}Bounds.zw - ${prefix}Bounds.xy);
      bool inside = d.x >= 0.0 && d.y >= 0.0 && d.x <= 1.0 && d.y <= 1.0;
      if (inside && texture2D(${prefix}Mask, d).r > 0.5) {
        vec4 close = texture2D(${prefix}Patch, d);
        // Opaque layers mark missing data in black (Landsat far out at sea): use the global map there.
        if (max(close.r, max(close.g, close.b)) >= ${prefix}NoData) return close;
      }
      if (${prefix}Fill < 0.5) return vec4(0.0);
    }
    return texture2D(${prefix}Global, uv);
  }
`;

export function tiledUniforms(prefix: string, layer: TiledLayer) {
  return {
    [`${prefix}Global`]: { value: layer.global.texture },
    [`${prefix}Patch`]: { value: layer.patch.texture },
    [`${prefix}Mask`]: { value: layer.mask.texture },
    [`${prefix}Bounds`]: { value: layer.bounds },
    [`${prefix}Fill`]: layer.fill,
    [`${prefix}NoData`]: layer.noData,
  };
}
