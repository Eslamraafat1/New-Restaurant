import { defineConfig, devices } from '@playwright/test';

// Targets:
//   npm test                         -> live deployment (https://new-restaurant-kappa.vercel.app)
//   BASE_URL=http://localhost:3000 npm test -> any running server
//   LOCAL=1 npm test                 -> starts the production build in ../ (run `npm run build` there first)
const local = !!process.env.LOCAL;
const port = Number(process.env.PORT || 3000);
const baseURL = process.env.BASE_URL || (local ? `http://localhost:${port}` : 'https://new-restaurant-kappa.vercel.app');

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    // makes GSAP/Lenis/framer-motion settle instantly so flows are deterministic
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: local
    ? { command: `npm start -- -p ${port}`, cwd: '..', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 }
    : undefined,
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
