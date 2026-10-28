"use client";

import { ShoppingBag, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CartLines } from "@/components/chrome/CartLines";
import { Modal } from "@/components/chrome/Modal";
import { brand } from "@/lib/brand";
import { cartStore, clearCart, couponStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { calcTotals } from "@/lib/pricing";
import { toast } from "@/lib/toast";
import type { OrderTotals } from "@/lib/api/types";

export function TotalsBox({ totals, delivery }: { totals: OrderTotals; delivery: boolean }) {
  const { t, money } = useI18n();
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="flex justify-between text-basiltext"><dt>{t("cart.discount")}</dt><dd className="tabular-nums">−{money(totals.discount)}</dd></div>}
      {brand.deliveryFee > 0 && (
        <div className="flex justify-between"><dt>{t("cart.delivery")}</dt><dd className="tabular-nums">{delivery ? (totals.delivery === 0 ? t("cart.free") : money(totals.delivery)) : "—"}</dd></div>
      )}
      <div className="flex justify-between border-t border-line pt-3 text-xl font-extrabold"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(totals.total)}</dd></div>
    </dl>
  );
}

export function CouponBox() {
  const { t } = useI18n();
  const applied = couponStore.use();
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState<"ok" | "bad" | null>(null);
  const apply = () => {
    const code = val.trim().toUpperCase();
    if (code && brand.coupons[code]) { couponStore.set(code); setMsg("ok"); setVal(""); }
    else setMsg("bad");
  };
  return (
    <div>
      <label htmlFor="coupon" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold"><Tag size={15} aria-hidden />{t("cart.coupon")}</label>
      <div className="flex gap-2">
        <input id="coupon" className="field" value={val} onChange={(e) => { setVal(e.target.value); setMsg(null); }} aria-invalid={msg === "bad"} aria-describedby="coupon-msg"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }} placeholder={applied || "CRAVE10"} />
        <button type="button" className="btn btn-ghost" onClick={apply}>{t("cart.apply")}</button>
      </div>
      <p id="coupon-msg" role="status" className={`mt-1.5 text-xs font-bold ${msg === "bad" ? "text-tomatotext" : "text-basiltext"}`}>
        {msg === "bad" ? t("cart.couponBad") : msg === "ok" || applied ? `${t("cart.couponOk")}: ${applied}` : ""}
      </p>
    </div>
  );
}

export function CartView() {
  const { t, money } = useI18n();
  const lines = cartStore.use();
  const coupon = couponStore.use();
  const [confirm, setConfirm] = useState(false);
  const totals = calcTotals(lines, { delivery: false, coupon });

  if (lines.length === 0) {
    return (
      <div className="wrap grid place-items-center py-24 text-center">
        <div>
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-bg2"><ShoppingBag size={40} aria-hidden /></span>
          <h1 className="display mt-6 text-5xl">{t("cart.empty")}</h1>
          <p className="mt-2 text-soft">{t("cart.emptySub")}</p>
          <Link href="/menu" className="btn btn-primary mt-8">{t("cart.browse")}</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="wrap py-10">
      <div className="flex items-end justify-between gap-4">
        <h1 className="display text-5xl sm:text-7xl">{t("cart.title")}</h1>
        <button type="button" className="btn btn-ghost !min-h-10" onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden />{t("cart.clear")}</button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="card px-5"><CartLines lines={lines} /></div>
        <aside className="card h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <CouponBox />
          <TotalsBox totals={totals} delivery={false} />
          {brand.deliveryFee > 0 && <p className="text-xs text-soft">{t("cart.deliveryHint")}{brand.freeDeliveryOver > 0 && ` ${t("cart.freeAt")} ${money(brand.freeDeliveryOver)}.`}</p>}
          <Link href="/checkout" className="btn btn-primary w-full">{t("cart.checkout")}</Link>
          <p className="text-xs text-soft">{t("cart.demoNote")}</p>
        </aside>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} label={t("cart.clear")} className="!w-[min(100%,26rem)]">
        <div className="p-6 pt-14 text-center">
          <p className="display text-3xl">{t("cart.clearAsk")}</p>
          <div className="mt-6 flex gap-2">
            <button className="btn btn-ghost flex-1" data-autofocus onClick={() => setConfirm(false)}>{t("common.cancel")}</button>
            <button className="btn btn-primary flex-1" onClick={() => { clearCart(); setConfirm(false); toast(t("cart.removed")); }}>{t("common.confirm")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
