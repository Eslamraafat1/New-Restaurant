import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryHead } from "@/components/menu/CategoryHead";
import { MenuView } from "@/components/menu/MenuView";
import { categories } from "@/data/demo/categories";
import { getCategories } from "@/lib/api/categories";

export async function generateStaticParams() {
  try {
    const list = await getCategories();
    if (list.length) return list.map((c) => ({ category: c.slug }));
  } catch { /* backend unreachable at build time */ }
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/menu/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = await findCategory(category);
  return { title: c ? c.name.en : "Menu" };
}

async function findCategory(slug: string) {
  try {
    return (await getCategories()).find((c) => c.slug === slug);
  } catch {
    return undefined;
  }
}

async function CategoryContent({ params }: { params: PageProps<"/menu/[category]">["params"] }) {
  const { category } = await params;
  const c = await findCategory(category);
  if (!c) notFound();
  return (
    <>
      <CategoryHead id={c.id} />
      <MenuView only={c.id} />
    </>
  );
}

export default function CategoryPage({ params }: PageProps<"/menu/[category]">) {
  return (
    <Suspense fallback={<div className="wrap py-20"><div className="skeleton h-40" /></div>}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
