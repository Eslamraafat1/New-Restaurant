import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return <LegalPage kind="privacy" />;
}
