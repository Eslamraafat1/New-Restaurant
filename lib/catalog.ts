"use client";

import { useEffect, useSyncExternalStore } from "react";
import { categories as demoCategories } from "@/data/demo/categories";
import { products as demoProducts } from "@/data/demo/products";
import { apiConfig } from "@/lib/api/config";
import { branches as demoBranches, offers as demoOffers } from "@/data/demo/content";
import { getBranches, getOffers } from "@/lib/api/content";
import { getMenu } from "@/lib/api/menu";
import type { Branch, Category, Offer, Product } from "@/lib/api/types";

interface State { products: Product[]; categories: Category[]; offers: Offer[]; branches: Branch[]; status: "loading" | "ready" | "error" }

let state: State = apiConfig.useDemo
  ? { products: demoProducts, categories: demoCategories, offers: demoOffers, branches: demoBranches, status: "ready" }
  : { products: [], categories: [], offers: [], branches: [], status: "loading" };
let started = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function reloadCatalog() {
  state = { ...state, status: "loading" };
  emit();
  Promise.all([getMenu(), getOffers(), getBranches()])
    .then(([m, offers, branches]) => { state = { products: m.products, categories: m.categories, offers, branches, status: "ready" }; emit(); })
    .catch(() => { state = { ...state, status: "error" }; emit(); });
}

/** Shared menu data for client components. Goes through lib/api so demo/live is a config switch. */
export function useCatalog() {
  const s = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => state, () => state);
  useEffect(() => {
    if (!started && !apiConfig.useDemo) { started = true; reloadCatalog(); }
  }, []);
  return {
    ...s,
    byId: (id: string) => s.products.find((p) => p.id === id),
    categoryOf: (id: string) => s.categories.find((c) => c.id === id),
  };
}
