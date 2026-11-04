import { staticPageMetadata } from "@/lib/page-meta";
import { LegalPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/privacy");

export default function Page() {
  return <LegalPage kind="privacy" />;
}
