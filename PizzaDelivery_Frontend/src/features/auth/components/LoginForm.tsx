"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { loginSchema, LoginFormData } from "../types/schemas";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { useLanguage } from "@/lib/LanguageContext";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const { t, isRtl } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-stone-900 tracking-tight font-serif">
          {t("auth_login_title")}
        </h2>
        <p className="text-stone-500 mt-2 text-sm">
          {t("auth_login_sub")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            {t("auth_email_label")}
          </label>
          <div className="relative">
            <input
              type="email"
              {...register("email")}
              placeholder="name@example.com"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white transition text-sm"
            />
            <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
          </div>
          {errors.email && (
            <p className="text-red-600 text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-stone-700">
              {t("auth_pass_label")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-red-800 font-semibold hover:text-red-950 transition"
            >
              {t("auth_forgot_pass")}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-11 rtl:pl-4 rtl:pr-11 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1.5">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition duration-200 shadow-md shadow-red-900/15 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isRtl ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>{t("auth_login_btn")}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-stone-500">
        {t("auth_no_account")}{" "}
        <Link
          href="/register"
          className="text-red-800 font-bold hover:text-red-950 transition ml-1"
        >
          {t("auth_register_link")}
        </Link>
      </div>
    </div>
  );
}
