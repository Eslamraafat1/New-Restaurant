import { calcTotals } from "@/lib/pricing";
import { apiConfig } from "./config";
import { apiFetch } from "./client";
import { ApiError } from "./errors";
import type { OrderRequest, OrderResponse } from "./types";

/**
 * Demo mode: the order is "accepted" locally. It is NOT sent anywhere and never reaches a kitchen.
 * Live mode: POST {baseUrl}/orders – the success UI is shown only after the backend responds OK.
 */
export async function submitOrder(req: OrderRequest): Promise<OrderResponse> {
  if (!req.lines.length) throw new ApiError("Cart is empty", 400, "validation");
  if (apiConfig.useDemo) {
    await new Promise((r) => setTimeout(r, 700));
    return {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      demo: true,
      status: "accepted",
      createdAt: new Date().toISOString(),
      totals: calcTotals(req.lines, { delivery: req.fulfilment === "delivery", coupon: req.coupon }),
      request: req,
    };
  }
  return apiFetch<OrderResponse>("/orders", { method: "POST", body: JSON.stringify(req) });
}

export async function submitContact(msg: { name: string; email: string; message: string }): Promise<{ ok: true; demo: boolean }> {
  if (apiConfig.useDemo) {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true, demo: true };
  }
  await apiFetch("/contact", { method: "POST", body: JSON.stringify(msg) });
  return { ok: true, demo: false };
}
