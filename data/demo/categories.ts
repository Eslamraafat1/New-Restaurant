import type { Category } from "@/lib/api/types";

export const categories: Category[] = [
  { id: "pizza", slug: "pizza", order: 1, accent: "#d63a22",
    name: { en: "Pizza", ar: "بيتزا" },
    tagline: { en: "Hand-stretched, wood-fired spirit", ar: "عجينة مفرودة يدوياً بروح الفرن الحجري" } },
  { id: "crepes", slug: "crepes", order: 2, accent: "#8a4b2a",
    name: { en: "Crepes", ar: "كريب" },
    tagline: { en: "Sweet and savory, folded warm", ar: "حلو ومالح، يُطوى دافئاً" } },
  { id: "burgers", slug: "burgers", order: 3, accent: "#c9791a",
    name: { en: "Burgers", ar: "برجر" },
    tagline: { en: "Stacked, smashed, unforgettable", ar: "طبقات مشوية لا تُنسى" } },
  { id: "pasta", slug: "pasta", order: 4, accent: "#c58a1c",
    name: { en: "Pasta", ar: "مكرونة" },
    tagline: { en: "Slow sauces, al dente bite", ar: "صلصات هادئة وقوام مثالي" } },
  { id: "appetizers", slug: "appetizers", order: 5, accent: "#4f7a32",
    name: { en: "Appetizers", ar: "مقبلات" },
    tagline: { en: "Little things to share", ar: "أطباق صغيرة للمشاركة" } },
  { id: "desserts", slug: "desserts", order: 6, accent: "#7a3d2a",
    name: { en: "Desserts", ar: "حلويات" },
    tagline: { en: "The sweet finale", ar: "الختام الحلو" } },
  { id: "drinks", slug: "drinks", order: 7, accent: "#1f9bb0",
    name: { en: "Drinks", ar: "مشروبات" },
    tagline: { en: "Cold, bright, refreshing", ar: "باردة ومنعشة" } },
  { id: "combos", slug: "combos", order: 8, accent: "#b8321d",
    name: { en: "Combos", ar: "وجبات كومبو" },
    tagline: { en: "More for the table", ar: "أكثر لمائدتك" } },
  { id: "seasonal", slug: "seasonal", order: 9, accent: "#8b5a1e",
    name: { en: "Seasonal Specials", ar: "أطباق الموسم" },
    tagline: { en: "Here for a little while", ar: "ضيوف لوقت قصير" } },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
