import { getCategories } from "./categories";
import { getProducts } from "./products";
import type { MenuResponse } from "./types";

export async function getMenu(): Promise<MenuResponse> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return { categories, products };
}
