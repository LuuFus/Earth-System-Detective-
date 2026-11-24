// A 2D canvas laid over the globe or the flat map, sized in CSS pixels and drawn at the screen's
// pixel ratio. The overlays (wind lines, station bubbles, city names, smoke marks) share it.

export class CanvasLayer {
  readonly canvas: HTMLCanvasElement;
  protected readonly ctx: CanvasRenderingContext2D;
  protected width = 0;
  protected height = 0;
  protected dpr = 1;

  constructor(className: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = className;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d')!;
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

  /** Empties the canvas and leaves it ready to draw in CSS pixels. */
  protected begin(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Whether a point in CSS pixels is on the canvas, with a margin. */
  protected onScreen(x: number, y: number, margin: number): boolean {
    return x > -margin && y > -margin && x < this.width + margin && y < this.height + margin;
  }
}
