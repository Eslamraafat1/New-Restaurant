import type { MetadataRoute } from "next";
import { categories as demoCategories } from "@/data/demo/categories";
import { products as demoProducts } from "@/data/demo/products";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { localePath } from "@/lib/i18n/paths";
import { absoluteUrl, languageAlternates, locales } from "@/lib/site";

type Entry = { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" };

/** Indexable pages only: /admin, /cart, /checkout and /order are noindex and left out. */
const staticPages: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
  { path: "/offers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/our-story", priority: 0.5, changeFrequency: "monthly" },
  { path: "/ingredients", priority: 0.5, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

/**
 * Every page is listed once per language (English at the root, Arabic under /ar), and each entry
 * carries the full hreflang set (en, ar, x-default) as <xhtml:link rel="alternate"> elements.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => demoCategories),
    getProducts().catch(() => demoProducts),
  ]);
  const entries: Entry[] = [
    ...staticPages,
    ...categories.map((c) => ({ path: `/menu/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ path: `/product/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
  const alternates = (path: string) => ({
    languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([k, v]) => [k, absoluteUrl(v)])),
  });
  return entries.flatMap((e) =>
    locales.map((lang) => ({
      url: absoluteUrl(localePath(lang, e.path)),
      changeFrequency: e.changeFrequency,
      priority: e.priority,
      alternates: alternates(e.path),
    })),
  );
}
