"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { createStore } from "@/lib/store";
import { Modal } from "./Modal";

export const searchStore = createStore<boolean>("cc-search-open", false, false);

/** Case-insensitive and tolerant of Arabic diacritics / alef variants. */
export function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا");
}

export function SearchDialog() {
  const open = searchStore.use();
  const { t, l, money } = useI18n();
  const { products } = useCatalog();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const close = () => { searchStore.set(false); setQ(""); setActive(0); };

  const results = useMemo(() => {
    const n = normalizeText(q.trim());
    const list = n
      ? products.filter((p) => normalizeText(p.name.en).includes(n) || normalizeText(p.name.ar).includes(n) || normalizeText(p.description.en).includes(n))
      : [...products].sort((a, b) => b.popularity - a.popularity);
    return list.slice(0, 6);
  }, [q, products]);

  const go = (slug: string) => { close(); router.push(`/product/${slug}`); };

  return (
    <Modal open={open} onClose={close} label={t("nav.search")} hideClose className="!max-w-xl">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Search size={20} aria-hidden className="text-soft" />
        <input
          data-autofocus type="search" role="combobox" aria-expanded="true" aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
          value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder={t("search.placeholder")} aria-label={t("nav.search")}
          className="min-h-11 w-full bg-transparent text-lg font-semibold outline-none placeholder:text-soft"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            if (e.key === "Enter" && results[active]) go(results[active].slug);
          }}
        />
      </div>
      <ul id="search-results" role="listbox" className="max-h-[60dvh] overflow-y-auto p-2">
        {results.length === 0 && <li className="p-6 text-center text-soft">{t("search.empty")}</li>}
        {results.map((p, i) => (
          <li key={p.id} id={`sr-${p.id}`} role="option" aria-selected={i === active}>
            <button type="button" onClick={() => go(p.slug)} onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-3 rounded-2xl p-2 text-start ${i === active ? "bg-bg2" : ""}`}>
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bg2"><ProductArt product={p} sizes="56px" className="h-full w-full" /></span>
              <span className="min-w-0 flex-1 truncate font-bold">{l(p.name)}</span>
              <span className="font-extrabold tabular-nums">{money(p.basePrice)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2 text-xs text-soft">{t("search.hint")}</p>
    </Modal>
  );
}
