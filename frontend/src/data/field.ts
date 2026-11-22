// Gridded fields and how they are painted: the NOAA GFS forecast (whole Earth, 1°) and the CAMS
// air quality forecast (Ukraine and its neighbours, 0.5°). Shared by the page and the field
// worker, so nothing here touches the DOM or React.

/** A regular latitude-longitude grid: rows from `north` southwards, columns from `west` eastwards. */
export type Grid = { north: number; west: number; step: number; ni: number; nj: number; wrap: boolean };

export type GridVar = 'u' | 'v' | 't' | 'precip' | 'gust' | 'cloud' | 'aqi' | 'pm25' | 'dust';

/** Byte for "no value" in the air quality grid (outside the model's domain). */
const NONE = 255;

/** A byte of the pipeline's files back into the variable's unit (data-pipeline/build_live.py). */
export function decode(v: GridVar, b: number): number {
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
    case 'aqi':
      return b === NONE ? Number.NaN : b * 2;
    case 'pm25':
      return b === NONE ? Number.NaN : (b / 11) ** 2;
    case 'dust':
      return b === NONE ? Number.NaN : (b / 5.6) ** 2;
    default:
      return b;
  }
}

/** One moment of a gridded forecast: one byte grid per variable, one after another. */
export class GridFrame {
  readonly time: Date;
  readonly grid: Grid;
  readonly vars: GridVar[];
  readonly bytes: Uint8Array;
  private readonly size: number;
  private readonly offsets: Partial<Record<GridVar, number>>;

  constructor(bytes: Uint8Array, time: string | Date, grid: Grid, vars: GridVar[]) {
    this.bytes = bytes;
    this.time = new Date(time);
    this.grid = grid;
    this.vars = vars;
    this.size = grid.ni * grid.nj;
    this.offsets = Object.fromEntries(vars.map((v, i) => [v, i * this.size]));
  }

  has(v: GridVar): boolean {
    return this.offsets[v] !== undefined;
  }

  /** Bilinear value at a place in the variable's unit; NaN outside a regional grid. */
  sample(v: GridVar, lat: number, lon: number): number {
    const g = this.grid;
    const off = this.offsets[v];
    if (off === undefined) return Number.NaN;
    let x = (lon - g.west) / g.step;
    let y = (g.north - lat) / g.step;
    if (g.wrap) {
      const n = 360 / g.step;
      x = ((x % n) + n) % n;
      y = Math.min(g.nj - 1.0001, Math.max(0, y));
    } else {
      if (x < 0 || y < 0 || x > g.ni - 1 || y > g.nj - 1) return Number.NaN;
      x = Math.min(g.ni - 1.0001, x);
      y = Math.min(g.nj - 1.0001, y);
    }
    const i0 = Math.floor(x);
    const j0 = Math.floor(y);
    const fx = x - i0;
    const fy = y - j0;
    const i1 = g.wrap ? (i0 + 1) % g.ni : i0 + 1;
    const r0 = off + j0 * g.ni;
    const r1 = r0 + g.ni;
    const a = decode(v, this.bytes[r0 + (i0 % g.ni)]);
    const b = decode(v, this.bytes[r0 + i1]);
    const c = decode(v, this.bytes[r1 + (i0 % g.ni)]);
    const d = decode(v, this.bytes[r1 + i1]);
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  }

  wind = (lat: number, lon: number): [number, number] => [this.sample('u', lat, lon), this.sample('v', lat, lon)];
}

// ---------- colour scales ----------

export type FieldKind = 'wind' | 'gust' | 'temp' | 'precip' | 'cloud' | 'aqi' | 'pm25' | 'dust';
type Stop = [number, [number, number, number, number]];

/** The air quality forecast's kinds: a model, drawn over Ukraine and its neighbours only. */
export const AIR_KINDS: FieldKind[] = ['aqi', 'pm25', 'dust'];
export const isAirKind = (k: string): boolean => (AIR_KINDS as string[]).includes(k);

