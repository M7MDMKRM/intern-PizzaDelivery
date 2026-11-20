export type UserRole = "Customer" | "Admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  user?: User;
  message?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export interface VerifyOtpDto {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token?: string;
  otpCode?: string;
  newPassword: string;
}

export interface ResendVerificationEmailDto {
  email: string;
}
