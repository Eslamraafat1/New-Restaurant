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
 * Language routing without changing public URLs: every page request is rewritten to the
 * prerendered app/[lang] tree chosen by the `cc-lang` cookie (default English). The server
 * therefore renders Arabic text and <html lang="ar" dir="rtl"> directly – no English flash.
 * Keep the cookie name in sync with LOCALE_COOKIE in lib/site.ts.
 */
export function proxy(request: NextRequest) {
  const locale = request.cookies.get("cc-lang")?.value === "ar" ? "ar" : "en";
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  // `/{locale}/404` is served by app/[lang]/[...missing] and renders the not-found page with status 404
  url.pathname = isUnknownCatalogPath(pathname) ? `/${locale}/404` : `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except API routes, Next internals, metadata routes and files with an extension
  matcher: ["/((?!api/|_next/|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\.[a-zA-Z0-9]+$).*)"],
};