/**
 * Scales in the spirit of Windy's: calm blues to strong purples, cold violets to hot reds. Air
 * quality follows the US EPA bands (green, yellow, orange, red, purple, maroon), as the bubbles do.
 */
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
  aqi: {
    unit: 'AQI',
    stops: [
      [0, [52, 209, 122, 40]],
      [50, [52, 209, 122, 95]],
      [75, [255, 210, 63, 170]],
      [100, [255, 159, 10, 190]],
      [150, [255, 90, 95, 200]],
      [200, [178, 92, 240, 210]],
      [300, [140, 28, 58, 220]],
    ],
  },
  pm25: {
    unit: 'µg/m³',
    stops: [
      [0, [52, 209, 122, 40]],
      [9, [52, 209, 122, 95]],
      [20, [255, 210, 63, 170]],
      [35, [255, 159, 10, 190]],
      [55, [255, 90, 95, 200]],
      [125, [178, 92, 240, 210]],
      [225, [140, 28, 58, 220]],
    ],
  },
  dust: {
    unit: 'µg/m³',
    stops: [
      [5, [214, 184, 120, 0]],
      [20, [214, 184, 120, 90]],
      [50, [206, 160, 92, 150]],
      [100, [192, 130, 62, 190]],
      [250, [164, 92, 42, 215]],
      [600, [120, 60, 30, 230]],
    ],
  },
};

export function colorAt(kind: FieldKind, value: number): [number, number, number, number] {
  if (!Number.isFinite(value)) return [0, 0, 0, 0];
  const stops = SCALES[kind].stops;
  if (value <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (value <= stops[i][0]) {
      const [x0, c0] = stops[i - 1];
      const [x1, c1] = stops[i];
      const t = (value - x0) / (x1 - x0);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t, c0[3] + (c1[3] - c0[3]) * t];
    }
  }
  return stops[stops.length - 1][1];
}

export function fieldValue(frame: GridFrame, kind: FieldKind, lat: number, lon: number): number {
  switch (kind) {
    case 'wind':
      return Math.hypot(frame.sample('u', lat, lon), frame.sample('v', lat, lon));
    case 'gust':
      return frame.sample('gust', lat, lon);
    case 'temp':
      return frame.sample('t', lat, lon);
    case 'precip':
      return frame.sample('precip', lat, lon);
    case 'cloud':
      return frame.sample('cloud', lat, lon);
    default:
      return frame.sample(kind, lat, lon);
  }
}

// ---------- painting ----------

/** What to paint: a box of the Earth, as plain latitude-longitude (the globe) or Web Mercator (the map). */
export type FieldView = { width: number; height: number; north: number; south: number; west: number; east: number; projection: 'equirect' | 'mercator' };

export const MERCATOR_LIMIT = 85.051129;

export function worldView(projection: 'equirect' | 'mercator', width: number): FieldView {
  return projection === 'equirect'
    ? { width, height: Math.round(width / 2), north: 90, south: -90, west: -180, east: 180, projection }
    : { width, height: width, north: MERCATOR_LIMIT, south: -MERCATOR_LIMIT, west: -180, east: 180, projection };
}

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/**
 * RGBA pixels of a field. Colours come from a 1024-step table of the scale, so each pixel costs
 * one sample and one lookup. A regional grid fades out over its last three cells, so its box has
 * no hard edge on the map.
 */
export function fieldPixels(frame: GridFrame, kind: FieldKind, view: FieldView): Uint8ClampedArray<ArrayBuffer> {
  const { width, height } = view;
  const stops = SCALES[kind].stops;
  const lo = stops[0][0];
  const hi = stops[stops.length - 1][0];
  const N = 1024;
  const lut = new Uint8ClampedArray(N * 4);
  for (let i = 0; i < N; i++) lut.set(colorAt(kind, lo + ((hi - lo) * i) / (N - 1)), i * 4);
  const px = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  const yN = mercY(view.north);
  const yS = mercY(view.south);
  const lons = new Float64Array(width);
  for (let x = 0; x < width; x++) lons[x] = view.west + ((x + 0.5) / width) * (view.east - view.west);
  const g = frame.grid;
  const FADE = 3;
  for (let y = 0; y < height; y++) {
    const t = (y + 0.5) / height;
    const lat = view.projection === 'equirect' ? view.north - t * (view.north - view.south) : (Math.atan(Math.sinh(yN - t * (yN - yS))) * 180) / Math.PI;
    const gy = (g.north - lat) / g.step;
    const rowEdge = Math.min(gy, g.nj - 1 - gy);
    let k = y * width * 4;
    for (let x = 0; x < width; x++, k += 4) {
      const v = fieldValue(frame, kind, lat, lons[x]);
      if (!Number.isFinite(v)) continue;
      const i = 4 * Math.round(((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (N - 1));
      let a = lut[i + 3];
      if (!g.wrap) {
        const gx = (lons[x] - g.west) / g.step;
        a *= Math.min(1, Math.max(0, Math.min(rowEdge, gx, g.ni - 1 - gx) / FADE));
      }
      px[k] = lut[i];
      px[k + 1] = lut[i + 1];
      px[k + 2] = lut[i + 2];
      px[k + 3] = a;
    }
  }
  return px;
}
