// The site in a real browser. Each test guards against a problem found by hand before.

import { expect, test } from '@playwright/test';
import { centreBrightness, collectErrors, subsolarLon, wrapLon } from './helpers';

test('home: the film, the about section with screenshots, the authors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const about = page.locator('#about');
  await about.scrollIntoViewIfNeeded();
  await expect(about.locator('.about__section')).toHaveCount(9);
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
  // Each side is compared with the same view under even light, so what lies there (a dark ocean,
  // a desert) does not matter. Measured within 10 s of loading, which caught the Sun being placed
  // only after 30 s.
  const look = async (lon: number, light: string) => {
    await page.goto(`/explore?${light}cam=0.00,${wrapLon(lon).toFixed(2)},3.00`);
    await page.waitForTimeout(8000);
    return centreBrightness(page, 120);
  };
  const day = (await look(sun, 'light=sun&')) / (await look(sun, ''));
  const night = (await look(sun + 180, 'light=sun&')) / (await look(sun + 180, ''));
  expect(day).toBeGreaterThan(0.6);
  expect(night).toBeLessThan(0.4);
  expect(errors).toEqual([]);
});

test('analysis: the year labels under a narrow slider do not run together', async ({ page }) => {
  await page.goto('/explore?v=t2m&a=c:UA');
  const labels = page.locator('.timeline .jelly__nums span');
  await expect(labels.first()).toBeVisible();
  const boxes = await labels.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right })));
  for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBeGreaterThan(boxes[i - 1].right);
});

