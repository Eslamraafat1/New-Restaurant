import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "About us" };

export default function Page() {
  return <AboutPage />;
}
