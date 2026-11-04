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
    expect(locs.length).toBeGreaterThanOrEqual(50); // 11 pages + 9 categories + 32 dishes
    expect(locs.every(isPublicHttps)).toBe(true);
    const paths = locs.map((u) => new URL(u).pathname);
    for (const p of ['/', '/menu', '/menu/pizza', '/menu/seasonal', '/product/margherita', '/product/truffle-mushroom', '/offers']) {
      expect(paths).toContain(p);
    }
    for (const p of ['/admin', '/cart', '/checkout', '/order']) expect(paths).not.toContain(p);
  });
});

test.describe('Page metadata', () => {
  const pages = [
    ['/', /CRUST & CRAVE/],
    ['/menu', /^Menu · CRUST & CRAVE$/],
    ['/menu/burgers', /^Burgers menu · CRUST & CRAVE$/],
    ['/product/margherita', /^Margherita · CRUST & CRAVE$/],
    ['/about', /^About us · CRUST & CRAVE$/],
  ];
  for (const [path, title] of pages) {
    test(`${path} has canonical, Open Graph and Twitter tags`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(isPublicHttps(canonical)).toBe(true);
      expect(new URL(canonical).pathname).toBe(path);
      const meta = (p) => page.locator(`meta[property="${p}"], meta[name="${p}"]`).first();
      await expect(meta('description')).toHaveAttribute('content', /\w{10,}/);
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

  test('checkout is noindex', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
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
});
