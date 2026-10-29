"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Flame, Share2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { IngredientIcon, type ToppingKind } from "@/components/art/pizza";
import { ProductArt } from "@/components/art/ProductArt";
import { Breadcrumbs } from "@/components/chrome/PageHeader";
import { Badge, QtyStepper, Rating } from "@/components/chrome/ui";
import { ProductCard, WishButton } from "@/components/menu/ProductCard";
import { addToCart, cartStore, drawer, replaceLine } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { choicePrice, unitPrice, validateConfig } from "@/lib/pricing";
import { toast } from "@/lib/toast";
import type { Config, OptionGroup, Product } from "@/lib/api/types";

const SWATCH: Record<string, string> = {
  marinara: "#c93a20", ranch: "#fffaf0", bbq: "#5a2a16", pesto: "#6f9d3a",
  milk: "#6b3a20", dark: "#2c130a", white: "#fff4de", none: "transparent",
};
const TOPPING_ICON = new Set(["pepperoni", "mushroom", "olive", "pepper", "onion", "basil"]);

type GroupStyle = "segments" | "tiles" | "swatches" | "chips";
function styleFor(g: OptionGroup): GroupStyle {
  if (g.id === "sauce" || g.id === "chocolate") return "swatches";
  if (g.id === "crust" || g.id === "fruit" || g.id === "crunch" || g.id === "fillings") return "tiles";
  if (g.kind === "multi") return "chips";
  return "segments";
}

function ChoiceBox({
  type, name, checked, disabled, onToggle, children, className = "",
}: {
  type: "radio" | "checkbox"; name: string; checked: boolean; disabled?: boolean; onToggle: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <label className={`relative block ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>
      <input
        type={type} name={name} checked={checked} disabled={disabled} className="peer sr-only"
        onChange={type === "checkbox" ? onToggle : () => { if (!checked) onToggle(); }}
        onClick={type === "radio" ? () => { if (checked) onToggle(); } : undefined}
      />
      <span className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface px-3 py-2 text-center text-sm font-bold transition-all peer-checked:border-tomato peer-checked:bg-tomato/10 peer-checked:text-tomatotext peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${className}`}>
        {children}
      </span>
    </label>
  );
}

function GroupView({ product, group, config, setConfig }: { product: Product; group: OptionGroup; config: Config; setConfig: (c: Config) => void }) {
  const { t, l, money } = useI18n();
  const sel = config[group.id] ?? [];
  const style = styleFor(group);
  const atMax = group.kind === "multi" && group.max !== undefined && sel.length >= group.max;

  const toggle = (id: string) => {
    if (group.kind === "single") {
      setConfig({ ...config, [group.id]: sel[0] === id ? (group.required ? sel : []) : [id] });
    } else {
      setConfig({ ...config, [group.id]: sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id] });
    }
  };

  const priceLabel = (id: string) => {
    const p = choicePrice(product, group.id, id);
    const included = product.defaults[group.id]?.includes(id);
    if (included && group.kind === "multi") return t("p.included");
    if (p === 0) return "";
    return `${p > 0 ? "+" : "−"}${money(Math.abs(p))}`;
  };

  const grid =
    style === "tiles" ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
    : style === "swatches" ? "flex flex-wrap gap-2"
    : style === "chips" ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
    : "grid grid-cols-2 gap-2 sm:grid-cols-3";

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="float-start mb-3 flex w-full items-baseline justify-between gap-2">
        <span className="display text-2xl">{l(group.name)}</span>
        <span className="text-xs font-bold text-soft">
          {group.kind === "multi" && group.max ? `${t("p.max")} ${group.max}` : group.required ? t("p.required") : t("p.optional")}
        </span>
      </legend>
      <div className={`clear-both ${grid}`}>
        {group.choices.map((c) => {
          const checked = sel.includes(c.id);
          const disabled = c.available === false || (group.kind === "multi" && atMax && !checked);
          const pl = priceLabel(c.id);
          return (
            <ChoiceBox key={c.id} type={group.kind === "single" ? "radio" : "checkbox"} name={`${product.id}-${group.id}`} checked={checked} disabled={disabled} onToggle={() => toggle(c.id)}
              className={style === "swatches" ? "!rounded-full !px-4" : style === "tiles" ? "min-h-16 flex-col" : ""}>
              {style === "swatches" && (
                <span className="h-5 w-5 shrink-0 rounded-full border border-black/20" style={{ background: SWATCH[c.id] ?? "var(--gold)" }} aria-hidden />
              )}
              {style === "chips" && TOPPING_ICON.has(c.id) && <IngredientIcon kind={c.id as ToppingKind} size={26} />}
              <span className="flex flex-col leading-tight">
                <span>{l(c.name)}</span>
                {pl && <span className="text-[0.7rem] font-semibold text-soft tabular-nums">{pl}</span>}
              </span>
              {checked && <Check size={15} aria-hidden className="ms-1 shrink-0" />}
            </ChoiceBox>
          );
        })}
      </div>
      {atMax && <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-bold text-tomatotext"><Flame size={14} aria-hidden />{t("p.limit")}</p>}
    </fieldset>
  );
}

