using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.BackgroundServices;

public class StockMonitoringBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StockMonitoringBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

    public StockMonitoringBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<StockMonitoringBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Stock Monitoring Background Service is starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckStockAndNotifyAdminAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while executing Stock Monitoring Job.");
            }

            // لف Task.Delay بـ try/catch
            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("Stock Monitoring Background Service is stopping.");
    }

    private async Task CheckStockAndNotifyAdminAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var allIngredients = await context.Ingredients
            .Where(i => i.IsActive)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var lowStockToAlert = new List<Domain.Entities.Ingredient>();

        foreach (var ing in allIngredients)
        {
            if (ing.StockQuantity <= ing.MinThreshold)
            {
                // ابعت فقط للمكونات اللي LastLowStockAlertAt == null أو أقدم من 24 ساعة
                if (ing.LastLowStockAlertAt == null || ing.LastLowStockAlertAt.Value <= now.AddHours(-24))
                {
                    lowStockToAlert.Add(ing);
                    ing.LastLowStockAlertAt = now;
                }
            }
            else
            {
                // صَفّره (null) لما StockQuantity > MinThreshold
                if (ing.LastLowStockAlertAt != null)
                {
                    ing.LastLowStockAlertAt = null;
                }
            }
        }

        if (context.ChangeTracker.HasChanges())
        {
            await context.SaveChangesAsync(cancellationToken);
        }

        if (!lowStockToAlert.Any()) return;

        // ابعت لكل الأدمنز مش أول واحد
        var adminEmails = await context.Users
            .AsNoTracking()
            .Where(u => u.Role == Domain.Enums.UserRole.Admin)
            .Select(u => u.Email)
            .Where(email => !string.IsNullOrWhiteSpace(email))
            .ToListAsync(cancellationToken);

        if (!adminEmails.Any())
        {
            _logger.LogWarning("No Admin emails found to send low stock notification.");
            return;
        }

        // بناء محتوى الإيميل التنبيهي مع WebUtility.HtmlEncode
        var emailBody = $@"
            <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'>
                <h2 style='color: #d9534f;'>⚠️ تنبيه هام: نواقص في مخزون المكونات</h2>
                <p>مرحباً إدمن،</p>
                <p>تم رصد انخفاض في كميات بعض المكونات الأساسية عن الحد الأدنى المحدد للأمان (Minimum Threshold):</p>
                <table border='1' cellpadding='8' style='border-collapse: collapse; width: 100%; border-color: #ddd;'>
                    <thead style='background-color: #f8f9fa;'>
                        <tr>
                            <th>المكون</th>
                            <th>الرصيد الحالي بالمخزن</th>
                            <th>الحد الأدنى للأمان</th>
                        </tr>
                    </thead>
                    <tbody>
                        {string.Join("", lowStockToAlert.Select(item => $@"
                            <tr>
                                <td><strong>{WebUtility.HtmlEncode(item.Name)}</strong></td>
                                <td style='color: #c9302c;'>{item.StockQuantity} {item.Unit}</td>
                                <td>{item.MinThreshold} {item.Unit}</td>
                            </tr>"))}
                    </tbody>
                </table>
                <p style='margin-top: 20px;'>يرجى اتخاذ الإجراءات اللازمة وإعادة تزويد المخزون لتجنب تعطل الطلبات.</p>
                <hr/>
                <small style='color: #888;'>نظام إدارة مطعم البيتزا - فحص دوري تلقائي</small>
            </div>";

        foreach (var adminEmail in adminEmails)
        {
            try
            {
                await emailService.SendEmailAsync(adminEmail, "⚠️ تنبيه انخفاض المخزون بالمطعم", emailBody);
                _logger.LogInformation("Low stock alert email sent to admin: {AdminEmail}", adminEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send low stock email to admin: {AdminEmail}", adminEmail);
            }
        }
    }
}