test('analysis: measured numbers, nothing made up past the data, the globe follows the chart, single years', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?a=c:UA&cv=fires&v=fires&p=2012-2025');
  const drawer = page.locator('#analysis-drawer');
  await expect(drawer.locator('.summary')).toContainText('Найбільше — у');
  // No trend carried on past the period unless asked for, and so no negative fire counts.
  await expect(drawer.locator('.chart__band')).toHaveCount(0);
  const ticks = await drawer.locator('.chart__tick').allTextContents();
  expect(ticks.some((t) => /^[-−]\d/.test(t.trim()))).toBe(false);
  // A new chart variable puts its layer on the globe.
  await drawer.locator('.drawer__what select').first().selectOption('precip');
  await expect(page).toHaveURL(/v=precip/);
  // Single years: the picked years against a usual year, and the same two years on the globe's shutter.
  await drawer.getByRole('button', { name: 'Окремі роки' }).click();
  await drawer.locator('.years-pick select').selectOption('2010');
  const table = drawer.locator('.years-table');
  await expect(table).toContainText('2010');
  await expect(table).toContainText('Звичайний рік');
  await expect(page).toHaveURL(/ys=2010/);
  await expect(page).toHaveURL(/cmp=2010/);
  await expect(page.locator('.globe-split')).toBeVisible();
  await expect(drawer.locator('.years-result__shutter')).toContainText('ліворуч 2010');
  expect(errors).toEqual([]);
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

for (const layer of ['Вітер', 'Дрібний пил PM2.5']) {
  test(`forecast playback has no stalls: ${layer}`, async ({ page }) => {
    // A frame of the field used to stall the map for about a second at every step.
    await page.goto('/map?mode=weather');
    await expect(page.locator('.wm-timeline__when')).toBeVisible({ timeout: 40_000 });
    await page.getByText(layer, { exact: true }).click();
    await page.waitForTimeout(3000);
    await page.locator('.wm-timeline .play-btn').click();
    const { fps, worst } = await page.evaluate(
      () =>
        new Promise<{ fps: number; worst: number }>((done) => {
          const t0 = performance.now();
          let n = 0;
          let last = t0;
          let worst = 0;
          const tick = (t: number) => {
            n++;
            worst = Math.max(worst, t - last);
            last = t;
            if (t - t0 < 8000) requestAnimationFrame(tick);
            else done({ fps: n / 8, worst });
          };
          requestAnimationFrame(tick);
        }),
    );
    console.log(`${layer}: ${fps.toFixed(0)} fps, longest frame ${worst.toFixed(0)} ms`);
    expect(worst).toBeLessThan(400);
    expect(fps).toBeGreaterThan(20);
  });
}

test('my city: the page loads, the city can be pinned and shows on the home page', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/city?name=Черкаси&lat=49.4444&lon=32.0598&country=Україна');
  await expect(page.getByRole('heading', { level: 1, name: 'Черкаси' })).toBeVisible();
  await expect(page.locator('.city-advice__item').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.city-now__temp')).toBeVisible();
  await page.getByRole('button', { name: 'Закріпити' }).click();
  await page.goto('/');
  await expect(page.locator('.hero__city')).toContainText('Черкаси');
  expect(errors).toEqual([]);
});

test('war and the environment: four stories, a working slider, videos load only on demand', async ({ page }) => {
  const errors = collectErrors(page);
  const youtube: string[] = [];
  page.on('request', (r) => /youtube/.test(r.url()) && youtube.push(r.url()));
  await page.goto('/war');
  await expect(page.locator('.war-topic')).toHaveCount(4);
  await expect(page.locator('.war-tally li')).toHaveCount(6);
  // The slider moves the line between the two pictures.
  const slider = page.locator('.before-after').first();
  await slider.scrollIntoViewIfNeeded();
  await slider.locator('input[type=range]').fill('20');
  await expect(slider).toHaveAttribute('style', /--at: 20%/);
  // Nothing from YouTube until a video is asked for; then the no-cookie player.
  expect(youtube).toEqual([]);
  await page.locator('.video__facade').first().click();
  await expect(page.locator('iframe.video__frame')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
  expect(errors).toEqual([]);
});

test('ask the Earth: a question about a town gets an answer with numbers and a link', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Запитай Землю' }).click();
  await page.getByRole('searchbox', { name: /Наприклад/ }).fill('Яка погода завтра в Одесі?');
  await page.getByRole('button', { name: 'Запитати' }).click();
  const card = page.locator('.ask-card');
  await expect(card).toContainText('Одеса', { timeout: 30_000 });
  await expect(card).toContainText('завтра');
  await expect(card.getByRole('link').first()).toBeVisible();
  // A question it cannot read gets the list of what it can.
  await page.getByRole('searchbox', { name: /Наприклад/ }).fill('Привіт');
  await page.getByRole('button', { name: 'Запитати' }).click();
  await expect(card).toContainText('прості питання');
  expect(errors).toEqual([]);
});

test('events: the news list, the Los Angeles fires day by day, the blackout comparison', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?panel=cases');
  await page.locator('.news-card', { hasText: 'Пожежі в Лос-Анджелесі' }).click();
  const card = page.locator('.hint-card');
  await expect(card).toContainText('7–31 січня 2025');
  await expect(card).toContainText('Основні причини');
  await expect(card).toContainText('Наслідки');
  // The fire points of those days, from the NASA FIRMS archive.
  await card.getByRole('button', { name: 'Точки вогню день за днем' }).click();
  await expect(page.locator('.story-player')).toContainText('Лос-Анджелес');
  // The blackout event opens the 2021 / 2022 comparison at once (it used to only switch the layer on).
  await page.locator('.news-card', { hasText: 'Блекаут' }).click();
  await page.getByRole('button', { name: 'Порівняти: 2021 і 2022' }).click();
  await expect(page).toHaveURL(/cmp=2021/);
  await expect(page).toHaveURL(/on=blackout/);
  expect(errors).toEqual([]);
});

