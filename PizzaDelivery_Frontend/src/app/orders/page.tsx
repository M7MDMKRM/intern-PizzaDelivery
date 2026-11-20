import { Metadata } from "next";
import { MyOrdersView } from "@/features/orders/components/MyOrdersView";

export const metadata: Metadata = {
  title: "My Orders | Pizza Delivery - سجل الطلبات",
  description: "View your past pizza orders and track their delivery status live.",
};

export default function MyOrdersPage() {
  return <MyOrdersView />;
}
