"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { IngredientIcon, PizzaSVG, type PizzaLayers } from "@/components/art/pizza";
import { LogoMark } from "@/components/chrome/Logo";
import { Chars } from "@/components/fx/Chars";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { Magnetic } from "./Magnetic";

const HERO_LAYERS: PizzaLayers = {
  sauce: "marinara", cheese: "regular", crust: "classic", hot: false,
  toppings: { pepperoni: 1, mushroom: 1, olive: 1, pepper: 1, onion: 0, basil: 1 },
};

const FLOATERS = [
  { kind: "tomato", cls: "start-[0%] top-[12%]", size: 78, depth: 46, speed: 0.5, r: "-12deg", d: "7s" },
  { kind: "basil", cls: "end-[2%] top-[4%]", size: 64, depth: 62, speed: 0.9, r: "20deg", d: "6s" },
  { kind: "pepperoni", cls: "end-[-2%] bottom-[22%]", size: 92, depth: 30, speed: 0.4, r: "10deg", d: "8s" },
  { kind: "mushroom", cls: "start-[4%] bottom-[8%]", size: 60, depth: 52, speed: 0.7, r: "-20deg", d: "5.5s" },
  { kind: "cheese", cls: "start-[44%] -top-[4%]", size: 58, depth: 24, speed: 0.3, r: "8deg", d: "6.5s" },
  { kind: "olive", cls: "end-[24%] -bottom-[3%]", size: 40, depth: 70, speed: 1, r: "0deg", d: "5s" },
] as const;

