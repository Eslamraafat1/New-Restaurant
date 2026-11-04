import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata: Metadata = pageMeta({
  title: "Checkout",
  description: "Demo checkout: delivery or pickup details with form validation. No real payment is taken.",
  path: "/checkout", noindex: true,
});

export default function Page() {
  return <CheckoutView />;
}
