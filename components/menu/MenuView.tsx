"use client";

import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/chrome/Modal";
import { normalizeText } from "@/components/chrome/SearchDialog";
import { wishlistStore } from "@/lib/cart";
import { reloadCatalog, useCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { CategoryId, DietaryTag, Product } from "@/lib/api/types";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./QuickView";

type Sort = "popular" | "low" | "high";
const DIET: DietaryTag[] = ["vegetarian", "vegan", "spicy"];

function Skeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-80" />)}
    </div>
  );
}

function Filters({
  q, setQ, sort, setSort, diet, setDiet, saved, setSaved,
}: {
  q: string; setQ: (v: string) => void; sort: Sort; setSort: (v: Sort) => void;
  diet: DietaryTag[]; setDiet: (v: DietaryTag[]) => void; saved: boolean; setSaved: (v: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="menu-q" className="sr-only">{t("menu.search")}</label>
        <Search size={18} aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-soft" />
        <input id="menu-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("menu.search")} className="field !ps-11" />
      </div>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">{t("menu.dietary")}</legend>
        {DIET.map((d) => (
          <button key={d} type="button" className="chip" aria-pressed={diet.includes(d)} onClick={() => setDiet(diet.includes(d) ? diet.filter((x) => x !== d) : [...diet, d])}>
            {t(`tag.${d}` as const)}
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={saved} onClick={() => setSaved(!saved)}>♥ {t("nav.wishlist")}</button>
      </fieldset>
      <div>
        <label htmlFor="menu-sort" className="sr-only">{t("menu.sort")}</label>
        <select id="menu-sort" className="field !w-auto" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="popular">{t("menu.sort.popular")}</option>
          <option value="low">{t("menu.sort.low")}</option>
          <option value="high">{t("menu.sort.high")}</option>
        </select>
      </div>
    </div>
  );
}

const GRID_BY_CAT: Partial<Record<CategoryId, string>> = {
  pizza: "sm:grid-cols-2 lg:grid-cols-3",
  crepes: "sm:grid-cols-2",
  burgers: "sm:grid-cols-2 lg:grid-cols-4",
  desserts: "sm:grid-cols-2 lg:grid-cols-3",
};

export function MenuView({ only }: { only?: CategoryId }) {
  const { t, l } = useI18n();
  const { products, categories, status } = useCatalog();
  const wishlist = wishlistStore.use();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [diet, setDiet] = useState<DietaryTag[]>([]);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [active, setActive] = useState<string>("");

  const filtered = useMemo(() => {
    const n = normalizeText(q.trim());
    const list = products.filter((p) => {
      if (only && p.category !== only) return false;
      if (n && !normalizeText(p.name.en).includes(n) && !normalizeText(p.name.ar).includes(n)) return false;
      if (diet.length && !diet.every((d) => p.tags.includes(d))) return false;
      if (saved && !wishlist.includes(p.id)) return false;
      return true;
    });
    const by = { popular: (a: Product, b: Product) => b.popularity - a.popularity, low: (a: Product, b: Product) => a.basePrice - b.basePrice, high: (a: Product, b: Product) => b.basePrice - a.basePrice }[sort];
    return [...list].sort(by);
  }, [products, only, q, diet, saved, wishlist, sort]);

  const groups = useMemo(
    () => categories.filter((c) => !only || c.id === only).sort((a, b) => a.order - b.order).map((c) => ({ c, items: filtered.filter((p) => p.category === c.id) })).filter((g) => g.items.length),
    [categories, filtered, only],
  );

  useEffect(() => {
    if (only || !groups.length) return;
    const els = groups.map((g) => document.getElementById(`cat-${g.c.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id.replace("cat-", ""));
    }, { rootMargin: "-130px 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [groups, only]);

  const activeFilters = (q ? 1 : 0) + diet.length + (saved ? 1 : 0);
  const clear = () => { setQ(""); setDiet([]); setSaved(false); };
  const filterProps = { q, setQ, sort, setSort, diet, setDiet, saved, setSaved };

  return (
    <div>
      {/* sticky category rail + tools */}
      <div className="sticky top-[4.25rem] z-30 border-y border-line bg-bg/92 backdrop-blur-md">
        <div className="wrap flex items-center gap-2 py-2">
          {!only && (
            <nav aria-label={t("menu.title")} className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
              {categories.filter((c) => groups.some((g) => g.c.id === c.id)).map((c) => (
                <a key={c.id} href={`#cat-${c.id}`} aria-current={active === c.id ? "true" : undefined} data-on={active === c.id}
                  className="chip shrink-0 no-underline">{l(c.name)}</a>
              ))}
            </nav>
          )}
          {only && <p className="flex-1 text-sm font-bold text-soft">{groups.reduce((s, g) => s + g.items.length, 0)} {t("menu.results")}</p>}
          <div role="group" aria-label={t("menu.grid")} className="hidden gap-1 sm:flex">
            <button type="button" className="icon-btn" aria-pressed={view === "grid"} aria-label={t("menu.grid")} onClick={() => setView("grid")}><LayoutGrid size={18} aria-hidden /></button>
            <button type="button" className="icon-btn" aria-pressed={view === "list"} aria-label={t("menu.list")} onClick={() => setView("list")}><List size={18} aria-hidden /></button>
          </div>
          <button type="button" className="icon-btn relative lg:hidden" aria-label={t("menu.filters")} aria-haspopup="dialog" onClick={() => setDrawer(true)}>
            <SlidersHorizontal size={18} aria-hidden />
            {activeFilters > 0 && <span className="absolute -end-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-tomato text-[0.65rem] font-black text-white">{activeFilters}</span>}
          </button>
        </div>
        <div className="wrap hidden pb-3 lg:block"><Filters {...filterProps} /></div>
      </div>

      <div className="wrap py-10">
        {status === "loading" && <Skeletons />}
        {status === "error" && (
          <div role="alert" className="card p-10 text-center">
            <p className="display text-3xl">{t("menu.error")}</p>
            <button className="btn btn-primary mt-5" onClick={reloadCatalog}>{t("common.retry")}</button>
          </div>
        )}
        {status === "ready" && groups.length === 0 && (
          <div className="card p-10 text-center" role="status">
            <p className="display text-3xl">{t("menu.empty")}</p>
            <button className="btn btn-ghost mt-5" onClick={clear}><X size={16} aria-hidden />{t("menu.clear")}</button>
          </div>
        )}
        {status === "ready" && groups.map(({ c, items }) => (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`h-${c.id}`} className="mb-16 scroll-mt-40">
            <header className="mb-6 flex items-end justify-between gap-4 border-b-2 pb-3" style={{ borderColor: c.accent }}>
              <div>
                <h2 id={`h-${c.id}`} className="display text-4xl sm:text-6xl">{l(c.name)}</h2>
                <p className="mt-1 text-soft">{l(c.tagline)}</p>
              </div>
            </header>
            {view === "list" ? (
              <div className="grid gap-3">{items.map((p) => <ProductCard key={p.id} product={p} variant="list" />)}</div>
            ) : (
              <div className={`grid grid-cols-1 gap-5 ${GRID_BY_CAT[c.id] ?? "sm:grid-cols-2 lg:grid-cols-4"}`}>
                {items.map((p, i) => (
                  <div key={p.id} className={c.id === "pizza" && i === 0 && !q ? "lg:col-span-2" : ""}>
                    <ProductCard product={p} variant={c.id === "pizza" && i === 0 && !q ? "feature" : "grid"} onQuick={setQuick} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} label={t("menu.filters")} side="bottom">
        <div className="space-y-5 p-6 pt-14">
          <h2 className="display text-3xl">{t("menu.filters")}</h2>
          <Filters {...filterProps} />
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1" onClick={clear}>{t("menu.clear")}</button>
            <button className="btn btn-primary flex-1" onClick={() => setDrawer(false)}>{t("menu.apply")}</button>
          </div>
        </div>
      </Modal>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
