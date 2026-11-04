import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/chrome/PageHeader";
import { MenuView } from "@/components/menu/MenuView";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories as demoCategories } from "@/data/demo/categories";
import { products as demoProducts } from "@/data/demo/products";
import { getMenu } from "@/lib/api/menu";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { menuLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMeta({
  title: "Menu",
  description: "The full Crust & Crave menu: pizza, crepes, burgers, pasta, appetizers, desserts, drinks and combos – filter, sort and customise.",
  path: "/menu",
});

async function MenuStructuredData() {
  let menu = { categories: demoCategories, products: demoProducts };
  try {
    menu = await getMenu();
  } catch { /* backend unreachable – describe the demo menu */ }
  return (
    <JsonLd data={[menuLd(menu.categories, menu.products), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Menu", path: "/menu" }])]} />
  );
}

export default function MenuPage() {
  return (
    <>
      <Suspense fallback={null}><MenuStructuredData /></Suspense>
      <PageHeader titleKey="menu.title" subKey="menu.sub" kickerKey="nav.menu" crumbs={[{ key: "nav.menu" }]} />
      <MenuView />
    </>
  );
}
