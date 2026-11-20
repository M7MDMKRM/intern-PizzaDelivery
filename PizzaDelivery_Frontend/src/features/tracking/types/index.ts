export enum OrderStatus {
  OrderReceived = 1,
  Preparing = 2,
  InTheOven = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Cancelled = 6,
}

export interface OrderStatusChangedPayload {
  orderId: number;
  status: OrderStatus;
  statusText: string;
  progressPercentage: number; // 25, 50, 75, 90, 100
  estimatedDeliveryTime?: string;
}

export interface NewOrderNotificationPayload {
  orderId: number;
  customerName: string;
  totalAmount: number;
  orderType: number;
  createdAt: string;
}

export interface OrderDetails {
  id: number;
  orderNumber?: string;
  status: OrderStatus;
  statusText?: string;
  progressPercentage?: number;
  totalAmount: number;
  createdAt: string;
  deliveryAddress?: string;
  phoneNumber?: string;
  orderType: number;
  items: Array<{
    id: number;
    pizzaName?: string;
    isCustom: boolean;
    customDetails?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}
