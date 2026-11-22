// The README screenshots (docs/screenshots/*.jpg), taken from the running site:
//   npm run screenshots
// Live data changes, so every run shows the Earth of that moment.

import { test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { clickText, subsolarLon, wrapLon } from './helpers';

const OUT = fileURLToPath(new URL('../../docs/screenshots/', import.meta.url));

async function save(page: Page, name: string) {
  await page.screenshot({ path: `${OUT}${name}.jpg`, type: 'jpeg', quality: 80 });
}

async function open(page: Page, path: string, wait: number) {
  await page.goto(path);
  await page.waitForTimeout(wait);
}

/** Moves the pointer a little at a spot, so the card under the pointer appears. */
async function hover(page: Page, x: number, y: number) {
  for (let k = 0; k < 4; k++) {
    await page.mouse.move(x + k, y + k);
    await page.waitForTimeout(120);
  }
}

test.describe('desktop', () => {
  test('home', async ({ page }) => {
    await open(page, '/', 6000);
    await save(page, 'home');
    await page.evaluate(() => document.getElementById('about')!.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(1500);
    await save(page, 'about');
  });

  test('layers and the value under the pointer', async ({ page }) => {
    await open(page, '/explore?v=sst&panel=layers&cam=25.00,-30.00,2.90', 10000);
    await hover(page, 730, 420);
    await page.waitForTimeout(2500);
    await save(page, 'layers');
    await open(page, '/explore?v=no2&cam=36.00,40.00,2.20', 10000);
    await hover(page, 680, 380);
    await page.waitForTimeout(3000);
    await save(page, 'readout');
  });

  test('night and the blackout', async ({ page }) => {
    // The evening side of the Earth now, with city lights.
    await open(page, `/explore?light=sun&cam=30.00,${wrapLon(subsolarLon() + 80).toFixed(2)},3.30`, 10000);
    await save(page, 'night');
    await open(page, '/explore?v=nightlights&on=blackout&panel=ukraine&cam=48.60,32.00,1.55', 12000);
    await save(page, 'blackout');
  });

  test('fires', async ({ page }) => {
    await open(page, '/explore?panel=fires&on=fires&cam=6.00,18.00,2.30', 10000);
    await save(page, 'fires');
    await open(page, '/explore?panel=fires', 6000);
    await clickText(page, 'Чорнобильська зона, квітень 2020');
    await page.waitForTimeout(14000);
    await save(page, 'fire-story');
  });

  test('map of Ukraine', async ({ page }) => {
    await open(page, '/map?mode=ukraine', 12000);
    await save(page, 'ukraine-map');
    // A yellow bubble (AQI 51-100) near the middle, found in the bubbles' canvas, opens its card.
    const p = await page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('.weather-map__stations')!;
      const r = c.getBoundingClientRect();
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      const k = c.width / r.width;
      const hit = (x: number, y: number) => {
        const i = (Math.round(y * k) * c.width + Math.round(x * k)) * 4;
        return d[i] === 0xff && d[i + 1] === 0xd2 && d[i + 2] === 0x3f;
      };
      let best: [number, number, number] | null = null;
      for (let y = 120; y < r.height - 160; y += 3)
        for (let x = 200; x < r.width - 380; x += 3)
          if (hit(x, y) && hit(x + 7, y) && hit(x - 7, y) && hit(x, y + 7) && hit(x, y - 7)) {
            const dd = (x - r.width * 0.45) ** 2 + (y - r.height * 0.5) ** 2;
            if (!best || dd < best[2]) best = [x + r.x, y + r.y, dd];
          }
      return best;
    });
    if (p) {
      await page.mouse.click(p[0], p[1]);
      await page.waitForTimeout(4000);
    }
    await save(page, 'air-card');
  });

  test('weather', async ({ page }) => {
    await open(page, '/map?mode=weather', 12000);
    await save(page, 'weather-wind');
    await clickText(page, 'Температура');
    await page.waitForTimeout(3000);
    await page.mouse.click(620, 400);
    await page.waitForTimeout(5000);
    await save(page, 'weather-temp');
  });

  test('analysis', async ({ page }) => {
    await open(page, '/explore?v=t2m&a=c:UA&cam=49.00,31.00,2.40', 15000);
    await save(page, 'trends');
    await open(page, '/explore?v=t2m&a=c:UA&bb=c:PL&cam=51.00,25.00,2.40', 16000);
    await save(page, 'compare');
  });

  test('events', async ({ page }) => {
    await open(page, '/explore?panel=cases&cam=38.00,25.00,3.30', 9000);
    await save(page, 'events');
    await clickText(page, 'Висихання Аральського моря');
    await page.waitForTimeout(18000);
    await save(page, 'event');
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });

  test('home, map, globe', async ({ page }) => {
    await open(page, '/', 5000);
    await save(page, 'mobile-home');
    await open(page, '/map?mode=ukraine', 12000);
    await save(page, 'mobile-map');
    await open(page, '/explore?v=sst&cam=30.00,20.00,3.60', 10000);
    await save(page, 'mobile-globe');
  });
});
