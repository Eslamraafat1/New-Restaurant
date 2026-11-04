"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { brand } from "@/lib/brand";
import { LOCALE_COOKIE } from "@/lib/site";
import type { L10n, Locale } from "@/lib/api/types";
import { ar, en, type Key } from "./dictionary";

const dicts: Record<Locale, Record<Key, string>> = { en, ar };

/**
 * The language is stored in the `cc-lang` cookie. proxy.ts reads it and rewrites the request to
 * app/[lang], so the server already renders the right language and <html lang/dir> – no flash.
 * The server-rendered locale is handed to client components through this context and is used
 * as the hydration snapshot; switching language afterwards is instant on the client.
 */
const ServerLocale = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <ServerLocale.Provider value={locale}>{children}</ServerLocale.Provider>;
}

let current: Locale | null = null;
const subs = new Set<() => void>();

function readClientLocale(): Locale {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=(en|ar)(?:;|$)`));
  if (m) return m[1] as Locale;
  // the server rendered <html lang> from the cookie (or the default), so it is the safe fallback
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

export const localeStore = {
  get(): Locale {
    if (current === null) current = readClientLocale();
    return current;
  },
  set(next: Locale) {
    current = next;
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* cookies blocked – the choice still applies for this page view */
    }
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

function useLocale(): Locale {
  const serverLocale = useContext(ServerLocale);
  return useSyncExternalStore(localeStore.subscribe, localeStore.get, () => serverLocale);
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
    setLocale: (v: Locale) => localeStore.set(v),
    toggleLocale: () => localeStore.set(locale === "en" ? "ar" : "en"),
  };
}

/** Keeps <html lang/dir> in sync when the language is switched on the client. */
export function LocaleSync() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
