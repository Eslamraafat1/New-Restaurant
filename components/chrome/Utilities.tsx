"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useToasts } from "@/lib/toast";

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1">
      <div ref={bar} className="h-full origin-[0_50%] bg-gradient-to-r from-tomato via-gold to-basil rtl:origin-[100%_50%]" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

export function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button" aria-label={t("nav.top")} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
          onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
          className="icon-btn fixed bottom-24 start-4 z-40 shadow-lg md:bottom-6"
        >
          <ArrowUp size={20} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Toaster() {
  const items = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence>
        {items.map((i) => (
          <motion.div key={i.id} layout initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto rounded-full bg-charcoal px-5 py-3 text-sm font-bold text-[#f6ead4] shadow-xl" style={{ background: "#1b1411" }}>
            {i.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Floating cart button with live count – hidden on cart/checkout pages. */
export function FloatingCart() {
  const { t, num, money } = useI18n();
  const lines = cartStore.use();
  const path = usePathname();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  if (path.startsWith("/cart") || path.startsWith("/checkout") || path.startsWith("/order")) return null;
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className={`safe-b fixed inset-x-0 bottom-0 z-40 ${path.startsWith("/product") ? "max-md:hidden " : ""} flex justify-center px-4 md:inset-x-auto md:end-6 md:bottom-6 md:block md:p-0`}>
          <Link href="/cart" className="btn btn-primary w-full max-w-sm shadow-2xl md:w-auto" aria-label={`${t("cart.view")}: ${num(count)} ${t("cart.items")}`}>
            <ShoppingBag size={18} aria-hidden />
            <span>{t("cart.view")}</span>
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs tabular-nums">{num(count)}</span>
            <span className="tabular-nums opacity-90">{money(total)}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
