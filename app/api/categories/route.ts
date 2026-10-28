import { categories } from "@/data/demo/categories";

export function GET() {
  return Response.json(categories);
}
