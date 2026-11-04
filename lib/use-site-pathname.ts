"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/paths";

/**
 * Language-neutral pathname (`/ar/menu` and `/menu` both → `/menu`).
 * English URLs are rewritten by proxy.ts from `/menu` to the internal `/en/menu`, so the prerendered
 * HTML sees the rewritten path while the browser sees the public one; stripping the `/en` segment
 * makes both sides agree (see the usePathname docs on rewrites). Arabic URLs carry `/ar` publicly.
 */
export function useSitePathname() {
  return stripLocale(usePathname().replace(/^\/en(?=\/|$)/, "") || "/").path;
}
