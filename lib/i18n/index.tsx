"use client";

import { useCallback, useEffect, useMemo } from "react";
import { createStore } from "@/lib/store";
import { brand } from "@/lib/brand";
import type { L10n, Locale } from "@/lib/api/types";
import { ar, en, type Key } from "./dictionary";

export const localeStore = createStore<Locale>("cc-lang", "en");

const dicts: Record<Locale, Record<Key, string>> = { en, ar };

export function useI18n() {
  const locale = localeStore.use();
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

/** Keeps <html lang/dir> in sync with the chosen language. */
export function LocaleSync() {
  const locale = localeStore.use();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
