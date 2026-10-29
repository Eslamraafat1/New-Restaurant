"use client";

import { PageHeader } from "@/components/chrome/PageHeader";
import { useCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { CategoryId } from "@/lib/api/types";

export function CategoryHead({ id }: { id: CategoryId }) {
  const { l } = useI18n();
  const { categoryOf } = useCatalog();
  const c = categoryOf(id);
  if (!c) return null;
  return <PageHeader title={l(c.name)} crumbs={[{ key: "nav.menu", href: "/menu" }, { label: l(c.name) }]}>
    <p className="mt-4 max-w-2xl text-lg text-soft">{l(c.tagline)}</p>
  </PageHeader>;
}
