import { apiClient } from "@/lib/apiClient";
import { Ingredient, Pizza } from "../types";

export const pizzaService = {
  getPizzas: async (): Promise<Pizza[]> => {
    const response = await apiClient.get<Pizza[]>("/api/Pizzas");
    return response.data;
  },

  getIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiClient.get<any[]>("/api/Ingredients");
    // Normalize backend categoryName into frontend Ingredient format
    return (response.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.categoryName || item.category || "Base",
      categoryName: item.categoryName || item.category || "Base",
      extraPrice: item.extraPrice ?? item.costPrice ?? 0,
      stockQuantity: item.stockQuantity ?? 0,
      imageUrl: item.imageUrl,
    }));
  },

  getCategories: async (): Promise<{ id: number; name: string; description?: string }[]> => {
    const response = await apiClient.get<any[]>("/api/Ingredients/categories");
    return response.data;
  },

  updateIngredientStock: async (id: number, stock: number): Promise<void> => {
    await apiClient.put(`/api/Ingredients/${id}/stock`, { stock });
  },

  createIngredient: async (data: any): Promise<any> => {
    const response = await apiClient.post("/api/Ingredients", data);
    return response.data;
  },

  deleteIngredient: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Ingredients/${id}`);
  },

  createPizza: async (data: any): Promise<Pizza> => {
    const response = await apiClient.post<Pizza>("/api/Pizzas", data);
    return response.data;
  },

  updatePizza: async (id: number, data: any): Promise<Pizza> => {
    const response = await apiClient.put<Pizza>(`/api/Pizzas/${id}`, data);
    return response.data;
  },

  deletePizza: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Pizzas/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string; relativeUrl: string; fileName: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string; relativeUrl: string; fileName: string }>(
      "/api/Uploads",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
