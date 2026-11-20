using PizzaDelivery.Application.Common;
using PizzaDelivery.Application.DTOs.Orders;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto?> GetOrderByIdAsync(int orderId, int userId, bool isAdmin);

    Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, int page = 1, int pageSize = 20);

    Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int page = 1, int pageSize = 20);

    Task<OrderTrackingDto?> TrackOrderByCodeAsync(Guid trackingCode);
    Task<OrderTrackingDto?> TrackOrderAsync(int orderId);

    Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus);
    Task<OrderResponseDto> CheckoutAsync(int userId, CheckoutDto dto);
}