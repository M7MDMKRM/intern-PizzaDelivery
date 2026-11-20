"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin, UserPlus, Loader2, KeyRound, CheckCircle } from "lucide-react";
import {
  registerSchema,
  verifyOtpSchema,
  RegisterFormData,
  VerifyOtpFormData,
} from "../types/schemas";
import {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendVerificationEmailMutation,
} from "../hooks/useAuthMutations";
import { useLanguage } from "@/lib/LanguageContext";

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const resendMutation = useResendVerificationEmailMutation();
  const { t, isRtl } = useLanguage();

  // Register Form
  const {
    register: regField,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: regErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation(() => {});

  const onRegister = (data: RegisterFormData) => {
    setRegisteredEmail(data.email);
    registerMutation.mutate(data);
  };

  // OTP Form
  const {
    register: otpField,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    values: {
      email: registeredEmail || "",
      otpCode: "",
    },
  });

  const verifyOtpMutation = useVerifyOtpMutation();

  const onVerifyOtp = (data: VerifyOtpFormData) => {
    verifyOtpMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xl">
      {!registeredEmail || !registerMutation.isSuccess ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight font-serif">
              {t("auth_reg_title")}
            </h2>
            <p className="text-stone-500 mt-2 text-sm">
              {t("auth_reg_sub")}
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("auth_reg_name")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...regField("fullName")}
                  placeholder={isRtl ? "محمد أحمد" : "John Doe"}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white text-sm transition"
                />
                <User className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
              </div>
              {regErrors.fullName && (
                <p className="text-red-600 text-xs mt-1">{regErrors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("auth_email_label")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...regField("email")}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white text-sm transition"
                />
                <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
              </div>
              {regErrors.email && (
                <p className="text-red-600 text-xs mt-1">{regErrors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("auth_reg_phone")}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...regField("phoneNumber")}
                  placeholder="01012345678"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white text-sm transition"
                />
                <Phone className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
              </div>
              {regErrors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">
                  {regErrors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("auth_reg_address")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...regField("address")}
                  placeholder={isRtl ? "القاهرة، المعادي، شارع النصر" : "Cairo, Maadi, Street 9"}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white text-sm transition"
                />
                <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
              </div>
              {regErrors.address && (
                <p className="text-red-600 text-xs mt-1">
                  {regErrors.address.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("auth_pass_label")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...regField("password")}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white text-sm transition"
                />
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
              </div>
              {regErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {regErrors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full mt-2 py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition shadow-md shadow-red-900/15 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isRtl ? "جاري إنشاء الحساب..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{t("auth_reg_btn")}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            {t("auth_already_have")}{" "}
            <Link
              href="/login"
              className="text-red-800 font-bold hover:text-red-950 transition ml-1"
            >
              {t("auth_login_btn")}
            </Link>
          </div>
        </>
      ) : (
        /* OTP Verification Step */
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-900 font-serif">{t("auth_otp_title")}</h2>
            <p className="text-stone-500 text-sm mt-2">
              {t("auth_otp_sub")}
              <br />
              <span className="text-red-800 font-bold">{registeredEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
                {t("auth_otp_label")}
              </label>
              <input
                type="text"
                {...otpField("otpCode")}
                placeholder="123456"
                maxLength={6}
                className="w-full text-center tracking-widest text-2xl font-black bg-stone-50 border border-stone-200 rounded-xl py-3 text-red-800 focus:outline-none focus:border-red-800 focus:bg-white transition"
              />
              {otpErrors.otpCode && (
                <p className="text-red-600 text-xs mt-1 text-center">
                  {otpErrors.otpCode.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyOtpMutation.isPending}
              className="w-full py-3.5 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50 cursor-pointer"
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isRtl ? "جاري التحقق..." : "Verifying..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t("auth_otp_btn")}</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Verification Email Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (registeredEmail) {
                  resendMutation.mutate(registeredEmail);
                }
              }}
              disabled={resendMutation.isPending}
              className="text-xs font-bold text-stone-500 hover:text-red-800 transition disabled:opacity-50 cursor-pointer"
            >
              {resendMutation.isPending ? (isRtl ? "جاري إعادة الإرسال..." : "Resending...") : t("auth_otp_resend")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
