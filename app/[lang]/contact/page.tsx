import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ContactPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Get in touch with Crust & Crave. Demo storefront – contact details are placeholders.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
