import type { L10n } from "@/lib/api/types";

/**
 * Single place to rebrand the site: name, tagline, currency, fees, coupons, contact.
 * Colours live as CSS variables in app/globals.css (:root / [data-theme="dark"]).
 * Contact values are PLACEHOLDERS (reserved .example domain) – replace before launch.
 */
export const brand = {
  name: "CRUST & CRAVE",
  nameAr: "كراست آند كريف",
  mark: "C&C",
  tagline: {
    en: "Pizza, crepes & burgers made to be craved.",
    ar: "بيتزا وكريب وبرجر مصنوعة لتُشتهى.",
  } as L10n,
  currency: "EGP",
  /** delivery fee applied to delivery orders; set to 0 to disable */
  deliveryFee: 30,
  /** delivery is free above this subtotal; set to 0 to disable */
  freeDeliveryOver: 400,
  /** demo coupon rules – evaluated client-side only */
  coupons: {
    CRAVE10: { type: "percent", value: 10 },
    WELCOME30: { type: "fixed", value: 30 },
  } as Record<string, { type: "percent" | "fixed"; value: number }>,
  contact: {
    email: "hello@crustandcrave.example",
    phone: "+20 000 000 0000",
    placeholder: true,
  },
  social: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "facebook", label: "Facebook", href: "#" },
    { id: "tiktok", label: "TikTok", href: "#" },
  ],
  /** opening hours: leave undefined until real hours are supplied (footer hides the block) */
  hours: undefined as L10n | undefined,
};
