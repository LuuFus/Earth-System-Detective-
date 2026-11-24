// The Cities layer on the globe: a dot, the name and the population of each city, drawn on one
// canvas. The closer the view, the smaller the cities that get a name; bigger cities win the
// place when names would overlap, and a city without room keeps just its dot.

import { CanvasLayer } from './canvasLayer';
import type { Projection } from './flow';

export type CityPoint = { id: number; uk: string; en: string; lat: number; lon: number; pop: number };

type Placed = { id: number; x: number; y: number; x0: number; y0: number; x1: number; y1: number };

/** The smallest city that gets a mark at a scale (screen pixels per degree of latitude). */
export function minPopulation(pixelsPerDegree: number): number {
  const steps: [number, number][] = [
    [6, 5e6],
    [12, 2e6],
    [24, 1e6],
    [48, 5e5],
    [96, 2.5e5],
    [200, 1e5],
  ];
  for (const [ppd, pop] of steps) if (pixelsPerDegree < ppd) return pop;
  return 0;
}

export class CityLayer extends CanvasLayer {
  private cities: CityPoint[] | null = null;
  private placed: Placed[] = [];
  private widths = new Map<string, number>();
  lang: 'uk' | 'en' = 'uk';
  hovered = -1;

  get active(): boolean {
    return this.cities !== null;
  }

  /** The cities, biggest first; null hides the layer. */
  set(cities: CityPoint[] | null): void {
    this.cities = cities ? [...cities].sort((a, b) => b.pop - a.pop) : null;
    this.canvas.hidden = !cities;
    this.placed = [];
    if (!cities) this.clear();
  }

  private textWidth(text: string, font: string): number {
    const key = `${font}|${text}`;
    let w = this.widths.get(key);
    if (w === undefined) {
      this.ctx.font = font;
      w = this.ctx.measureText(text).width;
      this.widths.set(key, w);
    }
    return w;
  }

  draw(view: Projection): void {
    this.begin();
    this.placed = [];
    const cities = this.cities;
    if (!cities || !this.width) return;
    const minPop = minPopulation(view.pixelsPerDegree());
    const nameFont = (big: boolean) => `${big ? 650 : 550} ${big ? 12 : 11}px Inter Variable, Inter, Arial, sans-serif`;
    const popFont = '400 10px Inter Variable, Inter, Arial, sans-serif';
    // Boxes already taken, in cells of 64 px, for a quick overlap test.
    const cell = 64;
    const grid = new Map<number, Placed[]>();
    const keyOf = (cx: number, cy: number) => cy * 4096 + cx;
    const free = (b: Omit<Placed, 'id' | 'x' | 'y'>) => {
      for (let cy = Math.floor(b.y0 / cell); cy <= Math.floor(b.y1 / cell); cy++) {
        for (let cx = Math.floor(b.x0 / cell); cx <= Math.floor(b.x1 / cell); cx++) {
          for (const o of grid.get(keyOf(cx, cy)) ?? []) if (!(b.x1 < o.x0 || b.x0 > o.x1 || b.y1 < o.y0 || b.y0 > o.y1)) return false;
        }
      }
      return true;
    };
    const take = (p: Placed) => {
      this.placed.push(p);
      for (let cy = Math.floor(p.y0 / cell); cy <= Math.floor(p.y1 / cell); cy++) {
        for (let cx = Math.floor(p.x0 / cell); cx <= Math.floor(p.x1 / cell); cx++) {
          const k = keyOf(cx, cy);
          const list = grid.get(k);
          if (list) list.push(p);
          else grid.set(k, [p]);
        }
      }
    };
    const labels: { p: Placed; name: string; pop: string; big: boolean; dotOnly: boolean }[] = [];
    for (const c of cities) {
      if (c.pop < minPop) break;
      const s = view.project(c.lat, c.lon);
      if (!s || !this.onScreen(s[0], s[1], 40)) continue;
      const [x, y] = s;
      const big = c.pop >= 1e6;
      const name = c[this.lang];
      const pop = popText(c.pop, this.lang);
      const w = this.textWidth(name, nameFont(big)) + (pop ? 5 + this.textWidth(pop, popFont) : 0);
      const box = { x0: x - 5, y0: y - 8, x1: x + 8 + w, y1: y + 8 };
      if (free(box)) {
        take({ id: c.id, x, y, ...box });
        labels.push({ p: this.placed[this.placed.length - 1], name, pop, big, dotOnly: false });
      } else {
        const dot = { x0: x - 4, y0: y - 4, x1: x + 4, y1: y + 4 };
        if (!free(dot)) continue;
        take({ id: c.id, x, y, ...dot });
        labels.push({ p: this.placed[this.placed.length - 1], name, pop, big, dotOnly: true });
      }
    }
    const ctx = this.ctx;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const l of labels) {
      const { x, y } = l.p;
      const hover = l.p.id === this.hovered;
      ctx.beginPath();
      ctx.arc(x, y, l.big ? 3.6 : 2.8, 0, Math.PI * 2);
      ctx.fillStyle = hover ? '#ffffff' : '#ffd9a8';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(4,6,11,0.9)';
      ctx.stroke();
      if (l.dotOnly) continue;
      ctx.font = nameFont(l.big);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(4,6,11,0.85)';
      ctx.strokeText(l.name, x + 7, y);
      ctx.fillStyle = hover ? '#ffffff' : '#f4f1ea';
      ctx.fillText(l.name, x + 7, y);
      if (!l.pop) continue;
      const nx = x + 7 + this.textWidth(l.name, nameFont(l.big)) + 5;
      ctx.font = popFont;
      ctx.strokeText(l.pop, nx, y + 0.5);
      ctx.fillStyle = 'rgba(214,220,232,0.72)';
      ctx.fillText(l.pop, nx, y + 0.5);
    }
  }

  /** The city under a point (CSS pixels), or -1. */
  hit(x: number, y: number): number {
    for (let i = this.placed.length - 1; i >= 0; i--) {
      const p = this.placed[i];
      if (x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1) return p.id;
    }
    return -1;
  }
}

/** A population in short words: 1,4 млн / 1.4 m, 320 тис. / 320 k. */
export function popText(pop: number, lang: 'uk' | 'en'): string {
  if (pop >= 1e6) return `${new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1 }).format(pop / 1e6)} ${lang === 'uk' ? 'млн' : 'm'}`;
  if (pop >= 1e3) return `${Math.round(pop / 1e3)} ${lang === 'uk' ? 'тис.' : 'k'}`;
  return '';
}
