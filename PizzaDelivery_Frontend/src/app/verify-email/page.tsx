"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useLanguage } from "@/lib/LanguageContext";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isRtl } = useLanguage();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(isRtl ? "رمز التفعيل مفقود من الرابط" : "Verification token is missing from the URL");
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
            (isRtl ? "رمز التفعيل غير صالح أو انتهت صلاحيته" : "Invalid or expired verification token")
        );
      });
  }, [token, isRtl]);

  return (
    <div className="max-w-md mx-auto my-16 bg-white border border-stone-200/90 rounded-3xl p-8 text-center shadow-lg space-y-6">
      {status === "loading" && (
        <div className="space-y-4 py-8">
          <Loader2 className="w-12 h-12 text-red-800 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            {isRtl ? "جاري تفعيل الحساب..." : "Verifying your email..."}
          </h2>
          <p className="text-xs text-stone-500">
            {isRtl ? "يرجى الانتظار ثوانٍ معدودة" : "Please wait a moment while we verify your email address"}
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-serif">
            {isRtl ? "تم تفعيل الحساب بنجاح!" : "Email Verified Successfully!"}
          </h2>
          <p className="text-xs text-stone-600">
            {isRtl
              ? "تم التحقق من بريدك الإلكتروني بنجاح، يمكنك الآن تسجيل الدخول والاستمتاع بأشهى بيتزا إيطالية."
              : "Your email has been confirmed. You can now log in to place orders and customize pizzas."}
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-900/15"
            >
              <span>{isRtl ? "تسجيل الدخول الآن" : "Go to Login"}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4 py-4">
          <div className="w-16 h-16 bg-red-50 text-red-800 border border-red-200 rounded-3xl flex items-center justify-center mx-auto">
            <XCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-serif">
            {isRtl ? "فشل تفعيل البريد" : "Verification Failed"}
          </h2>
          <p className="text-xs text-red-700 font-medium">
            {errorMessage}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition"
            >
              {isRtl ? "إنشاء حساب جديد" : "Sign Up Again"}
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl transition"
            >
              {isRtl ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-800" />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