test('the side panel can be made wider and narrower, and keeps its width', async ({ page }) => {
  await page.goto('/explore?panel=layers');
  const panel = page.locator('.flyout');
  await expect(panel).toBeVisible();
  await page.waitForTimeout(600);
  const before = (await panel.boundingBox())!.width;
  const handle = (await page.locator('.flyout__resize').boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + 220, handle.y + handle.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(before + 150);
  const wide = Math.round((await panel.boundingBox())!.width);
  // Opened again on a new visit, it keeps the width.
  await page.goto('/explore?panel=layers');
  await expect(panel).toBeVisible();
  await page.waitForTimeout(800);
  await expect.poll(async () => Math.round((await panel.boundingBox())!.width)).toBeGreaterThan(wide - 10);
  // The keyboard works too: Home is the narrowest.
  await page.locator('.flyout__resize').focus();
  await page.keyboard.press('Home');
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeLessThan(310);
});

test('glossary: a term has its formula, how to read it and where it is on the site', async ({ page }) => {
  await page.goto('/explore');
  await page.locator('.rail__btn[data-id="glossary"]').click();
  await page.getByRole('searchbox').fill('NDVI');
  const term = page.locator('.gloss-term');
  await expect(term).toHaveCount(1);
  await expect(term.locator('.gloss-formula')).toContainText('NDVI = (NIR − Red) / (NIR + Red)');
  await expect(term).toContainText('Як читати числа');
  await expect(term).toContainText('Де на сайті');
});

test('occupied territory: the timeline plays from 2022 and can be moved by hand', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=ukraine');
  await page.getByRole('button', { name: /Хронологія з 2022 року/ }).click();
  const player = page.locator('.occ-player');
  await expect(player).toBeVisible();
  const date = player.locator('.occ-player__date');
  const first = await date.textContent();
  // It plays: the date moves on by itself.
  await expect.poll(() => date.textContent(), { timeout: 15_000 }).not.toBe(first);
  await player.getByRole('button', { name: 'Пауза' }).click();
  // 13 November 2022: Kherson's liberation shows in the numbers.
  const n = await page.evaluate(async () => (await (await fetch('/data/ukraine/front-history.json')).json()).frames.length as number);
  const chart = (await player.locator('.occ-chart__svg').boundingBox())!;
  await page.mouse.click(chart.x + (chart.width * 33) / (n - 1), chart.y + chart.height / 2);
  await expect(date).toHaveText('13 листопада 2022');
  await expect(player.locator('.occ-chip--liberated')).toBeVisible();
  expect(errors).toEqual([]);
});

test('radiation: stations with their own reading at each place, a card in plain words', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=ukraine');
  await page.locator('.wm-ua .switch', { hasText: 'Радіаційний фон' }).click();
  // The radiation tags get their own canvas, and it gets painted.
  const tags = page.locator('canvas.weather-map__rad');
  await expect(tags).toBeVisible();
  await expect
    .poll(() =>
      tags.evaluate((c: HTMLCanvasElement) => {
        const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4 * 16) if (d[i] > 0) n++;
        return n;
      }),
    )
    .toBeGreaterThan(100);
  // Ask the Earth answers with the nearest station's reading.
  await page.getByRole('button', { name: 'Запитай Землю' }).click();
  await page.getByRole('searchbox', { name: /Наприклад/ }).fill('Яка радіація в Києві?');
  await page.getByRole('button', { name: 'Запитати' }).click();
  await expect(page.locator('.ask-card')).toContainText('мкЗв/год', { timeout: 30_000 });
  expect(errors).toEqual([]);
});

test('on a phone, the home and war pages fit the screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/', '/war']) {
    await page.goto(path);
    await page.waitForTimeout(1500);
    const wide = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll('h1, h2, p, a, button')].filter((e) => e.getBoundingClientRect().right > w + 2 && e.getBoundingClientRect().width > 0).length;
    });
    expect(wide, path).toBe(0);
  }
});

test('cities: the layer on the globe, cities typed into the analysis, two cities compared by everything', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?b=1&on=cities&cam=49.00,31.00,1.6');
  // City dots, names and population, drawn on their own canvas over the globe.
  const names = page.locator('canvas.globe__cities');
  await expect(names).toBeVisible({ timeout: 20_000 });
  await expect
    .poll(() =>
      names.evaluate((c: HTMLCanvasElement) => {
        const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4 * 16) if (d[i] > 0) n++;
        return n;
      }),
    )
    .toBeGreaterThan(300);
  // The search on the globe finds countries only; cities are typed into the analysis.
  const search = page.getByRole('combobox', { name: 'Пошук країни' });
  await search.fill('Харків');
  await search.press('Enter');
  await expect(page.locator('.search__error')).toContainText('панелі «Аналіз»');
  await page.getByRole('button', { name: 'Аналіз', exact: true }).click();
  const a = page.getByRole('combobox', { name: 'Країна або місто для A' });
  await a.fill('Харків');
  await a.press('Enter');
  const b = page.getByRole('combobox', { name: 'Країна або місто для B' });
  await b.fill('Львів');
  await b.press('Enter');
  // The comparison by everything, with numbers that arrive one by one.
  await page.getByRole('tab', { name: 'Усе про місця' }).click();
  const table = page.locator('.place-cmp');
  await expect(table).toContainText('Порівняння за всім');
  await expect(table).toContainText('Харків');
  await expect(table).toContainText('Львів');
  await expect(table.locator('tr', { hasText: /^Населення/ })).toContainText('803');
  await expect(table.locator('tr', { hasText: 'Густота населення' })).toContainText('4');
  expect(errors).toEqual([]);
});

