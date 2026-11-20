using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Orders;

public class OrderTrackingDto
{
    public int OrderId { get; set; }
    public Guid TrackingCode { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string StatusDescription { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }

    public OrderType OrderType { get; set; }
    public string OrderTypeText { get; set; } = string.Empty;

    public string DestinationInfo { get; set; } = string.Empty;
    public string? DeliveryAddress { get; set; }
    public string? PhoneNumber { get; set; }
    public decimal TotalAmount { get; set; }

    public List<string> ItemsSummary { get; set; } = new();
}