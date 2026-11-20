import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد | Pizza Express",
  description: "انضم إلينا واستمتع بأشهى أطباق البيتزا الإيطالية وتتبع طلبك لحظياً",
};

export default function RegisterPage() {
  return (
    <div className="py-12 flex items-center justify-center min-h-[75vh]">
      <RegisterForm />
    </div>
  );
}
