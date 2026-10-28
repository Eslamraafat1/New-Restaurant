"use client";

import { Star } from "lucide-react";
import type { Badge as BadgeType } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n";

const BADGE_STYLE: Record<BadgeType, string> = {
  bestseller: "bg-gold text-[#2a1a08]",
  new: "bg-basil text-white",
  signature: "bg-tomato text-white",
  spicy: "bg-[#8e1d0d] text-white",
  vegetarian: "bg-basil text-white",
  seasonal: "bg-[#7a4a1a] text-white",
};

export function Badge({ kind }: { kind: BadgeType }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider ${BADGE_STYLE[kind]}`}>
      {t(`badge.${kind}` as const)}
    </span>
  );
}

export function Rating({ value, count }: { value?: number; count?: number }) {
  const { num } = useI18n();
  if (value === undefined) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label={`${value} / 5`}>
      <Star size={15} className="fill-gold text-gold" aria-hidden />
      {num(value)}
      {count !== undefined && <span className="font-medium text-soft">({num(count)})</span>}
    </span>
  );
}

/** Marks sample / placeholder content so it can never be mistaken for real data. */
export function SampleTag() {
  const { t } = useI18n();
  return <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-soft">{t("common.sample")}</span>;
}

export function QtyStepper({ value, onChange, min = 1, max = 99, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  const { t, num } = useI18n();
  return (
    <div role="group" aria-label={label ?? t("common.qty")} className="inline-flex items-center rounded-full border-[1.5px] border-line bg-surface">
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-lg font-black disabled:opacity-40" aria-label={t("common.dec")} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output className="min-w-8 text-center font-extrabold tabular-nums" aria-live="polite">{num(value)}</output>
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-lg font-black disabled:opacity-40" aria-label={t("common.inc")} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
