import { categories } from "@/data/demo/categories";
import { apiConfig } from "./config";
import { apiFetch } from "./client";
import type { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  if (apiConfig.useDemo) return categories;
  return apiFetch<Category[]>("/categories");
}
