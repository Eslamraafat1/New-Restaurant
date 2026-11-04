import { test, expect } from '@playwright/test';
import { ready } from './helpers.js';

test.describe('Language (EN / AR)', () => {
  test('switching to Arabic sets lang="ar" dir="rtl" and survives a reload server-side', async ({ page, context }) => {
    await page.goto('/menu');
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Switch language' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('المنيو');

    const cookie = (await context.cookies()).find((c) => c.name === 'cc-lang');
    expect(cookie?.value).toBe('ar');

    // the server HTML itself is Arabic (no English flash before hydration)
    const res = await page.reload();
    const html = await res.text();
    expect(html).toMatch(/<html[^>]*lang="ar"[^>]*dir="rtl"/);
    expect(html).toContain('المنيو');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await ready(page);

    await page.getByRole('button', { name: 'تغيير اللغة' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The menu');
  });

  test('a returning Arabic visitor gets Arabic HTML on the first byte', async ({ request, baseURL }) => {
    const host = new URL(baseURL).hostname;
    const res = await request.get('/product/margherita', { headers: { cookie: 'cc-lang=ar' } });
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<html[^>]*lang="ar"[^>]*dir="rtl"/);
    expect(html).toContain('مارجريتا');
    expect(host).toBeTruthy();
  });
});

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
  for (const path of ['/this-page-does-not-exist', '/product/not-a-real-dish', '/menu/not-a-category']) {
    test(`${path} returns 404 with the branded not-found page`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });
  }
});
