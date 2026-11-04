import { staticPageMetadata } from "@/lib/page-meta";
import { LocationsPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/locations");

export default function Page() {
  return <LocationsPage />;
}
