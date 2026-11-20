import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pizzaService } from "../services/pizzaService";

export const PIZZA_KEYS = {
  all: ["pizzas"] as const,
  ingredients: ["ingredients"] as const,
};

export function usePizzas() {
  return useQuery({
    queryKey: PIZZA_KEYS.all,
    queryFn: pizzaService.getPizzas,
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: PIZZA_KEYS.ingredients,
    queryFn: pizzaService.getIngredients,
  });
}

export function useIngredientCategories() {
  return useQuery({
    queryKey: ["ingredient-categories"] as const,
    queryFn: pizzaService.getCategories,
  });
}

export function useUpdateIngredientStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      pizzaService.updateIngredientStock(id, stock),
    onSuccess: () => {
      toast.success("تم تحديث رصيد المخزون بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.ingredients });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل تحديث المخزون");
    },
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => pizzaService.createIngredient(data),
    onSuccess: () => {
      toast.success("تم إضافة المكون الجديد بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.ingredients });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل إضافة المكون");
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pizzaService.deleteIngredient(id),
    onSuccess: () => {
      toast.success("تم حذف المكون بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.ingredients });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل حذف المكون");
    },
  });
}

export function useCreatePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => pizzaService.createPizza(data),
    onSuccess: () => {
      toast.success("تم إضافة البيتزا إلى القائمة بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل إضافة البيتزا");
    },
  });
}

export function useUpdatePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      pizzaService.updatePizza(id, data),
    onSuccess: () => {
      toast.success("تم تحديث بيانات البيتزا بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل تحديث البيتزا");
    },
  });
}

export function useDeletePizza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pizzaService.deletePizza(id),
    onSuccess: () => {
      toast.success("تم حذف البيتزا من القائمة بنجاح!");
      queryClient.invalidateQueries({ queryKey: PIZZA_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل حذف البيتزا");
    },
  });
}
