import { branches, offers } from "@/data/demo/content";
import { apiConfig } from "./config";
import { apiFetch } from "./client";
import type { Branch, Offer } from "./types";

export async function getOffers(): Promise<Offer[]> {
  if (apiConfig.useDemo) return offers;
  return apiFetch<Offer[]>("/offers");
}

export async function getBranches(): Promise<Branch[]> {
  if (apiConfig.useDemo) return branches;
  return apiFetch<Branch[]>("/branches");
}
