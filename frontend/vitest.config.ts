// Unit tests (Vitest): the statistics and other pure code. Kept apart from vite.config.ts so
// the dev server's live-data plugin does not start during tests.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
