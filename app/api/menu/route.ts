import { categories } from "@/data/demo/categories";
import { products } from "@/data/demo/products";

export function GET() {
  return Response.json({ categories, products });
}
