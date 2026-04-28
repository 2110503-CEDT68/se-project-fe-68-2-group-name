import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // 1 retry locally too — helps with flaky login timing
  workers: 1,
  reporter: 'html',
  // globalSetup: './global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,    // per-action timeout (clicks, fills, etc.)
    navigationTimeout: 20_000, // page.goto / waitForURL timeout
  },
  expect: {
    timeout: 10_000,   // add this at the top level, not inside `use`
  },

  // Auto-start your dev server if it's not already running
  webServer:
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});