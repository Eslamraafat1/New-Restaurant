import { Suspense } from "react";
import { PageHeader } from "@/components/chrome/PageHeader";
import { MenuView } from "@/components/menu/MenuView";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories as demoCategories } from "@/data/demo/categories";
import { products as demoProducts } from "@/data/demo/products";
import { getMenu } from "@/lib/api/menu";
import type { Locale } from "@/lib/api/types";
import { staticPageMetadata } from "@/lib/page-meta";
import { breadcrumbLd, pageLocale } from "@/lib/site";
import { menuLd, rootCrumbs } from "@/lib/structured-data";

export const generateMetadata = staticPageMetadata("/menu");

async function MenuStructuredData({ lang }: { lang: Locale }) {
  let menu = { categories: demoCategories, products: demoProducts };
  try {
    menu = await getMenu();
  } catch { /* backend unreachable – describe the demo menu */ }
  return (
    <JsonLd
      data={[
        menuLd(menu.categories, menu.products, lang),
        breadcrumbLd(lang, rootCrumbs(lang)),
      ]}
    />
  );
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const lang = await pageLocale(params);
  return (
    <>
      <Suspense fallback={null}><MenuStructuredData lang={lang} /></Suspense>
      <PageHeader titleKey="menu.title" subKey="menu.sub" kickerKey="nav.menu" crumbs={[{ key: "nav.menu" }]} />
      <MenuView />
    </>
  );
}
