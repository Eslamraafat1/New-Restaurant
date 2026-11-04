import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryHead } from "@/components/menu/CategoryHead";
import { MenuView } from "@/components/menu/MenuView";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories } from "@/data/demo/categories";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { brand } from "@/lib/brand";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { menuSectionLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  try {
    const list = await getCategories();
    if (list.length) return list.map((c) => ({ category: c.slug }));
  } catch { /* backend unreachable at build time */ }
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/menu/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = await findCategory(category);
  if (!c) return { title: "Not found", robots: { index: false } };
  return pageMeta({
    title: `${c.name.en} menu`,
    description: `${c.tagline.en}. Browse and customise ${c.name.en.toLowerCase()} at ${brand.name}.`,
    path: `/menu/${c.slug}`,
  });
}

async function findCategory(slug: string) {
  try {
    return (await getCategories()).find((c) => c.slug === slug);
  } catch {
    return undefined;
  }
}

async function CategoryContent({ params }: { params: PageProps<"/[lang]/menu/[category]">["params"] }) {
  const { category } = await params;
  const c = await findCategory(category);
  if (!c) notFound();
  const products = await getProducts().catch(() => []);
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", ...menuSectionLd(c, products) },
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Menu", path: "/menu" }, { name: c.name.en, path: `/menu/${c.slug}` }]),
        ]}
      />
      <CategoryHead id={c.id} />
      <MenuView only={c.id} />
    </>
  );
}

export default function CategoryPage({ params }: PageProps<"/[lang]/menu/[category]">) {
  return (
    <Suspense fallback={<div className="wrap py-20"><div className="skeleton h-40" /></div>}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
