"use client";

import type { Config, Product } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n";
import { BurgerLive, CrepeLive } from "./Live";
import { Photo } from "./Photo";
import { PizzaSVG, configToLayers } from "./pizza";

/**
 * Real product photography. In `live` mode (product page) the picture reacts to the chosen options:
 * pizza gets real topping cut-outs + sauce overlays, crepes swap photos and add fruit, burgers swap patty photo.
 * The parent decides size/shape (it must have dimensions); this fills it.
 */
export function ProductArt({
  product, config, live = false, className = "", sizes,
}: {
  product: Product; config?: Config; live?: boolean; className?: string; sizes?: string;
}) {
  const { l } = useI18n();
  const cfg = config ?? product.defaults;
  const alt = l(product.name);
  if (live && product.customizer === "pizza") {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-[4%] rounded-full shadow-[0_30px_50px_-12px_rgba(40,10,0,.55)]">
          <PizzaSVG photo={product.image} layers={configToLayers(cfg)} mode="motion" title={alt} className="h-full w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {live && product.customizer === "crepe" ? <CrepeLive product={product} config={cfg} />
        : live && product.customizer === "burger" ? <BurgerLive product={product} config={cfg} />
        : <Photo src={product.image} alt={alt} sizes={sizes} />}
    </div>
  );
}
