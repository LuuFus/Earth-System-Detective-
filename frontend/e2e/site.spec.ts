// The site in a real browser. Each test guards against a problem found by hand before.

import { expect, test } from '@playwright/test';
import { centreBrightness, collectErrors, subsolarLon, wrapLon } from './helpers';

test('home: the film, the about section with screenshots, the authors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const about = page.locator('#about');
  await about.scrollIntoViewIfNeeded();
  await expect(about.locator('.about__section')).toHaveCount(7);
  await expect(about).toContainText('IT Detectives');
  // Every screenshot has loaded (lazy images: scroll through first).
  for (const img of await about.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test('globe: the real Sun lights the day side from the first frame', async ({ page }) => {
  const errors = collectErrors(page);
  const sun = subsolarLon();
  // Facing the Sun: bright. Facing away: dark, with only city lights. Checked within 10 s of loading,
  // which caught the Sun being placed only after 30 s.
  await page.goto(`/explore?light=sun&cam=0.00,${sun.toFixed(2)},3.00`);
  await page.waitForTimeout(8000);
  const day = await centreBrightness(page);
  await page.goto(`/explore?light=sun&cam=0.00,${wrapLon(sun + 180).toFixed(2)},3.00`);
  await page.waitForTimeout(8000);
  const night = await centreBrightness(page);
  // Brightness depends on what is under the Sun (a dark ocean, a desert): compare, don't threshold.
  expect(day).toBeGreaterThan(night * 4 + 5);
  expect(errors).toEqual([]);
});

test('analysis: the year labels under a narrow slider do not run together', async ({ page }) => {
  await page.goto('/explore?v=t2m&a=c:UA');
  const labels = page.locator('.timeline .jelly__nums span');
  await expect(labels.first()).toBeVisible();
  const boxes = await labels.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right })));
  for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBeGreaterThan(boxes[i - 1].right);
});

test('map of Ukraine: the air quality bubbles are drawn', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=ukraine');
  const stations = page.locator('.weather-map__stations');
  await expect(stations).toBeVisible();
  // Some pixels of the bubbles' canvas are painted.
  await expect
    .poll(
      () =>
        stations.evaluate((c: HTMLCanvasElement) => {
          const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
          let n = 0;
          for (let i = 3; i < d.length; i += 4 * 16) if (d[i] > 0) n++;
          return n;
        }),
      { timeout: 40_000 },
    )
    .toBeGreaterThan(200);
  expect(errors).toEqual([]);
});

test('weather map: the forecast plays and the time moves on', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=weather');
  const when = page.locator('.wm-timeline__when');
  await expect(when).toBeVisible({ timeout: 40_000 });
  const before = await when.innerText();
  await page.locator('.wm-timeline button').first().click();
  await expect.poll(() => when.innerText(), { timeout: 20_000 }).not.toBe(before);
  expect(errors).toEqual([]);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const path of ['/explore', '/map?mode=ukraine']) {
    test(`the 3D / 2D switch fits on the screen: ${path}`, async ({ page }) => {
      await page.goto(path);
      const sw = page.locator('.view-switch').first();
      await expect(sw).toBeVisible();
      const box = (await sw.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    });
  }

  test('the map panel folds and unfolds', async ({ page }) => {
    await page.goto('/map?mode=weather');
    const more = page.locator('.wm-layers__more');
    await expect(more).toBeVisible();
    await expect(page.locator('.wm-weather')).toBeHidden();
    await more.click();
    await expect(page.locator('.wm-weather')).toBeVisible();
  });
});
