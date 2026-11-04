import { test, expect } from '@playwright/test';

// Every key page should load (HTTP 200) with the right <title> and without runtime or hydration errors
const pages = [
  ['/', /CRUST & CRAVE/i],
  ['/menu', /Menu/i],
  ['/menu/pizza', /Pizza/i],
  ['/menu/burgers', /Burgers/i],
  ['/menu/crepes', /Crepes/i],
  ['/offers', /Offers/i],
  ['/product/margherita', /Margherita/i],
  ['/cart', /Cart/i],
  ['/checkout', /Checkout/i],
  ['/about', /About/i],
  ['/ar', /CRUST & CRAVE/i],
  ['/ar/menu', /المنيو/],
  ['/ar/menu/pizza', /بيتزا/],
  ['/ar/product/margherita', /مارجريتا/],
  ['/ar/checkout', /إتمام الطلب/],
];

test.describe('Key pages load', () => {
  for (const [path, title] of pages) {
    test(`${path} returns 200 with correct title and no console errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      const res = await page.goto(path, { waitUntil: 'networkidle' });
      expect(res.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('Error handling', () => {
  test('unknown routes return 404', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res.status()).toBe(404);
  });
});
