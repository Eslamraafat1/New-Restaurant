"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Moon, Search, ShoppingBag, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartStore, drawer } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import type { Key } from "@/lib/i18n/dictionary";
import { Logo } from "./Logo";
import { Modal } from "./Modal";
import { searchStore } from "./SearchDialog";

const MAIN: { href: string; key: Key }[] = [
  { href: "/", key: "nav.home" },
  { href: "/menu", key: "nav.menu" },
  { href: "/offers", key: "nav.offers" },
];
const MORE: { href: string; key: Key }[] = [
  { href: "/our-story", key: "nav.story" },
  { href: "/ingredients", key: "nav.ingredients" },
  { href: "/locations", key: "nav.locations" },
  { href: "/faq", key: "nav.faq" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function ThemeToggle() {
  const { t } = useI18n();
  const { toggle, pref } = useTheme();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-color-scheme: dark)");
    const calc = () => setDark(pref === "dark" || (pref === "system" && q.matches));
    calc();
    q.addEventListener("change", calc);
    return () => q.removeEventListener("change", calc);
  }, [pref]);
  return (
    <button type="button" className="icon-btn overflow-hidden" onClick={toggle} aria-label={t("nav.theme")} aria-pressed={dark}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? "moon" : "sun"} initial={{ rotate: -90, scale: 0, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="grid place-items-center">
          {dark ? <Moon size={19} aria-hidden /> : <Sun size={19} aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LangToggle() {
  const { t, locale, toggleLocale } = useI18n();
  return (
    <button type="button" onClick={toggleLocale} aria-label={t("nav.lang")} lang={locale === "en" ? "ar" : "en"} className="icon-btn !w-auto px-3.5 text-sm font-extrabold">
      {locale === "en" ? "العربية" : "EN"}
    </button>
  );
}

function MoreMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const [prev, setPrev] = useState(path);
  if (prev !== path) { setPrev(path); setOpen(false); }
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const focusItem = (dir: 1 | -1) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + dir + items.length) % items.length]?.focus();
  };
  return (
    <div
      ref={ref} className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape") { setOpen(false); (ref.current?.querySelector("button") as HTMLElement)?.focus(); }
        if (e.key === "ArrowDown") { e.preventDefault(); if (!open) setOpen(true); setTimeout(() => focusItem(1), 0); }
        if (e.key === "ArrowUp") { e.preventDefault(); focusItem(-1); }
      }}
      onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold hover:bg-bg2">
        {t("nav.more")} <ChevronDown size={15} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute end-0 top-full z-50 mt-2 w-52 rounded-2xl border border-line bg-surface p-2 shadow-xl">
            {MORE.map((m) => (
              <Link key={m.href} href={m.href} role="menuitem" className="block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-bg2">{t(m.key)}</Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const { t, num } = useI18n();
  const path = usePathname();
  const lines = cartStore.use();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) { setPrevPath(path); setMobile(false); }
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchStore.set(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-line bg-bg/90 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="wrap flex h-[4.25rem] items-center gap-2 sm:gap-3">
        <button type="button" className="icon-btn lg:hidden" aria-label={t("nav.open")} aria-haspopup="dialog" onClick={() => setMobile(true)}>
          <Menu size={20} aria-hidden />
        </button>
        <Logo />
        <nav aria-label="Primary" className="ms-6 hidden items-center gap-1 lg:flex">
          {MAIN.map((m) => (
            <Link key={m.href} href={m.href} aria-current={active(m.href) ? "page" : undefined}
              className={`relative flex min-h-11 items-center rounded-full px-4 text-sm font-bold transition-colors hover:bg-bg2 ${active(m.href) ? "text-tomatotext" : ""}`}>
              {t(m.key)}
              {active(m.href) && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-tomato" />}
            </Link>
          ))}
          <MoreMenu />
        </nav>
        <div className="flex-1" />
        <button type="button" className="icon-btn" aria-label={`${t("nav.search")} (Ctrl+K)`} onClick={() => searchStore.set(true)}>
          <Search size={19} aria-hidden />
        </button>
        <LangToggle />
        <ThemeToggle />
        <button type="button" className="icon-btn" aria-label={`${t("nav.cart")} (${num(count)})`} onClick={drawer.open}>
          <ShoppingBag size={19} aria-hidden />
          <AnimatePresence>
            {count > 0 && (
              <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[0.68rem] font-black text-white tabular-nums">
                {num(count)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <Link href="/menu" className="btn btn-primary hidden !min-h-11 xl:inline-flex">{t("nav.order")}</Link>
      </div>

      <Modal open={mobile} onClose={() => setMobile(false)} label={t("nav.open")} side="start">
        <div className="p-5 pt-16">
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {[...MAIN, ...MORE].map((m) => (
                <li key={m.href}>
                  <Link href={m.href} onClick={() => setMobile(false)} aria-current={active(m.href) ? "page" : undefined}
                    className={`display block rounded-2xl px-4 py-3 text-3xl hover:bg-bg2 ${active(m.href) ? "text-tomatotext" : ""}`}>
                    {t(m.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/menu" onClick={() => setMobile(false)} className="btn btn-primary mt-6 w-full">{t("nav.order")}</Link>
        </div>
      </Modal>
    </header>
  );
}
