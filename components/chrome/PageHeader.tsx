"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import type { Key } from "@/lib/i18n/dictionary";

export interface Crumb { label?: string; key?: Key; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-soft">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/" className="font-semibold hover:text-tomatotext">{t("p.crumbHome")}</Link></li>
        {items.map((c, i) => {
          const label = c.key ? t(c.key) : c.label;
          return (
            <li key={i} className="flex items-center gap-1">
              <ChevronRight size={14} aria-hidden className="rtl:rotate-180" />
              {c.href ? <Link href={c.href} className="font-semibold hover:text-tomatotext">{label}</Link> : <span aria-current="page" className="font-bold text-ink">{label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({ kickerKey, titleKey, title, subKey, crumbs, children }: { kickerKey?: Key; titleKey?: Key; title?: string; subKey?: Key; crumbs?: Crumb[]; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="wrap pb-8 pt-8 sm:pt-12">
      {crumbs && <Breadcrumbs items={crumbs} />}
      {kickerKey && <p className="kicker mt-5">{t(kickerKey)}</p>}
      <h1 className="display mt-2 text-[clamp(2.6rem,9vw,6.5rem)]">{titleKey ? t(titleKey) : title}</h1>
      {subKey && <p className="mt-4 max-w-2xl text-lg text-soft">{t(subKey)}</p>}
      {children}
    </div>
  );
}
