import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن لا يقل عن 3 أحرف"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  phoneNumber: z.string().min(10, "يرجى إدخال رقم هاتف صحيح"),
  address: z.string().min(3, "يرجى إدخال عنوان السكن أو التوصيل"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  otpCode: z.string().min(4, "رمز التحقق يجب أن لا يقل عن 4 أرقام"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  otpCode: z.string().min(4, "رمز التحقق يجب أن لا يقل عن 4 أرقام"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
