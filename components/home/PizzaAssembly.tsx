"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PizzaSVG, type PizzaLayers } from "@/components/art/pizza";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n/dictionary";

const FINAL: PizzaLayers = {
  sauce: "marinara", cheese: "regular", crust: "classic", hot: false,
  toppings: { pepperoni: 1, mushroom: 1, olive: 1, pepper: 1, onion: 0, basil: 1 },
};
const STEPS: Key[] = ["asm.s1", "asm.s2", "asm.s3", "asm.s4", "asm.s5", "asm.s6", "asm.s7"];

const polar = (deg: number, r: number) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });

export function PizzaAssembly() {
  const { t } = useI18n();
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
      const far = mobile ? 380 : 640;
      const svgO = { svgOrigin: "200 200" };

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: el, start: "top top", end: mobile ? "+=1700" : "+=3600", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });

      // stage camera: starts tight on the dough, pulls back at the end
      tl.fromTo(q("[data-stage]"), { scale: 1.45, rotation: -8 }, { scale: 1.12, rotation: 0, duration: 7, ease: "none" }, 0);
      tl.to(q("[data-stage]"), { scale: mobile ? 0.92 : 0.86, x: mobile ? 0 : document.dir === "rtl" ? "12%" : "-12%", duration: 2.2, ease: "power3.inOut" }, 7.2);

      // 1 dough
      tl.fromTo(q("[data-l=dough]"), { scale: 0.2, opacity: 0, rotation: -140, ...svgO }, { scale: 1, opacity: 1, rotation: 0, ...svgO, duration: 1.4, ease: "back.out(1.3)" }, 0);
      // 2 sauce spreads (clip circle grows)
      tl.fromTo(q("[data-l=sauce-clip]"), { attr: { r: 0 } }, { attr: { r: 168 }, duration: 1.2, ease: "power1.inOut" }, 1.3);
      // 3 cheese falls in
      tl.fromTo(q("[data-l=cheese] .cp"), { y: -300, opacity: 0, scale: 0.5, ...{ transformOrigin: "50% 50%" } }, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: { each: 0.035, from: "random" }, ease: "back.out(1.6)" }, 2.5);
      // 4 pepperoni flies in from alternating sides
      q("[data-l=pepperoni] .pc").forEach((n, i, all) => {
        const a = (i % 2 ? 190 : -10) + (i * 23) % 70 - 35;
        const { x, y } = polar(a, far);
        tl.fromTo(n, { x, y, rotation: 420, scale: 1.5, opacity: 0 }, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, 3.8 + (i / all.length) * 1.1);
      });
      // 5 mushrooms from above, olives from below, peppers spiral from the corners
      q("[data-l=mushroom] .pc").forEach((n, i, all) => tl.fromTo(n, { y: -far, x: (i % 2 ? 1 : -1) * 120, rotation: -200, opacity: 0 }, { y: 0, x: 0, rotation: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 5.2 + (i / all.length) * 0.8));
      q("[data-l=olive] .pc").forEach((n, i, all) => tl.fromTo(n, { y: far, scale: 2, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "bounce.out" }, 5.5 + (i / all.length) * 0.8));
      q("[data-l=pepper] .pc").forEach((n, i, all) => {
        const { x, y } = polar(45 + i * 70, far);
        tl.fromTo(n, { x, y, rotation: 540, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 5.8 + (i / all.length) * 0.7);
      });
      // 6 basil drifts down
      q("[data-l=basil] .pc").forEach((n, i, all) => tl.fromTo(n, { y: -far * 0.9, x: (i % 2 ? 60 : -60), rotation: i % 2 ? 160 : -160, opacity: 0, scale: 0.6 }, { y: 0, x: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.1, ease: "sine.out" }, 6.6 + (i / all.length) * 0.7));

      // captions
      const steps = q(".steps > li");
      const starts = [0, 1.3, 2.5, 3.8, 5.2, 6.6, 7.6];
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, starts[i]);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -24, duration: 0.3 }, starts[i + 1] - 0.3);
      });
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2 }, 8.2);
      tl.to({}, { duration: 0.6 });

      return () => { delete el.dataset.motion; };
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  return (
    <section ref={root} id="assembly" aria-labelledby="asm-h" className="scene relative overflow-hidden" style={{ background: "var(--scene-pizza)" }}>
      <div className="wrap grid min-h-svh content-center gap-6 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative z-10 order-2 md:order-1">
          <p className="kicker">{t("asm.kicker")}</p>
          <h2 id="asm-h" className="display mt-2 text-[clamp(2.1rem,7vw,5.5rem)]">{t("asm.title")}</h2>
          <ol className="steps mt-5 text-xl font-bold sm:text-2xl" aria-label={t("asm.kicker")}>
            {STEPS.map((k, i) => (
              <li key={k} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tomato text-sm font-black text-white">{i + 1}</span>{t(k)}
              </li>
            ))}
          </ol>
          <div data-final className="mt-6">
            <p className="display text-3xl text-tomatotext sm:text-4xl">{t("asm.final")}</p>
            <Link href="/product/pepperoni-classic" className="btn btn-primary mt-4">{t("asm.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
          </div>
        </div>
        <div className="order-1 mx-auto aspect-square w-[min(78vw,40svh)] md:order-2 md:w-[min(46vw,78svh)]">
          <div data-stage className="h-full w-full will-change-transform">
            <PizzaSVG layers={FINAL} mode="plain" title={t("asm.final")} className="h-full w-full drop-shadow-[0_40px_40px_rgba(70,20,0,.4)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
