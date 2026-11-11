// NASA GISTEMP v4 annual temperature anomalies, built by data-pipeline/build_gistemp.py.
// Layout: int8 [year][lat][lon], 0.1 degC steps, rows south to north, columns west to east.

export type GistempMeta = {
  source: string;
  url: string;
  baseline: string;
  built: string;
  startYear: number;
  endYear: number;
  nlat: number;
  nlon: number;
  lat0: number;
  lon0: number;
  step: number;
  scale: number;
  missing: number;
  globalMean: (number | null)[];
};

export type Gistemp = { meta: GistempMeta; data: Int8Array };

let cache: Promise<Gistemp> | null = null;

export function loadGistemp(): Promise<Gistemp> {
  if (!cache) {
    const base = `${import.meta.env.BASE_URL}data/gistemp/`;
    cache = Promise.all([
      fetch(`${base}meta.json`).then((r) => {
        if (!r.ok) throw new Error(`meta.json ${r.status}`);
        return r.json() as Promise<GistempMeta>;
      }),
      fetch(`${base}annual.bin`).then((r) => {
        if (!r.ok) throw new Error(`annual.bin ${r.status}`);
        return r.arrayBuffer();
      }),
    ]).then(([meta, buffer]) => ({ meta, data: new Int8Array(buffer) }));
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

/** One value per cell (NaN = no data). */
export type Field = { values: Float32Array; significant?: Uint8Array; pValues?: Float32Array };

export function yearField({ meta, data }: Gistemp, year: number): Field {
  const cells = meta.nlat * meta.nlon;
  const offset = (year - meta.startYear) * cells;
  const values = new Float32Array(cells);
  for (let i = 0; i < cells; i++) {
    const v = data[offset + i];
    values[i] = v === meta.missing ? NaN : v * meta.scale;
  }
  return { values };
}

export function differenceField(g: Gistemp, from: number, to: number): Field {
  const a = yearField(g, from).values;
  const b = yearField(g, to).values;
  const values = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) values[i] = b[i] - a[i];
  return { values };
}

export function cellIndex(meta: GistempMeta, lat: number, lon: number): number {
  const row = Math.min(meta.nlat - 1, Math.max(0, Math.floor((lat + 90) / meta.step)));
  const col = Math.min(meta.nlon - 1, Math.max(0, Math.floor((((lon + 180) % 360) + 360) % 360 / meta.step)));
  return row * meta.nlon + col;
}

/** Area-weighted mean of a field (cos latitude), ignoring cells without data. */
export function areaMean(meta: GistempMeta, values: Float32Array): number {
  let sum = 0;
  let weight = 0;
  for (let row = 0; row < meta.nlat; row++) {
    const w = Math.cos(((meta.lat0 + row * meta.step) * Math.PI) / 180);
    for (let col = 0; col < meta.nlon; col++) {
      const v = values[row * meta.nlon + col];
      if (Number.isFinite(v)) {
        sum += v * w;
        weight += w;
      }
    }
  }
  return weight ? sum / weight : NaN;
}

// Diverging blue-red ramp with a light neutral midpoint, equal steps per arm.
// The dark ends are lifted so cold cells stay visible over dark ocean imagery.
export const RAMP: [number, number, number][] = [
  [0x24, 0x57, 0xb3],
  [0x3f, 0x7f, 0xd0],
  [0x94, 0xbd, 0xe8],
  [0xec, 0xe9, 0xe2],
  [0xf2, 0xa5, 0x82],
  [0xdd, 0x5a, 0x3c],
  [0xb3, 0x26, 0x1e],
];

export const RAMP_CSS = RAMP.map(([r, g, b]) => `rgb(${r} ${g} ${b})`);

/** t in [-1, 1] to an RGB triple. */
export function rampColor(t: number): [number, number, number] {
  const x = (Math.max(-1, Math.min(1, t)) + 1) * 0.5 * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  const f = x - i;
  const a = RAMP[i];
  const b = RAMP[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Texture for the globe's data layer: R = position on the colour ramp (0..1) times validity,
 * G = validity, B = significance times validity. Premultiplying lets linear filtering average
 * only cells that have data, so the field draws smooth instead of square. */
export function fieldToRGBA(meta: GistempMeta, field: Field, range: number): Uint8Array {
  const cells = meta.nlat * meta.nlon;
  const out = new Uint8Array(cells * 4);
  for (let i = 0; i < cells; i++) {
    const v = field.values[i];
    out[i * 4 + 3] = 255;
    if (!Number.isFinite(v)) continue;
    const t = (Math.max(-1, Math.min(1, v / range)) + 1) / 2;
    out[i * 4] = Math.round(t * 255);
    out[i * 4 + 1] = 255;
    out[i * 4 + 2] = !field.significant || field.significant[i] ? 255 : 0;
  }
  return out;
}

/** Theil-Sen slope (per decade) and two-sided Mann-Kendall p-value for a short series (main thread). */
export function senMannKendall(xs: number[], ys: number[]): { slope: number; p: number } {
  const n = xs.length;
  const slopes: number[] = [];
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = ys[j] - ys[i];
      s += Math.sign(d);
      slopes.push(d / (xs[j] - xs[i]));
    }
  }
  slopes.sort((a, b) => a - b);
  const m = slopes.length;
  const median = m % 2 ? slopes[(m - 1) / 2] : (slopes[m / 2 - 1] + slopes[m / 2]) / 2;
  const counts = new Map<number, number>();
  ys.forEach((y) => counts.set(y, (counts.get(y) ?? 0) + 1));
  let ties = 0;
  counts.forEach((t) => {
    if (t > 1) ties += t * (t - 1) * (2 * t + 5);
  });
  const variance = (n * (n - 1) * (2 * n + 5) - ties) / 18;
  const z = s > 0 ? (s - 1) / Math.sqrt(variance) : s < 0 ? (s + 1) / Math.sqrt(variance) : 0;
  return { slope: median * 10, p: 1 - erf(Math.abs(z) / Math.SQRT2) };
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return sign * y;
}
