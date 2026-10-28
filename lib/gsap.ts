"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Keep ScrollTrigger in step with Lenis (if smooth scrolling is active). Returns a cleanup function. */
export function syncLenis(): () => void {
  const lenis = (window as unknown as { __lenis?: { on(e: string, f: () => void): void; off(e: string, f: () => void): void } }).__lenis;
  if (!lenis) return () => {};
  const update = () => ScrollTrigger.update();
  lenis.on("scroll", update);
  return () => lenis.off("scroll", update);
}

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
