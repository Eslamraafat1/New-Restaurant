import { test, expect } from '@playwright/test';
import { jsonLd } from './helpers.js';

// Request-level and <head> checks are viewport-independent: run them once.
test.skip(({ isMobile }) => isMobile, 'SEO checks run on desktop only');

const isPublicHttps = (u) => {
  const url = new URL(u);
  return url.protocol === 'https:' && !/localhost|127\.0\.0\.1/.test(url.hostname);
};

test.describe('robots.txt & sitemap.xml', () => {
  test('robots.txt allows crawling and points to an absolute sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/Disallow: \/api\//);
    const sitemap = body.match(/Sitemap: (\S+)/)?.[1];
    expect(sitemap).toBeTruthy();
    expect(isPublicHttps(sitemap)).toBe(true);
    expect(sitemap).toMatch(/\/sitemap\.xml$/);
  });

  test('sitemap.xml lists every menu category and dish, but no private pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(100); // (11 pages + 9 categories + 32 dishes) × 2 languages
    expect(locs.every(isPublicHttps)).toBe(true);
    const paths = locs.map((u) => new URL(u).pathname);
    for (const p of ['/', '/menu', '/menu/pizza', '/menu/seasonal', '/product/margherita', '/product/truffle-mushroom', '/offers']) {
      expect(paths).toContain(p);
    }
    for (const p of ['/admin', '/cart', '/checkout', '/order']) expect(paths).not.toContain(p);
  });

  test('sitemap.xml lists every page in both languages with hreflang alternates', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    const paths = urls.map((u) => new URL(u.match(/<loc>([^<]+)<\/loc>/)[1]).pathname);
    const ar = paths.filter((p) => /^\/ar(\/|$)/.test(p));
    expect(ar.length).toBe(paths.length / 2);
    for (const p of ['/ar', '/ar/menu', '/ar/menu/pizza', '/ar/product/margherita']) expect(paths).toContain(p);
    for (const p of ['/ar/admin', '/ar/cart', '/ar/checkout', '/ar/order']) expect(paths).not.toContain(p);

    // every entry links all language versions, and they point at each other
    for (const u of urls) {
      const alt = Object.fromEntries([...u.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], new URL(m[2]).pathname]));
      expect(Object.keys(alt).sort()).toEqual(['ar', 'en', 'x-default']);
      expect(alt.ar).toBe(alt.en === '/' ? '/ar' : `/ar${alt.en}`);
      expect(alt['x-default']).toBe(alt.en);
    }
  });
});

test.describe('Page metadata', () => {
  // [path, title, language-neutral path, og:locale]
  const pages = [
    ['/', /CRUST & CRAVE/, '/', 'en_US'],
    ['/menu', /^Menu · CRUST & CRAVE$/, '/menu', 'en_US'],
    ['/menu/burgers', /^Burgers menu · CRUST & CRAVE$/, '/menu/burgers', 'en_US'],
    ['/product/margherita', /^Margherita · CRUST & CRAVE$/, '/product/margherita', 'en_US'],
    ['/about', /^About us · CRUST & CRAVE$/, '/about', 'en_US'],
    ['/ar', /CRUST & CRAVE – بيتزا وكريب وبرجر/, '/', 'ar_EG'],
    ['/ar/menu', /^المنيو · CRUST & CRAVE$/, '/menu', 'ar_EG'],
    ['/ar/menu/burgers', /^منيو برجر · CRUST & CRAVE$/, '/menu/burgers', 'ar_EG'],
    ['/ar/product/margherita', /^مارجريتا · CRUST & CRAVE$/, '/product/margherita', 'ar_EG'],
    ['/ar/about', /^من نحن · CRUST & CRAVE$/, '/about', 'ar_EG'],
  ];
  for (const [path, title, neutral, ogLocale] of pages) {
    test(`${path} has canonical, hreflang, Open Graph and Twitter tags`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(isPublicHttps(canonical)).toBe(true);
      expect(new URL(canonical).pathname).toBe(path);

      // self-referencing hreflang set: en at the root, ar under /ar, x-default → English
      const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
        Object.fromEntries(els.map((e) => [e.getAttribute('hreflang'), e.getAttribute('href')])),
      );
      expect(Object.keys(alternates).sort()).toEqual(['ar', 'en', 'x-default']);
      expect(Object.values(alternates).every(isPublicHttps)).toBe(true);
      expect(new URL(alternates.en).pathname).toBe(neutral);
      expect(new URL(alternates.ar).pathname).toBe(neutral === '/' ? '/ar' : `/ar${neutral}`);
      expect(alternates['x-default']).toBe(alternates.en);
      expect(Object.values(alternates)).toContain(canonical);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', ogLocale);
      await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute('content', ogLocale === 'en_US' ? 'ar_EG' : 'en_US');
      const meta = (p) => page.locator(`meta[property="${p}"], meta[name="${p}"]`).first();
      await expect(meta('description')).toHaveAttribute('content', /\p{L}{3,}.{20,}/u);
      await expect(meta('og:title')).toHaveAttribute('content', /CRUST & CRAVE/);
      expect(await meta('og:url').getAttribute('content')).toBe(canonical);
      const ogImage = await meta('og:image').getAttribute('content');
      expect(isPublicHttps(ogImage)).toBe(true);
      await expect(meta('twitter:card')).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });
  }

  test('Open Graph image renders as a PNG', async ({ request }) => {
    const res = await request.get('/opengraph-image');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test('admin preview (no auth) is noindex', async ({ page }) => {
    const res = await page.goto('/admin');
    expect(res.headers()['x-robots-tag']).toMatch(/noindex/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByText(/Not secure: this screen has no authentication/)).toBeVisible();
  });

  test('checkout is noindex in both languages', async ({ page }) => {
    for (const path of ['/checkout', '/ar/checkout']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
    }
  });

  test('Arabic admin preview is noindex too', async ({ request }) => {
    const res = await request.get('/ar/admin');
    expect(res.headers()['x-robots-tag']).toMatch(/noindex/);
  });
});

