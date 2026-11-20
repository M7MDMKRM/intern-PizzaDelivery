import { apiClient } from "@/lib/api-client";

export interface CreatePaymentOrderDto {
  orderId: number;
}

export interface PaymentOrderResponseDto {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentDto {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const paymentService = {
  createOrder: async (data: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto> => {
    const response = await apiClient.post<PaymentOrderResponseDto>(
      "/api/Payment/create-order",
      data
    );
    return response.data;
  },

  verifyPayment: async (data: VerifyPaymentDto): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      "/api/Payment/verify",
      data
    );
    return response.data;
  },
};
