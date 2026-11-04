import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/api/types";

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

export const defaultDescription = `${brand.tagline.en} A fictional demo storefront with a customisable menu and demo checkout.`;

interface PageMetaInput {
  title: string;
  description?: string;
  /** path beginning with "/" – becomes the canonical URL */
  path: string;
  noindex?: boolean;
}

/**
 * Per-page metadata: title, description, canonical, Open Graph and Twitter card.
 */
export function pageMeta({ title, description = defaultDescription, path, noindex }: PageMetaInput): Metadata {
  const fullTitle = path === "/" ? title : `${title} · ${brand.name}`;
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: "en_US",
      alternateLocale: ["ar_EG"],
      url: path,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Serialises JSON-LD safely for an inline <script> (escapes "<" to prevent markup injection). */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});
