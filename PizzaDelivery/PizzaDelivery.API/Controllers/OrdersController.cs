using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PizzaDelivery.API.Hubs;
using PizzaDelivery.Application.Common;
using PizzaDelivery.Application.DTOs.Orders;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IHubContext<OrderHub> _hubContext;

    public OrdersController(
        IOrderService orderService,
        IHubContext<OrderHub> hubContext)
    {
        _orderService = orderService;
        _hubContext = hubContext;
    }

    // 1. جلب تفاصيل طلب محدد بالـ Id
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");

        var order = await _orderService.GetOrderByIdAsync(id, userId, isAdmin);
        if (order == null)
            return NotFound(new { message = "الطلب غير موجود أو لا تملك صلاحية الوصول إليه" });

        return Ok(order);
    }

    // 2. جلب جميع طلبات العميل الحالي المسجل مع Pagination
    [HttpGet("my-orders")]
    public async Task<ActionResult<PagedResult<OrderResponseDto>>> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var orders = await _orderService.GetMyOrdersAsync(userId, page, pageSize);
        return Ok(orders);
    }

    // 3. جلب جميع الطلبات في النظام (مقتصرة على الأدمن فقط) مع Pagination
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResult<OrderResponseDto>>> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var orders = await _orderService.GetAllOrdersAsync(page, pageSize);
        return Ok(orders);
    }

    // 4. تحديث حالة الطلب (مقتصرة على الأدمن فقط) مع بث فوري للعميل
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatus newStatus)
    {
        var success = await _orderService.UpdateOrderStatusAsync(id, newStatus);
        if (!success)
            return NotFound(new { message = "الطلب غير موجود" });

        // جلب بيانات التتبع بعد التحديث وإرسالها فورياً لشاشة العميل
        var trackingInfo = await _orderService.TrackOrderAsync(id);
        if (trackingInfo != null)
        {
            await _hubContext.Clients.Group($"Order_{id}").SendAsync("OrderStatusChanged", trackingInfo);
        }

        return Ok(new { message = "تم تحديث حالة الطلب بنجاح", currentStatus = newStatus.ToString() });
    }

    // 5. مسار تتبع الطلب بالـ TrackingCode (Guid) أو بالـ Id
    [AllowAnonymous]
    [HttpGet("track/{trackingCode:guid}")]
    public async Task<IActionResult> TrackOrderByCode(Guid trackingCode)
    {
        var trackingInfo = await _orderService.TrackOrderByCodeAsync(trackingCode);
        if (trackingInfo == null)
        {
            return NotFound(new { message = "لم يتم العثور على طلب بهذا الرمز" });
        }

        return Ok(trackingInfo);
    }

    [AllowAnonymous]
    [HttpGet("track/{id:int}")]
    public async Task<IActionResult> TrackOrderById(int id)
    {
        var trackingInfo = await _orderService.TrackOrderAsync(id);
        if (trackingInfo == null)
        {
            return NotFound(new { message = "لم يتم العثور على طلب بهذا الرقم" });
        }

        return Ok(trackingInfo);
    }

    /// <summary>
    /// تحويل محتويات سلة المشتريات إلى طلب رسمي وإفراغ السلة وبث إشعار للأدمن
    /// </summary>
    [HttpPost("checkout")]
    [Authorize]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        var userId = GetCurrentUserId();
        var order = await _orderService.CheckoutAsync(userId, dto);

        // إشعار فوري للوحة تحكم الأدمن بالطلب الجديد القادم من السلة
        await _hubContext.Clients.Group("Admins").SendAsync("ReceiveNewOrder", new
        {
            OrderId = order.Id,
            CustomerName = order.CustomerName,
            TotalAmount = order.TotalAmount,
            OrderType = order.OrderType.ToString(),
            OrderDate = order.OrderDate,
            TrackingCode = order.TrackingCode
        });

        return Ok(order);
    }

    // دالة مساعدة لاستخراج UserId من الـ JWT Token المرفق
    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || !int.TryParse(claim.Value, out var userId))
            throw new UnauthorizedAccessException("تعذر استخراج هوية المستخدم من التوكن");

        return userId;
    }
}
