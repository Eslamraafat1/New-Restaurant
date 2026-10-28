import { products } from "@/data/demo/products";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const found = products.find((p) => p.id === id);
  return found ? Response.json(found) : Response.json({ error: "Not found" }, { status: 404 });
}
