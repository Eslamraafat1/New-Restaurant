import type { Metadata } from "next";
import { OrderSuccess } from "@/components/cart/OrderSuccess";

export const metadata: Metadata = { title: "Order confirmation" };

export default function Page() {
  return <OrderSuccess />;
}
