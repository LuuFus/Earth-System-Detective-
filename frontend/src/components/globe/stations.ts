// Measuring stations drawn as coloured bubbles with their value written inside (air quality as
// circles, radiation as rounded tags), on a 2D canvas over the globe or the flat map. Bubbles that
// would overlap give way to the ones drawn first (the worst first), so the map stays readable at
// any zoom; zoom in to see more. A layer can be told to keep clear of another one (radiation tags
// of the air bubbles): a tag that would cover a bubble moves beside it, with a line to its station.

import { CanvasLayer } from './canvasLayer';
import type { Projection } from './flow';

export type Stations = {
  key: string;
  lat: ArrayLike<number>;
  lon: ArrayLike<number>;
  /** The value: it orders the stations (highest first) and is written in the bubble. */
  value: ArrayLike<number>;
  /** Text written instead of the rounded value. */
  label?: ArrayLike<string>;
  /** Bubble colour per station, 0xRRGGBB. */
  color: ArrayLike<number>;
  /** 1 for a reading older than a few hours: drawn faded, and fresh ones win the place. */
  old?: ArrayLike<number>;
};

const R = 12;

export class StationLayer extends CanvasLayer {
  private data: Stations | null = null;
  private order: number[] = [];
  /** Where each station is drawn (x, y) and where it really is (ax, ay). */
  private drawn: { i: number; x: number; y: number; ax: number; ay: number }[] = [];
  hovered = -1;
  private readonly shape: 'circle' | 'tag';
  /** Another layer whose bubbles this one keeps clear of; draw that one first. */
  avoid: StationLayer | null = null;

  constructor(className: string, shape: 'circle' | 'tag' = 'circle') {
    super(className);
    this.shape = shape;
  }

  set(data: Stations | null): void {
    this.data = data;
    this.drawn = [];
    this.hovered = -1;
    if (data) {
      // Fresh readings first, then the worst air: they win the place when bubbles collide.
      const old = data.old;
      this.order = Array.from({ length: data.value.length }, (_, i) => i).sort((a, b) => (old ? old[a] - old[b] : 0) || data.value[b] - data.value[a]);
    } else {
      this.order = [];
      this.clear();
    }
  }

  get active(): boolean {
    return this.data !== null;
  }

  draw(view: Projection): void {
    const ctx = this.ctx;
    this.begin();
    const data = this.data;
    this.drawn = [];
    if (!data || !this.width) return;
    // A grid of cells two bubbles wide: a bubble is placed only if no neighbour is too close.
    // Tags are wider than tall: they need more room side by side than one above the other.
    const rx = this.shape === 'tag' ? 2 * R * 1.45 : 2 * R;
    const ry = this.shape === 'tag' ? 2 * R * 0.85 : 2 * R;
    const cell = Math.ceil(rx) + 2;
    const cols = Math.ceil(this.width / cell) + 2;
    const grid = new Map<number, { x: number; y: number }[]>();
    const near = (x: number, y: number) => {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const list = grid.get((cy + dy) * cols + (cx + dx));
          if (list?.some((p) => ((p.x - x) / rx) ** 2 + ((p.y - y) / ry) ** 2 < 1)) return true;
        }
      }
      return false;
    };
    // The other layer's bubbles (circles of radius R): half this marker plus a bubble apart.
    const others = this.avoid?.active ? this.avoid.drawn : [];
    const ox = rx / 2 + R + 2;
    const oy = ry / 2 + R + 2;
    const covers = (x: number, y: number) => others.some((p) => ((p.x - x) / ox) ** 2 + ((p.y - y) / oy) ** 2 < 1);
    // Where a marker may go when its own place is taken by the other layer: above, below, right, left.
    const shifts: [number, number][] = [
      [0, 0],
      [0, -oy],
      [0, oy],
      [ox, 0],
      [-ox, 0],
    ];
    for (const i of this.order) {
      const p = view.project(data.lat[i], data.lon[i]);
      if (!p) continue;
      const [ax, ay] = p;
      if (ax < -R || ay < -R || ax > this.width + R || ay > this.height + R) continue;
      const spot = shifts.map(([dx, dy]) => [ax + dx, ay + dy] as const).find(([x, y]) => !near(x, y) && !covers(x, y));
      if (!spot) continue;
      const [x, y] = spot;
      const k = Math.floor(y / cell) * cols + Math.floor(x / cell);
      const list = grid.get(k);
      if (list) list.push({ x, y });
      else grid.set(k, [{ x, y }]);
      this.drawn.push({ i, x, y, ax, ay });
    }
    ctx.font = '700 10.5px Inter Variable, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const d of this.drawn) {
      const c = data.color[d.i];
      const r = d.i === this.hovered ? R + 3 : R;
      ctx.globalAlpha = data.old?.[d.i] && d.i !== this.hovered ? 0.5 : 1;
      if (d.x !== d.ax || d.y !== d.ay) {
        // Moved aside: a thin line and a dot show where the station really is.
        ctx.beginPath();
        ctx.moveTo(d.ax, d.ay);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = 'rgba(4,6,11,0.85)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = `#${c.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(d.ax, d.ay, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `#${c.toString(16).padStart(6, '0')}`;
        ctx.fill();
      }
      const text = data.label ? data.label[d.i] : String(Math.round(data.value[d.i]));
      ctx.beginPath();
      if (this.shape === 'tag') {
        // A rounded tag as wide as its number, so "0,12" fits.
        const w = Math.max(2 * r, ctx.measureText(text).width + 10) / 2;
        const h = r * 0.8;
        ctx.roundRect(d.x - w - 1.5, d.y - h - 1.5, 2 * w + 3, 2 * h + 3, h + 1.5);
        ctx.fillStyle = 'rgba(4,6,11,0.75)';
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(d.x - w, d.y - h, 2 * w, 2 * h, h);
      } else {
        ctx.arc(d.x, d.y, r + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(4,6,11,0.75)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = `#${c.toString(16).padStart(6, '0')}`;
      ctx.fill();
      // Dark numbers on light bubbles, white on dark ones.
      const lum = 0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255);
      ctx.fillStyle = lum > 150 ? '#0b0d12' : '#ffffff';
      ctx.fillText(text, d.x, d.y + 0.5);
    }
    ctx.globalAlpha = 1;
  }

  /** The station under a screen point (CSS pixels), or -1. */
  hit(x: number, y: number): number {
    let best = -1;
    let bestD = (R + 3) ** 2;
    for (const d of this.drawn) {
      const dd = (d.x - x) ** 2 + (d.y - y) ** 2;
      if (dd < bestD) {
        bestD = dd;
        best = d.i;
      }
    }
    return best;
  }

  /** Screen position of a drawn station, for placing its card. */
  position(i: number): [number, number] | null {
    const d = this.drawn.find((x) => x.i === i);
    return d ? [d.x, d.y] : null;
  }
}
