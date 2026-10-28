"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { IngredientIcon, PizzaSVG, configToLayers, type ToppingKind } from "@/components/art/pizza";
import { ProductArt } from "@/components/art/ProductArt";
import { Rating } from "@/components/chrome/ui";
import { ProductCard, useQuickAdd } from "@/components/menu/ProductCard";
import { QuickView } from "@/components/menu/QuickView";
import { ingredients } from "@/data/demo/content";
import { useCatalog } from "@/lib/catalog";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { unitPrice } from "@/lib/pricing";
import type { CategoryId, Config, Product } from "@/lib/api/types";
import type { Key } from "@/lib/i18n/dictionary";

/* ───────────── Scene 6: flavor switch (+ extra 6: flavor wheel) ───────────── */
const SWITCH: { id: CategoryId; bg: string }[] = [
  { id: "pizza", bg: "var(--scene-pizza)" }, { id: "crepes", bg: "var(--scene-crepe)" }, { id: "burgers", bg: "var(--scene-burger)" },
  { id: "pasta", bg: "var(--scene-burger)" }, { id: "desserts", bg: "var(--scene-sweet)" }, { id: "drinks", bg: "var(--scene-drinks)" },
];

const MOODS: { id: string; key: Key; cat?: CategoryId; tag?: "spicy" }[] = [
  { id: "cheesy", key: "flavor.cheesy", cat: "pizza" }, { id: "sweet", key: "flavor.sweet", cat: "desserts" }, { id: "spicy", key: "flavor.spicy", tag: "spicy" },
  { id: "fresh", key: "flavor.fresh", cat: "drinks" }, { id: "hearty", key: "flavor.hearty", cat: "burgers" }, { id: "light", key: "flavor.light", cat: "appetizers" },
];

