import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | Pizza Express",
  description: "سجل الدخول لمتابعة طلباتك أو بدء طلب بيتزا جديدة",
};

export default function LoginPage() {
  return (
    <div className="py-12 flex items-center justify-center min-h-[75vh]">
      <LoginForm />
    </div>
  );
}
