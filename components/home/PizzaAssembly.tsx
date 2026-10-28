"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PizzaSVG, type PizzaLayers } from "@/components/art/pizza";
import { Chars } from "@/components/fx/Chars";
import { ingredients } from "@/data/demo/content";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n/dictionary";

const FINAL: PizzaLayers = {
  sauce: "marinara", cheese: "regular", crust: "classic", hot: false,
  toppings: { pepperoni: 1, mushroom: 1, olive: 1, pepper: 1, onion: 0, basil: 1 },
};
const STEPS: Key[] = ["asm.s1", "asm.s2", "asm.s3", "asm.s4", "asm.s5", "asm.s6", "asm.s7"];
const polar = (deg: number, r: number) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });
const CALLOUTS = [
  { id: "tomato", pos: "end-[-4%] top-[14%]", line: "w-10" },
  { id: "mozzarella", pos: "end-[-8%] top-[46%]", line: "w-14" },
  { id: "basil", pos: "end-[-2%] top-[76%]", line: "w-8" },
];

export function PizzaAssembly() {
  const { t, l } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stopSync = syncLenis();
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
      const { mobile } = ctx.conditions as { mobile: boolean };
      el.dataset.motion = "on";
      const q = gsap.utils.selector(el);
      const stageW = el.querySelector<HTMLElement>("[data-stage]")?.offsetWidth ?? 500;
      const far = mobile ? 380 : 640;
      const svgO = { svgOrigin: "200 200" };

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1900" : "+=4200", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });

      // camera: tight on the dough, slow dolly out, then a big pull-back for the reveal
      tl.fromTo(q("[data-stage]"), { scale: 1.3, rotation: -10 }, { scale: 1.08, rotation: 0, duration: 7.4, ease: "none" }, 0);
      tl.to(q("[data-stage]"), { scale: mobile ? 0.9 : 0.84, x: mobile ? 0 : document.dir === "rtl" ? "14%" : "-14%", duration: 2.4, ease: "power3.inOut" }, 7.8);
      // the background warms up as the pizza gets closer to done
      tl.to(q("[data-warm]"), { opacity: 1, duration: 8, ease: "none" }, 0);

      tl.fromTo(q("[data-l=dough]"), { scale: 0.15, opacity: 0, rotation: -200, ...svgO }, { scale: 1, opacity: 1, rotation: 0, ...svgO, duration: 1.4, ease: "back.out(1.4)" }, 0);
      // dough "thwack": a little squash on landing
      tl.fromTo(q("[data-l=dough]"), { scaleY: 1 }, { scaleY: 0.96, duration: 0.12, yoyo: true, repeat: 1, ...svgO }, 1.3);

      // sauce spreads – plus a splash of droplets flung outwards
      tl.fromTo(q("[data-l=sauce-clip]"), { attr: { r: 0 } }, { attr: { r: 168 }, duration: 1.3, ease: "power1.inOut" }, 1.4);
      q("[data-fx=splash]").forEach((n, i, a) => {
        const { x, y } = polar((i / a.length) * 360, stageW * (0.25 + ((i * 37) % 30) / 100));
        tl.fromTo(n, { x: 0, y: 0, scale: 0, opacity: 1 }, { x, y, scale: 1.4 + (i % 3) * 0.4, opacity: 0, duration: 0.9, ease: "power3.out" }, 1.5 + i * 0.02);
      });

      // cheese: patches tumble in, with shreds raining down across the whole pizza
      tl.fromTo(q("[data-l=cheese] .cp"), { y: -320, opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: { each: 0.035, from: "random" }, ease: "back.out(1.7)" }, 2.7);
      q("[data-fx=shred]").forEach((n, i, a) => {
        tl.fromTo(n, { y: -stageW * 0.9, x: (i % 7 - 3) * stageW * 0.09, rotation: i * 40, opacity: 0 }, { y: ((i * 53) % 90 - 45) * stageW / 200, opacity: 1, rotation: i * 40 + 220, duration: 0.8, ease: "power2.in" }, 2.6 + (i / a.length) * 0.9);
      });
      tl.to(q("[data-fx=shred]"), { opacity: 0, duration: 0.4 }, 3.9);

      // pepperoni from alternating sides, every slice spinning
      q("[data-l=pepperoni] .pc").forEach((n, i, a) => {
        const { x, y } = polar((i % 2 ? 190 : -10) + ((i * 23) % 70) - 35, far);
        tl.fromTo(n, { x, y, rotation: 420, scale: 1.5, opacity: 0 }, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, 4.1 + (i / a.length) * 1.1);
      });
      q("[data-l=mushroom] .pc").forEach((n, i, a) => tl.fromTo(n, { y: -far, x: (i % 2 ? 1 : -1) * 120, rotation: -200, opacity: 0 }, { y: 0, x: 0, rotation: 0, opacity: 1, duration: 0.8 }, 5.4 + (i / a.length) * 0.8));
      q("[data-l=olive] .pc").forEach((n, i, a) => tl.fromTo(n, { y: far, scale: 2, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "bounce.out" }, 5.7 + (i / a.length) * 0.8));
      q("[data-l=pepper] .pc").forEach((n, i, a) => {
        const { x, y } = polar(45 + i * 70, far);
        tl.fromTo(n, { x, y, rotation: 540, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 5.9 + (i / a.length) * 0.7);
      });
      // basil drifts down in a lazy sway
      q("[data-l=basil] .pc").forEach((n, i, a) => tl.fromTo(n, { y: -far * 0.9, x: i % 2 ? 60 : -60, rotation: i % 2 ? 160 : -160, opacity: 0, scale: 0.6 }, { y: 0, x: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.2, ease: "sine.out" }, 6.7 + (i / a.length) * 0.7));

      // ready: cut lines draw across, callouts label the ingredients, steam rises
      tl.fromTo(q("[data-fx=slice]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.07 }, 8.1);
      tl.fromTo(q("[data-fx=callout]"), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.18 }, 8.6);
      tl.fromTo(q("[data-fx=callout] i"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.18, transformOrigin: "0% 50%" }, 8.7);
      tl.fromTo(q("[data-fx=steam]"), { opacity: 0 }, { opacity: 1, stagger: 0.2, duration: 0.5 }, 8.8);
      tl.fromTo(q("[data-l=sauce], [data-l=cheese]"), { filter: "brightness(1)" }, { filter: "brightness(1.12)", duration: 0.6, yoyo: true, repeat: 1 }, 8.2);

      const steps = q(".steps > li");
      const starts = [0, 1.4, 2.7, 4.1, 5.4, 6.7, 8];
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0, y: 24, rotateX: -60 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.4 }, starts[i]);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -24, duration: 0.3 }, starts[i + 1] - 0.3);
      });
      tl.fromTo(q("[data-final] [data-char]"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.5 }, 8.4);
      tl.fromTo(q("[data-final] a"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 9);
      tl.to({}, { duration: 0.8 });

      return () => { delete el.dataset.motion; };
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  const callouts = CALLOUTS.map((c) => ({ ...c, item: ingredients.find((i) => i.id === c.id)! })).filter((c) => c.item);

  return (
    <section ref={root} id="assembly" aria-labelledby="asm-h" className="scene relative overflow-hidden" style={{ background: "var(--scene-pizza)" }}>
      <div aria-hidden data-warm className="asm-layer pointer-events-none absolute inset-0 bg-gold/30 opacity-0" />
      <div aria-hidden className="absolute -start-24 top-1/4 h-72 w-72 rounded-full bg-tomato/15 blur-3xl" />
      <div className="wrap grid min-h-svh content-center gap-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-8">
        <div className="relative z-10 order-2 md:order-1">
          <p className="kicker" data-no-reveal>{t("asm.kicker")}</p>
          <h2 id="asm-h" data-no-reveal className="display mt-2 text-[clamp(2.1rem,7vw,5.5rem)]">{t("asm.title")}</h2>
          <ol className="steps mt-4 text-lg font-bold sm:text-2xl" aria-label={t("asm.kicker")} style={{ perspective: 600 }}>
            {STEPS.map((k, i) => (
              <li key={k} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tomato text-sm font-black text-white">{i + 1}</span>{t(k)}
              </li>
            ))}
          </ol>
          <div data-final className="mt-5">
            <p className="display text-3xl text-tomatotext sm:text-4xl"><Chars text={t("asm.final")} /></p>
            <Link href="/product/ranch-supreme" className="btn btn-primary mt-4">{t("asm.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
          </div>
        </div>

        <div className="relative order-1 mx-auto aspect-square w-[min(76vw,38svh)] md:order-2 md:w-[min(44vw,70svh)]">
          <div data-stage className="relative h-full w-full will-change-transform">
            <PizzaSVG layers={FINAL} mode="plain" title={t("asm.final")} className="h-full w-full drop-shadow-[0_40px_40px_rgba(70,20,0,.4)]" />
            {/* particles & overlays – only exist visually while the scene is animated */}
            <div aria-hidden className="asm-layer pointer-events-none absolute inset-0">
              {Array.from({ length: 16 }, (_, i) => <span key={i} data-fx="splash" className="absolute start-1/2 top-1/2 h-[2.4%] w-[2.4%] rounded-full bg-[#c93a20]" style={{ opacity: 0 }} />)}
              {Array.from({ length: 24 }, (_, i) => <span key={i} data-fx="shred" className="absolute start-1/2 top-1/2 h-[0.9%] w-[4%] rounded-full bg-[#fff0b8] shadow" style={{ opacity: 0 }} />)}
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i / 8) * Math.PI;
                  return <line key={i} data-fx="slice" x1={200 - Math.cos(a) * 188} y1={200 - Math.sin(a) * 188} x2={200 + Math.cos(a) * 188} y2={200 + Math.sin(a) * 188}
                    pathLength={1} strokeDasharray={1} strokeDashoffset={1} stroke="#fff6dc" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />;
                })}
              </svg>
              {[0, 1, 2].map((i) => <span key={i} data-fx="steam" className="steam" style={{ left: `${36 + i * 14}%`, top: "4%", animationDelay: `${i * 1.1}s`, opacity: 0 }} />)}
              {callouts.map((c) => (
                <div key={c.id} data-fx="callout" className={`absolute hidden items-center gap-2 md:flex ${c.pos}`} style={{ opacity: 0 }}>
                  <i className={`block h-px bg-ink ${c.line}`} />
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold shadow-lg">{l(c.item.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
