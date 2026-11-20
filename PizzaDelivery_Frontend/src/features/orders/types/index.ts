import { OrderStatus } from "@/features/tracking/types";

export interface OrderItemResponse {
  id: number;
  pizzaId?: number;
  pizzaName?: string;
  isCustom: boolean;
  customDetails?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponseDto {
  id: number;
  trackingCode: string;
  userId: number;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  phoneNumber?: string;
  deliveryAddress?: string;
  orderType: number;
  branchId?: number;
  branchName?: string;
  items: OrderItemResponse[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
