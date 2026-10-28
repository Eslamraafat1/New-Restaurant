import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactPage />;
}
