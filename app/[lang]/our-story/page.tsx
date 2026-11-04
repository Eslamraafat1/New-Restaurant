import { staticPageMetadata } from "@/lib/page-meta";
import { StoryPage } from "@/components/pages/Info";

export const generateMetadata = staticPageMetadata("/our-story");

export default function Page() {
  return <StoryPage />;
}
