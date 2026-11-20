"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { role, isAuthenticated, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    initialize();
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token || storedRole !== "Admin") {
      toast.error("عفواً، هذه الصفحة مخصصة لمدير النظام وفريق المطبخ فقط");
      router.push("/");
    } else {
      setIsChecking(false);
    }
  }, [router, initialize]);

  if (isChecking) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 text-[#FEA116] animate-spin mx-auto mb-4" />
        <p className="text-stone-400 text-sm">جاري التحقق من صلاحيات الإدارة...</p>
      </div>
    );
  }

  return <>{children}</>;
}
