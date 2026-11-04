import { staticPageMetadata } from "@/lib/page-meta";
import { ContactPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/contact");

export default function Page() {
  return <ContactPage />;
}
