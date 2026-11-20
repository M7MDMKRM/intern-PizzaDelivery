export interface LowStockAlert {
  id: number;
  name: string;
  category: string;
  stockQuantity: number;
  threshold: number;
}

export interface TopSellingPizza {
  pizzaId: number;
  pizzaName: string;
  ordersCount: number;
  totalRevenue: number;
}

export interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  activeOrdersCount: number;
  topSellingPizzas: TopSellingPizza[];
  lowStockAlerts: LowStockAlert[];
}

export interface AdminBranch {
  id: number;
  name: string;
  city?: string;
  address: string;
  phoneNumber?: string;
  openingHours?: string;
  isActive: boolean;
}

export interface CreateAdminBranchDto {
  name: string;
  city: string;
  address: string;
  phoneNumber: string;
  openingHours?: string;
}
