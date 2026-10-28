import { products } from "@/data/demo/products";
import { apiConfig } from "./config";
import { apiFetch } from "./client";
import { ApiError } from "./errors";
import type { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  if (apiConfig.useDemo) return products;
  return apiFetch<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  if (apiConfig.useDemo) {
    const found = products.find((p) => p.id === id || p.slug === id);
    if (!found) throw new ApiError("Product not found", 404);
    return found;
  }
  return apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
}
