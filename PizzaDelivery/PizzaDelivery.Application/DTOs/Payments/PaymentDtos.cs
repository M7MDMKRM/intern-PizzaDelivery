using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Payments;

public class CreatePaymentOrderDto
{
    [Required(ErrorMessage = "رقم الطلب مطلوب")]
    public int OrderId { get; set; }
}

public class PaymentOrderResponseDto
{
    public string RazorpayOrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string KeyId { get; set; } = string.Empty;
}

public class VerifyPaymentDto
{
    [Required(ErrorMessage = "رقم الطلب مطلوب")]
    public int OrderId { get; set; }

    [Required(ErrorMessage = "معرف الطلب مطلوب")]
    public string RazorpayOrderId { get; set; } = null!;

    [Required(ErrorMessage = "معرف الدفع مطلوب")]
    public string RazorpayPaymentId { get; set; } = null!;

    [Required(ErrorMessage = "توقيع الدفع مطلوب")]
    public string RazorpaySignature { get; set; } = null!;
}