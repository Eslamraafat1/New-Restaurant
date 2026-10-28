import { calcTotals } from "@/lib/pricing";
import type { OrderRequest } from "@/lib/api/types";

/** DEMO endpoint: validates and echoes. Nothing is stored and nothing reaches a restaurant. */
export async function POST(req: Request) {
  let body: OrderRequest;
  try {
    body = (await req.json()) as OrderRequest;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.lines?.length || !body.customer?.name || !body.customer?.phone) {
    return Response.json({ error: "Missing lines or customer details" }, { status: 422 });
  }
  return Response.json({
    id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
    demo: true,
    status: "accepted",
    createdAt: new Date().toISOString(),
    totals: calcTotals(body.lines, { delivery: body.fulfilment === "delivery", coupon: body.coupon }),
    request: body,
  });
}
