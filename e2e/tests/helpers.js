import { expect } from '@playwright/test';

/** Digits only, so assertions don't depend on Intl currency formatting ("EGP 195" vs "ج.م.‏ ١٩٥"). */
export const digits = (s) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^\d]/g, '');

/** Reads lang/dir from the raw server HTML (before any client JS runs). */
export const htmlAttrs = (html) => {
  const tag = html.match(/<html[^>]*>/)?.[0] ?? '';
  return { lang: tag.match(/\slang="([^"]+)"/)?.[1], dir: tag.match(/\sdir="([^"]+)"/)?.[1] };
};

/** Waits until client components have hydrated (the header cart button is interactive). */
export async function ready(page) {
  await expect(page.getByRole('button', { name: /^Cart \(|^السلة \(/ })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

/** Reads all JSON-LD blocks on the page and returns a flat list of schema objects. */
export async function jsonLd(page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => {
    const data = JSON.parse(b);
    return Array.isArray(data) ? data : [data];
  });
}
