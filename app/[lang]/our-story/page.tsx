import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { StoryPage } from "@/components/pages/Info";

export const metadata: Metadata = pageMeta({
  title: "Our story",
  description: "The story of Crust & Crave, from the dough to the last bite.",
  path: "/our-story",
});

export default function Page() {
  return <StoryPage />;
}
