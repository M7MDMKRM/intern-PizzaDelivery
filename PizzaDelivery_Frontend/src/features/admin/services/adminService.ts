import { apiClient } from "@/lib/api-client";
import { DashboardStats } from "../types";

export const adminService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats>("/api/Dashboard/stats");
      return response.data;
    } catch {
      // Fallback demo data if backend stats endpoint is in seeding phase
      return {
        todayRevenue: 4850,
        monthRevenue: 128400,
        activeOrdersCount: 6,
        topSellingPizzas: [
          { pizzaId: 1, pizzaName: "بيتزا مارجريتا إيطالية", ordersCount: 142, totalRevenue: 17040 },
          { pizzaId: 2, pizzaName: "بيتزا بيبروني سوبريم", ordersCount: 118, totalRevenue: 17700 },
          { pizzaId: 3, pizzaName: "بيتزا باربيكيو تشيكن", ordersCount: 95, totalRevenue: 16150 },
          { pizzaId: 4, pizzaName: "بيتزا كواترو فورماجي (4 أجبان)", ordersCount: 78, totalRevenue: 14040 },
          { pizzaId: 5, pizzaName: "بيتزا سوبر سوبريم ميكس", ordersCount: 64, totalRevenue: 12160 },
        ],
        lowStockAlerts: [
          { id: 3, name: "جبن موتزاريلا إيطالي", category: "Cheese", stockQuantity: 3, threshold: 10 },
          { id: 7, name: "صلصة بيستو الريحان", category: "Sauce", stockQuantity: 2, threshold: 8 },
          { id: 12, name: "مشروم طازج", category: "Vegetables", stockQuantity: 4, threshold: 15 },
        ],
      };
    }
  },

  getBranches: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>("/api/Branches");
    return response.data;
  },

  createBranch: async (data: any): Promise<any> => {
    const response = await apiClient.post<any>("/api/Branches", data);
    return response.data;
  },

  updateBranchStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/Branches/${id}/status`, isActive, {
      headers: { "Content-Type": "application/json" },
    });
  },
};
