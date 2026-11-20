using PizzaDelivery.Application.DTOs.Dashboard;

namespace PizzaDelivery.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}