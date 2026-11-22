import type { Page } from '@playwright/test';

/** Longitude where the Sun is overhead now (NOAA approximation, as on the globe). */
export function subsolarLon(d = new Date()): number {
  const day = (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000;
  const g = (2 * Math.PI * (day - 1)) / 365;
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const min = d.getUTCHours() * 60 + d.getUTCMinutes();
  return ((((-(min + eot - 720) / 4) % 360) + 540) % 360) - 180;
}

export const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;

/** Mean brightness (0-255) of a square in the middle of the page, from a screenshot. */
export async function centreBrightness(page: Page, half = 40): Promise<number> {
  const png = await page.screenshot();
  const size = page.viewportSize()!;
  return page.evaluate(
    async ({ data, w, h, half }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const k = img.width / w;
      const px = ctx.getImageData(Math.round((w / 2 - half) * k), Math.round((h / 2 - half) * k), Math.round(2 * half * k), Math.round(2 * half * k)).data;
      let sum = 0;
      for (let i = 0; i < px.length; i += 4) sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      return sum / (px.length / 4);
    },
    { data: png.toString('base64'), w: size.width, h: size.height, half },
  );
}

/** Clicks the visible element whose own text contains `text` (the shortest match). */
export async function clickText(page: Page, text: string): Promise<void> {
  const box = await page.evaluate((want) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let best: { el: Element; len: number } | null = null;
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = (n.textContent ?? '').replace(/\s+/g, ' ');
      if (!t.includes(want) || !n.parentElement) continue;
      const r = n.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (!best || t.length < best.len) best = { el: n.parentElement, len: t.length };
    }
    if (!best) return null;
    best.el.scrollIntoView({ block: 'center' });
    const r = best.el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text);
  if (!box) throw new Error(`No element with the text "${text}"`);
  await page.mouse.click(box.x, box.y);
}

/** Errors thrown by the page, for a test to check at the end. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}
