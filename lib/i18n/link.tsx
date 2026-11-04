"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./index";

/**
 * Drop-in replacement for next/link that keeps visitors in their language:
 * `<Link href="/menu">` points to `/menu` on English pages and to `/ar/menu` on Arabic pages.
 * Hash links, external URLs and URL objects pass through unchanged.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { localeHref } = useI18n();
  return <NextLink href={typeof href === "string" ? localeHref(href) : href} {...props} />;
}
