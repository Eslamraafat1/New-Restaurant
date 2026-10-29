"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { describeConfig } from "@/lib/describe";
import { lastOrderStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { TotalsBox } from "./CartView";

const COLORS = ["#d63a22", "#e8a92c", "#3d7a2a", "#f6d77a", "#a8260f"];
const BITS = Array.from({ length: 28 }, (_, i) => ({
  x: Math.cos((i / 28) * Math.PI * 2) * (90 + (i % 5) * 28),
  y: Math.sin((i / 28) * Math.PI * 2) * (90 + (i % 5) * 28),
  r: (i * 53) % 360,
  c: COLORS[i % COLORS.length],
}));

export function OrderSuccess() {
  const { t, l, num } = useI18n();
  const order = lastOrderStore.use();
  const { byId } = useCatalog();

  if (!order) {
    return (
      <div className="wrap py-24 text-center">
        <p className="display text-4xl">{t("ok.none")}</p>
        <Link href="/menu" className="btn btn-primary mt-6">{t("ok.again")}</Link>
      </div>
    );
  }
  return (
    <div className="wrap max-w-3xl py-14">
      <div className="relative mx-auto grid h-36 w-36 place-items-center">
        {BITS.map((b, i) => (
          <motion.span key={i} aria-hidden className="absolute h-2.5 w-2.5 rounded-sm" style={{ background: b.c }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }} animate={{ x: b.x, y: b.y, opacity: 0, scale: 1, rotate: b.r }} transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }} />
        ))}
        <motion.svg viewBox="0 0 100 100" className="h-36 w-36" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} aria-hidden>
          <circle cx="50" cy="50" r="46" fill="var(--basil)" />
          <motion.path d="M28 52L44 67L73 36" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }} />
        </motion.svg>
      </div>
      <h1 className="display mt-6 text-center text-5xl sm:text-7xl">{order.demo ? t("ok.title") : t("ok.titleLive")}</h1>
      <p role="status" className="mx-auto mt-3 max-w-lg text-center text-soft">{order.demo ? t("ok.sub") : ""}</p>
      <p className="mt-6 text-center text-sm font-bold uppercase tracking-widest text-soft">{t("ok.id")}</p>
      <p dir="ltr" className="text-center font-mono text-2xl font-extrabold">{order.id}</p>

      <section className="card mt-8 p-5" aria-labelledby="oi-h">
        <h2 id="oi-h" className="display text-2xl">{t("ok.items")}</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {order.request.lines.map((line) => {
            const p = byId(line.productId);
            return (
              <li key={line.key} className="flex justify-between gap-3 py-2.5">
                <span><strong>{num(line.qty)}× {p ? l(p.name) : line.productId}</strong>{p && <span className="block text-xs text-soft">{describeConfig(p, line.config, l).join(" · ")}</span>}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4"><TotalsBox totals={order.totals} delivery={order.request.fulfilment === "delivery"} /></div>
      </section>

      <section className="mt-8" aria-labelledby="nx-h">
        <h2 id="nx-h" className="display text-2xl">{t("ok.next")}</h2>
        <ol className="mt-3 list-decimal space-y-2 ps-5 text-soft">{order.demo ? <><li>{t("ok.n1")}</li><li>{t("ok.n2")}</li><li>{t("ok.n3")}</li></> : <><li>{t("ok.l1")}</li><li>{t("ok.l2")}</li></>}</ol>
      </section>
      <div className="mt-8 text-center"><Link href="/menu" className="btn btn-primary">{t("ok.again")}</Link></div>
    </div>
  );
}
