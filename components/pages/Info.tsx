"use client";

import { Copy, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Faq } from "@/components/chrome/Accordion";
import { PageHeader } from "@/components/chrome/PageHeader";
import { SampleTag } from "@/components/chrome/ui";
import { categories } from "@/data/demo/categories";
import { branches, ingredients, offers } from "@/data/demo/content";
import { products } from "@/data/demo/products";
import { submitContact } from "@/lib/api/orders";
import { brand } from "@/lib/brand";
import { lastOrderStore } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";

export function OffersPage() {
  const { t, l, locale } = useI18n();
  return (
    <>
      <PageHeader kickerKey="offers.kicker" titleKey="offers.title" crumbs={[{ key: "nav.offers" }]} />
      <div className="wrap grid gap-5 pb-8 md:grid-cols-3">
        {offers.map((o, i) => (
          <article key={o.id} className="card flex flex-col gap-3 p-6" style={{ background: i === 0 ? "var(--tomato)" : undefined, color: i === 0 ? "#fff" : undefined }}>
            <h2 className="display text-3xl">{l(o.title)}</h2>
            <p className={i === 0 ? "" : "text-soft"}>{l(o.body)}</p>
            {o.endsAt && <p className="text-sm font-bold">{t("offers.ends")}: {new Date(o.endsAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}</p>}
            {o.code && (
              <button type="button" className="btn mt-auto self-start border-2 border-current" onClick={async () => { try { await navigator.clipboard.writeText(o.code!); toast(t("common.copied")); } catch { /* ignore */ } }}>
                <Copy size={16} aria-hidden />{t("offers.code")}: <span dir="ltr">{o.code}</span>
              </button>
            )}
          </article>
        ))}
      </div>
      <p className="wrap pb-12 text-sm text-soft">{t("cart.demoNote")}</p>
    </>
  );
}

export function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader kickerKey="nav.about" titleKey="about.title" crumbs={[{ key: "nav.about" }]} />
      <div className="wrap grid gap-8 pb-12 md:grid-cols-2">
        <p className="text-xl leading-relaxed">{t("about.body")}</p>
        <p className="text-xl leading-relaxed text-soft">{t("about.body2")}</p>
        <div className="card p-6"><p className="display text-6xl">{products.length}</p><p className="text-soft">{t("stat.dishes")}</p></div>
        <div className="card p-6"><p className="display text-6xl">{categories.length}</p><p className="text-soft">{t("stat.categories")}</p></div>
      </div>
    </>
  );
}

export function StoryPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader kickerKey="story.kicker" titleKey="story.page.title" subKey="story.body" crumbs={[{ key: "nav.story" }]} />
      <div className="wrap pb-16"><SampleTag /><p className="display mt-4 max-w-4xl text-4xl sm:text-6xl">{t("story.title")}</p></div>
    </>
  );
}

