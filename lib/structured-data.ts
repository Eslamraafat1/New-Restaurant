import { brand } from "@/lib/brand";
import { absoluteUrl, defaultDescription, siteUrl } from "@/lib/site";
import type { Category, Product } from "@/lib/api/types";

/**
 * schema.org builders. Only facts that exist in the code are emitted: no address, phone,
 * opening hours or ratings, because those are placeholders/sample data in this demo.
 */

const diet: Partial<Record<Product["tags"][number], string>> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
};

export const restaurantLd = () => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${siteUrl}/#restaurant`,
  name: brand.name,
  alternateName: brand.nameAr,
  description: defaultDescription,
  url: absoluteUrl("/"),
  image: absoluteUrl("/opengraph-image"),
  servesCuisine: ["Pizza", "Crepes", "Burgers"],
  hasMenu: absoluteUrl("/menu"),
  currenciesAccepted: brand.currency,
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: brand.name,
  url: absoluteUrl("/"),
  inLanguage: ["en", "ar"],
  publisher: { "@id": `${siteUrl}/#restaurant` },
});

export const menuItemLd = (p: Product) => ({
  "@type": "MenuItem",
  name: p.name.en,
  description: p.description.en,
  url: absoluteUrl(`/product/${p.slug}`),
  ...(p.tags.some((t) => diet[t]) ? { suitableForDiet: p.tags.flatMap((t) => (diet[t] ? [diet[t]] : [])) } : {}),
  offers: {
    "@type": "Offer",
    price: p.basePrice,
    priceCurrency: brand.currency,
    availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  },
});

export const menuSectionLd = (c: Category, products: Product[]) => ({
  "@type": "MenuSection",
  name: c.name.en,
  description: c.tagline.en,
  url: absoluteUrl(`/menu/${c.slug}`),
  hasMenuItem: products.filter((p) => p.category === c.id).map(menuItemLd),
});

export const menuLd = (categories: Category[], products: Product[]) => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${siteUrl}/menu#menu`,
  name: `${brand.name} menu`,
  url: absoluteUrl("/menu"),
  inLanguage: "en",
  hasMenuSection: [...categories].sort((a, b) => a.order - b.order).map((c) => menuSectionLd(c, products)),
});
