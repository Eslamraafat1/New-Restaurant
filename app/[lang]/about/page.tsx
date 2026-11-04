import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { AboutPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "About us",
  description: "Who is behind Crust & Crave, a fictional pizza, crepe and burger kitchen built as a bilingual demo storefront.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
