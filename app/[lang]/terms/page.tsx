import { staticPageMetadata } from "@/lib/page-meta";
import { LegalPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/terms");

export default function Page() {
  return <LegalPage kind="terms" />;
}
