import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },

  expect: {
    timeout: 10_000,
  },

  webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: false,
  timeout: 60_000,
  env: {
    NEXT_PUBLIC_API_URL:
      'https://swdevprac-project-backend.vercel.app/api/v1',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'mysecret',
  },
},

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});