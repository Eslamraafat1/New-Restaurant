import type { Metadata } from "next";
import { AdminPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Admin preview" };

export default function Page() {
  return <AdminPage />;
}
