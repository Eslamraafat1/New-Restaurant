import { products } from "@/data/demo/products";

export function GET() {
  return Response.json(products);
}
