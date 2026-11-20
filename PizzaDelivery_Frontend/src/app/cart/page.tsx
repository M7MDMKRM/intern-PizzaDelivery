import { CartView } from "@/features/cart/components/CartView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سلة الطلبات والدفع | Pizza Delivery",
  description: "راجع محتويات السلة وأكمل طلبك عبر الدفع الإلكتروني أو الاستلام من الفرع",
};

export default function CartPage() {
  return (
    <div className="py-6">
      <CartView />
    </div>
  );
}
