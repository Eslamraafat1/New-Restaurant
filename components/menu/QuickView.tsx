"use client";

import Link from "next/link";
import { ProductArt } from "@/components/art/ProductArt";
import { Badge, Rating } from "@/components/chrome/ui";
import { Modal } from "@/components/chrome/Modal";
import { useI18n } from "@/lib/i18n";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/api/types";
import { PriceTag, WishButton, useQuickAdd } from "./ProductCard";

function Body({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, l } = useI18n();
  const { add, done } = useQuickAdd(product);
  return (
    <div className="grid max-h-[92dvh] overflow-y-auto md:grid-cols-2" data-lenis-prevent>
      <div className="grid place-items-center bg-bg2 p-8">
        <div className="aspect-square w-full max-w-sm"><ProductArt product={product} live className="h-full w-full drop-shadow-2xl" /></div>
      </div>
      <div className="flex flex-col gap-3 p-6 pt-14 md:pt-8">
        <div className="flex flex-wrap gap-1.5">{product.badges.map((b) => <Badge key={b} kind={b} />)}</div>
        <h2 className="display text-4xl">{l(product.name)}</h2>
        <p className="text-soft">{l(product.description)}</p>
        <Rating value={product.rating} count={product.ratingCount} />
        <p className="text-sm"><strong>{t("p.ingredients")}:</strong> {product.ingredients.map((i) => l(i)).join(", ")}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
          <span className="text-2xl"><PriceTag product={product} /></span>
          <WishButton id={product.id} />
          <button type="button" className="btn btn-primary" onClick={add}>{done ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}{done ? t("common.added") : t("common.add")}</button>
          <Link href={`/product/${product.slug}`} onClick={onClose} className="btn btn-ghost">{product.options.length ? t("sig.cta") : t("common.view")}</Link>
        </div>
      </div>
    </div>
  );
}

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { l, t } = useI18n();
  return (
    <Modal open={!!product} onClose={onClose} label={product ? `${t("common.quick")}: ${l(product.name)}` : t("common.quick")}>
      {product && <Body product={product} onClose={onClose} />}
    </Modal>
  );
}
