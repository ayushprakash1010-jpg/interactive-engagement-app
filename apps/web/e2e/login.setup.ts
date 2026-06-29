import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go directly to the Auth0 API route which redirects to Universal Login
  await page.goto('/api/auth/login');

  // Fill in the Auth0 Universal Login form
  await page.fill('input[name="username"]', 'ayush@growthtech.com');
  await page.fill('input[name="password"]', 'Testing123!');
  await page.keyboard.press('Enter');

  // Wait until we land back on the app (root or dashboard)
  await page.waitForURL(/http:\/\/localhost:3000.*/);

  // Save the auth state
  await page.context().storageState({ path: authFile });
});
