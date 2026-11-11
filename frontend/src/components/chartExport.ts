// Shared by the yearly and the seasonal chart: SVG to PNG with a title, and CSV quoting.

export type ChartHandle = { toPng: (title: string) => Promise<Blob | null>; toCsv: () => string };

/** Renders the chart SVG on the site's navy at 2x, with the title above it. */
export async function svgToPng(svg: SVGSVGElement, width: number, height: number, title: string): Promise<Blob | null> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const css = getComputedStyle(document.documentElement);
  const bg = css.getPropertyValue('--color-navy').trim() || '#081229';
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Inline the colours the stylesheet gives the chart, so the image stands alone.
  clone.querySelectorAll<SVGElement>('[data-color]').forEach((el) => {
    const value = css.getPropertyValue(el.dataset.color!).trim();
    if (el.tagName === 'text') el.setAttribute('fill', value);
    else if (el.dataset.fill) el.setAttribute('fill', value);
    else el.setAttribute('stroke', value);
  });
  const titleH = 36;
  const scale = 2;
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = (height + titleH) * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height + titleH);
  ctx.fillStyle = css.getPropertyValue('--color-star').trim() || '#eef2fb';
  ctx.font = '500 14px Inter, Helvetica, Arial, sans-serif';
  ctx.fillText(title, 16, 22);
  ctx.drawImage(img, 0, titleH, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => (/[",;\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
}

export function niceStep(span: number, target = 5): number {
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

/** Y axis from the values: a little air, round ticks. */
export function yScale(values: number[]): { min: number; max: number; ticks: number[] } {
  const v = values.filter(Number.isFinite);
  const lo = v.length ? Math.min(...v) : 0;
  const hi = v.length ? Math.max(...v) : 1;
  const pad = (hi - lo || 1) * 0.08;
  const step = niceStep(hi - lo + 2 * pad || 1);
  const min = Math.floor((lo - pad) / step) * step;
  const max = Math.ceil((hi + pad) / step) * step;
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Number(t.toFixed(10)));
  return { min, max, ticks };
}