export function FlavorSwitch() {
  const { t, l, money } = useI18n();
  const { products, categories } = useCatalog();
  const [active, setActive] = useState<CategoryId>("pizza");
  const [mood, setMood] = useState("cheesy");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const cat = categories.find((c) => c.id === active);
  const top = useMemo(() => products.filter((p) => p.category === active).sort((a, b) => b.popularity - a.popularity).slice(0, 3), [products, active]);
  const bg = SWITCH.find((s) => s.id === active)!.bg;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = SWITCH.length;
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (document.dir === "rtl" && e.key === "ArrowRight" ? i - 1 : i + 1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (document.dir === "rtl" && e.key === "ArrowLeft" ? i + 1 : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = (next + n) % n;
    setActive(SWITCH[j].id);
    tabs.current[j]?.focus();
  };

  const moodDef = MOODS.find((m) => m.id === mood)!;
  const suggestions = products.filter((p) => (moodDef.cat ? p.category === moodDef.cat : p.tags.includes(moodDef.tag!))).sort((a, b) => b.popularity - a.popularity).slice(0, 3);

  return (
    <section id="flavor" aria-labelledby="flavor-h" className="section transition-colors duration-700" style={{ background: bg }}>
      <div className="wrap">
        <p className="kicker">{t("flavor.kicker")}</p>
        <h2 id="flavor-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("flavor.title")}</h2>
        <div role="tablist" aria-label={t("flavor.title")} className="mt-8 flex flex-wrap gap-2">
          {SWITCH.map((s, i) => {
            const c = categories.find((x) => x.id === s.id);
            const on = active === s.id;
            return (
              <button key={s.id} ref={(n) => { tabs.current[i] = n; }} role="tab" id={`tab-${s.id}`} aria-selected={on} aria-controls="flavor-panel" tabIndex={on ? 0 : -1}
                onClick={() => setActive(s.id)} onKeyDown={(e) => onKey(e, i)} data-on={on} className="chip !min-h-11 !px-5 !text-base">
                {c && l(c.name)}
              </button>
            );
          })}
        </div>
        <div id="flavor-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-10 grid items-center gap-8 md:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div key={`art-${active}`} initial={{ opacity: 0, scale: 0.8, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.85, rotate: 12 }} transition={{ duration: 0.35 }}
              className="mx-auto aspect-square w-[min(80vw,26rem)]">
              {top[0] && <ProductArt product={top[0]} className="h-full w-full drop-shadow-2xl" />}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={`txt-${active}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
              <p className="display text-4xl sm:text-5xl">{cat && l(cat.tagline)}</p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {top.map((p) => (
                  <li key={p.id}><Link href={`/product/${p.slug}`} className="flex items-center justify-between gap-3 py-3 text-lg font-bold hover:text-tomatotext"><span>{l(p.name)}</span><span className="tabular-nums">{money(p.basePrice)}</span></Link></li>
                ))}
              </ul>
              <Link href={`/menu/${active}`} className="btn btn-primary mt-6">{t("flavor.go")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* flavor wheel */}
        <div className="mt-20 grid items-center gap-10 border-t border-line pt-14 md:grid-cols-[22rem_1fr]">
          <fieldset className="relative mx-auto aspect-square w-[min(84vw,22rem)]">
            <legend className="sr-only">{t("flavor.wheel")}</legend>
            <div aria-hidden className="absolute inset-[22%] grid place-items-center rounded-full border-2 border-dashed border-line text-center text-xs font-bold text-soft">{t("flavor.wheelHint")}</div>
            {MOODS.map((m, i) => {
              const a = (i / MOODS.length) * 360 - 90;
              return (
                <label key={m.id} className="absolute start-1/2 top-1/2 -ms-10 -mt-10 cursor-pointer" style={{ transform: `rotate(${a}deg) translateX(min(37vw, 8.4rem)) rotate(${-a}deg)` }}>
                  <input type="radio" name="mood" value={m.id} checked={mood === m.id} onChange={() => setMood(m.id)} className="peer sr-only" />
                  <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-line bg-surface text-sm font-extrabold transition peer-checked:scale-110 peer-checked:border-tomato peer-checked:bg-tomato peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-gold">{t(m.key)}</span>
                </label>
              );
            })}
          </fieldset>
          <div aria-live="polite">
            <p className="kicker">{t("flavor.suggest")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {suggestions.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="card group p-4 text-center">
                  <div className="mx-auto aspect-square w-24 transition group-hover:scale-110"><ProductArt product={p} className="h-full w-full" /></div>
                  <p className="mt-2 font-extrabold leading-tight">{l(p.name)}</p>
                  <p className="text-sm tabular-nums text-soft">{money(p.basePrice)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 7: chef's signature (+ extra 5: floating menu gallery) ───────────── */
export function ChefSignature() {
  const { t, l, money } = useI18n();
  const { products } = useCatalog();
  const root = useRef<HTMLDivElement>(null);
  const picks = products.filter((p) => p.badges.includes("signature")).slice(0, 3);
  const gallery = products.filter((p) => ["pepperoni-classic", "nutella-banana", "classic-smash", "choco-lava", "lemon-mint"].includes(p.id));

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stop = syncLenis();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((n) => {
        gsap.to(n, { y: -Number(n.dataset.depth) * 3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, el);
    return () => { ctx.revert(); stop(); ScrollTrigger.refresh(); };
  }, [gallery.length]);

  const pos = ["start-[2%] top-[4%] w-[44%] md:w-[30%]", "end-[4%] top-[14%] w-[34%] md:w-[24%]", "start-[24%] top-[44%] w-[40%] md:w-[26%]", "end-[10%] bottom-[2%] w-[36%] md:w-[22%]", "start-[2%] bottom-[2%] w-[24%] md:w-[16%]"];

  return (
    <section id="chef" aria-labelledby="chef-h" className="section overflow-hidden bg-[#1b1411] text-[#f6ead4]">
      <div className="wrap">
        <p className="kicker !text-[#ff9a82]">{t("chef.kicker")}</p>
        <h2 id="chef-h" className="display mt-2 max-w-4xl text-[clamp(2.4rem,6.5vw,5.5rem)]">{t("chef.title")}</h2>
        <p className="mt-4 max-w-xl text-[#cdbba2]">{t("chef.body")}</p>
        <div className="mt-14 space-y-16">
          {picks.map((p, i) => (
            <motion.article key={p.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
              className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="mx-auto aspect-square w-[min(80vw,26rem)] rounded-full" style={{ background: "radial-gradient(circle, #3a2a20, transparent 70%)" }}><ProductArt product={p} className="h-full w-full drop-shadow-[0_30px_30px_rgba(0,0,0,.6)]" /></div>
              <div>
                <p className="display text-7xl text-[#ff7a5c] opacity-60">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display text-4xl sm:text-5xl">{l(p.name)}</h3>
                <p className="mt-3 text-[#cdbba2]">{l(p.description)}</p>
                <ul className="mt-4 flex flex-wrap gap-2">{p.ingredients.map((g, j) => <li key={j} className="rounded-full border border-[#4a3a30] px-3 py-1 text-sm">{l(g)}</li>)}</ul>
                <div className="mt-6 flex items-center gap-4"><span className="text-2xl font-extrabold tabular-nums">{money(p.basePrice)}</span><Link href={`/product/${p.slug}`} className="btn btn-primary">{t("sig.cta")}</Link></div>
              </div>
            </motion.article>
          ))}
        </div>

        <div ref={root} aria-hidden="true" className="relative mt-24 h-[34rem] md:h-[46rem]">
          {gallery.map((p, i) => (
            <div key={p.id} data-depth={[14, 26, 10, 22, 34][i]} className={`absolute aspect-square ${pos[i]}`}>
              <div className="floaty h-full w-full" style={{ ["--d" as string]: `${5 + i}s`, ["--r" as string]: `${(i - 2) * 4}deg` }}>
                <ProductArt product={p} className="h-full w-full drop-shadow-[0_24px_24px_rgba(0,0,0,.55)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 8: fresh ingredients (+ extra 1: ingredient orbit) ───────────── */
const ORBIT: { kind: ToppingKind | "tomato" | "cheese"; name: string }[] = [
  { kind: "tomato", name: "tomato" }, { kind: "basil", name: "basil" }, { kind: "cheese", name: "mozzarella" },
  { kind: "pepperoni", name: "pepperoni" }, { kind: "mushroom", name: "mushroom" }, { kind: "olive", name: "olive" },
];

export function FreshIngredients() {
  const { t, l } = useI18n();
  return (
    <section id="ingredients" aria-labelledby="ing-h" className="section overflow-hidden" style={{ background: "linear-gradient(180deg, var(--bg), var(--bg-2))" }}>
      <div className="wrap">
        <p className="kicker">{t("ing.kicker")}</p>
        <h2 id="ing-h" className="display mt-2 max-w-3xl text-[clamp(2.4rem,6vw,5rem)]">{t("ing.title")}</h2>

        {/* orbit – desktop */}
        <div aria-hidden className="relative mx-auto mt-12 hidden aspect-square w-[min(60vw,34rem)] md:block">
          <div className="absolute inset-[22%]"><PizzaSVG layers={configToLayers({ sauce: ["marinara"], toppings: ["pepperoni", "mushroom", "basil"] })} mode="plain" className="h-full w-full drop-shadow-2xl" /></div>
          <div className="absolute inset-0" style={{ animation: "spin-slow 50s linear infinite" }}>
            {ORBIT.map((o, i) => (
              <div key={o.name} className="absolute inset-0" style={{ transform: `rotate(${(i / ORBIT.length) * 360}deg)` }}>
                <div className="absolute start-1/2 top-0 -ms-8" >
                  <div style={{ animation: "spin-slow 50s linear infinite reverse", transform: `rotate(${-(i / ORBIT.length) * 360}deg)` }}>
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-surface shadow-lg ring-2 ring-line"><IngredientIcon kind={o.kind} size={40} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ul className="mt-12 flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible" tabIndex={0} aria-label={t("ing.title")}>
          {ingredients.map((g, i) => (
            <motion.li key={g.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}
              className="card min-w-[16rem] shrink-0 snap-start p-6 md:min-w-0" style={{ transform: `translateY(${i % 2 ? 14 : 0}px)` }}>
              <span className="mb-4 block h-12 w-12 rounded-full" style={{ background: g.color }} aria-hidden />
              <h3 className="display text-2xl">{l(g.name)}</h3>
              <p className="mt-1 text-soft">{l(g.note)}</p>
            </motion.li>
          ))}
        </ul>
        <Link href="/ingredients" className="btn btn-ghost mt-8">{t("common.explore")}<ArrowRight size={16} className="rtl:rotate-180" aria-hidden /></Link>
      </div>
    </section>
  );
}

/* ───────────── Scene 9: build your own (live mini-builder) ───────────── */
export function BuildYourOwn() {
  const { t, l, money } = useI18n();
  const { byId } = useCatalog();
  const product = byId("margherita");
  const [tops, setTops] = useState<string[]>(["basil"]);
  const [sauce, setSauce] = useState("marinara");
  if (!product) return null;
  const config: Config = { ...product.defaults, toppings: tops, sauce: [sauce] };
  const price = unitPrice(product, config);
  const toggles = product.options.find((g) => g.id === "toppings")!.choices;
  return (
    <section id="build" aria-labelledby="build-h" className="section" style={{ background: "var(--scene-pizza)" }}>
      <div className="wrap grid items-center gap-10 md:grid-cols-2">
        <div className="mx-auto aspect-square w-[min(84vw,30rem)]"><PizzaSVG layers={configToLayers(config)} mode="motion" className="h-full w-full drop-shadow-2xl" title={t("build.title")} /></div>
        <div>
          <p className="kicker">{t("build.kicker")}</p>
          <h2 id="build-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("build.title")}</h2>
          <p className="mt-3 max-w-md text-soft">{t("build.body")}</p>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={product.options.find((g) => g.id === "toppings") ? l(product.options.find((g) => g.id === "toppings")!.name) : ""}>
            {toggles.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={tops.includes(c.id)} onClick={() => setTops((x) => (x.includes(c.id) ? x.filter((y) => y !== c.id) : [...x, c.id]))}>
                <IngredientIcon kind={c.id as ToppingKind} size={20} />{l(c.name)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Sauce">
            {product.options.find((g) => g.id === "sauce")!.choices.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={sauce === c.id} onClick={() => setSauce(c.id)}>{l(c.name)}</button>
            ))}
          </div>
          <p className="mt-6 flex items-baseline gap-3"><span className="text-sm text-soft">{t("p.total")}</span><motion.span key={price} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="display text-5xl tabular-nums">{money(price)}</motion.span></p>
          <Link href="/product/margherita" className="btn btn-primary mt-4">{t("build.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 10: best sellers ───────────── */
export function BestSellers() {
  const { t } = useI18n();
  const { products } = useCatalog();
  const [quick, setQuick] = useState<Product | null>(null);
  const list = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  return (
    <section id="best" aria-labelledby="best-h" className="section">
      <div className="wrap">
        <p className="kicker">{t("best.kicker")}</p>
        <h2 id="best-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("best.title")}</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => (
            <li key={p.id} className="relative">
              <span aria-hidden className="display pointer-events-none absolute -top-6 start-2 z-10 text-8xl text-tomato/80">{i + 1}</span>
              <ProductCard product={p} onQuick={setQuick} />
            </li>
          ))}
        </ol>
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}

/* ───────────── Scene 11: meal combos ───────────── */
export function Combos() {
  const { t, l, money } = useI18n();
  const { products, byId } = useCatalog();
  const combos = products.filter((p) => p.category === "combos");
  return (
    <section id="combos" aria-labelledby="combo-h" className="section" style={{ background: "var(--bg-2)" }}>
      <div className="wrap">
        <p className="kicker">{t("combo.kicker")}</p>
        <h2 id="combo-h" className="display mt-2 text-[clamp(2.4rem,6vw,5rem)]">{t("combo.title")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {combos.map((c) => <ComboCard key={c.id} product={c} items={(c.comboOf ?? []).map((id) => byId(id)).filter(Boolean) as Product[]} l={l} money={money} t={t} />)}
        </div>
      </div>
    </section>
  );
}

function ComboCard({ product, items, l, money, t }: { product: Product; items: Product[]; l: ReturnType<typeof useI18n>["l"]; money: (n: number) => string; t: ReturnType<typeof useI18n>["t"] }) {
  const { add, done } = useQuickAdd(product);
  const separate = items.reduce((s, p) => s + p.basePrice, 0);
  const save = separate - product.basePrice;
  return (
    <article className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
      <div className="mx-auto aspect-square w-40 shrink-0"><ProductArt product={product} className="h-full w-full" /></div>
      <div className="flex-1">
        <h3 className="display text-3xl"><Link href={`/product/${product.slug}`}>{l(product.name)}</Link></h3>
        <p className="mt-1 text-sm font-bold text-soft">{t("combo.includes")}</p>
        <ul className="mt-1 text-sm">{items.map((it, i) => <li key={i} className="flex justify-between gap-3"><span>{l(it.name)}</span><span className="tabular-nums text-soft">{money(it.basePrice)}</span></li>)}</ul>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
          <span className="text-2xl font-extrabold tabular-nums">{money(product.basePrice)}</span>
          {save > 0 && <span className="rounded-full bg-basil px-2.5 py-1 text-xs font-extrabold text-white">−{money(save)}</span>}
          <Rating value={product.rating} count={product.ratingCount} />
          <button type="button" className="btn btn-primary ms-auto" onClick={add}><Plus size={16} aria-hidden />{done ? t("common.added") : t("common.add")}</button>
        </div>
      </div>
    </article>
  );
}
