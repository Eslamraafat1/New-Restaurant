"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { IngredientIcon, PizzaSVG, type PizzaLayers } from "@/components/art/pizza";
import { LogoMark } from "@/components/chrome/Logo";
import { getGsap, reducedMotion } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { Magnetic } from "./Magnetic";

const HERO_LAYERS: PizzaLayers = {
  sauce: "marinara", cheese: "regular", crust: "classic", hot: false,
  toppings: { pepperoni: 1, mushroom: 1, olive: 1, pepper: 0, onion: 0, basil: 1 },
};

const FLOATERS = [
  { kind: "tomato", cls: "start-[2%] top-[14%]", size: 74, depth: 30, r: "-12deg", d: "7s" },
  { kind: "basil", cls: "end-[4%] top-[8%]", size: 64, depth: 46, r: "20deg", d: "6s" },
  { kind: "pepperoni", cls: "end-[0%] bottom-[16%]", size: 88, depth: 24, r: "10deg", d: "8s" },
  { kind: "mushroom", cls: "start-[6%] bottom-[8%]", size: 58, depth: 38, r: "-20deg", d: "5.5s" },
  { kind: "cheese", cls: "start-[44%] -top-[2%]", size: 56, depth: 18, r: "8deg", d: "6.5s" },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = getGsap();
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.set("[data-hero]", { visibility: "visible" })
        .from("[data-hero=ring]", { scale: 0.4, opacity: 0, duration: 1 }, 0)
        .from("[data-hero=pizza]", { scale: 0.5, rotation: -70, opacity: 0, duration: 1.2, ease: "back.out(1.2)" }, 0.05)
        .from("[data-hero=line] > span", { yPercent: 115, duration: 0.8, stagger: 0.1 }, 0.1)
        .from("[data-hero=fade]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.5)
        .from("[data-hero=float]", { scale: 0, rotation: -90, opacity: 0, duration: 0.8, stagger: 0.07, ease: "back.out(2)" }, 0.45);

      // subtle camera-like parallax: only for precise pointers
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
        const setters = layers.map((n) => ({ x: gsap.quickTo(n, "x", { duration: 0.8, ease: "power3" }), y: gsap.quickTo(n, "y", { duration: 0.8, ease: "power3" }), d: Number(n.dataset.depth) }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => { s.x(-nx * s.d); s.y(-ny * s.d); });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="grain relative isolate overflow-hidden" aria-labelledby="hero-h" style={{ background: "radial-gradient(120% 90% at 80% 20%, var(--cheese) -30%, transparent 55%), var(--bg)" }}>
      <div className="wrap grid min-h-[calc(100svh-4.25rem)] items-center gap-6 pb-16 pt-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10">
          <p data-hero="fade" className="kicker flex items-center gap-2"><LogoMark size={22} />{t("hero.kicker")}</p>
          <h1 id="hero-h" className="display mt-4 text-[clamp(3.6rem,15vw,10.5rem)]">
            {(["hero.l1", "hero.l2", "hero.l3"] as const).map((k, i) => (
              <span key={k} data-hero="line" className="split-line block" style={i === 2 ? { color: "var(--tomato-text)" } : undefined}><span>{t(k)}</span></span>
            ))}
          </h1>
          <p data-hero="fade" className="mt-6 max-w-md text-lg text-soft">{t("hero.sub")}</p>
          <div data-hero="fade" className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic><Link href="/menu" className="btn btn-primary !min-h-14 !px-8 text-base">{t("hero.cta1")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></Magnetic>
            <Magnetic><Link href="/product/margherita" className="btn btn-ghost !min-h-14">{t("hero.cta2")}</Link></Magnetic>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[min(92vw,44rem)]" aria-hidden="true">
          <div data-hero="ring" className="absolute inset-[2%] rounded-full" style={{ background: "radial-gradient(circle, var(--tomato) 0 58%, transparent 59%)", opacity: 0.12 }} />
          <div data-depth="14" className="absolute inset-0">
            <div data-hero="pizza" className="h-full w-full"><div className="h-full w-full" style={{ animation: "spin-slow 120s linear infinite" }}>
              <PizzaSVG layers={HERO_LAYERS} mode="plain" className="h-full w-full drop-shadow-[0_40px_40px_rgba(70,20,0,.35)]" />
            </div></div>
          </div>
          {FLOATERS.map((f) => (
            <div key={f.kind} data-depth={f.depth} className={`absolute ${f.cls}`}>
              <div data-hero="float" className="floaty" style={{ ["--r" as string]: f.r, ["--d" as string]: f.d }}>
                <IngredientIcon kind={f.kind} size={f.size} className="drop-shadow-lg" />
              </div>
            </div>
          ))}
          <p data-hero="fade" className="absolute bottom-0 end-2 rounded-full bg-charcoal px-4 py-2 text-xs font-extrabold tracking-wider text-[#f6ead4]" style={{ background: "#1b1411" }}>{t("hero.note")}</p>
        </div>
      </div>
      <a href="#assembly" className="absolute inset-x-0 bottom-3 mx-auto flex w-fit flex-col items-center gap-1 text-xs font-bold uppercase tracking-widest text-soft" aria-label={t("hero.scroll")}>
        {t("hero.scroll")}<ArrowDown size={16} className="animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
