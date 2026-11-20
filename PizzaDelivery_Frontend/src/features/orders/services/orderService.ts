import { apiClient } from "@/lib/api-client";
import { OrderResponseDto, PagedResult } from "../types";

export const orderService = {
  getMyOrders: async (page = 1, pageSize = 20): Promise<PagedResult<OrderResponseDto>> => {
    const response = await apiClient.get<PagedResult<OrderResponseDto>>("/api/Orders/my-orders", {
      params: { page, pageSize },
    });
    return response.data;
  },

  trackOrderByCode: async (trackingCode: string): Promise<OrderResponseDto> => {
    const response = await apiClient.get<OrderResponseDto>(`/api/Orders/track/${trackingCode}`);
    return response.data;
  },
};
