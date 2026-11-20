import { CustomPizzaBuilder } from "@/features/pizza-builder/components/CustomPizzaBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "باني البيتزا المخصص | Pizza Delivery",
  description: "اصنع وصفتك الخاصة واطلب بيتزا مخصصة بـ 4 خطوات سهلة ومكونات طازجة",
};

export default function BuilderPage() {
  return (
    <div className="py-6">
      <CustomPizzaBuilder />
    </div>
  );
}
