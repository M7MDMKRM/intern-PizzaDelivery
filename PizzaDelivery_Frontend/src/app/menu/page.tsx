import { MenuList } from "@/features/pizza-builder/components/MenuList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "قائمة البيتزا | Pizza Delivery",
  description: "تصفح أشهى أطباق البيتزا الإيطالية والعروض المميزة",
};

export default function MenuPage() {
  return (
    <div className="py-6">
      <MenuList />
    </div>
  );
}
