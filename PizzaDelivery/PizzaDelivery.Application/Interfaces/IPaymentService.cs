using PizzaDelivery.Application.DTOs.Payments;

namespace PizzaDelivery.Application.Interfaces;

public enum WebhookResultStatus
{
    Success,
    InvalidSignature,
    ProcessingError
}

public interface IPaymentService
{
    Task<PaymentOrderResponseDto> CreatePaymentOrderAsync(int userId, int orderId);
    Task<bool> VerifyAndConfirmAsync(int userId, VerifyPaymentDto dto);
    Task<WebhookResultStatus> ProcessRazorpayWebhookAsync(string requestBody, string signature);
}