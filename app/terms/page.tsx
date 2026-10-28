import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Terms of service" };

export default function Page() {
  return <LegalPage kind="terms" />;
}
