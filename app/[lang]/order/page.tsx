import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { OrderSuccess } from "@/components/cart/OrderSuccess";

export const metadata: Metadata = pageMeta({
  title: "Order confirmation",
  description: "Your Crust & Crave demo order confirmation.",
  path: "/order", noindex: true,
});

export default function Page() {
  return <OrderSuccess />;
}
