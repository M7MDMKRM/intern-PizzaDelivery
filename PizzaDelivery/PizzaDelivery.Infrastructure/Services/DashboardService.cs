using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Application.DTOs.Dashboard;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfToday = now.Date;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);

        // استبعاد الطلبات الملغاة من الحسابات المالية
        var validOrdersQuery = _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled);

        // 1. حساب الإيرادات
        var todayRevenue = await validOrdersQuery
            .Where(o => o.OrderDate >= startOfToday)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var monthRevenue = await validOrdersQuery
            .Where(o => o.OrderDate >= startOfMonth)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var totalRevenue = await validOrdersQuery
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        // 2. حساب عدد الطلبات
        var todayOrdersCount = await _context.Orders
            .AsNoTracking()
            .CountAsync(o => o.OrderDate >= startOfToday);

        var activeOrdersCount = await _context.Orders
            .AsNoTracking()
            .CountAsync(o => o.Status == OrderStatus.OrderReceived
                          || o.Status == OrderStatus.Preparing
                          || o.Status == OrderStatus.InTheOven
                          || o.Status == OrderStatus.OutForDelivery);

        var totalOrdersCount = await _context.Orders.AsNoTracking().CountAsync();

        // 3. أعلى 5 أصناف مبيعاً عبر تجميع SQL على PizzaId فقط
        var top = await _context.OrderItems.AsNoTracking()
            .Where(oi => !oi.IsCustom && oi.PizzaId.HasValue && oi.Order != null && oi.Order.Status != OrderStatus.Cancelled)
            .GroupBy(oi => oi.PizzaId!.Value)
            .Select(g => new
            {
                PizzaId = g.Key,
                Qty = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.Qty)
            .Take(5)
            .ToListAsync();

        var ids = top.Select(t => t.PizzaId).ToList();
        var names = await _context.Pizzas.AsNoTracking()
            .Where(p => ids.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var topSellingPizzas = top.Select(t => new TopSellingPizzaDto
        {
            PizzaId = t.PizzaId,
            PizzaName = names.GetValueOrDefault(t.PizzaId, string.Empty),
            TotalSoldQuantity = t.Qty,
            TotalRevenueGenerated = t.Revenue
        }).ToList();

        // 4. فحص المكونات التي انخفض رصيدها عن الحد الأدنى
        var lowStockAlerts = await _context.Ingredients
            .AsNoTracking()
            .Where(i => i.IsActive && i.StockQuantity <= i.MinThreshold)
            .Select(i => new LowStockAlertDto
            {
                IngredientId = i.Id,
                IngredientName = i.Name,
                CurrentStock = i.StockQuantity,
                MinThreshold = i.MinThreshold,
                Unit = i.Unit.ToString()
            })
            .ToListAsync();

        return new DashboardStatsDto
        {
            TodayRevenue = todayRevenue,
            MonthRevenue = monthRevenue,
            TotalRevenue = totalRevenue,
            TodayOrdersCount = todayOrdersCount,
            ActiveOrdersCount = activeOrdersCount,
            TotalOrdersCount = totalOrdersCount,
            TopSellingPizzas = topSellingPizzas,
            LowStockAlerts = lowStockAlerts
        };
    }
}
