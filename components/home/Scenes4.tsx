"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Copy, MapPin, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DishSVG } from "@/components/art/others";
import { PizzaSVG, FULL_LAYERS } from "@/components/art/pizza";
import { ProductArt } from "@/components/art/ProductArt";
import { Faq } from "@/components/chrome/Accordion";
import { SampleTag } from "@/components/chrome/ui";
import { useQuickAdd } from "@/components/menu/ProductCard";
import { branches, offers, reviews } from "@/data/demo/content";
import { useCatalog } from "@/lib/catalog";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { Product } from "@/lib/api/types";
import { Magnetic } from "./Magnetic";

/* ───────────── marquee strip ───────────── */
export function Marquee() {
  const words = ["MARGHERITA", "CREPES", "SMASH BURGERS", "FRESH BASIL", "MOLTEN CHOCOLATE", "WOOD-FIRED SPIRIT"];
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((w) => <li key={w} className="display flex items-center whitespace-nowrap px-6 text-3xl sm:text-5xl">{w}<span className="ms-12 text-gold">✦</span></li>)}
    </ul>
  );
  return (
    <div className="overflow-hidden bg-tomato py-4 text-white" aria-label="CRUST & CRAVE">
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}

/* ───────────── Scene 12: sweet finale (+ extra 2: sauce reveal via clip-path) ───────────── */
export function SweetFinale() {
  const { t, l, money } = useI18n();
  const { products } = useCatalog();
  const desserts = products.filter((p) => p.category === "desserts");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stop = syncLenis();
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top 85%", end: "center 45%", scrub: 0.8 };
      gsap.fromTo("[data-sauce]", { clipPath: "circle(0% at 50% 58%)" }, { clipPath: "circle(78% at 50% 58%)", ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-cake]", { clipPath: "circle(0% at 50% 58%)" }, { clipPath: "circle(70% at 50% 58%)", ease: "none", scrollTrigger: st });
    }, el);
    return () => { ctx.revert(); stop(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <section id="sweet" aria-labelledby="sweet-h" className="section" style={{ background: "linear-gradient(160deg, var(--scene-sweet), var(--bg-2))" }}>
      <div className="wrap grid items-center gap-10 md:grid-cols-2">
        <div ref={root} className="relative mx-auto aspect-square w-[min(84vw,30rem)]" aria-hidden="true">
          <div data-sauce className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 58%, #5a2c16 0 62%, #3a1a0d 63%)" }} />
          <div data-cake className="absolute inset-0"><DishSVG kind="dessert" className="h-full w-full drop-shadow-2xl" /></div>
        </div>
        <div>
          <p className="kicker" style={{ color: "#7a3d2a" }}>{t("sweet.kicker")}</p>
          <h2 id="sweet-h" className="display mt-2 text-[clamp(2.6rem,7vw,6rem)]">{t("sweet.title")}</h2>
          <p className="mt-3 max-w-md text-soft">{t("sweet.body")}</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {desserts.map((p) => <DessertRow key={p.id} p={p} />)}
          </ul>
          <p className="sr-only">{l(desserts[0]?.name ?? { en: "", ar: "" })} {money(0)}</p>
        </div>
      </div>
    </section>
  );
}

function DessertRow({ p }: { p: Product }) {
  const { t, l, money } = useI18n();
  const { add, done } = useQuickAdd(p);
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="h-14 w-14 shrink-0"><ProductArt product={p} className="h-full w-full" /></div>
      <Link href={`/product/${p.slug}`} className="flex-1 text-lg font-extrabold hover:text-tomatotext">{l(p.name)}</Link>
      <span className="tabular-nums font-bold">{money(p.basePrice)}</span>
      <button type="button" className="icon-btn" onClick={add} aria-label={`${t("common.add")}: ${l(p.name)}`}>{done ? "✓" : <Plus size={18} aria-hidden />}</button>
    </li>
  );
}

/* ───────────── Scene 13: drinks ───────────── */
export function Drinks() {
  const { t, l, money } = useI18n();
  const { products } = useCatalog();
  const drinks = products.filter((p) => p.category === "drinks");
  return (
    <section id="drinks" aria-labelledby="drinks-h" className="section relative overflow-hidden" style={{ background: "var(--scene-drinks)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-72">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="bubble" style={{ insetInlineStart: `${(i * 37) % 100}%`, width: 10 + (i % 4) * 8, height: 10 + (i % 4) * 8, ["--d" as string]: `${4 + (i % 5)}s`, animationDelay: `${(i % 6) * 0.7}s` }} />
        ))}
      </div>
      <div className="wrap relative">
        <p className="kicker" style={{ color: "#0e7488" }}>{t("drinks.kicker")}</p>
        <h2 id="drinks-h" className="display mt-2 text-[clamp(2.6rem,7vw,6rem)]">{t("drinks.title")}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {drinks.map((p, i) => <DrinkTile key={p.id} p={p} offset={i === 1} l={l} money={money} />)}
        </div>
      </div>
    </section>
  );
}

