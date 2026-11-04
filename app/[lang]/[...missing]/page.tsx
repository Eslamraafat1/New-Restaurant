import { notFound } from "next/navigation";

/** Any unknown URL renders app/[lang]/not-found.tsx with a 404 status. */
export default function CatchAll() {
  notFound();
}
