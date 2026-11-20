import { Metadata } from "next";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminBranchesView } from "@/features/admin/components/AdminBranchesView";

export const metadata: Metadata = {
  title: "Branch Management | Admin - إدارة الفروع",
  description: "Admin branch network and active order reception toggle.",
};

export default function AdminBranchesPage() {
  return (
    <div className="max-w-7xl mx-auto py-4">
      <AdminHeader />
      <AdminBranchesView />
    </div>
  );
}
