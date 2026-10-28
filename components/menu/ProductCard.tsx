"use client";

import { motion } from "framer-motion";
import { Check, Eye, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Badge, Rating } from "@/components/chrome/ui";
import { addToCart, toggleWish, wishlistStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { Product } from "@/lib/api/types";

export function useQuickAdd(product: Product) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  return {
    done,
    add: () => {
      addToCart(product, product.defaults, 1);
      toast(t("common.added"));
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    },
  };
}

export function WishButton({ id, className = "" }: { id: string; className?: string }) {
  const { t } = useI18n();
  const on = wishlistStore.use().includes(id);
  return (
    <button
      type="button" aria-pressed={on} aria-label={on ? t("menu.unwish") : t("menu.wish")}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast(toggleWish(id) ? t("wish.added") : t("wish.removed")); }}
      className={`icon-btn !h-10 !w-10 ${className}`}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="grid place-items-center">
        <Heart size={18} aria-hidden className={on ? "fill-tomato text-tomato" : ""} />
      </motion.span>
    </button>
  );
}

export function PriceTag({ product }: { product: Product }) {
  const { t, money } = useI18n();
  return (
    <span className="font-extrabold tabular-nums">
      {product.options.length > 0 && <span className="me-1 text-xs font-semibold text-soft">{t("common.from")}</span>}
      {money(product.basePrice)}
    </span>
  );
}

export interface CardProps {
  product: Product;
  variant?: "grid" | "list" | "feature";
  onQuick?: (p: Product) => void;
  layoutId?: string;
}

export function ProductCard({ product, variant = "grid", onQuick }: CardProps) {
  const { t, l } = useI18n();
  const { add, done } = useQuickAdd(product);
  const href = `/product/${product.slug}`;
  const AddBtn = (
    <button type="button" onClick={add} className="btn btn-primary !min-h-11 !px-4" aria-label={`${t("common.add")}: ${l(product.name)}`}>
      {done ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}
      <span className={variant === "grid" ? "max-sm:sr-only" : ""}>{done ? t("common.added") : t("common.add")}</span>
    </button>
  );

  if (variant === "list") {
    return (
      <article className="card flex items-center gap-3 p-3 sm:gap-5 sm:p-4">
        <Link href={href} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-bg2 sm:h-28 sm:w-28" aria-hidden tabIndex={-1}>
          <ProductArt product={product} sizes="112px" className="h-full w-full" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-1.5">{product.badges.slice(0, 2).map((b) => <Badge key={b} kind={b} />)}</div>
          <h3 className="display text-xl leading-tight sm:text-2xl"><Link href={href}>{l(product.name)}</Link></h3>
          <p className="mt-1 line-clamp-2 text-sm text-soft">{l(product.description)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3"><PriceTag product={product} /><Rating value={product.rating} count={product.ratingCount} /></div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <WishButton id={product.id} />
          {AddBtn}
        </div>
      </article>
    );
  }

  const big = variant === "feature";
  return (
    <motion.article layout className={`group card relative flex h-full flex-col overflow-hidden ${big ? "bg-gradient-to-br from-surface to-surface2" : ""}`}>
      <div className="absolute end-3 top-3 z-10 flex flex-col gap-2">
        <WishButton id={product.id} />
        {onQuick && (
          <button type="button" className="icon-btn !h-10 !w-10" aria-label={`${t("common.quick")}: ${l(product.name)}`} onClick={() => onQuick(product)}>
            <Eye size={18} aria-hidden />
          </button>
        )}
      </div>
      <Link href={href} className={`relative block overflow-hidden bg-bg2 ${big ? "aspect-[5/4]" : "aspect-[4/3.4]"}`} aria-label={l(product.name)}>
        <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-1.5">{product.badges.slice(0, 2).map((b) => <Badge key={b} kind={b} />)}</div>
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
          <ProductArt product={product} sizes={big ? "(max-width: 1024px) 90vw, 50vw" : "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"} className="h-full w-full" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className={`display leading-tight ${big ? "text-3xl" : "text-xl sm:text-2xl"}`}><Link href={href}>{l(product.name)}</Link></h3>
        <p className="line-clamp-2 text-sm text-soft">{l(product.description)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col"><PriceTag product={product} /><Rating value={product.rating} count={product.ratingCount} /></div>
          {AddBtn}
        </div>
      </div>
    </motion.article>
  );
}
