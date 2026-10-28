import type { Metadata } from "next";
import { OffersPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Offers" };

export default function Page() {
  return <OffersPage />;
}
