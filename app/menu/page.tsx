import type { Metadata } from "next";
import { PageHeader } from "@/components/chrome/PageHeader";
import { MenuView } from "@/components/menu/MenuView";

export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  return (
    <>
      <PageHeader titleKey="menu.title" subKey="menu.sub" kickerKey="nav.menu" crumbs={[{ key: "nav.menu" }]} />
      <MenuView />
    </>
  );
}
