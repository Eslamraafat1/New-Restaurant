import { brand } from "@/lib/brand";
import { localePath } from "@/lib/i18n/paths";
import { absoluteUrl, defaultDescriptions, siteUrl } from "@/lib/site";
import type { Category, Locale, Product } from "@/lib/api/types";

/**
 * schema.org builders. Only facts that exist in the code are emitted: no address, phone,
 * opening hours or ratings, because those are placeholders/sample data in this demo.
 * Names, descriptions and page URLs follow the language of the page (`lang`); `@id`s are shared
 * across languages because both URLs describe the same entity.
 */

const diet: Partial<Record<Product["tags"][number], string>> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
};

const url = (lang: Locale, path: string) => absoluteUrl(localePath(lang, path));

export const restaurantLd = (lang: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${siteUrl}/#restaurant`,
  name: brand.name,
  alternateName: brand.nameAr,
  description: defaultDescriptions[lang],
  url: absoluteUrl("/"),
  image: absoluteUrl("/opengraph-image"),
  servesCuisine: ["Pizza", "Crepes", "Burgers"],
  hasMenu: url(lang, "/menu"),
  currenciesAccepted: brand.currency,
});

/** The site as a whole is bilingual, so WebSite lists both languages (pages carry their own `inLanguage`). */
export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: brand.name,
  alternateName: brand.nameAr,
  url: absoluteUrl("/"),
  inLanguage: ["en", "ar"],
  publisher: { "@id": `${siteUrl}/#restaurant` },
});

export const menuItemLd = (p: Product, lang: Locale) => ({
  "@type": "MenuItem",
  name: p.name[lang] ?? p.name.en,
  description: p.description[lang] ?? p.description.en,
  url: url(lang, `/product/${p.slug}`),
  ...(p.tags.some((t) => diet[t]) ? { suitableForDiet: p.tags.flatMap((t) => (diet[t] ? [diet[t]] : [])) } : {}),
  offers: {
    "@type": "Offer",
    price: p.basePrice,
    priceCurrency: brand.currency,
    availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  },
});

export const menuSectionLd = (c: Category, products: Product[], lang: Locale) => ({
  "@type": "MenuSection",
  name: c.name[lang] ?? c.name.en,
  description: c.tagline[lang] ?? c.tagline.en,
  url: url(lang, `/menu/${c.slug}`),
  inLanguage: lang,
  hasMenuItem: products.filter((p) => p.category === c.id).map((p) => menuItemLd(p, lang)),
});

export const menuLd = (categories: Category[], products: Product[], lang: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${url(lang, "/menu")}#menu`,
  name: lang === "ar" ? `منيو ${brand.nameAr}` : `${brand.name} menu`,
  url: url(lang, "/menu"),
  inLanguage: lang,
  hasMenuSection: [...categories].sort((a, b) => a.order - b.order).map((c) => menuSectionLd(c, products, lang)),
});

/** A page in one language, with a pointer to its translation. */
export const webPageLd = (lang: Locale, path: string, name: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${url(lang, path)}#webpage`,
  url: url(lang, path),
  name,
  inLanguage: lang,
  isPartOf: { "@id": `${siteUrl}/#website` },
  about: { "@id": `${siteUrl}/#restaurant` },
});

/** First two breadcrumb levels (Home › Menu) in the page language; paths are language-neutral. */
export const rootCrumbs = (lang: Locale) => [
  { name: lang === "ar" ? "الرئيسية" : "Home", path: "/" },
  { name: lang === "ar" ? "المنيو" : "Menu", path: "/menu" },
];
