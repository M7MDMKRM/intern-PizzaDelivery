import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trackingService } from "../services/trackingService";
import { OrderStatus } from "../types";

export const ORDER_KEYS = {
  detail: (id: number | string) => ["order", id] as const,
  all: ["admin-orders"] as const,
};

export function useOrder(orderId: number | string) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: () => trackingService.getOrderById(orderId),
    enabled: !!orderId,
    refetchInterval: 15000, // Polling fallback alongside SignalR
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ORDER_KEYS.all,
    queryFn: trackingService.getAllOrders,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number | string;
      status: OrderStatus;
    }) => trackingService.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      toast.success("تم تحديث حالة الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      console.error("Order status update error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
          : null) ||
        error.message ||
        "فشل تحديث حالة الطلب";
      toast.error(msg);
    },
  });
}
