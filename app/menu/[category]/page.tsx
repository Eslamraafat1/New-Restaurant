import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryHead } from "@/components/menu/CategoryHead";
import { MenuView } from "@/components/menu/MenuView";
import { categories, categoryBySlug } from "@/data/demo/categories";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/menu/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = categoryBySlug(category);
  return { title: c ? c.name.en : "Menu" };
}

async function CategoryContent({ params }: { params: PageProps<"/menu/[category]">["params"] }) {
  const { category } = await params;
  const c = categoryBySlug(category);
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
