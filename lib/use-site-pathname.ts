"use client";

import { usePathname } from "next/navigation";

/**
 * Public pathname without the internal locale segment.
 * proxy.ts rewrites `/menu` to `/en/menu` (or `/ar/menu`), so the prerendered HTML sees the
 * rewritten path while the browser sees the public one. Stripping the prefix makes both sides
 * agree and avoids hydration mismatches (see the usePathname docs on rewrites).
 */
export function useSitePathname() {
  return usePathname().replace(/^\/(?:en|ar)(?=\/|$)/, "") || "/";
}
