import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { LegalPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Terms of service",
  description: "Crust & Crave terms of service for this demo storefront.",
  path: "/terms",
});

export default function Page() {
  return <LegalPage kind="terms" />;
}
