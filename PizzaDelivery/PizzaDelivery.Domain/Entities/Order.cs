using System.ComponentModel.DataAnnotations;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Domain.Entities;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public OrderStatus Status { get; set; } = OrderStatus.OrderReceived;

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public string? RazorpayOrderId { get; set; }

    public string? RazorpayPaymentId { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    public Guid TrackingCode { get; set; } = Guid.NewGuid();

    public decimal TotalAmount { get; set; }

    public string? PhoneNumber { get; set; }

    public string? DeliveryAddress { get; set; }

    public OrderType OrderType { get; set; } = OrderType.Delivery;

    public int? BranchId { get; set; }
    public Branch? Branch { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}