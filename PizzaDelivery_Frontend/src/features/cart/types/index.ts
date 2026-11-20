import { Pizza } from "@/features/pizza-builder/types";

export interface Branch {
  id: number;
  name: string;
  address: string;
  phoneNumber?: string;
}

export interface CartItem {
  id: number | string;
  pizzaId?: number;
  pizzaName?: string;
  pizza?: Pizza;
  isCustom: boolean;
  customDetails?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface AddToCartDto {
  pizzaId?: number;
  quantity: number;
  isCustom: boolean;
  selectedIngredientIds?: number[];
  customDetails?: string;
  unitPrice?: number;
}

export enum OrderType {
  Delivery = 1,
  Carryout = 2,
}

export interface CheckoutDto {
  orderType: OrderType;
  deliveryAddress?: string;
  branchId?: number | null;
  phoneNumber: string;
}

export interface OrderResponse {
  id: number;
  orderNumber?: string;
  totalAmount: number;
  status: number;
  createdAt: string;
  deliveryAddress?: string;
  orderType: OrderType;
  items?: CartItem[];
}
