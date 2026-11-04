import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { AdminPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Admin preview (demo, no auth)",
  description: "Demo-only admin preview with no authentication. Not for managing a real restaurant.",
  path: "/admin", noindex: true,
});

export default function Page() {
  return <AdminPage />;
}
