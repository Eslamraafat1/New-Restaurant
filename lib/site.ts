import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/api/types";
import { localePath, ogLocale, otherLocale } from "@/lib/i18n/paths";

/** Production URL, used when neither NEXT_PUBLIC_SITE_URL nor Vercel's production URL is available. */
const PRODUCTION_URL = "https://new-restaurant-kappa.vercel.app";

/**
 * Absolute site origin for canonical URLs, sitemap, robots and JSON-LD.
 * Never resolves to localhost in production: NEXT_PUBLIC_SITE_URL wins, then Vercel's
 * production domain, then the hardcoded production URL.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  PRODUCTION_URL
).replace(/\/+$/, "");

export const absoluteUrl = (path = "/") => `${siteUrl}${path}`;

export const locales = ["en", "ar"] as const satisfies readonly Locale[];
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
/** Cookie that carries the visitor's language; read by proxy.ts so the server renders the right language. */
export const LOCALE_COOKIE = "cc-lang";

/** Share image served by app/opengraph-image.tsx (absolute via metadataBase). Set explicitly because the
 * file convention only attaches it automatically to routes under the same root layout. */
export const ogImage = { url: "/opengraph-image", width: 1200, height: 630, alt: `${brand.name} – Pizza, Crepes & Burgers` };

export const defaultDescriptions: Record<Locale, string> = {
  en: `${brand.tagline.en} A fictional demo storefront with a customisable menu and demo checkout.`,
  ar: `${brand.tagline.ar} متجر تجريبي خيالي بمنيو قابل للتخصيص وإتمام طلب تجريبي.`,
};
export const defaultDescription = defaultDescriptions.en;

interface PageMetaInput {
  /** language of the page being described */
  lang: Locale;
  title: string;
  description?: string;
  /** language-neutral path beginning with "/" (e.g. "/menu") – the canonical URL is derived per language */
  path: string;
  noindex?: boolean;
}

/** hreflang map for a language-neutral path: `{ en: /menu, ar: /ar/menu, x-default: /menu }`. */
export const languageAlternates = (path: string) => ({
  en: localePath("en", path),
  ar: localePath("ar", path),
  "x-default": localePath("en", path),
});

/**
 * Per-page metadata: title, description, canonical + hreflang alternates, Open Graph and Twitter card.
 * Every page exists in both languages, so each URL is self-canonical and lists its translation.
 */
export function pageMeta({ lang, title, description = defaultDescriptions[lang], path, noindex }: PageMetaInput): Metadata {
  const isHome = path === "/";
  const fullTitle = isHome ? title : `${title} · ${brand.name}`;
  const url = localePath(lang, path);
  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: url, ...(noindex ? {} : { languages: languageAlternates(path) }) },
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: ogLocale[lang],
      alternateLocale: [ogLocale[otherLocale(lang)]],
      url,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Reads the `[lang]` segment of a page's params (validated; unknown values fall back to English). */
export const pageLocale = async (params: Promise<{ lang: string }>): Promise<Locale> => {
  const { lang } = await params;
  return isLocale(lang) ? lang : "en";
};

/** Serialises JSON-LD safely for an inline <script> (escapes "<" to prevent markup injection). */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

/** Breadcrumbs for a page in `lang`; item paths are language-neutral and get the locale prefix here. */
export const breadcrumbLd = (lang: Locale, items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(localePath(lang, it.path)),
  })),
});
