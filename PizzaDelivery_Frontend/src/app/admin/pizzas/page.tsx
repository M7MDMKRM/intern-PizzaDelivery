import { Metadata } from "next";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminPizzasView } from "@/features/admin/components/AdminPizzasView";

export const metadata: Metadata = {
  title: "Pizza Management | Admin - إدارة البيتزا",
  description: "Admin pizza catalogue CRUD management.",
};

export default function AdminPizzasPage() {
  return (
    <div className="max-w-7xl mx-auto py-4">
      <AdminHeader />
      <AdminPizzasView />
    </div>
  );
}
