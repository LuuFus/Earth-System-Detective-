// The occupied territory of Ukraine week by week since 2022 (DeepState), built by
// data-pipeline/build_front_history.py, and a painter that plays it smoothly: each week is drawn
// once (occupied area, plus what was captured and liberated in the last weeks, fading with age),
// and the picture between two weeks is a cross-dissolve of the two.

import type { Box } from '../components/globe/tiles';

export type OccFrame = {
  date: string;
  /** Rings as flat [lon, lat, ...], even-odd fill. */
  rings: Float32Array[];
  /** Occupied area inside Ukraine, km². */
  area: number;
  /** Captured and liberated since the frame before, km². */
  captured: number;
  liberated: number;
  /** Before the full-scale invasion: Crimea and the 2014 line only. */
  pre: boolean;
};

export type OccHistory = {
  source: string;
  url: string;
  built: string;
  box: Box;
  ukraineKm2: number;
  ukraine: Float32Array[];
  frames: OccFrame[];
};

type Raw = {
  source: string;
  url: string;
  built: string;
  q: number;
  box: [number, number, number, number];
  ukraineKm2: number;
  ukraine: number[][];
  rings: number[][];
  frames: { d: string; r: number[]; a: number; g: number; l: number; pre?: number }[];
};

function decode(d: number[], q: number): Float32Array {
  const out = new Float32Array(d.length);
  let x = 0;
  let y = 0;
  for (let i = 0; i < d.length; i += 2) {
    x = i === 0 ? d[0] : x + d[i];
    y = i === 0 ? d[1] : y + d[i + 1];
    out[i] = x / q;
    out[i + 1] = y / q;
  }
  return out;
}

let cache: Promise<OccHistory> | null = null;

export function loadOccHistory(): Promise<OccHistory> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/ukraine/front-history.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`front history ${r.status}`);
        return r.json() as Promise<Raw>;
      })
      .then((raw) => {
        const pool = raw.rings.map((r) => decode(r, raw.q));
        const [w, s, e, n] = raw.box;
        return {
          source: raw.source,
          url: raw.url,
          built: raw.built,
          box: { w, s, e, n },
          ukraineKm2: raw.ukraineKm2,
          ukraine: raw.ukraine.filter((r) => r.length).map((r) => decode(r, raw.q)),
          frames: raw.frames.map((f) => ({ date: f.d, rings: f.r.map((i) => pool[i]), area: f.a, captured: f.g, liberated: f.l, pre: !!f.pre })),
        };
      });
    cache.catch(() => (cache = null));
  }
  return cache;
}

/** Key dates for the chart under the player. */
export const OCC_EVENTS: { date: string; short: { uk: string; en: string }; label: { uk: string; en: string } }[] = [
  { date: '2022-04-03', short: { uk: 'Північ', en: 'North' }, label: { uk: 'російські війська вийшли з Київщини, Чернігівщини й Сумщини', en: 'Russian forces left the Kyiv, Chernihiv and Sumy regions' } },
  { date: '2022-09-11', short: { uk: 'Харківщина', en: 'Kharkiv' }, label: { uk: 'Харківський контрнаступ: звільнено Балаклію, Ізюм, Куп’янськ', en: 'the Kharkiv counteroffensive: Balakliia, Izium, Kupiansk liberated' } },
  { date: '2022-11-11', short: { uk: 'Херсон', en: 'Kherson' }, label: { uk: 'звільнено Херсон і правобережжя Херсонщини', en: 'Kherson and the right bank of the Kherson region liberated' } },
  { date: '2023-05-20', short: { uk: 'Бахмут', en: 'Bakhmut' }, label: { uk: 'Бахмут окуповано', en: 'Bakhmut occupied' } },
  { date: '2024-02-17', short: { uk: 'Авдіївка', en: 'Avdiivka' }, label: { uk: 'українські війська вийшли з Авдіївки', en: 'Ukrainian forces withdrew from Avdiivka' } },
];

/** How many weeks a capture or a liberation stays highlighted, fading. */
export const TRAIL = 4;

export const OCC_COLORS = { occupied: '#d9483b', captured: '#ffb020', liberated: '#4aa3ff' };

const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/**
 * Paints the timeline into canvases over a box, in plate carrée (the globe) or Web Mercator (the
 * 2D map, which stretches a canvas linearly in Mercator).
 */
export class OccPainter {
  readonly canvas: HTMLCanvasElement;
  /** Whole weeks, ready to blend. */
  private readonly frames = new Map<number, HTMLCanvasElement>();
  /** What changed in a week (captured and liberated), at half resolution: each is reused for TRAIL weeks. */
  private readonly diffs = new Map<number, HTMLCanvasElement>();
  private readonly tmp: HTMLCanvasElement;
  private readonly width: number;
  private readonly height: number;
  private readonly px: (lon: number) => number;
  private readonly py: (lat: number) => number;
  private readonly line: number;

  private readonly history: OccHistory;
  readonly box: Box;
  readonly projection: 'plate' | 'mercator';

