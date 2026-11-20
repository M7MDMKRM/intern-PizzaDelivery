import React from "react";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminStatsView } from "@/features/admin/components/AdminStatsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة تحكم الإدارة | Pizza Delivery",
  description: "مؤشرات الأداء ومبيعات اليوم ونواقص المخزن",
};

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="py-4">
        <AdminHeader />
        <AdminStatsView />
      </div>
    </AdminGuard>
  );
}
