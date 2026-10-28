import { brand } from "@/lib/brand";
import type { CartLine, Config, OrderTotals, Product } from "@/lib/api/types";

/** Cost of one choice: free when it is part of the product's included defaults. */
export function choicePrice(product: Product, groupId: string, choiceId: string): number {
  const group = product.options.find((g) => g.id === groupId);
  const choice = group?.choices.find((c) => c.id === choiceId);
  if (!choice) return 0;
  return product.defaults[groupId]?.includes(choiceId) ? 0 : choice.price;
}

export function unitPrice(product: Product, config: Config): number {
  let total = product.basePrice;
  for (const g of product.options) {
    for (const id of config[g.id] ?? []) total += choicePrice(product, g.id, id);
  }
  return total;
}

export function configKey(productId: string, config: Config): string {
  const norm = Object.keys(config)
    .sort()
    .map((k) => `${k}=${[...(config[k] ?? [])].sort().join(",")}`)
    .join("|");
  return `${productId}::${norm}`;
}

export function validateConfig(product: Product, config: Config): string[] {
  const errors: string[] = [];
  for (const g of product.options) {
    const sel = config[g.id] ?? [];
    if (g.kind === "single" && g.required && sel.length !== 1) errors.push(g.id);
    if (g.kind === "multi" && g.max !== undefined && sel.length > g.max) errors.push(g.id);
    for (const id of sel) {
      const c = g.choices.find((x) => x.id === id);
      if (!c || c.available === false) errors.push(`${g.id}:${id}`);
    }
  }
  return errors;
}

export function calcTotals(
  lines: CartLine[],
  opts: { delivery: boolean; coupon?: string },
): OrderTotals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const rule = opts.coupon ? brand.coupons[opts.coupon.toUpperCase()] : undefined;
  const discount = rule
    ? Math.min(subtotal, rule.type === "percent" ? Math.round((subtotal * rule.value) / 100) : rule.value)
    : 0;
  const free = brand.freeDeliveryOver > 0 && subtotal - discount >= brand.freeDeliveryOver;
  const delivery = opts.delivery && lines.length > 0 && !free ? brand.deliveryFee : 0;
  return { subtotal, discount, delivery, total: subtotal - discount + delivery };
}
