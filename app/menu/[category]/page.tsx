import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

export default async function CategoryPage({ params }: PageProps<"/menu/[category]">) {
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
