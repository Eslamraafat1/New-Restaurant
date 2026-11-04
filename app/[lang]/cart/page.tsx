import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = pageMeta({
  title: "Cart",
  description: "Review your Crust & Crave demo cart, edit customised items and apply a coupon.",
  path: "/cart", noindex: true,
});

export default function Page() {
  return <CartView />;
}
