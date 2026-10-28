"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n/dictionary";

const STEPS: Key[] = ["asm.s1", "asm.s2", "asm.s3", "asm.s4", "asm.s5", "asm.s6", "asm.s7"];
const GOLDEN = 2.399963;

/** deterministic scatter inside the pizza (percent of stage) */
function scatter(n: number, reach: number, offset: number) {
  return Array.from({ length: n }, (_, i) => {
    const r = reach * Math.sqrt((i + 0.5) / n);
    const a = i * GOLDEN + offset;
    return { x: +(50 + r * Math.cos(a)).toFixed(2), y: +(50 + r * Math.sin(a)).toFixed(2), rot: Math.round((i * 67 + offset * 30) % 360) };
  });
}

const polar = (deg: number, r: number) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });

export function PizzaAssembly() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const layers = useMemo(() => ({
    pep: scatter(9, 33, 0.3), mush: scatter(6, 30, 1.4), olive: scatter(8, 34, 2.5), basil: scatter(6, 28, 3.6),
  }), []);

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
      const stage = el.querySelector<HTMLElement>("[data-stage]")!;
      const far = stage.offsetWidth * (mobile ? 0.9 : 1.1);

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1800" : "+=3800", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });

      // camera: tight on the dough → pulls back for the finished pizza
      tl.fromTo(q("[data-cam]"), { scale: 1.12, rotation: -6 }, { scale: 1, rotation: 0, duration: 7.4, ease: "none" }, 0);
      tl.to(q("[data-cam]"), { scale: mobile ? 0.94 : 0.9, x: mobile ? 0 : document.dir === "rtl" ? "12%" : "-12%", duration: 2.2, ease: "power3.inOut" }, 7.6);

      tl.fromTo(q("[data-l=dough]"), { scale: 0.2, opacity: 0, rotation: -160 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: "back.out(1.3)" }, 0);
      tl.fromTo(q("[data-l=sauce]"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 1.3, ease: "power1.inOut" }, 1.3);
      tl.fromTo(q("[data-l=cheese]"), { opacity: 0, y: -240, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "bounce.out" }, 2.6);
      q("[data-l=pep] img").forEach((n, i, a) => {
        const { x, y } = polar((i % 2 ? 190 : -10) + ((i * 23) % 70) - 35, far);
        tl.fromTo(n, { x, y, rotation: 420, scale: 1.6, opacity: 0 }, { x: 0, y: 0, rotation: Number((n as HTMLElement).dataset.rot), scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, 4 + (i / a.length) * 1.1);
      });
      q("[data-l=mush] img").forEach((n, i, a) => tl.fromTo(n, { y: -far, x: (i % 2 ? 1 : -1) * far * 0.2, rotation: -200, opacity: 0 }, { y: 0, x: 0, rotation: Number((n as HTMLElement).dataset.rot), opacity: 1, duration: 0.8 }, 5.3 + (i / a.length) * 0.8));
      q("[data-l=olive] img").forEach((n, i, a) => tl.fromTo(n, { y: far, scale: 2.4, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "bounce.out" }, 5.6 + (i / a.length) * 0.8));
      q("[data-l=basil] img").forEach((n, i, a) => tl.fromTo(n, { y: -far * 0.9, x: i % 2 ? 80 : -80, rotation: i % 2 ? 160 : -160, opacity: 0, scale: 0.6 }, { y: 0, x: 0, rotation: Number((n as HTMLElement).dataset.rot), opacity: 1, scale: 1, duration: 1.1, ease: "sine.out" }, 6.6 + (i / a.length) * 0.7));
      // the finished photographic pizza fades in over the assembled layers
      tl.fromTo(q("[data-l=final]"), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.1 }, 7.4);
      tl.to(q("[data-l=base]"), { opacity: 0, duration: 0.6 }, 8.3);

      const steps = q(".steps > li");
      const starts = [0, 1.3, 2.6, 4, 5.3, 6.6, 7.6];
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, starts[i]);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -24, duration: 0.3 }, starts[i + 1] - 0.3);
      });
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1 }, 8.3);
      tl.to({}, { duration: 0.6 });
      return () => { delete el.dataset.motion; };
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  const chip = (src: string, p: { x: number; y: number; rot: number }, w: number, key: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={key} src={src} alt="" data-rot={p.rot} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${w}%`, marginLeft: `${-w / 2}%`, marginTop: `${-w / 2}%`, transform: `rotate(${p.rot}deg)`, filter: "drop-shadow(0 4px 4px rgba(40,10,0,.5))" }} />
  );

  return (
    <section ref={root} id="assembly" aria-labelledby="asm-h" className="scene relative overflow-hidden" style={{ background: "radial-gradient(80% 70% at 70% 45%, color-mix(in srgb, var(--gold) 40%, var(--scene-pizza)), var(--scene-pizza))" }}>
      <div className="wrap grid min-h-svh content-center gap-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-8">
        <div className="relative z-10 order-2 md:order-1">
          <p className="kicker">{t("asm.kicker")}</p>
          <h2 id="asm-h" className="display mt-2 text-[clamp(2.1rem,7vw,5.5rem)]">{t("asm.title")}</h2>
          <ol className="steps mt-4 text-lg font-bold sm:text-2xl" aria-label={t("asm.kicker")}>
            {STEPS.map((k, i) => (
              <li key={k} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tomato text-sm font-black text-white">{i + 1}</span>{t(k)}
              </li>
            ))}
          </ol>
          <div data-final className="mt-5">
            <p className="display text-3xl text-tomatotext sm:text-4xl">{t("asm.final")}</p>
            <Link href="/product/ranch-supreme" className="btn btn-primary mt-4">{t("asm.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link>
          </div>
        </div>

        <div className="order-1 mx-auto aspect-square w-[min(76vw,38svh)] md:order-2 md:w-[min(44vw,70svh)]">
          <div data-cam className="h-full w-full will-change-transform">
            <div data-stage className="relative h-full w-full">
              <div data-l="base" className="absolute inset-0">
                <div className="absolute inset-[-4%] rounded-full bg-black/10 blur-2xl asm-layer" />
                {/* raw dough */}
                <div data-l="dough" className="asm-layer absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 38% 32%, #f9e2ab 0, #ecc27a 55%, #d19a4c 100%)", boxShadow: "inset 0 0 0 10px #d9a258, inset 0 0 40px rgba(120,60,10,.45), 0 30px 50px -10px rgba(60,20,0,.5)" }} />
                {/* sauce spreading */}
                <div data-l="sauce" className="asm-layer absolute inset-[7%] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #e24a2c 0, #c42f17 55%, #9d2010 100%)" }} />
                {/* melted mozzarella */}
                <div data-l="cheese" className="asm-layer absolute inset-[8%] rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff1c4 0, transparent 35%), radial-gradient(circle at 70% 60%, #ffe39a 0, transparent 40%), radial-gradient(circle at 45% 78%, #fff1c4 0, transparent 38%), radial-gradient(circle, #f9dc88 0, #f3c864 100%)", opacity: 0.96 }} />
                <div data-l="pep" className="asm-layer absolute inset-0">{layers.pep.map((p, i) => chip(`/img/cut/pep${(i % 3) + 1}.png`, p, 12, `p${i}`))}</div>
                <div data-l="mush" className="asm-layer absolute inset-0">{layers.mush.map((p, i) => chip("/img/cut/mush1.png", p, 9, `m${i}`))}</div>
                <div data-l="olive" className="asm-layer absolute inset-0">{layers.olive.map((p, i) => chip(`/img/cut/olive${(i % 2) + 1}.png`, p, 6, `o${i}`))}</div>
                <div data-l="basil" className="asm-layer absolute inset-0">{layers.basil.map((p, i) => chip(`/img/cut/basil${(i % 3) + 1}.png`, p, 11, `b${i}`))}</div>
              </div>
              {/* the finished, real pizza (also the no-motion fallback) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-l="final" src="/img/cut/pizza-cut.png" alt={t("asm.final")} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_40px_40px_rgba(60,15,0,.5)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
