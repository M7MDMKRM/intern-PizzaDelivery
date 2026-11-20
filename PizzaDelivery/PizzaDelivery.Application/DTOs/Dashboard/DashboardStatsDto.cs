namespace PizzaDelivery.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public decimal TodayRevenue { get; set; }
    public decimal MonthRevenue { get; set; }
    public decimal TotalRevenue { get; set; }

    public int TodayOrdersCount { get; set; }
    public int ActiveOrdersCount { get; set; } // الطلبات الجاري تحضيرها أو توصيلها
    public int TotalOrdersCount { get; set; }

    // الأكثر مبيعاً
    public List<TopSellingPizzaDto> TopSellingPizzas { get; set; } = new();

    // تنبيهات المكونات التي قاربت على النفاد
    public List<LowStockAlertDto> LowStockAlerts { get; set; } = new();
}

public class TopSellingPizzaDto
{
    public int PizzaId { get; set; }
    public string PizzaName { get; set; } = string.Empty;
    public int TotalSoldQuantity { get; set; }
    public decimal TotalRevenueGenerated { get; set; }
}

public class LowStockAlertDto
{
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal MinThreshold { get; set; }
    public string Unit { get; set; } = string.Empty;
}