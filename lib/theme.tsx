"use client";

import { useEffect } from "react";
import { createStore } from "@/lib/store";

export type ThemePref = "system" | "light" | "dark";
export const themeStore = createStore<ThemePref>("cc-theme", "system");

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const pref = themeStore.use();
  return {
    pref,
    set: (v: ThemePref) => themeStore.set(v),
    toggle: () => {
      const current = typeof window === "undefined" ? "light" : resolve(pref);
      themeStore.set(current === "dark" ? "light" : "dark");
    },
  };
}

export function ThemeSync() {
  const pref = themeStore.use();
  useEffect(() => {
    const root = document.documentElement;
    if (pref === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", pref);
  }, [pref]);
  return null;
}

/** Runs before first paint (inline in <head>) so there is no theme / direction flash. */
export const preHydrationScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=JSON.parse(localStorage.getItem('cc-theme')||'"system"');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);var l=JSON.parse(localStorage.getItem('cc-lang')||'"en"');if(l==='ar'){d.lang='ar';d.dir='rtl';}}catch(e){}})();`;
