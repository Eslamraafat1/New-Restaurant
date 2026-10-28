"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BurgerSVG, BURGER_FULL, CrepeFoldedSVG, CrepeSVG, CREPE_FULL } from "@/components/art/others";
import { ProductCard } from "@/components/menu/ProductCard";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n/dictionary";

/* ───────────── Scene 3: signature pizza collection (editorial grid) ───────────── */
export function SignatureCollection() {
  const { t } = useI18n();
  const { products } = useCatalog();
  const pizzas = products.filter((p) => p.category === "pizza").slice(0, 5);
  const spans = ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2", ""];
  return (
    <section id="signature" aria-labelledby="sig-h" className="section">
      <div className="wrap">
        <p className="kicker">{t("sig.kicker")}</p>
        <h2 id="sig-h" className="display mt-2 max-w-3xl text-[clamp(2.4rem,6vw,5rem)]">{t("sig.title")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4 md:auto-rows-[minmax(0,1fr)]">
          {pizzas.map((p, i) => (
            <div key={p.id} className={`relative ${spans[i] ?? ""}`}>
              <ProductCard product={p} variant={i === 0 ? "feature" : "grid"} />
            </div>
          ))}
        </div>
        <div className="mt-8"><Link href="/menu/pizza" className="btn btn-ghost">{t("common.viewAll")}<ArrowRight size={16} className="rtl:rotate-180" aria-hidden /></Link></div>
      </div>
    </section>
  );
}

/* ───────────── Scene 4: crepe laboratory ───────────── */
const CREPE_STEPS: Key[] = ["crepe.s1", "crepe.s2", "crepe.s3", "crepe.s4", "crepe.s5", "crepe.s6"];

export function CrepeLab() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stopSync = syncLenis();
    const mm = gsap.matchMedia();
    mm.add({ mobile: "(max-width: 767px)", desktop: "(min-width: 768px)" }, (ctx) => {
      const { mobile } = ctx.conditions as { mobile: boolean };
      el.dataset.motion = "on";
      const q = gsap.utils.selector(el);
      const far = mobile ? 360 : 560;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1500" : "+=3000", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });

      tl.fromTo(q("[data-l=crepe]"), { scale: 0.1, rotation: -200, opacity: 0, svgOrigin: "200 200" }, { scale: 1, rotation: 0, opacity: 1, svgOrigin: "200 200", duration: 1.2, ease: "back.out(1.2)" }, 0);
      tl.fromTo(q(".choc"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "none" }, 1.3);
      tl.fromTo(q("[data-l=banana]"), { x: -far, opacity: 0, rotation: -40 }, { x: 0, opacity: 1, rotation: 0, duration: 1.2 }, 3);
      tl.fromTo(q("[data-l=strawberry]"), { x: far, opacity: 0, rotation: 60 }, { x: 0, opacity: 1, rotation: 0, duration: 1.2 }, 3.4);
      tl.fromTo(q("[data-l=nuts]"), { y: -far, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }, 4.5);
      // fold: squash the open crepe, reveal the folded, plated version
      tl.to(q("[data-open]"), { scaleY: 0.5, scaleX: 0.8, y: 50, rotation: 6, duration: 1.1, ease: "power2.inOut" }, 6);
      tl.to(q("[data-open]"), { opacity: 0, duration: 0.5 }, 6.8);
      tl.fromTo(q("[data-folded]"), { opacity: 0, y: 90, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "back.out(1.2)" }, 6.7);
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 8);

      const steps = q(".steps > li");
      const starts = [0, 1.3, 3, 4.5, 6, 7.4];
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, starts[i]);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -24, duration: 0.3 }, starts[i + 1] - 0.3);
      });
      tl.to({}, { duration: 0.8 });
      return () => { delete el.dataset.motion; };
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  return (
    <section ref={root} id="crepes" aria-labelledby="crepe-h" className="scene relative overflow-hidden" style={{ background: "var(--scene-crepe)" }}>
      {/* warm cooking-surface */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, rgb(138 75 42 / .22), transparent)" }} />
      <div className="wrap relative grid min-h-svh content-center gap-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="mx-auto aspect-square w-[min(78vw,40svh)] md:w-[min(44vw,76svh)]">
          <div className="relative h-full w-full">
            <div data-open className="absolute inset-0"><CrepeSVG layers={CREPE_FULL} plain title={t("crepe.title")} className="h-full w-full drop-shadow-[0_30px_30px_rgba(70,30,10,.3)]" /></div>
            <div data-folded className="absolute inset-0" style={{ opacity: 1 }}><CrepeFoldedSVG className="h-full w-full drop-shadow-[0_30px_30px_rgba(70,30,10,.3)]" /></div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="kicker" style={{ color: "#8a4b2a" }}>{t("crepe.kicker")}</p>
          <h2 id="crepe-h" className="display mt-2 text-[clamp(2.1rem,6.5vw,5rem)]">{t("crepe.title")}</h2>
          <ol className="steps mt-5 text-xl font-bold sm:text-2xl">
            {CREPE_STEPS.map((k, i) => (
              <li key={k} className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8a4b2a] text-sm font-black text-white">{i + 1}</span>{t(k)}</li>
            ))}
          </ol>
          <div data-final className="mt-6"><Link href="/menu/crepes" className="btn btn-dark">{t("crepe.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 5: burger drop ───────────── */
const BURGER_KEYS: Key[] = ["burger.l1", "burger.l2", "burger.l3", "burger.l4", "burger.l5", "burger.l6", "burger.l7"];

export function BurgerDrop() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stopSync = syncLenis();
    const mm = gsap.matchMedia();
    mm.add({ mobile: "(max-width: 767px)", desktop: "(min-width: 768px)" }, (ctx) => {
      const { mobile } = ctx.conditions as { mobile: boolean };
      el.dataset.motion = "on";
      const q = gsap.utils.selector(el);
      const layers = q(".bl");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1300" : "+=2400", pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true } });
      const step = 1.1;
      layers.forEach((layer, i) => {
        gsap.set(layer, { transformBox: "fill-box", transformOrigin: "50% 100%" });
        tl.fromTo(layer, { y: -520, opacity: 0, rotation: i % 2 ? 6 : -6 }, { y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: i === 6 ? "bounce.out" : "power3.in" }, i * step);
        // impact: squash the layer that was just landed on
        const below = layers[i - 1];
        if (below) tl.to(below, { scaleY: 0.92, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, i * step + 0.82);
        tl.fromTo(q(".steps > li")[i], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, i * step);
        if (i < layers.length - 1) tl.to(q(".steps > li")[i], { opacity: 0, y: -20, duration: 0.25 }, (i + 1) * step - 0.25);
      });
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, layers.length * step);
      tl.to(q("[data-stage]"), { scale: 1.06, rotation: -3, duration: 1, ease: "power2.inOut" }, layers.length * step);
      tl.to({}, { duration: 0.6 });
      return () => { delete el.dataset.motion; };
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  return (
    <section ref={root} id="burgers" aria-labelledby="burger-h" className="scene relative overflow-hidden" style={{ background: "var(--scene-burger)" }}>
      <div aria-hidden className="absolute -start-1/4 top-0 h-full w-1/2 -skew-x-12" style={{ background: "var(--tomato)", opacity: 0.1 }} />
      <div className="wrap relative grid min-h-svh content-center gap-6 py-10 md:grid-cols-2 md:items-center">
        <div className="relative z-10">
          <p className="kicker">{t("burger.kicker")}</p>
          <h2 id="burger-h" className="display mt-2 text-[clamp(2.4rem,8vw,6.5rem)]">{t("burger.title")}</h2>
          <ol className="steps mt-5 text-2xl font-extrabold sm:text-3xl">
            {BURGER_KEYS.map((k) => <li key={k}>{t(k)}</li>)}
          </ol>
          <div data-final className="mt-6"><Link href="/menu/burgers" className="btn btn-primary">{t("burger.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></div>
        </div>
        <div className="mx-auto w-[min(86vw,44svh)] md:w-[min(42vw,72svh)]">
          <div data-stage><BurgerSVG layers={BURGER_FULL} plain title={t("burger.title")} className="w-full drop-shadow-[0_30px_30px_rgba(80,40,0,.35)]" /></div>
        </div>
      </div>
    </section>
  );
}
