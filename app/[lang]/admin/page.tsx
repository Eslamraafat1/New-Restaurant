import { staticPageMetadata } from "@/lib/page-meta";
import { AdminPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/admin");

export default function Page() {
  return <AdminPage />;
}
