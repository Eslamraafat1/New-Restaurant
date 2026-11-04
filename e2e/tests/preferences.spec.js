import { test, expect } from '@playwright/test';
import { ready } from './helpers.js';

test.describe('Theme', () => {
  test('theme toggle switches the colour scheme and persists across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await ready(page);
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', /.+/);
    const toggle = page.getByRole('button', { name: 'Toggle theme' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(bg);
    await ready(page);
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Not found', () => {
  const cases = [
    ['/this-page-does-not-exist', 'Page not found', 'en'],
    ['/product/not-a-real-dish', 'Page not found', 'en'],
    ['/menu/not-a-category', 'Page not found', 'en'],
    ['/ar/this-page-does-not-exist', 'الصفحة غير موجودة', 'ar'],
    ['/ar/product/not-a-real-dish', 'الصفحة غير موجودة', 'ar'],
  ];
  for (const [path, heading, lang] of cases) {
    test(`${path} returns 404 with the branded not-found page`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });
  }
});
