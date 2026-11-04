import { staticPageMetadata } from "@/lib/page-meta";
import { CartView } from "@/components/cart/CartView";

export const generateMetadata = staticPageMetadata("/cart");

export default function Page() {
  return <CartView />;
}
