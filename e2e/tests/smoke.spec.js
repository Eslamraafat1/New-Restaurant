import { test, expect } from '@playwright/test';

// Every key page should load (HTTP 200) with the right <title>
const pages = [
  ['/', /CRUST & CRAVE/i],
  ['/menu', /Menu/i],
  ['/menu/pizza', /Pizza/i],
  ['/menu/burgers', /Burgers/i],
  ['/menu/crepes', /Crepes/i],
  ['/offers', /Offers/i],
  ['/product/margherita', /Margherita/i],
];

test.describe('Key pages load', () => {
  for (const [path, title] of pages) {
    test(`${path} returns 200 with correct title`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe('Error handling', () => {
  test('unknown routes return 404', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res.status()).toBe(404);
  });
});
