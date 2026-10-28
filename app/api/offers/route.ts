import { offers } from "@/data/demo/content";

export function GET() {
  return Response.json(offers);
}