function DrinkTile({ p, offset, l, money }: { p: Product; offset: boolean; l: (v: Product["name"]) => string; money: (n: number) => string }) {
  const { t } = useI18n();
  const { add, done } = useQuickAdd(p);
  return (
    <article className={`relative rounded-[2rem] bg-white/50 p-5 text-center backdrop-blur-sm dark:bg-black/20 ${offset ? "sm:-translate-y-6" : ""}`} style={{ border: "1.5px solid rgb(255 255 255 / .5)" }}>
      <Link href={`/product/${p.slug}`} className="mx-auto block aspect-square w-40"><ProductArt product={p} className="h-full w-full" /></Link>
      <h3 className="display mt-2 text-2xl">{l(p.name)}</h3>
      <p className="text-soft">{money(p.basePrice)}</p>
      <button type="button" className="btn btn-primary mt-3" onClick={add}>{done ? t("common.added") : t("common.add")}</button>
    </article>
  );
}

/* ───────────── Scene 14: kitchen story (+ extra 4: word-by-word typography) ───────────── */
export function KitchenStory() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const words = t("story.title").split(" ");

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stop = syncLenis();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-word]", { opacity: 0.12, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 70%", end: "center 40%", scrub: 0.6 } });
      gsap.to("[data-photo]", { yPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    return () => { ctx.revert(); stop(); ScrollTrigger.refresh(); };
  }, [words.length]);

  return (
    <section ref={root} id="story" aria-labelledby="story-h" className="section overflow-hidden bg-[#2a1b14] text-[#f6ead4]">
      <div className="wrap grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="kicker !text-[#ff9a82]">{t("story.kicker")}</p>
          <h2 id="story-h" className="display mt-3 text-[clamp(2.4rem,7vw,6rem)]">
            {words.map((w, i) => <span key={i} data-word className="inline-block me-[0.25em]">{w}</span>)}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[#cdbba2]">{t("story.body")}</p>
          <div className="mt-4"><SampleTag /></div>
          <Link href="/our-story" className="btn btn-primary mt-6">{t("common.explore")}<ArrowRight size={16} className="rtl:rotate-180" aria-hidden /></Link>
        </div>
        <div data-photo aria-hidden className="mx-auto aspect-square w-[min(70vw,20rem)] rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-[#3a2a20] p-6">
          <PizzaSVG layers={FULL_LAYERS} mode="plain" className="h-full w-full -rotate-12" />
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 15: customer favourites (carousel) ───────────── */
export function Favorites() {
  const { t, l, num } = useI18n();
  const track = useRef<HTMLUListElement>(null);
  const [i, setI] = useState(0);
  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    const rtl = document.dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: d * rtl * el.clientWidth * 0.9, behavior: reducedMotion() ? "auto" : "smooth" });
  };
  return (
    <section id="reviews" aria-labelledby="fav-h" className="section">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">{t("fav.kicker")}</p>
            <h2 id="fav-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("fav.title")}</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" className="icon-btn" aria-label={t("fav.prev")} onClick={() => go(-1)}><ChevronLeft size={20} className="rtl:rotate-180" aria-hidden /></button>
            <button type="button" className="icon-btn" aria-label={t("fav.next")} onClick={() => go(1)}><ChevronRight size={20} className="rtl:rotate-180" aria-hidden /></button>
          </div>
        </div>
        <p className="mt-2 text-sm text-soft">{t("fav.note")}</p>
        <ul ref={track} role="group" aria-roledescription="carousel" aria-label={t("fav.title")} tabIndex={0}
          onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(document.dir === "rtl" ? -1 : 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(document.dir === "rtl" ? 1 : -1); } }}
          onScroll={(e) => { const el = e.currentTarget; setI(Math.round(Math.abs(el.scrollLeft) / (el.scrollWidth / reviews.length))); }}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none]">
          {reviews.map((r, idx) => (
            <li key={r.id} aria-roledescription="slide" aria-label={`${num(idx + 1)} / ${num(reviews.length)}`} className="card w-[min(85vw,28rem)] shrink-0 snap-start p-7">
              <p className="flex gap-0.5" aria-label={`${r.stars} / 5`}>{Array.from({ length: 5 }, (_, s) => <Star key={s} size={18} className={s < r.stars ? "fill-gold text-gold" : "text-line"} aria-hidden />)}</p>
              <p className="display mt-4 text-2xl leading-snug">“{l(r.text)}”</p>
              <p className="mt-5 flex items-center gap-2 text-sm font-bold">{l(r.name)} <SampleTag /></p>
            </li>
          ))}
        </ul>
        <p className="sr-only" aria-live="polite">{num(i + 1)} / {num(reviews.length)}</p>
      </div>
    </section>
  );
}

