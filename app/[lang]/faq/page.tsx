import { staticPageMetadata } from "@/lib/page-meta";
import { FaqPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/faq");

export default function Page() {
  return <FaqPage />;
}
