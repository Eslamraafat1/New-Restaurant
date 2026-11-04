import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { OffersPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Offers",
  description: "Current Crust & Crave deals, combos and demo coupon codes.",
  path: "/offers",
});

export default function Page() {
  return <OffersPage />;
}
