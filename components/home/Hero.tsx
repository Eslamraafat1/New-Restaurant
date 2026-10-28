"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/chrome/Logo";
import { getGsap, reducedMotion } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { Magnetic } from "./Magnetic";

/** real photographic cut-outs floating around the hero pizza */
const FLOATERS = [
  { src: "/img/cut/basil1.png", cls: "start-[0%] top-[10%] w-[16%]", depth: 46, r: "-18deg", d: "7s" },
  { src: "/img/cut/pep1.png", cls: "end-[2%] top-[4%] w-[15%]", depth: 30, r: "12deg", d: "6s" },
  { src: "/img/cut/basil2.png", cls: "end-[-2%] bottom-[26%] w-[17%]", depth: 52, r: "22deg", d: "8s" },
  { src: "/img/cut/olive1.png", cls: "start-[6%] bottom-[10%] w-[8%]", depth: 24, r: "0deg", d: "5s" },
  { src: "/img/cut/pep2.png", cls: "start-[22%] -top-[3%] w-[11%]", depth: 20, r: "30deg", d: "7.5s" },
  { src: "/img/cut/mush1.png", cls: "end-[18%] -bottom-[2%] w-[11%]", depth: 36, r: "-10deg", d: "6.5s" },
] as const;

const TRIO = [
  { href: "/menu/pizza", img: "/img/pepperoni.jpg", name: { en: "Pizza", ar: "بيتزا" } },
  { href: "/menu/crepes", img: "/img/crepe-banana.jpg", name: { en: "Crepes", ar: "كريب" } },
  { href: "/menu/burgers", img: "/img/burger-classic.jpg", name: { en: "Burgers", ar: "برجر" } },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { t, l } = useI18n();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = getGsap();
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.set("[data-hero]", { visibility: "visible" })
        .from("[data-hero=word]", { scale: 0.85, opacity: 0, duration: 1.2 }, 0)
        .from("[data-hero=pizza]", { scale: 0.45, rotation: -80, opacity: 0, duration: 1.3, ease: "back.out(1.15)" }, 0.05)
        .from("[data-hero=line] > span", { yPercent: 115, duration: 0.85, stagger: 0.1 }, 0.1)
        .from("[data-hero=fade]", { y: 26, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.5)
        .from("[data-hero=float]", { scale: 0, rotation: -120, opacity: 0, duration: 0.9, stagger: 0.07, ease: "back.out(2)" }, 0.5)
        .from("[data-hero=trio]", { y: 60, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.9);

      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
        const set = layers.map((n) => ({ x: gsap.quickTo(n, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(n, "y", { duration: 0.9, ease: "power3" }), d: Number(n.dataset.depth) }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          set.forEach((s) => { s.x(-nx * s.d); s.y(-ny * s.d); });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="grain relative isolate overflow-hidden" aria-labelledby="hero-h"
      style={{ background: "radial-gradient(90% 70% at 85% 25%, color-mix(in srgb, var(--gold) 55%, transparent), transparent 60%), radial-gradient(70% 60% at 0% 100%, color-mix(in srgb, var(--tomato) 30%, transparent), transparent 60%), var(--bg)" }}>
      {/* giant outlined word behind everything */}
      <p aria-hidden data-hero="word" className="display outline-text pointer-events-none absolute -bottom-[0.18em] start-1/2 -z-10 w-full -translate-x-1/2 select-none text-center text-[clamp(7rem,30vw,28rem)] leading-none opacity-[0.14] rtl:translate-x-1/2">
        CRAVE
      </p>
      <div className="wrap grid min-h-[calc(100svh-4.25rem)] items-center gap-4 pb-28 pt-4 lg:grid-cols-[1.05fr_1fr] lg:pb-32">
        <div className="relative z-10">
          <p data-hero="fade" className="kicker flex items-center gap-2"><span className="sticker !text-[0.7rem]">{t("hero.kicker")}</span></p>
          <h1 id="hero-h" className="display mt-4 text-[clamp(3.4rem,14.5vw,10rem)]">
            {(["hero.l1", "hero.l2", "hero.l3"] as const).map((k, i) => (
              <span key={k} data-hero="line" className="split-line block" style={i === 2 ? { color: "var(--tomato-text)" } : undefined}><span>{t(k)}</span></span>
            ))}
          </h1>
          <p data-hero="fade" className="mt-5 max-w-md text-lg text-soft">{t("hero.sub")}</p>
          <div data-hero="fade" className="mt-7 flex flex-wrap items-center gap-3">
            <Magnetic><Link href="/menu" className="btn btn-primary !min-h-14 !px-8 text-base">{t("hero.cta1")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></Magnetic>
            <Magnetic><Link href="/product/margherita" className="btn btn-ghost !min-h-14">{t("hero.cta2")}</Link></Magnetic>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[min(94vw,46rem)]" aria-hidden="true">
          <div data-depth="12" className="absolute inset-0">
            <div data-hero="pizza" className="relative h-full w-full">
              <div className="absolute inset-[3%] rounded-full bg-tomato/25 blur-3xl" />
              <div className="relative h-full w-full" style={{ animation: "spin-slow 140s linear infinite" }}>
                <Image src="/img/cut/pizza-cut.png" alt="" fill priority sizes="(max-width: 1024px) 94vw, 46vw" className="object-contain drop-shadow-[0_40px_40px_rgba(60,15,0,.45)]" />
              </div>
              <span className="steam" style={{ left: "38%", top: "10%" }} />
              <span className="steam" style={{ left: "54%", top: "6%", animationDelay: "1.3s" }} />
              <span className="steam" style={{ left: "68%", top: "12%", animationDelay: "2.4s" }} />
            </div>
          </div>
          {FLOATERS.map((f) => (
            <div key={f.src} data-depth={f.depth} className={`absolute ${f.cls}`}>
              <div data-hero="float" className="floaty" style={{ ["--r" as string]: f.r, ["--d" as string]: f.d }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt="" className="w-full drop-shadow-[0_10px_10px_rgba(40,10,0,.5)]" loading="eager" />
              </div>
            </div>
          ))}
          {/* rotating stamp */}
          <div data-hero="fade" className="absolute -bottom-2 start-0 h-20 w-20 sm:h-36 sm:w-36">
            <svg viewBox="0 0 120 120" className="h-full w-full" style={{ animation: "spin-slow 18s linear infinite" }}>
              <circle cx="60" cy="60" r="58" fill="#120c09" />
              <defs><path id="stamp" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
              <text fill="#ffd45e" fontSize="11" fontWeight="800"><textPath href="#stamp" textLength="268" lengthAdjust="spacing">{t("hero.note")} ·</textPath></text>
            </svg>
            <span className="absolute inset-0 grid place-items-center"><LogoMark size={40} /></span>
          </div>
        </div>
      </div>

      <ul className="wrap absolute inset-x-0 bottom-6 z-10 hidden gap-3 sm:flex sm:justify-end lg:bottom-8">
        {TRIO.map((x) => (
          <li key={x.href} data-hero="trio">
            <Link href={x.href} className="group flex items-center gap-3 rounded-full bg-surface/90 py-1.5 pe-5 ps-1.5 shadow-lg backdrop-blur transition hover:-translate-y-1">
              <span className="relative h-12 w-12 overflow-hidden rounded-full"><Image src={x.img} alt="" fill sizes="48px" className="object-cover transition group-hover:scale-125" /></span>
              <span className="text-sm font-extrabold">{l(x.name)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <a href="#assembly" className="absolute inset-x-0 bottom-2 mx-auto flex w-fit flex-col items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-soft sm:hidden" aria-label={t("hero.scroll")}>
        {t("hero.scroll")}<ArrowDown size={14} className="animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
