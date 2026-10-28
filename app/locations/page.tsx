import type { Metadata } from "next";
import { LocationsPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Locations" };

export default function Page() {
  return <LocationsPage />;
}
