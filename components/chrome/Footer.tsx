"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/data/demo/categories";
import { brand } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer() {
  const { t, l } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [bad, setBad] = useState(false);
  return (
    <footer className="mt-24 bg-[#1b1411] text-[#f6ead4]">
      <div className="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="[&_a]:text-[#f6ead4]"><Logo /></div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#cdbba2]">{l(brand.tagline)}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {brand.social.map((s) => (
              <li key={s.id}><a href={s.href} aria-label={s.label} className="chip !border-[#4a3a30] !bg-transparent !text-[#f6ead4]">{s.label}</a></li>
            ))}
          </ul>
        </div>
        <nav aria-label={t("footer.menu")}>
          <h2 className="kicker !text-[#ff9a82]">{t("footer.menu")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}><Link href={`/menu/${c.slug}`} className="hover:underline">{l(c.name)}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("footer.company")}>
          <h2 className="kicker !text-[#ff9a82]">{t("footer.company")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[["/about", "nav.about"], ["/our-story", "nav.story"], ["/ingredients", "nav.ingredients"], ["/locations", "nav.locations"], ["/offers", "nav.offers"], ["/faq", "nav.faq"], ["/contact", "nav.contact"]].map(([h, k]) => (
              <li key={h}><Link href={h} className="hover:underline">{t(k as "nav.about")}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="kicker !text-[#ff9a82]">{t("footer.news")}</h2>
          <form
            noValidate className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); const ok = /^\S+@\S+\.\S+$/.test(email); setBad(!ok); setDone(ok); if (ok) setEmail(""); }}
          >
            <label className="sr-only" htmlFor="news-email">{t("footer.email")}</label>
            <input id="news-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("footer.email")}
              aria-invalid={bad} aria-describedby="news-msg" className="field !border-[#4a3a30] !bg-[#241c18] !text-[#f6ead4]" />
            <button className="btn btn-primary">{t("footer.join")}</button>
          </form>
          <p id="news-msg" role="status" className="mt-2 text-xs text-[#cdbba2]">{done ? t("footer.joined") : bad ? t("v.email") : t("footer.newsHint")}</p>
          <div className="mt-6 text-sm text-[#cdbba2]">
            <h2 className="kicker !text-[#ff9a82]">{t("footer.contact")}</h2>
            <p className="mt-3"><a href={`mailto:${brand.contact.email}`} className="hover:underline">{brand.contact.email}</a></p>
            <p dir="ltr" className="text-start"><a href={`tel:${brand.contact.phone.replace(/\s/g, "")}`} className="hover:underline">{brand.contact.phone}</a></p>
            {brand.contact.placeholder && <p className="mt-1 text-xs opacity-70">{t("footer.placeholder")}</p>}
            {brand.hours && (<><h2 className="kicker mt-4 !text-[#ff9a82]">{t("footer.hours")}</h2><p className="mt-2">{l(brand.hours)}</p></>)}
          </div>
        </div>
      </div>
      <div className="border-t border-[#3a2d25]">
        <div className="wrap flex flex-col items-start justify-between gap-2 py-5 text-xs text-[#cdbba2] sm:flex-row sm:items-center">
          <p>© {brand.name} · {t("footer.rights")}</p>
          <ul className="flex gap-4">
            <li><Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link></li>
            <li><Link href="/terms" className="hover:underline">{t("footer.terms")}</Link></li>
            <li><Link href="/admin" className="hover:underline">{t("admin.title")}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
