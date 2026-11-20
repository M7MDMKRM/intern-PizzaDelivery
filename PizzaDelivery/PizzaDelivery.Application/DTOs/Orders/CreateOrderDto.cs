using System.ComponentModel.DataAnnotations;
using PizzaDelivery.Domain.Entities;

namespace PizzaDelivery.Application.DTOs.Orders;

public class CreateOrderDto
{
    public OrderType OrderType { get; set; } = OrderType.Delivery;

    public string? DeliveryAddress { get; set; }

    public int? BranchId { get; set; }

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "يجب اختيار عنصر واحد على الأقل في الطلب")]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}