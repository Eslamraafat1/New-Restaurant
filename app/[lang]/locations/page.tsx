import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { LocationsPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Locations",
  description: "Crust & Crave branches. Demo storefront – branch data is sample content.",
  path: "/locations",
});

export default function Page() {
  return <LocationsPage />;
}
