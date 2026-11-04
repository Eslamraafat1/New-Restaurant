import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/api/types";
import { pageLocale, pageMeta } from "@/lib/site";

type Copy = Record<Locale, { title: string; description?: string }>;

/** Titles and descriptions of the fixed pages, per language (Arabic is a translation of the English copy). */
export const staticPages = {
  "/": {
    en: { title: `${brand.name} – Pizza, Crepes & Burgers` },
    ar: { title: `${brand.name} – بيتزا وكريب وبرجر` },
  },
  "/menu": {
    en: { title: "Menu", description: "The full Crust & Crave menu: pizza, crepes, burgers, pasta, appetizers, desserts, drinks and combos – filter, sort and customise." },
    ar: { title: "المنيو", description: `منيو ${brand.nameAr} الكامل: بيتزا وكريب وبرجر ومكرونة ومقبلات وحلويات ومشروبات ووجبات كومبو – فلتر ورتّب وخصّص.` },
  },
  "/offers": {
    en: { title: "Offers", description: "Current Crust & Crave deals, combos and demo coupon codes." },
    ar: { title: "العروض", description: `عروض ${brand.nameAr} الحالية ووجبات الكومبو وأكواد الخصم التجريبية.` },
  },
  "/about": {
    en: { title: "About us", description: "Who is behind Crust & Crave, a fictional pizza, crepe and burger kitchen built as a bilingual demo storefront." },
    ar: { title: "من نحن", description: `من وراء ${brand.nameAr}، مطبخ خيالي للبيتزا والكريب والبرجر صُمم كمتجر تجريبي ثنائي اللغة.` },
  },
  "/our-story": {
    en: { title: "Our story", description: "The story of Crust & Crave, from the dough to the last bite." },
    ar: { title: "قصتنا", description: `قصة ${brand.nameAr}، من العجينة حتى آخر قضمة.` },
  },
  "/ingredients": {
    en: { title: "Ingredients", description: "The ingredients behind Crust & Crave pizzas, crepes and burgers." },
    ar: { title: "المكونات", description: `المكونات وراء بيتزا وكريب وبرجر ${brand.nameAr}.` },
  },
  "/locations": {
    en: { title: "Locations", description: "Crust & Crave branches. Demo storefront – branch data is sample content." },
    ar: { title: "الفروع", description: `فروع ${brand.nameAr}. متجر تجريبي – بيانات الفروع محتوى تجريبي.` },
  },
  "/faq": {
    en: { title: "FAQ", description: "Answers to common questions about ordering, delivery, customising and allergens at Crust & Crave." },
    ar: { title: "الأسئلة الشائعة", description: `إجابات الأسئلة الشائعة عن الطلب والتوصيل والتخصيص ومسببات الحساسية في ${brand.nameAr}.` },
  },
  "/contact": {
    en: { title: "Contact", description: "Get in touch with Crust & Crave. Demo storefront – contact details are placeholders." },
    ar: { title: "اتصل بنا", description: `تواصل مع ${brand.nameAr}. متجر تجريبي – بيانات التواصل أمثلة.` },
  },
  "/privacy": {
    en: { title: "Privacy policy", description: "Crust & Crave privacy policy for this demo storefront." },
    ar: { title: "سياسة الخصوصية", description: `سياسة خصوصية ${brand.nameAr} لهذا المتجر التجريبي.` },
  },
  "/terms": {
    en: { title: "Terms of service", description: "Crust & Crave terms of service for this demo storefront." },
    ar: { title: "شروط الخدمة", description: `شروط خدمة ${brand.nameAr} لهذا المتجر التجريبي.` },
  },
  // noindex pages
  "/cart": {
    en: { title: "Cart", description: "Review your Crust & Crave demo cart, edit customised items and apply a coupon." },
    ar: { title: "السلة", description: `راجع سلة ${brand.nameAr} التجريبية وعدّل الأصناف المخصصة وطبّق كود خصم.` },
  },
  "/checkout": {
    en: { title: "Checkout", description: "Demo checkout: delivery or pickup details with form validation. No real payment is taken." },
    ar: { title: "إتمام الطلب", description: "إتمام طلب تجريبي: بيانات التوصيل أو الاستلام مع التحقق من النموذج. لا يتم أي دفع حقيقي." },
  },
  "/order": {
    en: { title: "Order confirmation", description: "Your Crust & Crave demo order confirmation." },
    ar: { title: "تأكيد الطلب", description: `تأكيد طلبك التجريبي من ${brand.nameAr}.` },
  },
  "/admin": {
    en: { title: "Admin preview (demo, no auth)", description: "Demo-only admin preview with no authentication. Not for managing a real restaurant." },
    ar: { title: "معاينة الإدارة (تجريبية، بلا مصادقة)", description: "معاينة إدارة تجريبية بلا مصادقة. ليست لإدارة مطعم حقيقي." },
  },
} satisfies Record<string, Copy>;

export type StaticPath = keyof typeof staticPages;

/** Pages that carry `noindex` (and are left out of the sitemap). */
export const noindexPaths: readonly StaticPath[] = ["/cart", "/checkout", "/order", "/admin"];

/** `generateMetadata` for a fixed page: localized title/description, canonical and hreflang for `path`. */
export function staticPageMetadata(path: StaticPath) {
  return async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const lang = await pageLocale(params);
    return pageMeta({ lang, path, ...staticPages[path][lang], noindex: noindexPaths.includes(path) });
  };
}
