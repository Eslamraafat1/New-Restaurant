import { staticPageMetadata } from "@/lib/page-meta";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const generateMetadata = staticPageMetadata("/checkout");

export default function Page() {
  return <CheckoutView />;
}
