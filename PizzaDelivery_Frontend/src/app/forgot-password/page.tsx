import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | Pizza Express",
  description: "استعد حسابك بسهولة عبر إرسال كود التحقق إلى بريدك الإلكتروني",
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-12 flex items-center justify-center min-h-[75vh]">
      <ForgotPasswordForm />
    </div>
  );
}
