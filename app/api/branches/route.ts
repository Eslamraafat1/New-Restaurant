import { branches } from "@/data/demo/content";

export function GET() {
  return Response.json(branches);
}
