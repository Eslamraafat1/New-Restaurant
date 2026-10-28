import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductExperience } from "@/components/product/ProductExperience";
import { products } from "@/data/demo/products";
import { getProduct } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

async function load(slug: string): Promise<Product | null> {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  return p ? { title: p.name.en, description: p.description.en } : { title: "Not found" };
}

async function ProductContent({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();
  return <ProductExperience product={product} />;
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<div className="wrap grid gap-8 py-12 lg:grid-cols-2"><div className="skeleton aspect-square" /><div className="skeleton h-96" /></div>}>
      <ProductContent params={params} />
    </Suspense>
  );
}
