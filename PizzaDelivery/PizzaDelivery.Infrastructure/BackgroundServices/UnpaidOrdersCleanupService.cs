using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.BackgroundServices;

public class UnpaidOrdersCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<UnpaidOrdersCleanupService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public UnpaidOrdersCleanupService(
        IServiceProvider serviceProvider,
        ILogger<UnpaidOrdersCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Unpaid Orders Cleanup Service is starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupUnpaidOrdersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while executing Unpaid Orders Cleanup Job.");
            }

            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("Unpaid Orders Cleanup Service is stopping.");
    }

    private async Task CleanupUnpaidOrdersAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

        var cutoffTime = DateTime.UtcNow.AddMinutes(-15);

        var expiredOrders = await context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Pending
                     && o.Status == OrderStatus.OrderReceived
                     && o.OrderDate <= cutoffTime)
            .Select(o => o.Id)
            .ToListAsync(cancellationToken);

        if (!expiredOrders.Any()) return;

        _logger.LogInformation("Found {Count} expired unpaid orders to cancel.", expiredOrders.Count);

        foreach (var orderId in expiredOrders)
        {
            try
            {
                // استخدام UpdateOrderStatusAsync لضمان نفس منطق الـ State Machine والـ Rollback الآمن
                var success = await orderService.UpdateOrderStatusAsync(orderId, OrderStatus.Cancelled);
                if (success)
                {
                    _logger.LogInformation("Expired order #{OrderId} cancelled successfully with stock rollback.", orderId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cancel expired order #{OrderId}.", orderId);
            }
        }
    }
}
