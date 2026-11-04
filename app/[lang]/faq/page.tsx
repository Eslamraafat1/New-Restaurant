import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { FaqPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "FAQ",
  description: "Answers to common questions about ordering, delivery, customising and allergens at Crust & Crave.",
  path: "/faq",
});

export default function Page() {
  return <FaqPage />;
}