const SIZE_SCALE: Record<string, number> = { small: 0.8, medium: 0.92, large: 1, regular: 0.92 };

function Stage({ product, config }: { product: Product; config: Config }) {
  const { l } = useI18n();
  const kind = product.customizer;
  const scale = (kind === "pizza" || kind === "crepe") ? SIZE_SCALE[config.size?.[0] ?? "medium"] ?? 0.92 : 1;
  const bg = kind === "pizza" ? "var(--scene-pizza)" : kind === "crepe" ? "var(--scene-crepe)" : kind === "burger" ? "var(--scene-burger)" : product.category === "drinks" ? "var(--scene-drinks)" : product.category === "desserts" ? "var(--scene-sweet)" : "var(--bg-2)";
  return (
    <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-[2rem]" style={{ background: bg }}>
      {kind === "pizza" && <div aria-hidden className="absolute inset-[6%] rounded-full border-2 border-dashed border-tomato/30" style={{ animation: "spin-slow 60s linear infinite" }} />}
      {kind === "crepe" && <div aria-hidden className="absolute -bottom-1/4 start-1/2 h-3/4 w-[120%] -translate-x-1/2 rounded-[50%] bg-[#8a4b2a]/20 rtl:translate-x-1/2" />}
      {kind === "burger" && <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -25 }} animate={{ opacity: 1, scale, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }} className="w-[88%]"
      >
        <ProductArt product={product} config={config} live className="h-full w-full drop-shadow-[0_30px_30px_rgba(60,20,5,.35)]" />
      </motion.div>
      <span className="sr-only">{l(product.name)}</span>
    </div>
  );
}

