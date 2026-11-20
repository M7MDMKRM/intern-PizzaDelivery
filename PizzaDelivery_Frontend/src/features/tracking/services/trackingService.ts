import { apiClient } from "@/lib/api-client";
import { OrderDetails, OrderStatus } from "../types";

export const trackingService = {
  getOrderById: async (orderId: number | string): Promise<OrderDetails> => {
    try {
      const response = await apiClient.get<any>(`/api/Orders/track/${orderId}`);
      const data = response.data;
      return {
        id: data.orderId || data.id,
        orderNumber: String(data.orderId || data.id),
        status: data.status,
        statusText: data.statusText,
        progressPercentage: data.progressPercentage,
        totalAmount: data.totalAmount ?? 0,
        createdAt: data.orderDate || data.createdAt || new Date().toISOString(),
        deliveryAddress: data.deliveryAddress || data.destinationInfo,
        phoneNumber: data.phoneNumber,
        orderType: data.orderType ?? 1,
        items: (data.items || []).length > 0
          ? data.items
          : (data.itemsSummary || []).map((summary: string, i: number) => ({
              id: i + 1,
              pizzaName: summary,
              isCustom: false,
              quantity: 1,
              unitPrice: 0,
              totalPrice: 0,
            })),
      };
    } catch {
      const response = await apiClient.get<any>(`/api/Orders/${orderId}`);
      const data = response.data;
      return {
        id: data.id || data.orderId,
        orderNumber: String(data.id || data.orderId),
        status: data.status,
        statusText: data.statusText,
        progressPercentage: data.progressPercentage,
        totalAmount: data.totalAmount ?? 0,
        createdAt: data.orderDate || data.createdAt || new Date().toISOString(),
        deliveryAddress: data.deliveryAddress,
        phoneNumber: data.phoneNumber,
        orderType: data.orderType ?? 1,
        items: data.items || [],
      };
    }
  },

  getAllOrders: async (): Promise<OrderDetails[]> => {
    const response = await apiClient.get<any>("/api/Orders");
    const data = response.data;
    // Backend returns PagedResult<OrderResponseDto> { items, totalCount, page... }
    const rawList = Array.isArray(data) ? data : data?.items || [];
    return rawList.map((order: any) => ({
      id: order.id,
      orderNumber: String(order.id),
      status: order.status,
      statusText: order.statusText,
      progressPercentage: order.progressPercentage,
      totalAmount: order.totalAmount ?? 0,
      createdAt: order.orderDate || order.createdAt || new Date().toISOString(),
      deliveryAddress: order.deliveryAddress,
      phoneNumber: order.phoneNumber,
      orderType: order.orderType ?? 1,
      items: order.items || [],
    }));
  },

  updateOrderStatus: async (
    orderId: number | string,
    status: OrderStatus
  ): Promise<void> => {
    await apiClient.patch(`/api/Orders/${orderId}/status`, Number(status), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
