"use client";

import { useEffect, useRef } from "react";
import { getGsap, reducedMotion } from "@/lib/gsap";

/** A soft follower ring that grows over interactive elements. Desktop / fine pointers only; the native cursor stays. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const { gsap } = getGsap();
    const d = dot.current!, r = ring.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08 }), dy = gsap.quickTo(d, "y", { duration: 0.08 });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) { shown = true; gsap.to([d, r], { opacity: 1, duration: 0.3 }); }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const hot = (e.target as HTMLElement).closest("a, button, label, [data-tilt], input, select, textarea, [role=tab]");
      gsap.to(r, { scale: hot ? 1.9 : 1, backgroundColor: hot ? "rgba(255,178,30,.25)" : "rgba(255,178,30,0)", duration: 0.3, overwrite: "auto" });
      gsap.to(d, { scale: hot ? 0.4 : 1, duration: 0.2, overwrite: "auto" });
    };
    const out = () => gsap.to([d, r], { opacity: 0, duration: 0.2 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", out);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", out); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed start-0 top-0 z-[150] hidden md:block">
      <div ref={ring} className="absolute h-10 w-10 rounded-full border-2 border-gold" />
      <div ref={dot} className="absolute h-2 w-2 rounded-full bg-tomato" />
    </div>
  );
}
