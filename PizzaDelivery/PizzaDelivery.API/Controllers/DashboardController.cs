using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaDelivery.Application.DTOs.Dashboard;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// عرض تقرير وإحصائيات لوحة تحكم الأدمن (خاص بالأدمن فقط)
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.GetDashboardStatsAsync();
        return Ok(stats);
    }
}