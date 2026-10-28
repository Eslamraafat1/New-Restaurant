import type { Metadata } from "next";
import { IngredientsPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Ingredients" };

export default function Page() {
  return <IngredientsPage />;
}
