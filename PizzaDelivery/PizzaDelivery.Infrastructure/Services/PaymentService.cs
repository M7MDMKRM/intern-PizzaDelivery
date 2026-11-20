
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PizzaDelivery.Application.DTOs.Payments;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly string _keyId;
    private readonly string _keySecret;
    private readonly string _webhookSecret;

    public PaymentService(
        AppDbContext context,
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _context = context;
        _httpClient = httpClient;
        _keyId = configuration["Razorpay:KeyId"]
            ?? throw new InvalidOperationException("Razorpay:KeyId is missing");
        _keySecret = configuration["Razorpay:KeySecret"]
            ?? throw new InvalidOperationException("Razorpay:KeySecret is missing");
        _webhookSecret = configuration["Razorpay:WebhookSecret"]
            ?? throw new InvalidOperationException("Razorpay:WebhookSecret is missing");
    }

    public async Task<PaymentOrderResponseDto> CreatePaymentOrderAsync(int userId, int orderId)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId)
            ?? throw new ArgumentException("الطلب غير موجود.");

        if (order.PaymentStatus == PaymentStatus.Paid)
            throw new InvalidOperationException("الطلب مدفوع بالفعل.");

        if (order.Status == OrderStatus.Cancelled)
            throw new InvalidOperationException("الطلب ملغي.");

        // 5) لو الطلب Pending وعنده RazorpayOrderId، رجّعه بدل توليد واحد جديد
        if (order.PaymentStatus == PaymentStatus.Pending && !string.IsNullOrWhiteSpace(order.RazorpayOrderId))
        {
            return new PaymentOrderResponseDto
            {
                RazorpayOrderId = order.RazorpayOrderId,
                Amount = order.TotalAmount,
                Currency = "INR",
                KeyId = _keyId
            };
        }

        // Razorpay يحسب المبالغ بالوحدة الصغرى (Sub-units / Paise) => ضرب في 100
        var amountInSubUnits = (long)Math.Round(order.TotalAmount * 100);

        var requestBody = new
        {
            amount = amountInSubUnits,
            currency = "INR",
            receipt = $"order_{order.Id}"
        };

        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_keyId}:{_keySecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Post, "orders");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"فشل إنشاء طلب الدفع على Razorpay: {err}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var razorpayOrderId = doc.RootElement.GetProperty("id").GetString()!;

        order.RazorpayOrderId = razorpayOrderId;
        await _context.SaveChangesAsync();

        return new PaymentOrderResponseDto
        {
            RazorpayOrderId = razorpayOrderId,
            Amount = order.TotalAmount,
            Currency = "INR",
            KeyId = _keyId
        };
    }

    public async Task<bool> VerifyAndConfirmAsync(int userId, VerifyPaymentDto dto)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId)
            ?? throw new ArgumentException("الطلب غير موجود.");

        if (order.PaymentStatus == PaymentStatus.Paid) return true; // Idempotent

        if (order.RazorpayOrderId != dto.RazorpayOrderId)
            throw new InvalidOperationException("بيانات الدفع لا تخص هذا الطلب.");

        var payload = $"{dto.RazorpayOrderId}|{dto.RazorpayPaymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
        var expected = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

        byte[] provided;
        try
        {
            provided = Convert.FromHexString(dto.RazorpaySignature);
        }
        catch (FormatException)
        {
            return false;
        }

        if (!CryptographicOperations.FixedTimeEquals(expected, provided))
        {
            return false;
        }

        // 3) التحقق من الدفع عبر Razorpay API (GET payments/{id})
        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_keyId}:{_keySecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Get, $"payments/{dto.RazorpayPaymentId}");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        var paymentJson = await response.Content.ReadAsStringAsync();
        using var paymentDoc = JsonDocument.Parse(paymentJson);
        var paymentRoot = paymentDoc.RootElement;

        var status = paymentRoot.TryGetProperty("status", out var statusProp) ? statusProp.GetString() : null;
        var rzpOrderId = paymentRoot.TryGetProperty("order_id", out var orderIdProp) ? orderIdProp.GetString() : null;
        var amount = paymentRoot.TryGetProperty("amount", out var amountProp) ? amountProp.GetInt64() : 0;

        var expectedAmount = (long)Math.Round(order.TotalAmount * 100);
        if (status != "captured" || rzpOrderId != dto.RazorpayOrderId || amount != expectedAmount)
        {
            return false;
        }

        order.PaymentStatus = PaymentStatus.Paid;
        order.RazorpayPaymentId = dto.RazorpayPaymentId;

        // 4) لف SaveChangesAsync بـ DbUpdateConcurrencyException
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            await _context.Entry(order).ReloadAsync();
            return order.PaymentStatus == PaymentStatus.Paid;
        }
    }

    public async Task<WebhookResultStatus> ProcessRazorpayWebhookAsync(string requestBody, string signature)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
        var expectedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(requestBody));

        byte[] providedHash;
        try
        {
            providedHash = Convert.FromHexString(signature);
        }
        catch (FormatException)
        {
            return WebhookResultStatus.InvalidSignature;
        }

        if (!CryptographicOperations.FixedTimeEquals(expectedHash, providedHash))
        {
            return WebhookResultStatus.InvalidSignature;
        }

        try
        {
            using var doc = JsonDocument.Parse(requestBody);
            var root = doc.RootElement;
            var eventType = root.TryGetProperty("event", out var eventElem) ? eventElem.GetString() : null;

            if (eventType == "payment.captured")
            {
                var payload = root.GetProperty("payload");
                var paymentEntity = payload.GetProperty("payment").GetProperty("entity");
                var razorpayOrderId = paymentEntity.TryGetProperty("order_id", out var orderIdElem) ? orderIdElem.GetString() : null;
                var razorpayPaymentId = paymentEntity.TryGetProperty("id", out var payIdElem) ? payIdElem.GetString() : null;
                var amount = paymentEntity.TryGetProperty("amount", out var amountElem) ? amountElem.GetInt64() : 0;

                if (!string.IsNullOrWhiteSpace(razorpayOrderId))
                {
                    var order = await _context.Orders.FirstOrDefaultAsync(o => o.RazorpayOrderId == razorpayOrderId);
                    if (order != null)
                    {
                        var expectedAmount = (long)Math.Round(order.TotalAmount * 100);
                        if (amount != expectedAmount)
                        {
                            // 2) التحقق من تطابق المبلغ
                            return WebhookResultStatus.ProcessingError;
                        }

                        if (order.PaymentStatus != PaymentStatus.Paid)
                        {
                            order.PaymentStatus = PaymentStatus.Paid;
                            if (!string.IsNullOrWhiteSpace(razorpayPaymentId))
                            {
                                order.RazorpayPaymentId = razorpayPaymentId;
                            }

                            try
                            {
                                await _context.SaveChangesAsync();
                            }
                            catch (DbUpdateConcurrencyException)
                            {
                                await _context.Entry(order).ReloadAsync();
                                if (order.PaymentStatus != PaymentStatus.Paid)
                                    return WebhookResultStatus.ProcessingError;
                            }
                        }
                    }
                }
            }

            return WebhookResultStatus.Success;
        }
        catch (Exception)
        {
            return WebhookResultStatus.ProcessingError;
        }
    }
}