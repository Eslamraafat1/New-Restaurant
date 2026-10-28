import type { Metadata } from "next";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function Page() {
  return <CheckoutView />;
}
