import { jsonLd } from "@/lib/site";

/** Renders structured data as an inline JSON-LD script (see Next.js JSON-LD guide). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}
