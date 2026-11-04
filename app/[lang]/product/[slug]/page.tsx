import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductExperience } from "@/components/product/ProductExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories } from "@/data/demo/categories";
import { products } from "@/data/demo/products";
import { getCategories } from "@/lib/api/categories";
import { getProduct, getProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { menuItemLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  // pre-render whatever the configured API (demo or real) lists; fall back to demo data so the build never fails offline
  try {
    const list = await getProducts();
    if (list.length) return list.map((p) => ({ slug: p.slug }));
  } catch { /* backend unreachable at build time */ }
  return products.map((p) => ({ slug: p.slug }));
}

async function load(slug: string): Promise<Product | null> {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: "Not found", robots: { index: false } };
  return pageMeta({ title: p.name.en, description: p.description.en, path: `/product/${p.slug}` });
}

async function ProductContent({ params }: { params: PageProps<"/[lang]/product/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();
  const cats = await getCategories().catch(() => categories);
  const cat = cats.find((c) => c.id === product.category);
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", ...menuItemLd(product) },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Menu", path: "/menu" },
            ...(cat ? [{ name: cat.name.en, path: `/menu/${cat.slug}` }] : []),
            { name: product.name.en, path: `/product/${product.slug}` },
          ]),
        ]}
      />
      <ProductExperience product={product} />
    </>
  );
}

export default function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  return (
    <Suspense fallback={<div className="wrap grid gap-8 py-12 lg:grid-cols-2"><div className="skeleton aspect-square" /><div className="skeleton h-96" /></div>}>
      <ProductContent params={params} />
    </Suspense>
  );
}
