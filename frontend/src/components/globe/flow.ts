// Wind as moving lines, drawn on a 2D canvas over the globe or the flat map.
//
// Particles live in latitude and longitude, are pushed by the wind field each frame and drawn
// as short segments in screen space; the canvas fades a little every frame, so each particle
// leaves a tail. The same code serves the 3D globe and the 2D map: only the projection differs.

export type Projection = {
  /** Screen position in CSS pixels, or null when the place is out of sight (far side, off map). */
  project: (lat: number, lon: number) => [number, number] | null;
  /** A random place in view, or null if none was found. */
  randomPlace: () => [number, number] | null;
  /** Screen pixels per degree of latitude around the middle of the view. */
  pixelsPerDegree: () => number;
};

/** Wind at a place, m/s eastward and northward, or null where there is none. */
export type WindSampler = (lat: number, lon: number) => [number, number] | null;

const BUCKETS = 6;

export class FlowLayer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private wind: WindSampler | null = null;
  private lat = new Float32Array(0);
  private lon = new Float32Array(0);
  private age = new Float32Array(0);
  private life = new Float32Array(0);
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private visible = new Uint8Array(0);
  private count = 0;
  private dpr = 1;
  private width = 0;
  private height = 0;
  /** Pixels a particle moves per frame for 1 m/s. */
  speed = 0.2;
  /** How much of the last frame stays: higher means longer tails. */
  fade = 0.94;
  /** Particles per 10 000 square pixels of the view. */
  density = 0.75;
  /** Keep longitudes in -180..180 (the globe); off for a flat map that shows world copies. */
  wrap = true;
  private colors: string[];

  constructor(className = 'flow') {
    this.canvas = document.createElement('canvas');
    this.canvas.className = className;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d')!;
    // Brighter and more opaque for stronger wind, as Windy draws it.
    this.colors = Array.from({ length: BUCKETS }, (_, i) => `rgba(255,255,255,${(0.5 + (0.5 * i) / (BUCKETS - 1)).toFixed(2)})`);
  }

  setWind(wind: WindSampler | null): void {
    this.wind = wind;
    this.clear();
    this.count = 0;
  }

  get active(): boolean {
    return this.wind !== null;
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.count = 0;
  }

  clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Screen positions belong to the old view: start the tails again.
    this.visible.fill(0);
  }

  private ensure(n: number) {
    if (this.lat.length >= n) return;
    const grow = (a: Float32Array) => {
      const b = new Float32Array(n);
      b.set(a);
      return b;
    };
    this.lat = grow(this.lat);
    this.lon = grow(this.lon);
    this.age = grow(this.age);
    this.life = grow(this.life);
    this.px = grow(this.px);
    this.py = grow(this.py);
    const v = new Uint8Array(n);
    v.set(this.visible);
    this.visible = v;
  }

  private spawn(i: number, view: Projection) {
    const p = view.randomPlace();
    if (!p) {
      this.life[i] = 0;
      this.age[i] = 1;
      return;
    }
    this.lat[i] = p[0];
    this.lon[i] = p[1];
    this.age[i] = 0;
    this.life[i] = 40 + Math.random() * 70;
    this.visible[i] = 0;
  }

  /** One frame. `coverage`: share of the screen the planet or map covers (0..1). */
  frame(view: Projection, coverage = 1): void {
    const wind = this.wind;
    if (!wind || !this.width) return;
    const want = Math.round(((this.width * this.height) / 10000) * this.density * Math.max(0.15, coverage));
    const n = Math.min(9000, Math.max(300, want));
    if (n !== this.count) {
      this.ensure(n);
      for (let i = this.count; i < n; i++) {
        this.spawn(i, view);
        // Spread the ages so particles do not all die at once.
        this.age[i] = Math.random() * this.life[i];
      }
      this.count = n;
    }
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';

    const ppd = Math.max(1e-6, view.pixelsPerDegree());
    const k = this.speed / ppd;
    const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
    for (let i = 0; i < n; i++) {
      if (this.age[i] >= this.life[i]) {
        this.spawn(i, view);
        continue;
      }
      this.age[i]++;
      const lat = this.lat[i];
      const lon = this.lon[i];
      const w = wind(lat, lon);
      if (!w) {
        this.age[i] = this.life[i];
        continue;
      }
      const [u, v] = w;
      const cos = Math.max(0.05, Math.cos((lat * Math.PI) / 180));
      let nlat = lat + v * k;
      let nlon = lon + (u * k) / cos;
      if (nlat > 89.5 || nlat < -89.5) {
        this.age[i] = this.life[i];
        continue;
      }
      if (this.wrap) {
        if (nlon > 180) nlon -= 360;
        else if (nlon < -180) nlon += 360;
      }
      this.lat[i] = nlat;
      this.lon[i] = nlon;
      const s = view.project(nlat, nlon);
      if (!s) {
        this.age[i] = this.life[i];
        continue;
      }
      if (this.visible[i]) {
        const dx = s[0] - this.px[i];
        const dy = s[1] - this.py[i];
        // A jump (wrap, view change) is not a stroke.
        if (dx * dx + dy * dy < 900) {
          const speed = Math.hypot(u, v);
          const b = Math.min(BUCKETS - 1, Math.floor(speed / 3));
          paths[b].moveTo(this.px[i], this.py[i]);
          paths[b].lineTo(s[0], s[1]);
        }
      }
      this.px[i] = s[0];
      this.py[i] = s[1];
      this.visible[i] = 1;
    }
    for (let b = 0; b < BUCKETS; b++) {
      ctx.strokeStyle = this.colors[b];
      ctx.stroke(paths[b]);
    }
  }
}
