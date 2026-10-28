"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">{t("sig.kicker")}</p>
            <h2 id="sig-h" className="display mt-2 max-w-3xl text-[clamp(2.4rem,6vw,5rem)]">{t("sig.title")}</h2>
          </div>
          <Link href="/menu/pizza" className="btn btn-ghost">{t("common.viewAll")}<ArrowRight size={16} className="rtl:rotate-180" aria-hidden /></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {pizzas.map((p, i) => (
            <div key={p.id} className={`relative ${spans[i] ?? ""}`}>
              <ProductCard product={p} variant={i === 0 ? "feature" : "grid"} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 4: crepe laboratory ───────────── */
const CREPE_STEPS: Key[] = ["crepe.s1", "crepe.s2", "crepe.s3", "crepe.s4", "crepe.s5", "crepe.s6"];
const BANANA_POS = [[30, 32, 15], [64, 26, 14], [76, 56, 16], [36, 70, 15], [52, 50, 14]];
const BERRY_POS = [["straw1", 24, 50, 17], ["straw2", 80, 30, 15], ["rasp1", 50, 22, 9], ["rasp2", 66, 76, 9], ["rasp3", 22, 72, 9]] as const;

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
      const far = (el.querySelector<HTMLElement>("[data-stage]")?.offsetWidth ?? 500) * 1.1;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1600" : "+=3200", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });

      tl.fromTo(q("[data-l=plate]"), { scale: 0.3, opacity: 0, y: 80 }, { scale: 1, opacity: 1, y: 0, duration: 0.9 }, 0);
      tl.fromTo(q("[data-l=crepe]"), { scale: 0.2, rotation: -220, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "back.out(1.2)" }, 0.5);
      tl.fromTo(q(".choc"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "none" }, 1.7);
      q("[data-l=banana] img").forEach((n, i, a) => tl.fromTo(n, { x: -far, y: (i - 2) * 40, rotation: -200, opacity: 0 }, { x: 0, y: 0, rotation: Number((n as HTMLElement).dataset.rot), opacity: 1, duration: 0.9 }, 3.4 + (i / a.length) * 0.8));
      q("[data-l=berry] img").forEach((n, i, a) => tl.fromTo(n, { x: far, y: (i - 2) * 50, rotation: 220, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9 }, 4.2 + (i / a.length) * 0.8));
      tl.fromTo(q("[data-l=nuts] span"), { y: -far, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "bounce.out" }, 5.3);
      // fold + serve: the assembled crepe is swept off and the finished plated crepes slide in
      tl.to(q("[data-open]"), { scaleY: 0.45, scaleX: 0.7, y: 60, rotation: 8, opacity: 0, duration: 1.1, ease: "power2.inOut" }, 6.6);
      tl.fromTo(q("[data-folded]"), { opacity: 0, y: 120, scale: 0.8, rotation: 6 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.1)" }, 7);
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 8.2);

      const steps = q(".steps > li");
      const starts = [0, 1.7, 3.4, 5.3, 6.6, 7.8];
      steps.forEach((s, i) => {
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, starts[i]);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -24, duration: 0.3 }, starts[i + 1] - 0.3);
      });
      tl.to({}, { duration: 0.8 });
      return () => { delete el.dataset.motion; };
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  const chip = (src: string, x: number, y: number, w: number, rot: number, key: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={key} src={src} alt="" data-rot={rot} className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, marginLeft: `${-w / 2}%`, marginTop: `${-w / 2}%`, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 6px 6px rgba(40,15,0,.5))" }} />
  );

  return (
    <section ref={root} id="crepes" aria-labelledby="crepe-h" className="scene relative overflow-hidden" style={{ background: "radial-gradient(70% 60% at 30% 50%, #fff1e2, var(--scene-crepe))" }}>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, rgb(110 55 25 / .28), transparent)" }} />
      <div className="wrap relative grid min-h-svh content-center gap-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-8">
        <div className="mx-auto aspect-square w-[min(76vw,38svh)] md:w-[min(44vw,74svh)]">
          <div data-stage className="relative h-full w-full">
            <div data-open className="absolute inset-0">
              {/* white plate */}
              <div data-l="plate" className="asm-layer absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #fff 0, #f1ece4 70%, #ddd5c8 100%)", boxShadow: "0 30px 50px -12px rgba(60,30,10,.55), inset 0 0 0 10px #fbf8f3, inset 0 0 0 12px #e3dbcf" }} />
              {/* thin crepe */}
              <div data-l="crepe" className="asm-layer absolute inset-[9%] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #f3cf8c 0, #e5b062 60%, #c98a3e 100%)", boxShadow: "inset 0 0 30px rgba(120,60,10,.4)" }}>
                {Array.from({ length: 16 }, (_, i) => <span key={i} className="absolute rounded-full" style={{ left: `${15 + ((i * 37) % 70)}%`, top: `${12 + ((i * 53) % 74)}%`, width: `${3 + (i % 4)}%`, aspectRatio: "1", background: "rgba(150,80,20,.28)" }} />)}
              </div>
              {/* chocolate poured in a ribbon */}
              <svg viewBox="0 0 100 100" className="asm-layer absolute inset-0 h-full w-full" aria-hidden>
                <defs><linearGradient id="chocg" x1="0" x2="1"><stop offset="0" stopColor="#6a3419" /><stop offset=".5" stopColor="#3f1d0c" /><stop offset="1" stopColor="#5a2b14" /></linearGradient></defs>
                <path className="choc" d="M18 34 Q50 16 82 34 T82 54 T18 62 T76 78" pathLength={1} strokeDasharray={1} fill="none" stroke="url(#chocg)" strokeWidth="5" strokeLinecap="round" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.55))" }} />
              </svg>
              <div data-l="banana" className="asm-layer absolute inset-0">{BANANA_POS.map(([x, y, w], i) => chip(`/img/cut/banana${(i % 3) + 1}.png`, x, y, w, (i * 37) % 60 - 30, `b${i}`))}</div>
              <div data-l="berry" className="asm-layer absolute inset-0">{BERRY_POS.map(([n, x, y, w], i) => chip(`/img/cut/${n}.png`, x, y, w, 0, `s${i}`))}</div>
              <div data-l="nuts" className="asm-layer absolute inset-0">{Array.from({ length: 22 }, (_, i) => <span key={i} className="absolute rounded-[40%_60%_50%_50%]" style={{ left: `${24 + ((i * 41) % 52)}%`, top: `${22 + ((i * 59) % 56)}%`, width: "3%", aspectRatio: "1", background: "linear-gradient(135deg,#c98a4b,#7b4a1e)", boxShadow: "0 2px 2px rgba(0,0,0,.4)" }} />)}</div>
            </div>
            {/* finished, real plated crepes (also the no-motion fallback) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-folded src="/img/cut/plate-cut.png" alt={t("crepe.title")} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_30px_rgba(60,30,10,.45)]" />
          </div>
        </div>
        <div className="relative z-10">
          <p className="kicker" style={{ color: "#8a4b2a" }}>{t("crepe.kicker")}</p>
          <h2 id="crepe-h" className="display mt-2 text-[clamp(2.1rem,6.5vw,5rem)]">{t("crepe.title")}</h2>
          <ol className="steps mt-4 text-lg font-bold sm:text-2xl">
            {CREPE_STEPS.map((k, i) => (
              <li key={k} className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8a4b2a] text-sm font-black text-white">{i + 1}</span>{t(k)}</li>
            ))}
          </ol>
          <div data-final className="mt-5"><Link href="/menu/crepes" className="btn btn-dark">{t("crepe.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene 5: burger drop — a real burger photo cut into layers that fall and snap together ───────────── */
const BURGER_KEYS: Key[] = ["burger.l1", "burger.l2", "burger.l3", "burger.l4", "burger.l5", "burger.l6", "burger.l7"];
// bbox of the burger in the source photo: x 190→660, y 30→400 (700px space). Layers listed bottom → top.
const BAND_BOX = { x: 190, y: 30, w: 470, h: 370 };
const BANDS = [
  { n: "b4", x0: 192, y0: 328, x1: 652, y1: 398 },
  { n: "b3", x0: 196, y0: 258, x1: 656, y1: 338 },
  { n: "b2", x0: 196, y0: 168, x1: 656, y1: 268 },
  { n: "b1", x0: 208, y0: 34, x1: 648, y1: 176 },
];

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
      const bands = q("[data-band]");
      const drop = (el.querySelector<HTMLElement>("[data-stage]")?.offsetHeight ?? 400) * 1.3;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: mobile ? "+=1400" : "+=2600", pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true } });
      const step = 1.4;
      bands.forEach((b, i) => {
        tl.fromTo(b, { y: -drop, opacity: 0, rotation: i % 2 ? 7 : -7, scale: 1.08 }, { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 1, ease: "power3.in" }, i * step);
        const below = bands[i - 1];
        if (below) tl.to(below, { y: 6, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.out" }, i * step + 0.95);
        tl.to(b, { y: -8, duration: 0.08, yoyo: true, repeat: 1 }, i * step + 1);
      });
      // 7 labels map to 4 photo layers + overlays: advance captions evenly
      const steps = q(".steps > li");
      steps.forEach((s, i) => {
        const at = (i / steps.length) * bands.length * step;
        tl.fromTo(s, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25 }, at);
        if (i < steps.length - 1) tl.to(s, { opacity: 0, y: -20, duration: 0.2 }, ((i + 1) / steps.length) * bands.length * step - 0.2);
      });
      tl.fromTo(q("[data-final]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, bands.length * step);
      tl.to(q("[data-stage]"), { scale: 1.06, rotation: -2, duration: 1, ease: "power2.inOut" }, bands.length * step);
      tl.to({}, { duration: 0.6 });
      return () => { delete el.dataset.motion; };
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, []);

  return (
    <section ref={root} id="burgers" aria-labelledby="burger-h" className="scene relative overflow-hidden bg-[#120c09] text-[#f6ead4]">
      {/* blurred real burger as moody backdrop */}
      <div aria-hidden className="absolute inset-0 opacity-45" style={{ backgroundImage: "url(/img/burger-classic.jpg)", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(36px) saturate(1.2)" }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#120c09] via-[#120c09]/50 to-[#120c09]/70" />
      <div className="wrap relative grid min-h-svh content-center gap-4 py-8 md:grid-cols-2 md:items-center md:gap-8">
        <div className="relative z-10">
          <p className="kicker !text-[#ffb21e]">{t("burger.kicker")}</p>
          <h2 id="burger-h" className="display mt-2 text-[clamp(2.4rem,8vw,6.5rem)]">{t("burger.title")}</h2>
          <ol className="steps mt-4 text-xl font-extrabold sm:text-3xl">
            {BURGER_KEYS.map((k) => <li key={k}>{t(k)}</li>)}
          </ol>
          <div data-final className="mt-5"><Link href="/menu/burgers" className="btn btn-primary">{t("burger.cta")}<ArrowRight size={18} aria-hidden className="rtl:rotate-180" /></Link></div>
        </div>
        <div className="mx-auto w-[min(88vw,46svh)] md:w-[min(44vw,78svh)]">
          <div data-stage className="relative w-full" style={{ aspectRatio: `${BAND_BOX.w} / ${BAND_BOX.h}` }} role="img" aria-label={t("burger.title")}>
            {BANDS.map((b) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.n} data-band src={`/img/bands/${b.n}.png`} alt="" className="absolute"
                style={{ left: `${((b.x0 - BAND_BOX.x) / BAND_BOX.w) * 100}%`, top: `${((b.y0 - BAND_BOX.y) / BAND_BOX.h) * 100}%`, width: `${((b.x1 - b.x0) / BAND_BOX.w) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
