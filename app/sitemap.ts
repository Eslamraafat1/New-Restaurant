import type { MetadataRoute } from "next";
import { categories as demoCategories } from "@/data/demo/categories";
import { products as demoProducts } from "@/data/demo/products";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { absoluteUrl } from "@/lib/site";

/** Indexable pages only: /admin, /cart, /checkout and /order are noindex and left out. */
const staticPages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => demoCategories),
    getProducts().catch(() => demoProducts),
  ]);
  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p.path), changeFrequency: p.changeFrequency, priority: p.priority })),
    ...categories.map((c) => ({ url: absoluteUrl(`/menu/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: absoluteUrl(`/product/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
