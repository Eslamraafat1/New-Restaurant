"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { ProductArt } from "@/components/art/ProductArt";
import { QtyStepper } from "@/components/chrome/ui";
import { removeLine, setQty } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { describeConfig } from "@/lib/describe";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { CartLine } from "@/lib/api/types";

export function CartLines({ lines, onNavigate, compact }: { lines: CartLine[]; onNavigate?: () => void; compact?: boolean }) {
  const { t, l, money } = useI18n();
  const { byId } = useCatalog();
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => {
        const product = byId(line.productId);
        if (!product) return null;
        const bits = describeConfig(product, line.config, l);
        return (
          <li key={line.key} className="flex gap-3 py-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-bg2">
              <ProductArt product={product} config={line.config} sizes="80px" className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/product/${product.slug}`} onClick={onNavigate} className="font-extrabold leading-tight hover:text-tomatotext">{l(product.name)}</Link>
                <span className="font-extrabold tabular-nums">{money(line.unitPrice * line.qty)}</span>
              </div>
              {bits.length > 0 && !compact && <p className="mt-1 text-xs leading-relaxed text-soft">{bits.join(" · ")}</p>}
              {line.note && <p className="mt-1 text-xs italic text-soft">“{line.note}”</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <QtyStepper value={line.qty} onChange={(n) => setQty(line.key, n)} label={`${t("common.qty")} – ${l(product.name)}`} />
                <span className="text-xs text-soft tabular-nums">{money(line.unitPrice)}</span>
                <span className="flex-1" />
                {product.options.length > 0 && (
                  <Link href={`/product/${product.slug}?edit=${encodeURIComponent(line.key)}`} onClick={onNavigate} className="icon-btn !h-10 !w-10" aria-label={`${t("common.edit")} ${l(product.name)}`}>
                    <Pencil size={16} aria-hidden />
                  </Link>
                )}
                <button type="button" className="icon-btn !h-10 !w-10" aria-label={`${t("common.remove")} ${l(product.name)}`} onClick={() => { removeLine(line.key); toast(t("cart.removed")); }}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
