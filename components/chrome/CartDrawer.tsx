"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cartStore, cartUiStore, couponStore, drawer } from "@/lib/cart";
import { calcTotals } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";
import { CartLines } from "./CartLines";
import { Modal } from "./Modal";

export function CartDrawer() {
  const { t, money, num } = useI18n();
  const open = cartUiStore.use();
  const lines = cartStore.use();
  const coupon = couponStore.use();
  const totals = calcTotals(lines, { delivery: false, coupon });
  return (
    <Modal open={open} onClose={drawer.close} label={t("cart.title")} side="end">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <ShoppingBag size={20} aria-hidden />
        <h2 className="display text-2xl">{t("cart.title")}</h2>
        <span className="text-sm text-soft">({num(lines.reduce((s, l) => s + l.qty, 0))})</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
        {lines.length === 0 ? (
          <div className="grid h-full place-items-center py-12 text-center">
            <div>
              <p className="display text-3xl">{t("cart.empty")}</p>
              <p className="mt-2 text-soft">{t("cart.emptySub")}</p>
              <Link href="/menu" onClick={drawer.close} className="btn btn-primary mt-6">{t("cart.browse")}</Link>
            </div>
          </div>
        ) : (
          <CartLines lines={lines} onNavigate={drawer.close} compact />
        )}
      </div>
      {lines.length > 0 && (
        <div className="safe-b space-y-3 border-t border-line bg-surface px-5 pt-4">
          <div className="flex justify-between text-lg font-extrabold"><span>{t("cart.subtotal")}</span><span className="tabular-nums">{money(totals.subtotal)}</span></div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/cart" onClick={drawer.close} className="btn btn-ghost">{t("cart.view")}</Link>
            <Link href="/checkout" onClick={drawer.close} className="btn btn-primary">{t("cart.checkout")}</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
