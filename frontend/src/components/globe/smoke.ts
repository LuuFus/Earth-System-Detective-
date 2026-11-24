// Smoke carried by the wind, over the globe or the flat map.
//
// Each burning place lets out a puff every half hour. A puff's path is worked out once, ahead of
// time, through the wind of each hour (real wind from a weather model), with a little random
// drift for the gusts that spread a plume. Any moment of the story is then just "where is each
// puff at this hour", so the clock can jump back and forth. The puffs are drawn on the graphics
// card (smokeField.ts): soft clouds, dark and dense over the fire and lighter and wider as they
// drift. Near the fire the wind is shown as arrows, and towns get circles with their air quality.

import { CanvasLayer } from './canvasLayer';
import type { Projection } from './flow';

/** A burning place: from t0 to t1 (hours on the scene clock), with its fire power (MW). */
export type SmokeSource = { lat: number; lon: number; t0: number; t1: number; power: number };
/** Wind at a place and hour, m/s eastward and northward, or null outside the data. */
export type WindAt = (lat: number, lon: number, t: number) => [number, number] | null;
/** A town with its PM2.5 for each hour of the scene (NaN where unknown). */
export type SmokeTown = { lat: number; lon: number; name: string; pm25: Float32Array };
export type SmokeBox = { s: number; w: number; n: number; e: number };

/** Hours per integration step; every position is kept. The wind is hourly, so half an hour is enough. */
export const STEP = 0.5;
/** At most this many puffs in a scene: long, big fires let them out less often. */
const MAX_TRACKS = 9000;
const EARTH = 111_320; // metres per degree of latitude

/** A seeded random number generator (mulberry32), so a scene always looks the same. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Track = { te: number; power: number; seed: number; lat: Float32Array; lon: Float32Array };

export type SmokeOptions = {
  /** How long a puff lives, hours. */
  life?: number;
  /** Hours between two puffs of one fire. */
  every?: number;
  /** Turbulent spreading, m²/s: how fast a plume widens. */
  diffusion?: number;
};

export class SmokeSim {
  readonly life: number;
  readonly tracks: Track[] = [];
  readonly sources: SmokeSource[];
  private readonly maxPower: number;

  constructor(sources: SmokeSource[], wind: WindAt, opts: SmokeOptions = {}) {
    this.sources = sources;
    this.life = opts.life ?? 18;
    const burning = sources.reduce((a, s) => a + Math.max(0, s.t1 - s.t0), 0);
    const every = Math.max(opts.every ?? 0.5, burning / MAX_TRACKS);
    const k = opts.diffusion ?? 1500;
    const sigma = Math.sqrt(2 * k * STEP * 3600); // metres per step
    const random = rng(sources.length * 7919 + 17);
    this.maxPower = Math.max(1, ...sources.map((s) => s.power));
    const steps = Math.ceil(this.life / STEP);
    for (const s of sources) {
      for (let te = s.t0; te <= s.t1; te += every) {
        const n = steps + 1;
        const lat = new Float32Array(n);
        const lon = new Float32Array(n);
        // Puffs leave from a little around the fire, not one exact point.
        let y = s.lat + (random() - 0.5) * 0.01;
        let x = s.lon + (random() - 0.5) * 0.014;
        lat[0] = y;
        lon[0] = x;
        let ok = true;
        for (let i = 1; i <= steps; i++) {
          const w = wind(y, x, te + (i - 0.5) * STEP);
          if (!w) {
            ok = i > 4;
            for (let j = i; j < n; j++) {
              lat[j] = NaN;
              lon[j] = NaN;
            }
            break;
          }
          const cos = Math.max(0.15, Math.cos((y * Math.PI) / 180));
          // Box-Muller for the turbulent drift.
          const g1 = Math.sqrt(-2 * Math.log(random() + 1e-9)) * Math.cos(2 * Math.PI * random());
          const g2 = Math.sqrt(-2 * Math.log(random() + 1e-9)) * Math.cos(2 * Math.PI * random());
          y += (w[1] * STEP * 3600 + g1 * sigma) / EARTH;
          x += (w[0] * STEP * 3600 + g2 * sigma) / (EARTH * cos);
          lat[i] = y;
          lon[i] = x;
        }
        if (ok) this.tracks.push({ te, power: s.power, seed: Math.floor(random() * 1e9), lat, lon });
      }
    }
  }

  /** Relative strength of a fire, 0..1 (log scale: a refinery and a field fire both show). */
  strength(power: number): number {
    return Math.min(1, Math.log1p(power) / Math.log1p(this.maxPower));
  }
}

// ---------- the canvas part: wind near the fires, the towns' air ----------

/** US EPA AQI from PM2.5 (2024 breakpoints). */
export function aqiFromPm25(c: number): number {
  const bp: [number, number, number, number][] = [
    [0, 9, 0, 50],
    [9.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 125.4, 151, 200],
    [125.5, 225.4, 201, 300],
    [225.5, 325.4, 301, 500],
  ];
  for (const [lo, hi, ilo, ihi] of bp) if (c <= hi) return Math.round(ilo + ((ihi - ilo) * (Math.max(c, lo) - lo)) / (hi - lo));
  return 500;
}

