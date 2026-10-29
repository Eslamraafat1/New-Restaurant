"use client";

import type { Config, Product } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n";
import { BurgerSVG, CrepeSVG, DishSVG, burgerFromConfig, crepeFromConfig } from "./others";
import { PizzaSVG, configToLayers } from "./pizza";

const drinkTone = (id: string) => (id.includes("strawberry") ? "#e8465a" : id.includes("latte") || id.includes("tea") ? "#b98a5e" : id.includes("lemon") ? "#d9e36a" : "#f2b84a");

/** Renders the right illustration for a product and (optionally) its live configuration. */
export function ProductArt({
  product,
  config,
  live = false,
  className,
}: {
  product: Product;
  config?: Config;
  /** live = animate configuration changes (customiser); otherwise static for lists */
  live?: boolean;
  className?: string;
}) {
  const { l } = useI18n();
  const cfg = config ?? product.defaults;
  const title = l(product.name);
  switch (product.art) {
    case "pizza":
      return <PizzaSVG layers={configToLayers(cfg)} mode={live ? "motion" : "plain"} className={className} title={title} />;
    case "crepe":
      return <CrepeSVG layers={crepeFromConfig(cfg, !product.options.some((g) => g.id === "chocolate"))} className={className} title={title} />;
    case "burger":
      return <BurgerSVG layers={burgerFromConfig(cfg)} plain={!live} className={className} title={title} />;
    default:
      return <DishSVG kind={product.art} className={className} title={title} tone={drinkTone(product.id)} />;
  }
}