/* ───────────── Scene 16/17/18 ───────────── */
export function LocationsSection() {
  const { t, l } = useI18n();
  return (
    <section id="locations" aria-labelledby="loc-h" className="section" style={{ background: "var(--bg-2)" }}>
      <div className="wrap">
        <p className="kicker">{t("loc.kicker")}</p>
        <h2 id="loc-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("loc.title")}</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {branches.map((b) => (
            <li key={b.id} className="card flex items-start gap-3 p-5">
              <MapPin className="mt-1 shrink-0 text-tomatotext" aria-hidden />
              <div><h3 className="display text-2xl">{l(b.name)}</h3><p className="text-soft">{b.address ? l(b.address) : l(b.area)}</p>
                {b.sample && <p className="mt-2 text-xs font-bold text-soft">{t("loc.sample")}</p>}
                {b.mapUrl && <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold underline">{t("loc.map")}</a>}</div>
            </li>
          ))}
        </ul>
        <Link href="/locations" className="btn btn-ghost mt-6">{t("common.viewAll")}</Link>
      </div>
    </section>
  );
}

export function OffersSection() {
  const { t, l, locale } = useI18n();
  return (
    <section id="offers" aria-labelledby="off-h" className="section">
      <div className="wrap">
        <p className="kicker">{t("offers.kicker")}</p>
        <h2 id="off-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("offers.title")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {offers.map((o, i) => (
            <article key={o.id} className="card flex flex-col gap-3 p-6" style={i === 0 ? { background: "var(--charcoal)", color: "var(--on-dark)", borderColor: "transparent" } : undefined}>
              <h3 className="display text-3xl">{l(o.title)}</h3>
              <p className="opacity-80">{l(o.body)}</p>
              {o.endsAt && <p className="text-sm font-bold">{t("offers.ends")}: {new Date(o.endsAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}</p>}
              {o.code && (
                <button type="button" className="btn mt-auto self-start border-2 border-current" onClick={async () => { try { await navigator.clipboard.writeText(o.code!); toast(t("common.copied")); } catch { /* clipboard unavailable */ } }}>
                  <Copy size={15} aria-hidden /><span dir="ltr">{o.code}</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const { t } = useI18n();
  return (
    <section id="faq" aria-labelledby="faq-h" className="section" style={{ background: "var(--bg-2)" }}>
      <div className="wrap grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="kicker">{t("faq.kicker")}</p>
          <h2 id="faq-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("faq.title")}</h2>
          <Link href="/faq" className="btn btn-ghost mt-6">{t("common.viewAll")}</Link>
        </div>
        <Faq limit={4} />
      </div>
    </section>
  );
}

/* ───────────── Scene 19: final CTA ───────────── */
export function FinalCta() {
  const { t } = useI18n();
  return (
    <section id="final" aria-labelledby="final-h" className="grain relative isolate overflow-hidden bg-tomato py-24 text-white sm:py-32">
      <div aria-hidden className="absolute -end-24 top-1/2 -z-10 w-[min(90vw,40rem)] -translate-y-1/2 opacity-90">
        <PizzaSVG layers={FULL_LAYERS} mode="plain" className="h-full w-full drop-shadow-[0_40px_40px_rgba(0,0,0,.35)]" />
      </div>
      <div className="wrap">
        <h2 id="final-h" className="display max-w-3xl text-[clamp(3.4rem,13vw,10rem)]">{t("final.title")}</h2>
        <p className="mt-4 max-w-sm text-xl font-semibold">{t("final.sub")}</p>
        <div className="mt-8"><Magnetic><Link href="/menu" className="btn btn-dark !min-h-16 !px-10 text-lg">{t("final.cta")}<ArrowRight size={20} aria-hidden className="rtl:rotate-180" /></Link></Magnetic></div>
      </div>
    </section>
  );
}

/* ───────────── active section indicator ───────────── */
const RAIL: { id: string; key: Parameters<ReturnType<typeof useI18n>["t"]>[0] }[] = [
  { id: "hero", key: "nav.home" }, { id: "assembly", key: "asm.kicker" }, { id: "signature", key: "sig.kicker" }, { id: "crepes", key: "crepe.kicker" },
  { id: "burgers", key: "burger.kicker" }, { id: "flavor", key: "flavor.kicker" }, { id: "chef", key: "chef.kicker" }, { id: "ingredients", key: "ing.kicker" },
  { id: "build", key: "build.kicker" }, { id: "best", key: "best.kicker" }, { id: "combos", key: "combo.kicker" }, { id: "sweet", key: "sweet.kicker" },
  { id: "drinks", key: "drinks.kicker" }, { id: "story", key: "story.kicker" }, { id: "reviews", key: "fav.kicker" }, { id: "locations", key: "loc.kicker" },
  { id: "offers", key: "offers.kicker" }, { id: "faq", key: "faq.kicker" },
];

export function SectionRail() {
  const { t } = useI18n();
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const els = RAIL.map((r) => document.getElementById(r.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setActive(vis.target.id);
    }, { threshold: [0.25, 0.5, 0.75] });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Sections" className="fixed end-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col gap-2">
        {RAIL.map((r) => (
          <li key={r.id}>
            <a href={`#${r.id}`} aria-label={t(r.key)} aria-current={active === r.id ? "location" : undefined} title={t(r.key)} className="group flex h-4 w-4 items-center justify-center">
              <span className={`block rounded-full bg-ink transition-all ${active === r.id ? "h-3 w-3 !bg-tomato" : "h-1.5 w-1.5 opacity-40 group-hover:opacity-100"}`} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
