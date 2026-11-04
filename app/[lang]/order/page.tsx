import { staticPageMetadata } from "@/lib/page-meta";
import { OrderSuccess } from "@/components/cart/OrderSuccess";

export const generateMetadata = staticPageMetadata("/order");

export default function Page() {
  return <OrderSuccess />;
}
