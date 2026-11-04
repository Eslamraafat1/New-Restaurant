import { NextResponse, type NextRequest } from "next/server";
import { categories } from "@/data/demo/categories";
import { products } from "@/data/demo/products";
import { apiConfig } from "@/lib/api/config";

const productSlugs = new Set(products.map((p) => p.slug));
const categorySlugs = new Set(categories.map((c) => c.slug));

/** In demo mode the catalogue is known here, so unknown dishes/categories get a real 404 status
 * instead of a streamed (200 + noindex) not-found page. With a live API the page handles it. */
function isUnknownCatalogPath(pathname: string) {
  if (!apiConfig.useDemo) return false;
  const m = pathname.match(/^\/(product|menu)\/([^/]+)\/?$/);
  if (!m) return false;
  const slug = decodeURIComponent(m[2]);
  return m[1] === "product" ? !productSlugs.has(slug) : !categorySlugs.has(slug);
}

/**
 * Locale-prefixed public URLs on top of the prerendered app/[lang] tree:
 *  - English (default) lives at the root: `/menu` is rewritten to the internal `/en/menu`.
 *  - Arabic lives under `/ar`: `/ar/menu` maps onto app/[lang] directly, no rewrite needed.
 *  - `/en/…` is not a public URL; it is permanently redirected to the unprefixed one so there is no duplicate.
 * The language never depends on the `cc-lang` cookie (that is only a remembered preference), so every URL
 * serves the same HTML to people, caches and crawlers. See lib/i18n/paths.ts for the client-side mapping.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const m = pathname.match(/^\/(en|ar)(?=\/|$)(.*)$/);

  if (m?.[1] === "en") {
    const url = request.nextUrl.clone();
    url.pathname = m[2] || "/";
    return NextResponse.redirect(url, 308);
  }

  const locale = m ? "ar" : "en";
  const rest = m ? m[2] || "/" : pathname;
  if (isUnknownCatalogPath(rest)) {
    // `/{locale}/404` is served by app/[lang]/[...missing] and renders the not-found page with status 404
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/404`;
    return NextResponse.rewrite(url);
  }
  if (m) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except API routes, Next internals, metadata routes and files with an extension
  matcher: ["/((?!api/|_next/|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\.[a-zA-Z0-9]+$).*)"],
};
