"use client";

import { createStore } from "@/lib/store";
import { configKey, unitPrice } from "@/lib/pricing";
import type { CartLine, Config, OrderResponse, Product } from "@/lib/api/types";

export const cartStore = createStore<CartLine[]>("cc-cart", []);
export const couponStore = createStore<string>("cc-coupon", "");
export const wishlistStore = createStore<string[]>("cc-wishlist", []);
export const lastOrderStore = createStore<OrderResponse | null>("cc-last-order", null);
export const cartUiStore = createStore<boolean>("cc-cart-open", false, false);

/** the drawer open-state should not persist across reloads */
export const drawer = {
  open: () => cartUiStore.set(true),
  close: () => cartUiStore.set(false),
};

export function addToCart(product: Product, config: Config, qty = 1, note?: string): string {
  const key = configKey(product.id, config);
  const price = unitPrice(product, config);
  cartStore.set((lines) => {
    const hit = lines.find((l) => l.key === key && (l.note ?? "") === (note ?? ""));
    if (hit) return lines.map((l) => (l === hit ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
    return [...lines, { key, productId: product.id, config, qty, unitPrice: price, note }];
  });
  return key;
}

/** Replace one cart line with a new configuration (used by "edit customisation"). */
export function replaceLine(oldKey: string, product: Product, config: Config, qty: number, note?: string) {
  const key = configKey(product.id, config);
  const price = unitPrice(product, config);
  cartStore.set((lines) => {
    const idx = lines.findIndex((l) => l.key === oldKey);
    const next = lines.filter((l) => l.key !== oldKey || l.key === key);
    const line: CartLine = { key, productId: product.id, config, qty, unitPrice: price, note };
    if (idx === -1) return [...next, line];
    const merged = next.filter((l) => l.key !== key);
    merged.splice(Math.min(idx, merged.length), 0, line);
    return merged;
  });
}

export const setQty = (key: string, qty: number) =>
  cartStore.set((lines) => lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)));
export const removeLine = (key: string) => cartStore.set((lines) => lines.filter((l) => l.key !== key));
export const clearCart = () => cartStore.set([]);

export const toggleWish = (id: string): boolean => {
  let on = false;
  wishlistStore.set((w) => {
    on = !w.includes(id);
    return on ? [...w, id] : w.filter((x) => x !== id);
  });
  return on;
};
