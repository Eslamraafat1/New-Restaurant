"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { LocaleSync, useI18n } from "@/lib/i18n";
import { ThemeSync } from "@/lib/theme";
import { CartDrawer } from "./CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SearchDialog } from "./SearchDialog";
import { BackToTop, FloatingCart, ScrollProgress, Toaster } from "./Utilities";

/** Smooth scrolling. Skipped for reduced-motion users; exposes the instance so scenes can sync ScrollTrigger. */
function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, anchors: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);
  return null;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <LocaleSync />
      <ThemeSync />
      <SmoothScroll />
      <ScrollProgress />
      <a href="#main" className="sr-only z-[200] rounded-full bg-tomato px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:start-3 focus:top-3">{t("nav.skip")}</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
      <FloatingCart />
      <BackToTop />
      <Toaster />
    </>
  );
}
