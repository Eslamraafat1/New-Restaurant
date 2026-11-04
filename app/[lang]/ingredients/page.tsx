import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { IngredientsPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Ingredients",
  description: "The ingredients behind Crust & Crave pizzas, crepes and burgers.",
  path: "/ingredients",
});

export default function Page() {
  return <IngredientsPage />;
}
