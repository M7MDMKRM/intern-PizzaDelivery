import { apiClient } from "@/lib/api-client";
import { AddToCartDto, Cart, CheckoutDto, OrderResponse, Branch } from "../types";

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>("/api/Cart");
    return response.data;
  },

  addItem: async (item: AddToCartDto): Promise<void> => {
    await apiClient.post("/api/Cart/items", item);
  },

  removeItem: async (itemId: number | string): Promise<void> => {
    await apiClient.delete(`/api/Cart/items/${itemId}`);
  },

  updateQuantity: async (itemId: number | string, quantity: number): Promise<void> => {
    await apiClient.put(`/api/Cart/items/${itemId}`, { quantity });
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete("/api/Cart/clear");
  },

  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await apiClient.get<Branch[]>("/api/Branches");
      return response.data;
    } catch {
      // Fallback default branches if backend branch table is empty
      return [
        { id: 1, name: "فرع وسط البلد - التحرير", address: "شارع طلعت حرب، وسط البلد", phoneNumber: "01001234567" },
        { id: 2, name: "فرع مدينة نصر", address: "شارع عباس العقاد، مدينة نصر", phoneNumber: "01001234568" },
        { id: 3, name: "فرع المعادي", address: "شارع النصر، المعادي الجديدة", phoneNumber: "01001234569" },
        { id: 4, name: "فرع الدقي والمهندسين", address: "شارع مصدق، الدقي", phoneNumber: "01001234570" },
      ];
    }
  },

  checkout: async (data: CheckoutDto): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>("/api/Orders/checkout", data);
    return response.data;
  },
};
