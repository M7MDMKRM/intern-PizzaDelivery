using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Infrastructure.Data;
using System.Security.Claims;

namespace PizzaDelivery.API.Hubs;

[Authorize]
public class OrderHub : Hub
{
    private readonly AppDbContext _context;

    public OrderHub(AppDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        if (Context.User != null && Context.User.IsInRole("Admin"))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        await base.OnConnectedAsync();
    }

    // انضمام العميل لغرفة تتبع طلبه الخاص فقط أو الأدمن
    public async Task JoinOrderGroup(int orderId)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = Context.User?.IsInRole("Admin") ?? false;

        if (isAdmin)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
            return;
        }

        if (int.TryParse(userIdStr, out var userId))
        {
            var isOwner = await _context.Orders.AsNoTracking()
                .AnyAsync(o => o.Id == orderId && o.UserId == userId);

            if (isOwner)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
                return;
            }
        }

        throw new HubException("غير مصرح لك بالانضمام لتتبع هذا الطلب.");
    }

    // مغادرة غرفة التتبع
    public async Task LeaveOrderGroup(int orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Order_{orderId}");
    }

    // انضمام الأدمن / موظفي المطبخ لغرفة إشعارات الطلبات الجديدة
    public async Task JoinAdminGroup()
    {
        if (Context.User != null && Context.User.IsInRole("Admin"))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        else
        {
            throw new HubException("مخصص للمشرفين فقط.");
        }
    }
}