test('fires: the two layers are explained, and the live fires hide while years are compared', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?panel=fires&on=fires');
  const panel = page.locator('.flyout');
  await expect(panel).toContainText('Два шари пожеж: у чому різниця');
  await panel.getByRole('button', { name: 'Показати архів за вчора' }).click();
  await expect(page).toHaveURL(/v=fires/);
  await expect(panel).toContainText('Доба архіву');
  await expect(panel).toContainText('NOAA-20');
  // The comparison shutter: the 48-hour points are about today, not the years on the shutter.
  await page.goto('/explore?panel=fires&on=fires&v=fires&cmp=2021');
  await expect(page.locator('.flyout')).toContainText('пожежі за 48 годин сховано');
  expect(errors).toEqual([]);
});

test('map of Ukraine: air quality and radiation stay on together, fires have a card', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=ukraine');
  const air = page.locator('.wm-ua .switch', { hasText: 'Якість повітря' }).locator('input');
  const rad = page.locator('.wm-ua .switch', { hasText: 'Радіаційний фон' }).locator('input');
  await expect(air).toBeChecked();
  await page.locator('.wm-ua .switch', { hasText: 'Радіаційний фон' }).click();
  await expect(rad).toBeChecked();
  // Turning one on never turns the other off.
  await expect(air).toBeChecked();
  // The fires legend explains how to get a fire's card.
  await expect(page.locator('.wm-ua')).toContainText('Клацніть пожежу');
  expect(errors).toEqual([]);
});

test('smoke: a fire story shows where the wind took the smoke, with what to do', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?panel=fires');
  await page.locator('.story-card', { hasText: 'Чорнобильська зона' }).click();
  await page.getByRole('button', { name: /Дим і вітер/ }).click();
  const player = page.locator('.smoke-player');
  await expect(player).toContainText('Чорнобильська зона');
  await expect(player).toContainText('Що з цим робити');
  // Once the wind of those days and the towns' air arrive, the smoke canvas is drawn.
  const smoke = page.locator('canvas.globe__smoke');
  await expect(smoke).toBeVisible({ timeout: 40_000 });
  await expect
    .poll(
      () =>
        smoke.evaluate((c: HTMLCanvasElement) => {
          const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
          let n = 0;
          for (let i = 3; i < d.length; i += 4 * 16) if (d[i] > 0) n++;
          return n;
        }),
      { timeout: 30_000 },
    )
    .toBeGreaterThan(200);
  await player.getByText('Що з цим робити').click();
  await expect(player).toContainText('FFP2');
  expect(errors).toEqual([]);
});

test('fires now: the biggest hotspots of the world, each with a worked-out forecast', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/explore?panel=fires');
  const hotspots = page.locator('.hotspot');
  await expect(hotspots.first()).toBeVisible({ timeout: 30_000 });
  expect(await hotspots.count()).toBeGreaterThan(2);
  await hotspots.first().click();
  const player = page.locator('.smoke-player');
  await expect(player).toContainText('Що бачать супутники');
  await expect(player).toContainText('за останню добу', { ignoreCase: true });
  await expect(player).toContainText('FFWI', { timeout: 30_000 });
  expect(errors).toEqual([]);
});

test('map of Ukraine: strikes with fires, and the smoke of one on the map', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/map?mode=ukraine');
  const strikes = page.locator('.strike-list .hotspot');
  await expect(strikes.first()).toBeVisible({ timeout: 30_000 });
  expect(await strikes.count()).toBeGreaterThan(3);
  await strikes.filter({ hasText: 'Масована атака на Київ' }).click();
  const player = page.locator('.smoke-player');
  await expect(player).toContainText('Масована атака на Київ');
  await player.getByText('Що з цим робити').click();
  await expect(player).toContainText('101');
  expect(errors).toEqual([]);
});
