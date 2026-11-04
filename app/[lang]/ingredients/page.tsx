import { staticPageMetadata } from "@/lib/page-meta";
import { IngredientsPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/ingredients");

export default function Page() {
  return <IngredientsPage />;
}