  constructor(history: OccHistory, box: Box, width: number, projection: 'plate' | 'mercator') {
    this.history = history;
    this.box = box;
    this.projection = projection;
    const { w, s, e, n } = box;
    this.width = width;
    if (projection === 'mercator') {
      const top = merc(n);
      const span = top - merc(s);
      this.height = Math.round((width * span) / (((e - w) * Math.PI) / 180));
      this.py = (lat) => ((top - merc(lat)) / span) * this.height;
    } else {
      this.height = Math.round((width * (n - s)) / ((e - w) * Math.cos((((s + n) / 2) * Math.PI) / 180)));
      this.py = (lat) => ((n - lat) / (n - s)) * this.height;
    }
    this.px = (lon) => ((lon - w) / (e - w)) * width;
    this.line = Math.max(1, width / 900);
    this.canvas = this.make();
    this.tmp = this.make(0.5);
  }

  private make(scale = 1): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.round(this.width * scale);
    c.height = Math.round(this.height * scale);
    return c;
  }

  private path(ctx: CanvasRenderingContext2D, rings: Float32Array[], scale = 1) {
    ctx.beginPath();
    for (const r of rings) {
      for (let i = 0; i < r.length; i += 2) {
        const x = this.px(r[i]) * scale;
        const y = this.py(r[i + 1]) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
  }

  /** A canvas from an LRU cache, reusing the oldest one once the cache is full. */
  private take(cache: Map<number, HTMLCanvasElement>, size: number, scale: number): HTMLCanvasElement {
    if (cache.size < size) return this.make(scale);
    const oldest = cache.keys().next().value as number;
    const c = cache.get(oldest)!;
    cache.delete(oldest);
    return c;
  }

  /** `rings` minus `minus` in `color` on `ctx`, with a hairline of slack so shared edges leave no seam. */
  private difference(ctx: CanvasRenderingContext2D, rings: Float32Array[], minus: Float32Array[], color: string, scale: number) {
    const tmp = this.tmp.getContext('2d')!;
    tmp.globalCompositeOperation = 'source-over';
    tmp.clearRect(0, 0, this.tmp.width, this.tmp.height);
    this.path(tmp, rings, scale);
    tmp.fillStyle = color;
    tmp.fill('evenodd');
    tmp.globalCompositeOperation = 'destination-out';
    this.path(tmp, minus, scale);
    tmp.fillStyle = '#000';
    tmp.fill('evenodd');
    tmp.lineWidth = this.line * 1.6 * scale;
    tmp.strokeStyle = '#000';
    tmp.stroke();
    tmp.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.tmp, 0, 0);
  }

  /** What week `j` captured (amber) and liberated (blue) compared with the week before. */
  private diff(j: number): HTMLCanvasElement {
    const hit = this.diffs.get(j);
    if (hit) return hit;
    const frames = this.history.frames;
    const c = this.take(this.diffs, TRAIL + 2, 0.5);
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (frames[j].liberated > 0) this.difference(ctx, frames[j - 1].rings, frames[j].rings, OCC_COLORS.liberated, 0.5);
    if (frames[j].captured > 0) this.difference(ctx, frames[j].rings, frames[j - 1].rings, OCC_COLORS.captured, 0.5);
    this.diffs.set(j, c);
    return c;
  }

  /** One week: occupied, the captures and liberations of the last weeks fading with age, the line. Cached. */
  frame(k: number): HTMLCanvasElement {
    const hit = this.frames.get(k);
    if (hit) return hit;
    const frames = this.history.frames;
    const c = this.take(this.frames, 4, 1);
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    // Nothing outside Ukraine.
    this.path(ctx, this.history.ukraine);
    ctx.clip('evenodd');
    const f = frames[k];
    this.path(ctx, f.rings);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = OCC_COLORS.occupied;
    ctx.fill('evenodd');
    for (let age = TRAIL - 1; age >= 0; age--) {
      const j = k - age;
      if (j < 1 || frames[j].pre || frames[j - 1].pre || (!frames[j].liberated && !frames[j].captured)) continue;
      ctx.globalAlpha = 0.9 * (1 - age / TRAIL);
      ctx.drawImage(this.diff(j), 0, 0, this.width, this.height);
    }
    ctx.globalAlpha = 0.95;
    this.path(ctx, f.rings);
    ctx.lineWidth = this.line * 1.4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = OCC_COLORS.occupied;
    ctx.stroke();
    ctx.restore();
    this.frames.set(k, c);
    return c;
  }

  /** Draws week `k` ahead of time, so the player does not wait for it. */
  warm(k: number) {
    if (k >= 0 && k < this.history.frames.length) this.frame(k);
  }

  /**
   * The picture at a moment between weeks: `pos` is a fractional frame index. Two weeks are
   * blended with additive compositing of premultiplied colours, which is an exact dissolve: what
   * both weeks share keeps its colour and opacity, what changes fades out and in.
   */
  paint(pos: number): HTMLCanvasElement {
    const last = this.history.frames.length - 1;
    const p = Math.min(last, Math.max(0, pos));
    const k = Math.floor(p);
    const t = p - k;
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.width, this.height);
    if (t < 0.002 || k >= last) {
      ctx.drawImage(this.frame(Math.round(p)), 0, 0);
      return this.canvas;
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1 - t;
    ctx.drawImage(this.frame(k), 0, 0);
    ctx.globalAlpha = t;
    ctx.drawImage(this.frame(k + 1), 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    return this.canvas;
  }
}

/** The frame index for a date (the last week on or before it). */
export function frameAt(history: OccHistory, date: string): number {
  let k = 0;
  history.frames.forEach((f, i) => {
    if (f.date <= date) k = i;
  });
  return k;
}
