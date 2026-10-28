import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Cart" };

export default function Page() {
  return <CartView />;
}
