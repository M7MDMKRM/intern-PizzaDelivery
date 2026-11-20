"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, KeyRound, Lock, Send, CheckCircle, Loader2 } from "lucide-react";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "../types/schemas";
import { useLanguage } from "@/lib/LanguageContext";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../hooks/useAuthMutations";

export function ForgotPasswordForm() {
  const { t, isRtl } = useLanguage();
  const [emailSubmitted, setEmailSubmitted] = useState<string | null>(null);

  // Forgot password form
  const {
    register: forgotField,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotMutation = useForgotPasswordMutation(() => {
    // success
  });

  const onForgotSubmit = (data: ForgotPasswordFormData) => {
    setEmailSubmitted(data.email);
    forgotMutation.mutate(data);
  };

  // Reset password form
  const {
    register: resetField,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    values: {
      email: emailSubmitted || "",
      otpCode: "",
      newPassword: "",
    },
  });

  const resetMutation = useResetPasswordMutation();

  const onResetSubmit = (data: ResetPasswordFormData) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-2xl backdrop-blur-xl">
      {!emailSubmitted || !forgotMutation.isSuccess ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {t("auth_forgot_title")}
            </h2>
            <p className="text-stone-400 mt-2 text-sm">
              {t("auth_forgot_sub")}
            </p>
          </div>

          <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                {t("auth_email_label")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...forgotField("email")}
                  placeholder="name@example.com"
                  className={`w-full bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-3 ${
                    isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                  } text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm transition`}
                />
                <Mail className={`w-5 h-5 text-stone-500 absolute top-3.5 ${
                  isRtl ? "right-3.5" : "left-3.5"
                }`} />
              </div>
              {forgotErrors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {forgotErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-stone-950 font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {forgotMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isRtl ? "جاري الإرسال..." : "Sending..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t("auth_forgot_btn")}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-400">
            {t("auth_already_have")}{" "}
            <Link
              href="/login"
              className="text-amber-500 font-bold hover:text-amber-400 transition ml-1"
            >
              {t("auth_back_login")}
            </Link>
          </div>
        </>
      ) : (
        /* Reset Password Step */
        <>
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t("auth_forgot_title")}</h2>
            <p className="text-stone-400 text-xs mt-1">
              {isRtl ? "تم إرسال الكود إلى: " : "Code sent to: "}
              <span className="text-amber-400 font-semibold">{emailSubmitted}</span>
            </p>
          </div>

          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                {t("auth_otp_label")}
              </label>
              <input
                type="text"
                {...resetField("otpCode")}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-bold bg-stone-950/80 border border-stone-800 rounded-xl py-2.5 text-amber-400 focus:outline-none focus:border-amber-500 transition"
              />
              {resetErrors.otpCode && (
                <p className="text-red-400 text-xs mt-1">
                  {resetErrors.otpCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                {t("auth_new_pass_label")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...resetField("newPassword")}
                  placeholder="••••••••"
                  className={`w-full bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-3 ${
                    isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                  } text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm transition`}
                />
                <Lock className={`w-5 h-5 text-stone-500 absolute top-3.5 ${
                  isRtl ? "right-3.5" : "left-3.5"
                }`} />
              </div>
              {resetErrors.newPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {resetErrors.newPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-stone-950 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isRtl ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t("auth_reset_btn")}</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
