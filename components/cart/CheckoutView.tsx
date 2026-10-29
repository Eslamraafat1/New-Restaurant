"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CartLines } from "@/components/chrome/CartLines";
import { apiConfig } from "@/lib/api/config";
import { submitOrder } from "@/lib/api/orders";
import { useCatalog } from "@/lib/catalog";
import { cartStore, clearCart, couponStore, lastOrderStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { calcTotals } from "@/lib/pricing";
import type { Key } from "@/lib/i18n/dictionary";
import type { FulfilmentType, PaymentMethod } from "@/lib/api/types";
import { CouponBox, TotalsBox } from "./CartView";

type Errors = Partial<Record<"name" | "phone" | "email" | "address" | "branch", Key>>;

export function CheckoutView() {
  const { t, l } = useI18n();
  const { branches } = useCatalog();
  const router = useRouter();
  const lines = cartStore.use();
  const coupon = couponStore.use();
  const [fulfilment, setFulfilment] = useState<FulfilmentType>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const totals = calcTotals(lines, { delivery: fulfilment === "delivery", coupon });

  if (lines.length === 0) {
    return (
      <div className="wrap py-24 text-center">
        <p className="display text-4xl">{t("co.emptyCart")}</p>
        <Link href="/menu" className="btn btn-primary mt-6">{t("cart.browse")}</Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Errors = {};
    if (v("name").length < 2) next.name = "v.name";
    if (!/^\+?[\d\s-]{8,16}$/.test(v("phone"))) next.phone = "v.phone";
    if (v("email") && !/^\S+@\S+\.\S+$/.test(v("email"))) next.email = "v.email";
    if (fulfilment === "delivery" && v("address").length < 5) next.address = "v.address";
    if (fulfilment === "pickup" && !v("branch")) next.branch = "v.branch";
    setErrors(next);
    setFailed(false);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    try {
      const res = await submitOrder({
        lines, fulfilment, payment, coupon: coupon || undefined,
        customer: { name: v("name"), phone: v("phone"), email: v("email") || undefined },
        address: fulfilment === "delivery" ? v("address") : undefined,
        branchId: fulfilment === "pickup" ? v("branch") : undefined,
        notes: v("notes") || undefined,
      });
      // success is only reached after the (demo or live) service accepted the order
      lastOrderStore.set(res);
      clearCart();
      router.push("/order");
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const err = (k: keyof Errors) => errors[k] && <p id={`e-${k}`} className="mt-1 text-xs font-bold text-tomatotext">{t(errors[k]!)}</p>;
  const inv = (k: keyof Errors) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  return (
    <div className="wrap py-10">
      <h1 className="display text-5xl sm:text-7xl">{t("co.title")}</h1>
      {apiConfig.useDemo && (
        <p role="note" className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-gold bg-gold/15 p-4 text-sm font-bold">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" aria-hidden />{t("co.demoBanner")}
        </p>
      )}
      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-8">
          <fieldset className="card space-y-4 p-5">
            <legend className="display float-start mb-3 text-2xl">{t("co.details")}</legend>
            <div className="clear-both grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label htmlFor="name" className="mb-1 block text-sm font-bold">{t("co.name")}</label><input id="name" name="name" autoComplete="name" className="field" {...inv("name")} />{err("name")}</div>
              <div><label htmlFor="phone" className="mb-1 block text-sm font-bold">{t("co.phone")}</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" className="field text-start" {...inv("phone")} />{err("phone")}</div>
              <div><label htmlFor="email" className="mb-1 block text-sm font-bold">{t("co.email")}</label><input id="email" name="email" type="email" autoComplete="email" dir="ltr" className="field text-start" {...inv("email")} />{err("email")}</div>
            </div>
          </fieldset>

          <fieldset className="card space-y-4 p-5">
            <legend className="display float-start mb-3 text-2xl">{t("co.how")}</legend>
            <div className="clear-both grid grid-cols-2 gap-2">
              {(["delivery", "pickup"] as const).map((o) => (
                <label key={o} className="cursor-pointer">
                  <input type="radio" name="fulfilment" className="peer sr-only" checked={fulfilment === o} onChange={() => setFulfilment(o)} />
                  <span className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-line font-extrabold peer-checked:border-tomato peer-checked:bg-tomato/10 peer-checked:text-tomatotext peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-gold">{t(`co.${o}` as const)}</span>
                </label>
              ))}
            </div>
            {fulfilment === "delivery" ? (
              <div><label htmlFor="address" className="mb-1 block text-sm font-bold">{t("co.address")}</label><textarea id="address" name="address" rows={3} autoComplete="street-address" className="field" {...inv("address")} />{err("address")}</div>
            ) : (
              <div><label htmlFor="branch" className="mb-1 block text-sm font-bold">{t("co.branch")}</label>
                <select id="branch" name="branch" className="field" defaultValue="" {...inv("branch")}>
                  <option value="" disabled>—</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{l(b.name)}{b.sample ? ` (${t("common.sample")})` : ""}</option>)}
                </select>{err("branch")}</div>
            )}
            <div><label htmlFor="notes" className="mb-1 block text-sm font-bold">{t("co.notes")}</label><textarea id="notes" name="notes" rows={2} maxLength={300} className="field" /></div>
          </fieldset>

          <fieldset className="card space-y-3 p-5">
            <legend className="display float-start mb-3 text-2xl">{t("co.payment")}</legend>
            <div className="clear-both grid gap-2 sm:grid-cols-2">
              {(["cash", "card-demo"] as const).map((o) => (
                <label key={o} className="cursor-pointer">
                  <input type="radio" name="payment" className="peer sr-only" checked={payment === o} onChange={() => setPayment(o)} />
                  <span className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-line px-3 text-center font-bold peer-checked:border-tomato peer-checked:bg-tomato/10 peer-checked:text-tomatotext peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-gold">{o === "cash" ? t("co.cash") : t("co.card")}</span>
                </label>
              ))}
            </div>
            {payment === "card-demo" && <p className="text-sm text-soft">{t("co.cardNote")}</p>}
          </fieldset>
        </div>

        <aside className="card h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <h2 className="display text-2xl">{t("co.summary")}</h2>
          <div className="max-h-72 overflow-y-auto" data-lenis-prevent><CartLines lines={lines} compact /></div>
          <CouponBox />
          <TotalsBox totals={totals} delivery={fulfilment === "delivery"} />
          {failed && <p role="alert" className="rounded-xl bg-tomato/10 p-3 text-sm font-bold text-tomatotext">{t("co.error")}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy && <Loader2 size={18} className="animate-spin" aria-hidden />}{busy ? t("co.placing") : apiConfig.useDemo ? t("co.place") : t("co.placeLive")}
          </button>
        </aside>
      </form>
    </div>
  );
}
