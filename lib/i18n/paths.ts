import type { Locale } from "@/lib/api/types";

/** English lives at the root (`/menu`), Arabic under a prefix (`/ar/menu`). */
export const defaultLocale: Locale = "en";
export const prefixedLocales = ["ar"] as const satisfies readonly Locale[];

/**
 * Public URL of an internal path in a given language.
 * `localePath("ar", "/menu/pizza")` → `/ar/menu/pizza`; `localePath("en", "/menu")` → `/menu`.
 * Anything that is not a site-absolute path (`#hash`, `mailto:`, `https://…`, `//cdn`) is returned unchanged,
 * and an already-prefixed path is not prefixed twice.
 */
export function localePath(locale: Locale, path = "/"): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = stripLocale(path).path;
  if (locale === defaultLocale) return bare;
  return bare === "/" ? `/${locale}` : /^\/[?#]/.test(bare) ? `/${locale}${bare.slice(1)}` : `/${locale}${bare}`;
}

/** Splits a public pathname into its language and the language-neutral path (`/ar/menu` → `{ ar, /menu }`). */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(ar)(?=[/?#]|$)(.*)$/);
  if (!m) return { locale: defaultLocale, path: pathname || "/" };
  const rest = m[2];
  return { locale: m[1] as Locale, path: !rest || /^[?#]/.test(rest) ? `/${rest}` : rest };
}

export const otherLocale = (locale: Locale): Locale => (locale === "ar" ? "en" : "ar");

/** Open Graph locale tags. */
export const ogLocale: Record<Locale, string> = { en: "en_US", ar: "ar_EG" };
