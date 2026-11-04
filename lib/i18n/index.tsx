"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { brand } from "@/lib/brand";
import { LOCALE_COOKIE } from "@/lib/site";
import type { L10n, Locale } from "@/lib/api/types";
import { ar, en, type Key } from "./dictionary";
import { localePath } from "./paths";

const dicts: Record<Locale, Record<Key, string>> = { en, ar };

/**
 * The language comes from the URL: English at the root (`/menu`), Arabic under `/ar` (`/ar/menu`).
 * proxy.ts maps both onto the prerendered app/[lang] tree, the root layout renders <html lang dir>
 * and hands the locale to client components through this context. Switching language is a
 * navigation to the equivalent URL in the other language (see LanguageSwitch in Header.tsx).
 */
const UrlLocale = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <UrlLocale.Provider value={locale}>{children}</UrlLocale.Provider>;
}

/**
 * Remembers the visitor's choice in the `cc-lang` cookie. It is only a preference: the server never
 * redirects on it, so every URL always serves the same language to people and crawlers alike.
 */
export function rememberLocale(next: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* cookies blocked – the URL still carries the language */
  }
}

function useLocale(): Locale {
  return useContext(UrlLocale);
}

export function useI18n() {
  const locale = useLocale();
  const t = useCallback((key: Key) => dicts[locale][key] ?? en[key], [locale]);
  const l = useCallback((v: L10n) => v[locale] ?? v.en, [locale]);
  const fmt = useMemo(() => {
    const tag = locale === "ar" ? "ar-EG" : "en-EG";
    const money = new Intl.NumberFormat(tag, { style: "currency", currency: brand.currency, maximumFractionDigits: 0 });
    const num = new Intl.NumberFormat(tag);
    return { money: (n: number) => money.format(n), num: (n: number) => num.format(n) };
  }, [locale]);
  return {
    locale,
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
    t,
    l,
    money: fmt.money,
    num: fmt.num,
    /** Public URL of an internal path in the current language (`/menu` → `/ar/menu` in Arabic). */
    localeHref: (path: string) => localePath(locale, path),
  };
}

/** Keeps <html lang/dir> in sync with the URL locale after client-side navigations. */
export function LocaleSync() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
