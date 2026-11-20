using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Orders;

public class CheckoutDto
{
    [Required(ErrorMessage = "نوع الطلب مطلوب")]
    public OrderType OrderType { get; set; } // Delivery = 1, Carryout = 2

    // مطلوب فقط في حالة التوصيل
    [MaxLength(500, ErrorMessage = "عنوان التوصيل لا يمكن أن يتجاوز 500 حرف")]
    public string? DeliveryAddress { get; set; }

    // مطلوب فقط في حالة الاستلام من المطعم
    public int? BranchId { get; set; }

    [Required(ErrorMessage = "رقم الهاتف مطلوب")]
    [Phone(ErrorMessage = "صيغة رقم الهاتف غير صحيحة")]
    [MaxLength(20, ErrorMessage = "رقم الهاتف لا يمكن أن يتجاوز 20 حرف")]
    public string PhoneNumber { get; set; } = null!;
}