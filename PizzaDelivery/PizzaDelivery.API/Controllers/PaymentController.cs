using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaDelivery.Application.DTOs.Payments;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// إنشاء جلسة دفع جديدة على Razorpay للطلب
    /// </summary>
    [HttpPost("create-order")]
    [Authorize]
    public async Task<IActionResult> CreatePaymentOrder([FromBody] CreatePaymentOrderDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _paymentService.CreatePaymentOrderAsync(userId, dto.OrderId);
        return Ok(result);
    }

    /// <summary>
    /// التحقق من صحة توقيع الدفع وتحديث حالة الطلب إلى Paid
    /// </summary>
    [HttpPost("verify")]
    [Authorize]
    public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto dto)
    {
        var userId = GetCurrentUserId();
        var isValid = await _paymentService.VerifyAndConfirmAsync(userId, dto);
        if (!isValid)
        {
            return BadRequest(new { success = false, message = "فشل التحقق من صحة الدفع (توقيع غير صالح أو غير مكتمل)." });
        }

        return Ok(new { success = true, message = "تم تأكيد الدفع بنجاح ومطابقة التوقيع." });
    }

    /// <summary>
    /// استقبال إشعارات الـ Webhook من Razorpay وتحديث حالة الطلب
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> RazorpayWebhook()
    {
        if (!Request.Headers.TryGetValue("X-Razorpay-Signature", out var signatureHeader))
        {
            return Unauthorized(new { message = "X-Razorpay-Signature header is missing." });
        }

        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var requestBody = await reader.ReadToEndAsync();

        var result = await _paymentService.ProcessRazorpayWebhookAsync(requestBody, signatureHeader.ToString());
        return result switch
        {
            WebhookResultStatus.Success => Ok(new { status = "ok" }),
            WebhookResultStatus.InvalidSignature => Unauthorized(new { message = "Invalid signature." }),
            WebhookResultStatus.ProcessingError => StatusCode(StatusCodes.Status500InternalServerError, new { message = "Webhook processing error." }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unknown error." })
        };
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || !int.TryParse(claim.Value, out var userId))
            throw new UnauthorizedAccessException("تعذر استخراج هوية المستخدم من التوكن");

        return userId;
    }
}
