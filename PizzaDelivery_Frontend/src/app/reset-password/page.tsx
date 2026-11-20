"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Lock, Mail, KeyRound, CheckCircle, Loader2 } from "lucide-react";
import { useResetPasswordMutation } from "@/features/auth/hooks/useAuthMutations";
import { useLanguage } from "@/lib/LanguageContext";

interface ResetFormValues {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isRtl } = useLanguage();

  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";

  const [formError, setFormError] = useState("");
  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    defaultValues: {
      email: urlEmail,
      token: urlToken,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    setFormError("");
    if (data.newPassword !== data.confirmPassword) {
      setFormError(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    if (data.newPassword.length < 6) {
      setFormError(isRtl ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    resetMutation.mutate({
      email: data.email,
      token: data.token,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 font-serif">
          {isRtl ? "تعيين كلمة المرور الجديدة" : "Reset Your Password"}
        </h1>
        <p className="text-stone-500 text-xs">
          {isRtl
            ? "أدخل بيانات حسابك وكلمة المرور الجديدة لإكمال إعادة التعيين"
            : "Enter your account email and new password to complete the reset"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            {isRtl ? "البريد الإلكتروني" : "Email Address"}
          </label>
          <div className="relative">
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="name@example.com"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 rtl:pl-4 rtl:pr-10 text-stone-800 text-xs focus:outline-none focus:border-red-800 focus:bg-white transition"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          </div>
        </div>

        {/* Token Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            {isRtl ? "رمز التحقق / الـ Token" : "Reset Token"}
          </label>
          <input
            type="text"
            {...register("token", { required: true })}
            placeholder={isRtl ? "الصق الرمز المستلم هنا" : "Paste reset token here"}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 font-mono text-xs focus:outline-none focus:border-red-800 focus:bg-white transition"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            {isRtl ? "كلمة المرور الجديدة" : "New Password"}
          </label>
          <div className="relative">
            <input
              type="password"
              {...register("newPassword", { required: true })}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 rtl:pl-4 rtl:pr-10 text-stone-800 text-xs focus:outline-none focus:border-red-800 focus:bg-white transition"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            {isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
          </label>
          <div className="relative">
            <input
              type="password"
              {...register("confirmPassword", { required: true })}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 rtl:pl-4 rtl:pr-10 text-stone-800 text-xs focus:outline-none focus:border-red-800 focus:bg-white transition"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          </div>
        </div>

        {formError && (
          <p className="text-red-600 text-xs font-semibold text-center">{formError}</p>
        )}

        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer"
        >
          {resetMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isRtl ? "جاري التحديث..." : "Updating..."}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{isRtl ? "حفظ كلمة المرور الجديدة" : "Reset Password"}</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
        <Link href="/login" className="text-red-800 font-bold hover:text-red-950 transition">
          {isRtl ? "العودة لتسجيل الدخول" : "Back to Login"}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-800" />
        </div>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
