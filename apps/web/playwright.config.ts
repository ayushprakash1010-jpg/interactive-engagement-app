import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config (Sprint 7).
 *
 * Targets a running stack. By default it points at a local web app on :3000
 * (set PLAYWRIGHT_BASE_URL to test a deployed preview/staging URL). The host
 * dashboard flow requires an authenticated session — provide one via
 * E2E_STORAGE_STATE (a saved Auth0 session) so CI can run the full journey
 * without driving Auth0's Universal Login interactively.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  // When testing locally without a deployed URL, boot the web app automatically.
  // Skipped if PLAYWRIGHT_BASE_URL is set (assumed already running).
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm --filter @iep/web start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