const AQI_STEPS = [50, 100, 150, 200, 300];
const AQI_FILL = ['#34d17a', '#f5d547', '#ff9d3a', '#ff5a5f', '#b04bd6', '#8a1a3a'];
export const aqiColor = (aqi: number) => {
  const k = AQI_STEPS.findIndex((s) => aqi <= s);
  return AQI_FILL[k === -1 ? AQI_FILL.length - 1 : k];
};

/**
 * A smoke scene's state (the puffs' paths, the wind, the towns, the clock) and the canvas part of
 * it: wind arrows near the fires and the towns with their air. The puffs and flames are drawn by
 * a SmokeField on the graphics card, from `sim` and `time`.
 */
export class SmokeLayer extends CanvasLayer {
  private model: SmokeSim | null = null;
  private wind: WindAt | null = null;
  private box: SmokeBox | null = null;
  private towns: SmokeTown[] = [];
  /** Scene clock, hours. */
  time = 0;
  /** Hour of the scene clock that towns' values start at. */
  townStart = 0;

  constructor(className: string) {
    super(className);
    this.canvas.hidden = true;
  }

  setTime(hours: number): void {
    this.time = hours;
  }

  get active(): boolean {
    return this.model !== null;
  }

  /** The puffs' paths, for the SmokeField. */
  get sim(): SmokeSim | null {
    return this.model;
  }

  set(sim: SmokeSim | null, wind: WindAt | null = null, box: SmokeBox | null = null): void {
    this.model = sim;
    this.wind = wind;
    this.box = box;
    this.canvas.hidden = !sim;
    if (!sim) this.clear();
  }

  setTowns(towns: SmokeTown[]): void {
    this.towns = towns;
  }

  /** The AQI of each town at the current hour (NaN where unknown). */
  townAqi(t = this.time): number[] {
    const k = t - this.townStart;
    return this.towns.map((town) => {
      const i = Math.floor(k);
      const a = town.pm25[Math.max(0, Math.min(town.pm25.length - 1, i))];
      const b = town.pm25[Math.max(0, Math.min(town.pm25.length - 1, i + 1))];
      const v = Number.isFinite(a) && Number.isFinite(b) ? a + (b - a) * (k - i) : a;
      return Number.isFinite(v) ? aqiFromPm25(v) : NaN;
    });
  }

  /** Draws the wind and the towns at `this.time`; `now` (ms) only moves the wind marks. */
  draw(view: Projection, now: number): void {
    const ctx = this.ctx;
    this.begin();
    if (!this.model || !this.width) return;
    const t = this.time;
    if (this.wind && this.box) this.drawWind(view, t, now);

    // Towns with their air quality at this hour.
    const aqi = this.townAqi(t);
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.towns.forEach((town, i) => {
      const p = view.project(town.lat, town.lon);
      if (!p) return;
      const v = aqi[i];
      const R = 13;
      ctx.beginPath();
      ctx.arc(p[0], p[1], R, 0, Math.PI * 2);
      ctx.fillStyle = Number.isFinite(v) ? aqiColor(v) : 'rgba(120,130,145,0.9)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(4,6,11,0.85)';
      ctx.stroke();
      ctx.fillStyle = Number.isFinite(v) && v > 150 ? '#fff' : '#0b0e14';
      ctx.fillText(Number.isFinite(v) ? String(v) : '–', p[0], p[1] + 0.5);
      ctx.fillStyle = '#e9edf5';
      ctx.strokeStyle = 'rgba(4,6,11,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeText(town.name, p[0], p[1] + R + 9);
      ctx.fillText(town.name, p[0], p[1] + R + 9);
    });
  }

  private drawWind(view: Projection, t: number, now: number): void {
    const ctx = this.ctx;
    const box = this.box!;
    const n = 6;
    ctx.lineCap = 'round';
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const lat = box.s + ((box.n - box.s) * (j + 0.5)) / (n + 1);
        const lon = box.w + ((box.e - box.w) * (i + 0.5)) / (n + 1);
        const w = this.wind!(lat, lon, t);
        const p = view.project(lat, lon);
        if (!w || !p) continue;
        const speed = Math.hypot(w[0], w[1]);
        if (speed < 0.3) continue;
        // Screen direction: east is +x, north is -y (good enough over a small area).
        const dx = w[0] / speed;
        const dy = -w[1] / speed;
        const len = 12 + Math.min(30, speed * 2.4);
        const x0 = p[0] - (dx * len) / 2;
        const y0 = p[1] - (dy * len) / 2;
        const x1 = x0 + dx * len;
        const y1 = y0 + dy * len;
        ctx.strokeStyle = 'rgba(190,225,255,0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 - dx * 6 - dy * 4, y1 - dy * 6 + dx * 4);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - dx * 6 + dy * 4, y1 - dy * 6 - dx * 4);
        ctx.stroke();
        // A bright dot running along the arrow, faster in stronger wind.
        const phase = ((now / 1000) * (0.4 + speed * 0.08) + i * 0.37 + j * 0.61) % 1;
        ctx.fillStyle = 'rgba(225,242,255,0.9)';
        ctx.beginPath();
        ctx.arc(x0 + dx * len * phase, y0 + dy * len * phase, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