function ProductBody({ product, editKey }: { product: Product; editKey: string | null }) {
  const { t, l, money, num } = useI18n();
  const router = useRouter();
  const lines = cartStore.use();
  const { products, categoryOf } = useCatalog();
  const editing = editKey ? lines.find((x) => x.key === editKey) : undefined;
  const [config, setConfig] = useState<Config>(() => editing?.config ?? product.defaults);
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [note, setNote] = useState(editing?.note ?? "");
  const [added, setAdded] = useState(false);

  const price = unitPrice(product, config);
  const total = price * qty;
  const errors = validateConfig(product, config);
  const category = categoryOf(product.category);
  const related = useMemo(() => products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4), [products, product]);

  const summary = product.options.flatMap((g) =>
    (config[g.id] ?? []).map((id) => {
      const c = g.choices.find((x) => x.id === id)!;
      return { key: `${g.id}-${id}`, label: l(c.name), price: choicePrice(product, g.id, id) };
    }),
  );

  const submit = () => {
    if (errors.length) return;
    if (editing) {
      replaceLine(editing.key, product, config, qty, note || undefined);
      toast(t("cart.updated"));
      router.push("/cart");
      return;
    }
    addToCart(product, config, qty, note || undefined);
    toast(t("common.added"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    drawer.open();
  };

  const share = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) await navigator.share({ title: l(product.name), url });
      else { await navigator.clipboard.writeText(url); toast(t("common.copied")); }
    } catch { /* user cancelled */ }
  };

  const layoutFlip = product.customizer === "burger";
  const comboItems = (product.comboOf ?? []).map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  return (
    <article>
      <div className="wrap pt-6">
        <Breadcrumbs items={[{ key: "nav.menu", href: "/menu" }, ...(category ? [{ label: l(category.name), href: `/menu/${category.slug}` }] : []), { label: l(product.name) }]} />
        {editing && <p role="status" className="mt-3 inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-extrabold text-[#2a1a08]">{t("p.editing")}</p>}
      </div>

      <div className={`wrap grid gap-8 py-8 lg:grid-cols-2 lg:gap-14 ${layoutFlip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Stage product={product} config={config} />
          <div className="mt-4 hidden flex-wrap gap-3 text-sm text-soft lg:flex">
            {product.prepMinutes && <span className="inline-flex items-center gap-1.5"><Clock size={16} aria-hidden />{t("p.prep")}: {num(product.prepMinutes)} {t("p.min")}</span>}
            {product.calories && <span>{t("p.cal")}: {num(product.calories)}</span>}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">{product.badges.map((b) => <Badge key={b} kind={b} />)}</div>
          <h1 className="display mt-3 text-[clamp(2.4rem,7vw,4.6rem)]">{l(product.name)}</h1>
          <p className="mt-3 text-lg text-soft">{l(product.description)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} count={product.ratingCount} />
            <WishButton id={product.id} />
            <button type="button" className="icon-btn !h-10 !w-10" onClick={share} aria-label={t("common.share")}><Share2 size={17} aria-hidden /></button>
          </div>

          {comboItems.length > 0 && (
            <div className="card mt-6 p-4">
              <h2 className="font-extrabold">{t("p.combo")}</h2>
              <ul className="mt-2 list-inside list-disc text-soft">{comboItems.map((c, i) => <li key={i}><Link className="hover:text-tomatotext" href={`/product/${c.slug}`}>{l(c.name)}</Link></li>)}</ul>
            </div>
          )}

          {product.options.length > 0 && (
            <div className="mt-8 space-y-6">
              {product.options.map((g) => <GroupView key={g.id} product={product} group={g} config={config} setConfig={setConfig} />)}
            </div>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <label htmlFor="note" className="display text-2xl">{t("p.note")}</label>
            <textarea id="note" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className="field mt-2" />
          </div>

          {/* live order summary */}
          <section aria-labelledby="sum-h" className="card mt-8 p-5">
            <h2 id="sum-h" className="display text-2xl">{t("p.summary")}</h2>
            <dl className="mt-3 space-y-1.5 text-sm" aria-live="polite">
              <div className="flex justify-between"><dt>{t("p.base")}</dt><dd className="tabular-nums">{money(product.basePrice)}</dd></div>
              <AnimatePresence initial={false}>
                {summary.map((s) => (
                  <motion.div key={s.key} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between overflow-hidden text-soft">
                    <dt>{s.label}</dt>
                    <dd className="tabular-nums">{s.price === 0 ? "—" : `${s.price > 0 ? "+" : "−"}${money(Math.abs(s.price))}`}</dd>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>{t("p.total")} ({num(qty)}×)</dt>
                <dd className="tabular-nums"><motion.span key={total} initial={{ scale: 1.2, color: "var(--tomato-text)" }} animate={{ scale: 1, color: "var(--ink)" }} className="inline-block">{money(total)}</motion.span></dd></div>
            </dl>
            <div className="mt-4 hidden items-center gap-3 md:flex">
              <QtyStepper value={qty} onChange={setQty} />
              <button type="button" className="btn btn-primary flex-1" disabled={errors.length > 0 || !product.available} onClick={submit}>
                {added ? <Check size={18} aria-hidden /> : <ShoppingBag size={18} aria-hidden />}{editing ? t("p.save") : added ? t("common.added") : t("common.add")}
              </button>
            </div>
          </section>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <section>
              <h2 className="display text-2xl">{t("p.ingredients")}</h2>
              <p className="mt-2 text-soft">{product.ingredients.map((i) => l(i)).join(" · ")}</p>
            </section>
            <section>
              <h2 className="display text-2xl">{t("p.allergens")}</h2>
              {product.allergens?.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">{product.allergens.map((a) => <li key={a} className="chip !min-h-8 !cursor-default">{t(`allergen.${a}` as const)}</li>)}</ul>
              ) : <p className="mt-2 text-soft">{t("p.noAllergens")}</p>}
            </section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="wrap pb-20 pt-4" aria-labelledby="rel-h">
          <h2 id="rel-h" className="display text-4xl">{t("p.related")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {/* mobile sticky order bar */}
      <div className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pt-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <QtyStepper value={qty} onChange={setQty} />
          <button type="button" className="btn btn-primary flex-1" disabled={errors.length > 0 || !product.available} onClick={submit}>
            {added ? <Check size={18} aria-hidden /> : null}
            <span>{editing ? t("p.save") : t("common.add")}</span>
            <span className="tabular-nums">{money(total)}</span>
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden />
    </article>
  );
}

function EditBridge({ product }: { product: Product }) {
  const sp = useSearchParams();
  const edit = sp.get("edit");
  return <ProductBody key={edit ?? "new"} product={product} editKey={edit} />;
}

export function ProductExperience({ product }: { product: Product }) {
  return (
    <Suspense fallback={<ProductBody product={product} editKey={null} />}>
      <EditBridge product={product} />
    </Suspense>
  );
}
