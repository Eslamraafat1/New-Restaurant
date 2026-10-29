"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Chars } from "@/components/fx/Chars";
import { useQuickAdd } from "@/components/menu/ProductCard";
import { useCatalog } from "@/lib/catalog";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/api/types";

function ReelCard({ product, index }: { product: Product; index: number }) {
  const { t, l, money, num } = useI18n();
  const { add, done } = useQuickAdd(product);
  return (
    <article data-reelcard className="relative flex h-[min(34rem,72svh)] w-[min(84vw,32rem)] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#2a1a12] to-[#160e0a] p-6 text-[#f6ead4] sm:p-8">
      <span data-num aria-hidden className="display outline-text pointer-events-none absolute -end-4 -top-6 text-[11rem] leading-none text-[#ffb21e] opacity-40">{num(index + 1).padStart(2, "0")}</span>
      <div data-art className="relative mx-auto mt-4 aspect-square w-[62%] will-change-transform">
        <div className="absolute inset-0 rounded-full bg-tomato/30 blur-2xl" />
        <ProductArt product={product} className="relative h-full w-full drop-shadow-[0_25px_25px_rgba(0,0,0,.6)]" />
      </div>
      <div className="relative">
        <h3 className="display text-4xl sm:text-5xl">{l(product.name)}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-[#cdbba2]">{l(product.description)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-extrabold tabular-nums">{money(product.basePrice)}</span>
          <button type="button" onClick={add} className="btn btn-primary !min-h-11"><Plus size={16} aria-hidden />{done ? t("common.added") : t("common.add")}</button>
          <Link href={`/product/${product.slug}`} className="btn !min-h-11 border-2 border-[#f6ead4]/40 text-[#f6ead4] hover:bg-white/10">{t("sig.cta")}</Link>
        </div>
      </div>
    </article>
  );
}

/** Scene 3 – a pinned horizontal "reel" of signature pizzas. On phones it becomes a native snap carousel. */
export function SignatureReel() {
  const { t, num } = useI18n();
  const { products } = useCatalog();
  const root = useRef<HTMLElement>(null);
  const pizzas = products.filter((p) => p.category === "pizza").slice(0, 6);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion() || pizzas.length === 0) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stopSync = syncLenis();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      el.dataset.motion = "on";
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const bar = el.querySelector<HTMLElement>("[data-bar]")!;
      const counter = el.querySelector<HTMLElement>("[data-count]");
      const rtl = document.dir === "rtl";
      const dist = () => Math.max(0, track.scrollWidth - el.clientWidth + 48);
      const tween = gsap.to(track, {
        x: () => (rtl ? 1 : -1) * dist(), ease: "none",
        scrollTrigger: {
          trigger: el, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            bar.style.transform = `scaleX(${self.progress})`;
            if (counter) counter.textContent = num(Math.min(pizzas.length, Math.round(self.progress * (pizzas.length - 1)) + 1));
          },
        },
      });
      gsap.utils.toArray<HTMLElement>("[data-reelcard]", el).forEach((c) => {
        const trig = { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true };
        gsap.fromTo(c.querySelector("[data-art]"), { rotation: -70, scale: 0.7 }, { rotation: 70, scale: 1.08, ease: "none", scrollTrigger: trig });
        gsap.fromTo(c.querySelector("[data-num]"), { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: trig });
        gsap.fromTo(c, { rotateY: rtl ? -18 : 18 }, { rotateY: rtl ? 18 : -18, ease: "none", transformPerspective: 1200, scrollTrigger: trig });
        gsap.fromTo(c, { opacity: 0.5 }, { keyframes: { "50%": { opacity: 1 }, "100%": { opacity: 0.5 }, easeEach: "none" }, ease: "none", scrollTrigger: trig });
      });
      gsap.fromTo("[data-reelword]", { xPercent: 0 }, { xPercent: rtl ? 40 : -40, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => "+=" + dist(), scrub: true } });
      return () => { delete el.dataset.motion; };
    });
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(refresh); mm.revert(); stopSync(); };
  }, [pizzas.length, num]);

  return (
    <section ref={root} id="signature" aria-labelledby="sig-h" className="reel relative overflow-hidden bg-[#120c09] py-16 text-[#f6ead4] md:py-0">
      <p aria-hidden data-reelword className="display outline-text pointer-events-none absolute will-change-transform start-0 top-[8%] whitespace-nowrap text-[clamp(8rem,22vw,20rem)] leading-none text-[#f6ead4] opacity-[0.07]">SIGNATURE · SIGNATURE · SIGNATURE</p>
      <div className="relative flex min-h-svh flex-col justify-center gap-8 md:py-10">
        <div className="wrap">
          <p className="kicker !text-[#ffb21e]" data-no-reveal>{t("sig.kicker")}</p>
          <h2 id="sig-h" data-no-reveal className="display mt-2 max-w-3xl text-[clamp(2.4rem,6vw,5rem)]"><Chars text={t("sig.title")} /></h2>
        </div>
        <div className="reel-scroll snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:snap-none" tabIndex={0} aria-label={t("sig.kicker")}>
          <div data-track className="flex w-max gap-6 px-4 md:gap-10 md:px-[max(1rem,calc((100vw-80rem)/2))]">
            {pizzas.map((p, i) => <ReelCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
        <div className="wrap flex items-center gap-4">
          <span className="hidden text-sm font-extrabold tabular-nums md:block"><span data-count>{num(1)}</span> / {num(pizzas.length)}</span>
          <div className="hidden h-1 flex-1 overflow-hidden rounded-full bg-white/15 md:block"><div data-bar className="h-full origin-[0_50%] bg-gold rtl:origin-[100%_50%]" style={{ transform: "scaleX(0)" }} /></div>
          <Link href="/menu/pizza" className="btn btn-primary ms-auto">{t("common.viewAll")}<ArrowRight size={16} className="rtl:rotate-180" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
