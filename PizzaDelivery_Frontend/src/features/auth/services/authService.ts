import { apiClient } from "@/lib/apiClient";
import {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from "../types";

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<any>("/api/Auth/login", data);
    return {
      token: response.data.token || response.data.Token,
      role: (response.data.role || response.data.Role || "Customer") as any,
      user: {
        id: String(response.data.userid || response.data.id || ""),
        email: response.data.email || response.data.Email || data.email,
        fullName: response.data.fullName || response.data.FullName || "",
        role: (response.data.role || response.data.Role || "Customer") as any,
      },
    };
  },

  register: async (data: RegisterDto): Promise<{ message: string }> => {
    const response = await apiClient.post<any>("/api/Auth/register", data);
    return {
      message: response.data?.message || "تم إنشاء الحساب بنجاح، يرجى تفعيل البريد الإلكتروني.",
    };
  },

  verifyOtp: async (data: VerifyOtpDto): Promise<AuthResponse> => {
    // Backend uses /api/Auth/verify-email?token=
    const token = data.otpCode;
    await apiClient.get("/api/Auth/verify-email", {
      params: { token },
    });
    return {
      token: "",
      role: "Customer",
      message: "تم تفعيل الحساب بنجاح!",
    };
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/api/Auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordDto): Promise<{ message: string }> => {
    // If backend expects token property, map otpCode to token if needed
    const payload = {
      email: data.email,
      token: data.token || data.otpCode || "",
      newPassword: data.newPassword,
    };
    const response = await apiClient.post<{ message: string }>("/api/Auth/reset-password", payload);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.get<{ message: string }>("/api/Auth/verify-email", {
      params: { token },
    });
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/api/Auth/resend-verification-email", null, {
      params: { email },
    });
    return response.data;
  },
};