const TRIO = [
  { href: "/menu/pizza", en: "Pizza", ar: "بيتزا" },
  { href: "/menu/crepes", en: "Crepes", ar: "كريب" },
  { href: "/menu/burgers", en: "Burgers", ar: "برجر" },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { t, locale } = useI18n();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = getGsap();
    if (reducedMotion()) return;
    const stopSync = syncLenis();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power4.out" } });
      tl.set("[data-hero]", { visibility: "visible" })
        // giant outlined word sweeps in
        .from("[data-hero=word]", { yPercent: 40, opacity: 0, duration: 1.6 }, 0)
        // headline: 3D letter flip
        .from("[data-hero=line] [data-char]", { yPercent: 130, rotateX: -100, opacity: 0, transformOrigin: "50% 100%", transformPerspective: 600, duration: 0.9, stagger: { each: 0.035, from: "start" } }, 0.1)
        .from("[data-hero=fade]", { y: 28, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.7)
        // the pizza: dough spins in, then every topping flies from off-canvas with a bounce
        .from("[data-hero=pizza] [data-l=dough]", { scale: 0.2, rotation: -200, svgOrigin: "200 200", opacity: 0, duration: 1.1, ease: "back.out(1.3)" }, 0.1)
        .from("[data-hero=pizza] [data-l=sauce]", { opacity: 0, scale: 0.4, svgOrigin: "200 200", duration: 0.8 }, 0.55)
        .from("[data-hero=pizza] [data-l=cheese]", { opacity: 0, y: -120, duration: 0.8, ease: "bounce.out" }, 0.8)
        .from("[data-hero=pizza] .pc", {
          x: () => gsap.utils.random(-520, 520), y: () => gsap.utils.random(-520, 520), rotation: () => gsap.utils.random(-540, 540), scale: 0, opacity: 0,
          duration: 1, stagger: { amount: 1, from: "random" }, ease: "back.out(1.5)",
        }, 1)
        .from("[data-hero=float]", { scale: 0, rotation: -140, opacity: 0, duration: 0.9, stagger: 0.07, ease: "back.out(2)" }, 1.3)
        .from("[data-hero=stamp]", { scale: 0, rotation: 200, duration: 1, ease: "back.out(1.4)" }, 1.7)
        .from("[data-hero=trio]", { y: 40, opacity: 0, duration: 0.7, stagger: 0.08 }, 1.5);

      // scroll-out: the pizza keeps spinning away while the copy drifts up at a different speed
      gsap.to("[data-hero=spin]", { rotation: 90, scale: 1.18, y: -60, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero=copy]", { y: -90, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero=word]", { xPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((n) => {
        gsap.to(n, { y: -Number(n.dataset.speed) * 160, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      });

      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
        const set = layers.map((n) => ({ x: gsap.quickTo(n, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(n, "y", { duration: 0.9, ease: "power3" }), d: Number(n.dataset.depth) }));
        const tilt = el.querySelector<HTMLElement>("[data-hero=tilt]");
        const rx = tilt ? gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3" }) : null;
        const ry = tilt ? gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3" }) : null;
        if (tilt) gsap.set(tilt, { transformPerspective: 900 });
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          set.forEach((s) => { s.x(-nx * s.d); s.y(-ny * s.d); });
          rx?.(-ny * 16); ry?.(nx * 16);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });
    }, el);
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(refresh); ctx.revert(); stopSync(); };
  }, []);

  return (
    <section ref={root} className="grain relative isolate overflow-hidden" aria-labelledby="hero-h"
      style={{ background: "radial-gradient(90% 70% at 85% 25%, color-mix(in srgb, var(--gold) 55%, transparent), transparent 60%), radial-gradient(70% 60% at 0% 100%, color-mix(in srgb, var(--tomato) 30%, transparent), transparent 60%), var(--bg)" }}>
      <p aria-hidden data-hero="word" className="display outline-text pointer-events-none absolute -bottom-[0.15em] start-0 -z-10 w-[130%] select-none whitespace-nowrap text-[clamp(7rem,30vw,28rem)] leading-none opacity-[0.13]">
        CRAVE · CRAVE
      </p>
      <div className="wrap grid min-h-[calc(100svh-4.25rem)] items-center gap-4 pb-24 pt-4 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
        <div data-hero="copy" className="relative z-10">
          <p data-hero="fade" className="kicker flex items-center gap-2"><LogoMark size={22} /><span className="sticker !text-[0.7rem]">{t("hero.kicker")}</span></p>
          <h1 id="hero-h" className="display mt-4 text-[clamp(3.4rem,14.5vw,10rem)]">
            {(["hero.l1", "hero.l2", "hero.l3"] as const).map((k, i) => (
              <span key={k} data-hero="line" className="split-line block" style={i === 2 ? { color: "var(--tomato-text)" } : undefined}>
                <Chars text={t(k)} />
              </span>
            ))}
          </h1>
          <p data-hero="fade" className="mt-5 max-w-md text-lg text-soft">{t("hero.sub")}</p>
          <div data-hero="fade" className="mt-7 flex flex-wrap items-center gap-3">
            <Magnetic><Link href="/menu" className="btn btn-primary !min-h-14 !px-8 text-base">{t("hero.cta1")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></Magnetic>
            <Magnetic><Link href="/product/margherita" className="btn btn-ghost !min-h-14">{t("hero.cta2")}</Link></Magnetic>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[min(94vw,44rem)]" aria-hidden="true">
          <div data-depth="12" className="absolute inset-0">
            <div data-hero="tilt" className="h-full w-full">
              <div data-hero="spin" className="h-full w-full">
                <div data-hero="pizza" className="relative h-full w-full">
                  <div className="absolute inset-[3%] rounded-full bg-tomato/25 blur-3xl" />
                  <div className="relative h-full w-full" style={{ animation: "spin-slow 90s linear infinite" }}>
                    <PizzaSVG layers={HERO_LAYERS} mode="plain" className="h-full w-full drop-shadow-[0_40px_40px_rgba(70,20,0,.4)]" />
                  </div>
                  <span className="steam" style={{ left: "38%", top: "6%" }} />
                  <span className="steam" style={{ left: "54%", top: "2%", animationDelay: "1.3s" }} />
                  <span className="steam" style={{ left: "68%", top: "8%", animationDelay: "2.4s" }} />
                </div>
              </div>
            </div>
          </div>
          {FLOATERS.map((f) => (
            <div key={f.kind} data-depth={f.depth} data-speed={f.speed} className={`absolute ${f.cls}`}>
              <div data-hero="float" className="floaty" style={{ ["--r" as string]: f.r, ["--d" as string]: f.d }}>
                <IngredientIcon kind={f.kind} size={f.size} className="drop-shadow-lg" />
              </div>
            </div>
          ))}
          <div data-hero="stamp" className="absolute -bottom-2 start-0 h-20 w-20 sm:h-32 sm:w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full" style={{ animation: "spin-slow 18s linear infinite" }}>
              <circle cx="60" cy="60" r="58" fill="#120c09" />
              <defs><path id="stamp" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
              <text fill="#ffd45e" fontSize="11" fontWeight="800"><textPath href="#stamp" textLength="268" lengthAdjust="spacing">{t("hero.note")} ·</textPath></text>
            </svg>
            <span className="absolute inset-0 grid place-items-center"><LogoMark size={36} /></span>
          </div>
        </div>
      </div>

      <ul className="wrap absolute inset-x-0 bottom-6 z-10 hidden gap-3 sm:flex sm:justify-end lg:bottom-8">
        {TRIO.map((x) => (
          <li key={x.href} data-hero="trio">
            <Link href={x.href} className="chip !min-h-11 !px-5 !text-sm shadow-lg">{locale === "ar" ? x.ar : x.en}</Link>
          </li>
        ))}
      </ul>
      <a href="#assembly" className="absolute inset-x-0 bottom-2 mx-auto flex w-fit flex-col items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-soft sm:hidden" aria-label={t("hero.scroll")}>
        {t("hero.scroll")}<ArrowDown size={14} className="animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
