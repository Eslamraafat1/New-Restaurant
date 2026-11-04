import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { LegalPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description: "Crust & Crave privacy policy for this demo storefront.",
  path: "/privacy",
});

export default function Page() {
  return <LegalPage kind="privacy" />;
}
