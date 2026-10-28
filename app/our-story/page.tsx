import type { Metadata } from "next";
import { StoryPage } from "@/components/pages/Info";

export const metadata: Metadata = { title: "Our story" };

export default function Page() {
  return <StoryPage />;
}
