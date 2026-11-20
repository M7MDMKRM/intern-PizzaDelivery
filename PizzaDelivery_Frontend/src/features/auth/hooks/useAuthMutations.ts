import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { useAuthStore } from "./useAuthStore";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from "../types";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.token, data.role, data.user);
      toast.success("تم تسجيل الدخول بنجاح!");
      if (data.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/menu");
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "فشل تسجيل الدخول، تأكد من البيانات المدخلة";
      toast.error(msg);
    },
  });
}

export function useRegisterMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: () => {
      toast.success("تم إنشاء الحساب! يرجى إدخال رمز التحقق OTP المرسل لبريدك");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.title ||
        "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى";
      toast.error(msg);
    },
  });
}

export function useVerifyOtpMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyOtpDto) => authService.verifyOtp(data),
    onSuccess: (data) => {
      if (data.token) {
        setAuth(data.token, data.role, data.user);
        toast.success("تم تأكيد الحساب بنجاح!");
        router.push("/menu");
      } else {
        toast.success("تم تفعيل بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.");
        router.push("/login");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "رمز التحقق غير صحيح أو منتهي الصلاحية");
    },
  });
}

export function useForgotPasswordMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
    onSuccess: () => {
      toast.success("تم إرسال كود استعادة كلمة المرور إلى بريدك الإلكتروني");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إرسال الكود");
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("تم تعيين كلمة المرور الجديدة بنجاح! يمكنك تسجيل الدخول الآن");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل تعيين كلمة المرور الجديدة");
    },
  });
}

export function useResendVerificationEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),
    onSuccess: (data) => {
      toast.success(data?.message || "تم إعادة إرسال رابط/كود التفعيل إلى بريدك الإلكتروني");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل إعادة إرسال رابط التفعيل");
    },
  });
}
