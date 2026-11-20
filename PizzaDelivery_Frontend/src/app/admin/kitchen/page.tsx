import React from "react";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminKitchenBoard } from "@/features/admin/components/AdminKitchenBoard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "شاشة المطبخ والطلبات الحية | Pizza Delivery",
  description: "متابعة وتحديث حالات طلبات البيتزا في المطبخ لحظياً مع الإشعارات الصوتية",
};

export default function KitchenPage() {
  return (
    <AdminGuard>
      <div className="py-4">
        <AdminHeader />
        <AdminKitchenBoard />
      </div>
    </AdminGuard>
  );
}
