import { staticPageMetadata } from "@/lib/page-meta";
import { OffersPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/offers");

export default function Page() {
  return <OffersPage />;
}