test.describe('Structured data (JSON-LD)', () => {
  test('home page describes the Restaurant and WebSite', async ({ page }) => {
    await page.goto('/');
    const ld = await jsonLd(page);
    const restaurant = ld.find((x) => x['@type'] === 'Restaurant');
    expect(restaurant).toBeTruthy();
    expect(restaurant.name).toBe('CRUST & CRAVE');
    expect(restaurant.servesCuisine).toEqual(expect.arrayContaining(['Pizza', 'Burgers']));
    expect(new URL(restaurant.hasMenu).pathname).toBe('/menu');
    expect(restaurant.address).toBeUndefined(); // no fake address in a demo
    expect(ld.some((x) => x['@type'] === 'WebSite')).toBe(true);
  });

  test('menu page has a Menu with a section per category', async ({ page }) => {
    await page.goto('/menu');
    const menu = (await jsonLd(page)).find((x) => x['@type'] === 'Menu');
    expect(menu.hasMenuSection).toHaveLength(9);
    const items = menu.hasMenuSection.flatMap((s) => s.hasMenuItem);
    expect(items.length).toBeGreaterThanOrEqual(30);
    expect(items.every((i) => i.offers.priceCurrency === 'EGP' && i.offers.price > 0)).toBe(true);
  });

  test('product page has a MenuItem with price and a 4-level BreadcrumbList', async ({ page }) => {
    await page.goto('/product/margherita');
    const ld = await jsonLd(page);
    const item = ld.find((x) => x['@type'] === 'MenuItem');
    expect(item.name).toBe('Margherita');
    expect(item.offers).toMatchObject({ price: 140, priceCurrency: 'EGP' });
    const crumbs = ld.find((x) => x['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.map((c) => c.name)).toEqual(['Home', 'Menu', 'Pizza', 'Margherita']);
    expect(crumbs.itemListElement.every((c) => isPublicHttps(c.item))).toBe(true);
  });

  test('Arabic pages describe themselves in Arabic with /ar URLs', async ({ page }) => {
    await page.goto('/ar/product/margherita');
    const ld = await jsonLd(page);
    const item = ld.find((x) => x['@type'] === 'MenuItem');
    expect(item.name).toBe('مارجريتا');
    expect(new URL(item.url).pathname).toBe('/ar/product/margherita');
    const crumbs = ld.find((x) => x['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.map((c) => new URL(c.item).pathname)).toEqual(['/ar', '/ar/menu', '/ar/menu/pizza', '/ar/product/margherita']);
    expect(crumbs.itemListElement[0].name).toBe('الرئيسية');

    await page.goto('/ar/menu');
    const menu = (await jsonLd(page)).find((x) => x['@type'] === 'Menu');
    expect(menu.inLanguage).toBe('ar');
    expect(new URL(menu.url).pathname).toBe('/ar/menu');

    await page.goto('/ar');
    const home = await jsonLd(page);
    expect(home.find((x) => x['@type'] === 'WebPage').inLanguage).toBe('ar');
    expect(home.find((x) => x['@type'] === 'WebSite').inLanguage).toEqual(['en', 'ar']);
    expect(new URL(home.find((x) => x['@type'] === 'Restaurant').hasMenu).pathname).toBe('/ar/menu');
  });
});
