import { test, expect } from '@playwright/test';
import { digits, htmlAttrs, ready } from './helpers.js';

// English lives at the root, Arabic under /ar. Each URL always serves one language.

test.describe('Locale URLs (server HTML)', () => {
  const pairs = [
    ['/', '/ar', 'CRUST'],
    ['/menu', '/ar/menu', 'المنيو'],
    ['/menu/pizza', '/ar/menu/pizza', 'بيتزا'],
    ['/product/margherita', '/ar/product/margherita', 'مارجريتا'],
    ['/about', '/ar/about', 'من نحن'],
    ['/cart', '/ar/cart', 'سلتك'],
  ];
  for (const [en, ar, arabicText] of pairs) {
    test(`${ar} is Arabic/RTL and ${en} is English/LTR in the first response`, async ({ request }) => {
      const arRes = await request.get(ar);
      expect(arRes.status()).toBe(200);
      const arHtml = await arRes.text();
      expect(htmlAttrs(arHtml)).toEqual({ lang: 'ar', dir: 'rtl' });
      expect(arHtml).toContain(arabicText);

      const enRes = await request.get(en);
      expect(enRes.status()).toBe(200);
      expect(htmlAttrs(await enRes.text())).toEqual({ lang: 'en', dir: 'ltr' });
    });
  }

  test('the language cookie is only a preference: / stays English, no redirect', async ({ request }) => {
    const res = await request.get('/', { headers: { cookie: 'cc-lang=ar' }, maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(htmlAttrs(await res.text())).toEqual({ lang: 'en', dir: 'ltr' });
  });

  test('/en/… is not a duplicate: it permanently redirects to the unprefixed URL', async ({ request }) => {
    const res = await request.get('/en/menu/pizza?x=1', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(new URL(res.headers()['location'], 'http://x').pathname + new URL(res.headers()['location'], 'http://x').search).toBe('/menu/pizza?x=1');
  });

  test('internal links on Arabic pages stay under /ar', async ({ request }) => {
    const html = await (await request.get('/ar/menu/pizza')).text();
    const hrefs = [...html.matchAll(/<a[^>]*\shref="(\/[^"]*)"/g)].map((m) => m[1]);
    const site = hrefs.filter((h) => !h.startsWith('/_next') && !/\.[a-z0-9]+(\?|$)/i.test(h));
    expect(site.length).toBeGreaterThan(20);
    // the only unprefixed link is the language switch back to English
    expect(site.filter((h) => !/^\/ar(\/|$)/.test(h))).toEqual(['/menu/pizza']);
  });
});

test.describe('Language switcher', () => {
  test('maps /menu/pizza ⇄ /ar/menu/pizza, flips lang/dir and remembers the choice', async ({ page, context }) => {
    await page.goto('/menu/pizza');
    await ready(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const toAr = page.getByRole('link', { name: 'Switch language' });
    await expect(toAr).toHaveAttribute('href', '/ar/menu/pizza');
    await expect(toAr).toHaveAttribute('hreflang', 'ar');
    await toAr.click();

    await expect(page).toHaveURL(/\/ar\/menu\/pizza$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await ready(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('بيتزا');
    expect((await context.cookies()).find((c) => c.name === 'cc-lang')?.value).toBe('ar');

    // navigation inside Arabic keeps the /ar prefix
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'المنيو' }).click();
    await expect(page).toHaveURL(/\/ar\/menu$/);
    await ready(page);

    const toEn = page.getByRole('link', { name: 'تغيير اللغة' });
    await expect(toEn).toHaveAttribute('href', '/menu');
    await toEn.click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page).not.toHaveURL(/\/ar\//);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The menu');
    expect((await context.cookies()).find((c) => c.name === 'cc-lang')?.value).toBe('en');
  });

  test('switching keeps the query string (editing a cart item)', async ({ page }) => {
    await page.goto('/product/margherita?edit=missing');
    await ready(page);
    await page.getByRole('link', { name: 'Switch language' }).click();
    await expect(page).toHaveURL(/\/ar\/product\/margherita\?edit=missing$/);
  });
});

test.describe('Ordering in Arabic', () => {
  test('customise → add to cart → checkout validation → order, all under /ar', async ({ page }) => {
    await page.goto('/ar/product/margherita');
    await ready(page);
    const total = page.locator('section[aria-labelledby="sum-h"] dl > div').last().locator('dd');
    expect(digits(await total.innerText())).toBe('140');
    await page.locator('label', { hasText: 'كبير ١٤"' }).click(); // +55
    await expect.poll(async () => digits(await total.innerText())).toBe('195');

    await page.getByRole('button', { name: /^أضف للسلة(?!:)/ }).filter({ visible: true }).first().click();
    await expect(page.getByRole('button', { name: 'السلة (١)' })).toBeVisible();

    // the cart drawer opened; its checkout link is locale-aware
    const drawer = page.getByRole('dialog', { name: 'سلتك' });
    await drawer.getByRole('link', { name: 'إتمام الطلب' }).click();
    await expect(page).toHaveURL(/\/ar\/checkout$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await ready(page);

    await page.getByRole('button', { name: 'أرسل طلباً تجريبياً' }).click();
    await expect(page.getByText('الرجاء إدخال الاسم')).toBeVisible();
    await expect(page.getByText('أدخل رقم هاتف صالحاً')).toBeVisible();

    await page.getByLabel('الاسم الكامل').fill('عميل تجريبي');
    await page.getByLabel('رقم الهاتف').fill('+20 100 000 0000');
    await page.getByLabel('عنوان التوصيل').fill('١٢ شارع تجريبي، القاهرة');
    await page.getByRole('button', { name: 'أرسل طلباً تجريبياً' }).click();
    await expect(page).toHaveURL(/\/ar\/order$/);
    await expect(page.getByRole('heading', { name: 'تم قبول الطلب التجريبي' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'السلة (٠)' })).toBeVisible();
  });
});
