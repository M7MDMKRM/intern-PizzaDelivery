using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Orders;

public class OrderResponseDto
{
    public int Id { get; set; }
    public Guid TrackingCode { get; set; }
    public int UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? PhoneNumber { get; set; }
    public string? DeliveryAddress { get; set; }

    public OrderType OrderType { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }

    public List<OrderItemResponseDto> Items { get; set; } = new();
}

