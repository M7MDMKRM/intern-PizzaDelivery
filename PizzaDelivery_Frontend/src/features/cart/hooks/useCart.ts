import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartService } from "../services/cartService";
import { AddToCartDto, CheckoutDto } from "../types";

export const CART_KEYS = {
  cart: ["cart"] as const,
  branches: ["branches"] as const,
};

export function useCart() {
  return useQuery({
    queryKey: CART_KEYS.cart,
    queryFn: cartService.getCart,
    retry: false,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: CART_KEYS.branches,
    queryFn: cartService.getBranches,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartDto) => cartService.addItem(data),
    onSuccess: () => {
      toast.success("تمت الإضافة إلى السلة بنجاح!");
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء الإضافة للسلة أو المكون غير متوفر بالمخزن"
      );
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number | string) => cartService.removeItem(itemId),
    onSuccess: () => {
      toast.success("تم حذف العنصر من السلة");
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل حذف العنصر");
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number | string; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل تعديل الكمية بالمخزن");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      toast.success("تم إفراغ السلة بالكامل");
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل إفراغ السلة");
    },
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutDto) => cartService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.cart });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "تعذر إتمام الطلب، قد تكون بعض المكونات غير متوفرة في المخزن حالياً";
      toast.error(errorMsg, { duration: 6000 });
    },
  });
}
