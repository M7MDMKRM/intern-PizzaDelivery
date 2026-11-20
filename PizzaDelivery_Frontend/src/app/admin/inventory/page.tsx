import React from "react";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminInventoryView } from "@/features/admin/components/AdminInventoryView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة المخزون والمكونات | Pizza Delivery",
  description: "تعديل رصيد الخامات والمكونات ومتابعة النواقص",
};

export default function InventoryPage() {
  return (
    <AdminGuard>
      <div className="py-4">
        <AdminHeader />
        <AdminInventoryView />
      </div>
    </AdminGuard>
  );
}