export function IngredientsPage() {
  const { l } = useI18n();
  return (
    <>
      <PageHeader kickerKey="ing.kicker" titleKey="ing.page.title" crumbs={[{ key: "nav.ingredients" }]} />
      <ul className="wrap grid gap-5 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((i) => (
          <li key={i.id} className="card flex items-center gap-4 p-5">
            <span className="h-16 w-16 shrink-0 rounded-full border-4 border-bg2" style={{ background: i.color }} aria-hidden />
            <div><h2 className="display text-2xl">{l(i.name)}</h2><p className="text-soft">{l(i.note)}</p></div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeader titleKey="contact.title" crumbs={[{ key: "nav.contact" }]} />
      <div className="wrap grid gap-8 pb-12 md:grid-cols-[1fr_20rem]">
        <form noValidate className="card space-y-4 p-6" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name") ?? "").trim(), email = String(f.get("email") ?? "").trim(), message = String(f.get("message") ?? "").trim();
          const next: Record<string, string> = {};
          if (name.length < 2) next.name = t("v.name");
          if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t("v.email");
          if (message.length < 5) next.message = t("v.message");
          setErrs(next);
          if (Object.keys(next).length) return;
          setBusy(true);
          await submitContact({ name, email, message });
          setBusy(false);
          setSent(true);
          (e.target as HTMLFormElement).reset();
        }}>
          {[["name", "contact.name", "text"], ["email", "contact.email", "email"]].map(([id, k, type]) => (
            <div key={id}>
              <label htmlFor={`c-${id}`} className="mb-1 block text-sm font-bold">{t(k as "contact.name")}</label>
              <input id={`c-${id}`} name={id} type={type} dir={id === "email" ? "ltr" : undefined} className="field text-start" aria-invalid={!!errs[id]} aria-describedby={errs[id] ? `ce-${id}` : undefined} />
              {errs[id] && <p id={`ce-${id}`} className="mt-1 text-xs font-bold text-tomatotext">{errs[id]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="c-message" className="mb-1 block text-sm font-bold">{t("contact.message")}</label>
            <textarea id="c-message" name="message" rows={5} className="field" aria-invalid={!!errs.message} aria-describedby={errs.message ? "ce-message" : undefined} />
            {errs.message && <p id="ce-message" className="mt-1 text-xs font-bold text-tomatotext">{errs.message}</p>}
          </div>
          <button className="btn btn-primary" disabled={busy}>{t("contact.send")}</button>
          {sent && <p role="status" className="font-bold text-basiltext">{t("contact.sent")}</p>}
        </form>
        <aside className="card h-fit p-6">
          <h2 className="display text-2xl">{t("contact.details")}</h2>
          <p className="mt-3"><a href={`mailto:${brand.contact.email}`} className="font-bold hover:underline">{brand.contact.email}</a></p>
          <p dir="ltr" className="text-start"><a href={`tel:${brand.contact.phone.replace(/\s/g, "")}`} className="font-bold hover:underline">{brand.contact.phone}</a></p>
        </aside>
      </div>
    </>
  );
}

export function LocationsPage() {
  const { t, l } = useI18n();
  return (
    <>
      <PageHeader kickerKey="loc.kicker" titleKey="loc.title" subKey="loc.note" crumbs={[{ key: "nav.locations" }]} />
      <ul className="wrap grid gap-5 pb-12 md:grid-cols-2">
        {branches.map((b) => (
          <li key={b.id} className="card p-6">
            <div className="flex items-center gap-2"><MapPin size={20} aria-hidden className="text-tomatotext" /><h2 className="display text-3xl">{l(b.name)}</h2></div>
            <p className="mt-2 text-soft">{b.address ? l(b.address) : l(b.area)}</p>
            {b.sample && <p className="mt-3"><SampleTag /> <span className="ms-1 text-xs text-soft">{t("loc.sample")}</span></p>}
            {b.hours && <p className="mt-2 text-sm">{l(b.hours)}</p>}
            {b.mapUrl ? <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-4">{t("loc.map")}</a> : <p className="mt-4 text-sm text-soft">{t("common.soon")}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}

export function FaqPage() {
  return (
    <>
      <PageHeader kickerKey="faq.kicker" titleKey="faq.title" crumbs={[{ key: "nav.faq" }]} />
      <div className="wrap max-w-4xl pb-12"><Faq /></div>
    </>
  );
}

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useI18n();
  return (
    <>
      <PageHeader titleKey={`${kind}.title` as const} crumbs={[{ key: `footer.${kind}` as const }]} />
      <div className="wrap max-w-3xl pb-16 text-lg leading-relaxed">
        <p className="rounded-2xl bg-gold/20 p-4 text-sm font-bold">{t("legal.updated")}</p>
        <p className="mt-6">{t(`${kind}.body` as const)}</p>
      </div>
    </>
  );
}

export function NotFoundView() {
  const { t } = useI18n();
  return (
    <div className="wrap grid min-h-[60dvh] place-items-center py-20 text-center">
      <div>
        <p className="display text-[clamp(6rem,24vw,14rem)] text-tomatotext">404</p>
        <h1 className="display text-4xl">{t("nf.title")}</h1>
        <p className="mt-2 text-soft">{t("nf.body")}</p>
        <Link href="/menu" className="btn btn-primary mt-8">{t("cart.browse")}</Link>
      </div>
    </div>
  );
}

export function ErrorView({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="wrap grid min-h-[60dvh] place-items-center py-20 text-center" role="alert">
      <div>
        <h1 className="display text-5xl">{t("err.title")}</h1>
        <p className="mt-2 text-soft">{t("err.body")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button className="btn btn-primary" onClick={reset}>{t("common.retry")}</button>
          <Link href="/" className="btn btn-ghost">{t("nav.home")}</Link>
        </div>
      </div>
    </div>
  );
}

function AdminTable({ title, head, rows }: { title: string; head: string[]; rows: (string | number)[][] }) {
  const { t } = useI18n();
  return (
    <section className="card overflow-hidden"><h2 className="display border-b border-line px-5 py-4 text-2xl">{title} <span className="text-sm font-semibold text-soft">· {t("admin.readOnly")}</span></h2>
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full text-start text-sm"><thead><tr>{head.map((h) => <th key={h} className="px-5 py-2 text-start text-xs uppercase tracking-wider text-soft">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="px-5 py-2.5">{c}</td>)}</tr>)}</tbody></table>
      </div></section>
  );
}

export function AdminPage() {
  const { t, l, money } = useI18n();
  const order = lastOrderStore.use();
  return (
    <>
      <PageHeader titleKey="admin.title" />
      <div className="wrap space-y-6 pb-16">
        <p role="alert" className="rounded-2xl border-2 border-tomato bg-tomato/10 p-4 font-bold">{t("admin.warn")}</p>
        <AdminTable title={t("admin.products")} head={["ID", "Name", "Category", "Base"]} rows={products.map((p) => [p.id, l(p.name), p.category, money(p.basePrice)])} />
        <AdminTable title={t("admin.categories")} head={["ID", "Name", "Order"]} rows={categories.map((c) => [c.id, l(c.name), c.order])} />
        <AdminTable title={t("admin.ingredients")} head={["ID", "Name"]} rows={ingredients.map((i) => [i.id, l(i.name)])} />
        <AdminTable title={t("admin.options")} head={["Group", "Kind", "Choices"]} rows={products.find((p) => p.id === "margherita")!.options.map((g) => [g.id, g.kind, g.choices.map((c) => c.id).join(", ")])} />
        <AdminTable title={t("admin.offers")} head={["ID", "Title", "Code"]} rows={offers.map((o) => [o.id, l(o.title), o.code ?? "—"])} />
        <AdminTable title={t("admin.orders")} head={["ID", "Total"]} rows={order ? [[order.id, money(order.totals.total)]] : []} />
        {!order && <p className="text-sm text-soft">{t("admin.noOrders")}</p>}
        <AdminTable title={t("admin.settings")} head={["Key", "Value"]} rows={[["name", brand.name], ["currency", brand.currency], ["deliveryFee", brand.deliveryFee], ["freeDeliveryOver", brand.freeDeliveryOver]]} />
      </div>
    </>
  );
}
