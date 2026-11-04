import { staticPageMetadata } from "@/lib/page-meta";
import { AboutPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/about");

export default function Page() {
  return <AboutPage />;
}
