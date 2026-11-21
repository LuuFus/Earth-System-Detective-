// Measuring stations drawn as coloured bubbles with their value written inside (air quality),
// on a 2D canvas over the globe or the flat map. Bubbles that would overlap give way to the ones
// drawn first (the worst air first), so the map stays readable at any zoom; zoom in to see more.

import type { Projection } from './flow';

export type Stations = {
  key: string;
  lat: ArrayLike<number>;
  lon: ArrayLike<number>;
  /** The number written in the bubble. */
  value: ArrayLike<number>;
  /** Bubble colour per station, 0xRRGGBB. */
  color: ArrayLike<number>;
  /** 1 for a reading older than a few hours: drawn faded, and fresh ones win the place. */
  old?: ArrayLike<number>;
};

const R = 12;

export class StationLayer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: Stations | null = null;
  private order: number[] = [];
  private drawn: { i: number; x: number; y: number }[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  hovered = -1;

  constructor(className: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = className;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d')!;
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
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  get active(): boolean {
    return this.data !== null;
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  draw(view: Projection): void {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const data = this.data;
    this.drawn = [];
    if (!data || !this.width) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // A grid of cells two bubbles wide: a bubble is placed only if no neighbour is too close.
    const cell = 2 * R + 2;
    const cols = Math.ceil(this.width / cell) + 2;
    const grid = new Map<number, { x: number; y: number }[]>();
    const near = (x: number, y: number) => {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const list = grid.get((cy + dy) * cols + (cx + dx));
          if (list?.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < (2 * R) ** 2)) return true;
        }
      }
      return false;
    };
    for (const i of this.order) {
      const p = view.project(data.lat[i], data.lon[i]);
      if (!p) continue;
      const [x, y] = p;
      if (x < -R || y < -R || x > this.width + R || y > this.height + R) continue;
      if (near(x, y)) continue;
      const k = Math.floor(y / cell) * cols + Math.floor(x / cell);
      const list = grid.get(k);
      if (list) list.push({ x, y });
      else grid.set(k, [{ x, y }]);
      this.drawn.push({ i, x, y });
    }
    ctx.font = '700 10.5px Inter Variable, Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const d of this.drawn) {
      const c = data.color[d.i];
      const r = d.i === this.hovered ? R + 3 : R;
      ctx.globalAlpha = data.old?.[d.i] && d.i !== this.hovered ? 0.5 : 1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(4,6,11,0.75)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `#${c.toString(16).padStart(6, '0')}`;
      ctx.fill();
      // Dark numbers on light bubbles, white on dark ones.
      const lum = 0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255);
      ctx.fillStyle = lum > 150 ? '#0b0d12' : '#ffffff';
      ctx.fillText(String(Math.round(data.value[d.i])), d.x, d.y + 0.5);
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
