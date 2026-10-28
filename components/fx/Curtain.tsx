"use client";

import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/chrome/Logo";
import { getGsap, reducedMotion } from "@/lib/gsap";

/** One-time brand curtain (~1s) on the first visit of a session. A CSS fallback hides it even if JS never runs. */
export function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try { seen = sessionStorage.getItem("cc-curtain") === "1"; sessionStorage.setItem("cc-curtain", "1"); } catch { /* ignore */ }
    if (seen || reducedMotion()) { el.style.display = "none"; return; }
    const { gsap } = getGsap();
    const tl = gsap.timeline({ onComplete: () => { el.style.display = "none"; } });
    tl.from("[data-cmark]", { scale: 0, rotation: -180, duration: 0.6, ease: "back.out(1.6)" })
      .from("[data-cword] span", { yPercent: 110, stagger: 0.06, duration: 0.4, ease: "power3.out" }, 0.2)
      .to(el, { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, 0.95);
    return () => { tl.kill(); };
  }, []);
  return (
    <div ref={root} aria-hidden="true" className="curtain fixed inset-0 z-[300] grid place-items-center bg-[#120c09] text-[#f6ead4]">
      <div className="flex flex-col items-center gap-4">
        <div data-cmark><LogoMark size={72} /></div>
        <p data-cword className="display flex overflow-hidden text-4xl">{"CRUST & CRAVE".split("").map((c, i) => <span key={i} className="inline-block">{c === " " ? " " : c}</span>)}</p>
      </div>
    </div>
  );
}
