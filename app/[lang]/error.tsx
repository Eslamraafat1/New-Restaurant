"use client";

import { ErrorView } from "@/components/pages/Info";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
