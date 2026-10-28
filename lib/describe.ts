import type { Config, L10n, Product } from "@/lib/api/types";

/** Human-readable list of the selected choices, in group order. */
export function describeConfig(product: Product, config: Config, l: (v: L10n) => string): string[] {
  const out: string[] = [];
  for (const g of product.options) {
    for (const id of config[g.id] ?? []) {
      const c = g.choices.find((x) => x.id === id);
      if (c) out.push(l(c.name));
    }
  }
  return out;
}
