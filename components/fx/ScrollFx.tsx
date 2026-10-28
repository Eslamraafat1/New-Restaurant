"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getGsap, reducedMotion, syncLenis } from "@/lib/gsap";

/**
 * Site-wide GSAP choreography, driven by markup:
 *  - every `h2.display` / `.kicker` reveals on scroll
 *  - `[data-card]` items enter in staggered batches
 *  - `[data-speed]` gets scrubbed parallax
 *  - `[data-tilt]` gets a 3D pointer tilt (fine pointers only)
 * Skipped completely for reduced-motion users. Everything is reverted on route change.
 */
export function ScrollFx() {
  const path = usePathname();

  useEffect(() => {
    if (reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const stopSync = syncLenis();
    let ctx: gsap.Context | undefined;
    let cleanupTilt = () => {};

    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("main h2.display").forEach((h) => {
          if (h.closest("[data-no-reveal]")) return;
          gsap.fromTo(h, { opacity: 0, y: 70, rotateX: -35, transformOrigin: "0% 100%", transformPerspective: 800 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "power4.out", clearProps: "transform",
            scrollTrigger: { trigger: h, start: "top 90%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>("main .kicker").forEach((k) => {
          if (k.closest("[data-no-reveal]")) return;
          gsap.fromTo(k, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: k, start: "top 92%", once: true } });
        });

        const cards = gsap.utils.toArray<HTMLElement>("main [data-card]");
        if (cards.length) {
          gsap.set(cards, { y: 80, scale: 0.94 });
          ScrollTrigger.batch(cards, {
            start: "top 94%", once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.1, ease: "power3.out", clearProps: "transform" }),
          });
        }

        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const s = Number(el.dataset.speed);
          gsap.to(el, { y: () => -s * 120, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
        });

        gsap.utils.toArray<HTMLElement>("footer .wrap > *").forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 50, duration: 0.8, delay: i * 0.08, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 98%", once: true } });
        });
      }, document.body);
      ScrollTrigger.refresh();
    }, 200);

    // delegated 3D tilt (works for cards that mount later, e.g. after filtering)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let active: HTMLElement | null = null;
      const move = (e: PointerEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
        if (active && active !== el) gsap.to(active, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
        active = el;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotateY: px * 12, rotateX: -py * 12, transformPerspective: 900, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      };
      const leave = () => { if (active) gsap.to(active, { rotateX: 0, rotateY: 0, duration: 0.6 }); active = null; };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerleave", leave);
      cleanupTilt = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
    }

    return () => { clearTimeout(timer); ctx?.revert(); stopSync(); cleanupTilt(); };
  }, [path]);

  return null;
}
