import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/orderService";

export const ORDER_KEYS = {
  myOrders: (page: number, pageSize: number) => ["orders", "my-orders", page, pageSize] as const,
  trackByCode: (code: string) => ["orders", "track", code] as const,
};

export function useMyOrders(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ORDER_KEYS.myOrders(page, pageSize),
    queryFn: () => orderService.getMyOrders(page, pageSize),
  });
}

export function useTrackOrderByCode(code: string, enabled = false) {
  return useQuery({
    queryKey: ORDER_KEYS.trackByCode(code),
    queryFn: () => orderService.trackOrderByCode(code),
    enabled: Boolean(code && enabled),
    retry: 1,
  });
}
