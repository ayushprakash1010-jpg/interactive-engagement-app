import { defineConfig } from 'vitest/config';

/**
 * Vitest config for apps/web unit tests.
 *
 * The Playwright E2E suite lives in `e2e/` and uses @playwright/test — it must
 * NOT be collected by Vitest (it has its own runner via `pnpm e2e`).
 */
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'e2e'],
  },
});
