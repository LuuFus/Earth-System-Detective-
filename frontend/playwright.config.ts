// Browser tests (Playwright) on the dev server, in the Chrome that is already installed (no
// browser download). Two projects:
//   npm run test:e2e      — the site works: pages load, layers draw, nothing overlaps
//   npm run screenshots   — retakes the README screenshots in docs/screenshots/
// The globe needs WebGL, so Chrome runs with the GPU.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    launchOptions: { args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
    // Vite would open a browser window otherwise.
    env: { BROWSER: 'none' },
  },
  projects: [
    { name: 'site', testIgnore: /screenshots\.spec\.ts/ },
    { name: 'screenshots', testMatch: /screenshots\.spec\.ts/, timeout: 180_000 },
  ],
});
