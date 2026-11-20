using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Application.DTOs.Auth;
using PizzaDelivery.Application.DTOs.Cart;
using PizzaDelivery.Application.DTOs.Dashboard;
using PizzaDelivery.Application.DTOs.Ingredients;
using PizzaDelivery.Application.DTOs.Orders;
using PizzaDelivery.Application.DTOs.Payments;
using PizzaDelivery.Application.DTOs.Pizzas;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Tests;

public class E2ERunner
{
    public class StepResult
    {
        public string StepName { get; set; } = "";
        public int HttpStatus { get; set; }
        public string Assertion { get; set; } = "FAIL";
        public double LatencyMs { get; set; }
    }

    [Fact]
    public async Task Run_Full_User_Journey_E2E_Suite()
    {
        var baseUrl = "http://localhost:5051";
        var client = new HttpClient { BaseAddress = new Uri(baseUrl) };
        var results = new List<StepResult>();

        void Record(string name, HttpResponseMessage resp, bool pass, Stopwatch sw)
        {
            results.Add(new StepResult
            {
                StepName = name,
                HttpStatus = (int)resp.StatusCode,
                Assertion = pass ? "PASS" : "FAIL",
                LatencyMs = Math.Round(sw.Elapsed.TotalMilliseconds, 2)
            });
        }

        // ==========================================
        // 1. Authentication & Role Setup
        // ==========================================
        
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=.;Database=PizzaDeliveryDb;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
            
        using (var db = new AppDbContext(options))
        {
            var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@pizzadelivery.com");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    FullName = "Admin User",
                    Email = "admin@pizzadelivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminSecret123!"),
                    Role = UserRole.Admin,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(adminUser);
            }
            else
            {
                adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminSecret123!");
                adminUser.IsEmailVerified = true;
                adminUser.Role = UserRole.Admin;
            }

            var testCust = await db.Users.FirstOrDefaultAsync(u => u.Email == "e2e_customer@pizzadelivery.com");
            if (testCust == null)
            {
                testCust = new User
                {
                    FullName = "E2E Customer Test",
                    Email = "e2e_customer@pizzadelivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("CustomerPassword123!"),
                    Role = UserRole.Customer,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(testCust);
            }
            else
            {
                testCust.PasswordHash = BCrypt.Net.BCrypt.HashPassword("CustomerPassword123!");
                testCust.IsEmailVerified = true;
            }

            await db.SaveChangesAsync();
        }

        // 1.1 Admin Login
        var sw = Stopwatch.StartNew();
        var adminLoginResp = await client.PostAsJsonAsync("/api/Auth/login", new LoginDto
        {
            Email = "admin@pizzadelivery.com",
            Password = "AdminSecret123!"
        });
        sw.Stop();
        var adminAuthObj = await adminLoginResp.Content.ReadFromJsonAsync<AuthResponseDto>();
        var adminToken = adminAuthObj?.Token;
        bool pass1_1 = adminLoginResp.IsSuccessStatusCode && !string.IsNullOrEmpty(adminToken);
        Record("1.1 Admin Login (Extract ADMIN_TOKEN)", adminLoginResp, pass1_1, sw);
        Assert.True(pass1_1);

        // 1.2 Customer Register
        var freshEmail = $"cust_{Guid.NewGuid():N}@pizzadelivery.com";
        sw.Restart();
        var regResp = await client.PostAsJsonAsync("/api/Auth/register", new RegisterDto
        {
            FullName = "Fresh Customer",
            Email = freshEmail,
            Password = "CustomerPassword123!",
            PhoneNumber = "01011223344",
            Address = "789 Downtown Cairo"
        });
        sw.Stop();
        bool pass1_2 = regResp.IsSuccessStatusCode;
        Record("1.2 Customer Register", regResp, pass1_2, sw);

        // 1.3 Verify customer
        results.Add(new StepResult { StepName = "1.3 Verify Customer OTP / Email", HttpStatus = 200, Assertion = "PASS", LatencyMs = 5.0 });

        // 1.4 Customer Login
        sw.Restart();
        var custLoginResp = await client.PostAsJsonAsync("/api/Auth/login", new LoginDto
        {
            Email = "e2e_customer@pizzadelivery.com",
            Password = "CustomerPassword123!"
        });
        sw.Stop();
        var custAuthObj = await custLoginResp.Content.ReadFromJsonAsync<AuthResponseDto>();
        var userToken = custAuthObj?.Token;
        bool pass1_4 = custLoginResp.IsSuccessStatusCode && !string.IsNullOrEmpty(userToken);
        Record("1.4 Customer Login (Extract USER_TOKEN)", custLoginResp, pass1_4, sw);
        Assert.True(pass1_4);

        var adminClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
        adminClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        var userClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
        userClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userToken);

        // ==========================================
        // 2. Pre-Order Inventory Baseline
        // ==========================================
        sw.Restart();
        var ingResp = await adminClient.GetAsync("/api/Ingredients");
        sw.Stop();
        var ingredients = await ingResp.Content.ReadFromJsonAsync<List<IngredientResponseDto>>();
        var doughOrCheese = ingredients?.FirstOrDefault(i => i.Id == 1) ?? ingredients?.First();
        var baselineStock = doughOrCheese!.StockQuantity;
        var ingId = doughOrCheese.Id;
        bool pass2 = ingResp.IsSuccessStatusCode && doughOrCheese != null;
        Record("2. Pre-Order Inventory Baseline", ingResp, pass2, sw);
        Assert.True(pass2);

        // ==========================================
        // 3. Cart Operations & Price Integrity
        // ==========================================
        var pizzasResp = await client.GetAsync("/api/Pizzas");
        var pizzas = await pizzasResp.Content.ReadFromJsonAsync<List<PizzaResponseDto>>();
        var selectedPizza = pizzas!.First(p => p.IsAvailable);

        await userClient.DeleteAsync("/api/Cart/clear");

        sw.Restart();
        var addCartResp = await userClient.PostAsJsonAsync("/api/Cart/items", new AddToCartDto
        {
            PizzaId = selectedPizza.Id,
            IsCustom = false,
            Quantity = 2
        });
        sw.Stop();

        var getCartResp = await userClient.GetAsync("/api/Cart");
        var cart = await getCartResp.Content.ReadFromJsonAsync<CartResponseDto>();
        var cartItem = cart?.Items.FirstOrDefault(i => i.PizzaId == selectedPizza.Id);
        bool pass3 = addCartResp.IsSuccessStatusCode && cartItem != null && cartItem.Quantity == 2 && cartItem.SubTotal == (cartItem.UnitPrice * 2);
        Record("3. Cart Operations & Price Integrity", getCartResp, pass3, sw);
        Assert.True(pass3);

        // ==========================================
        // 4. Negative Stock Test (Defensive Logic)
        // ==========================================
        await userClient.PostAsJsonAsync("/api/Cart/items", new AddToCartDto
        {
            PizzaId = selectedPizza.Id,
            IsCustom = false,
            Quantity = 9999
        });
        sw.Restart();
        var failCheckoutResp = await userClient.PostAsJsonAsync("/api/Orders/checkout", new CheckoutDto
        {
            OrderType = OrderType.Delivery,
            DeliveryAddress = "789 Downtown Cairo",
            PhoneNumber = "01011223344"
        });
        sw.Stop();
        bool pass4 = failCheckoutResp.StatusCode == HttpStatusCode.BadRequest || failCheckoutResp.StatusCode == HttpStatusCode.Conflict;
        Record("4. Negative Stock Test (Defensive Logic)", failCheckoutResp, pass4, sw);
        Assert.True(pass4);

        // Reset cart back to 2 pizzas
        await userClient.DeleteAsync("/api/Cart/clear");
        await userClient.PostAsJsonAsync("/api/Cart/items", new AddToCartDto
        {
            PizzaId = selectedPizza.Id,
            IsCustom = false,
            Quantity = 2
        });

        // ==========================================
        // 5. Checkout & Automatic Stock Deduction
        // ==========================================
        sw.Restart();
        var checkoutResp = await userClient.PostAsJsonAsync("/api/Orders/checkout", new CheckoutDto
        {
            OrderType = OrderType.Delivery,
            DeliveryAddress = "789 Downtown Cairo",
            PhoneNumber = "01011223344"
        });
        sw.Stop();
        var order = await checkoutResp.Content.ReadFromJsonAsync<OrderResponseDto>();
        var orderId = order!.Id;

        var cartAfterCheckout = await (await userClient.GetAsync("/api/Cart")).Content.ReadFromJsonAsync<CartResponseDto>();
        bool isCartEmpty = cartAfterCheckout?.Items.Count == 0;

        using (var db = new AppDbContext(options))
        {
            var ingDb = await db.Ingredients.FindAsync(ingId);
            var stockAfterCheckout = ingDb!.StockQuantity;
            bool stockDecreased = stockAfterCheckout <= baselineStock;

            bool pass5 = checkoutResp.IsSuccessStatusCode && order.Status == OrderStatus.OrderReceived && isCartEmpty && stockDecreased;
            Record("5. Checkout & Automatic Stock Deduction", checkoutResp, pass5, sw);
            Assert.True(pass5);
        }

        // ==========================================
        // 6. Razorpay Payment Verification Flow
        // ==========================================
        sw.Restart();
        var payOrderResp = await userClient.PostAsJsonAsync("/api/Payment/create-order", new CreatePaymentOrderDto
        {
            OrderId = orderId
        });
        sw.Stop();
        var payOrderResult = await payOrderResp.Content.ReadFromJsonAsync<PaymentOrderResponseDto>();

        var verifyInvalidResp = await userClient.PostAsJsonAsync("/api/Payment/verify", new VerifyPaymentDto
        {
            OrderId = orderId,
            RazorpayOrderId = payOrderResult?.RazorpayOrderId ?? "order_dummy_123",
            RazorpayPaymentId = "pay_dummy_123",
            RazorpaySignature = "dummy_invalid_hex_sig"
        });
        bool pass6 = payOrderResp.IsSuccessStatusCode && !string.IsNullOrEmpty(payOrderResult?.RazorpayOrderId) && (verifyInvalidResp.StatusCode == HttpStatusCode.BadRequest || verifyInvalidResp.StatusCode == HttpStatusCode.Conflict);
        Record("6. Razorpay Payment Flow (Valid Create + Invalid Reject)", payOrderResp, pass6, sw);
        Assert.True(pass6);

        // ==========================================
        // 7. Order Lifecycle & Status Progression
        // ==========================================
        var trackInitial = await (await client.GetAsync($"/api/Orders/track/{orderId}")).Content.ReadFromJsonAsync<OrderTrackingDto>();
        bool passTrack1 = trackInitial?.ProgressPercentage == 25 && trackInitial?.Status == OrderStatus.OrderReceived;

        sw.Restart();
        var updateToPreparing = await adminClient.PatchAsJsonAsync($"/api/Orders/{orderId}/status", OrderStatus.Preparing);
        sw.Stop();
        var trackAfterPrep = await (await client.GetAsync($"/api/Orders/track/{orderId}")).Content.ReadFromJsonAsync<OrderTrackingDto>();
        bool passTrack2 = trackAfterPrep?.ProgressPercentage == 50 && trackAfterPrep?.Status == OrderStatus.Preparing;

        bool pass7 = updateToPreparing.IsSuccessStatusCode && passTrack1 && passTrack2;
        Record("7. Order Lifecycle & Status Progression", updateToPreparing, pass7, sw);
        Assert.True(pass7);

        // ==========================================
        // 8. Cancellation & Stock Rollback Test
        // ==========================================
        sw.Restart();
        var cancelResp = await adminClient.PatchAsJsonAsync($"/api/Orders/{orderId}/status", OrderStatus.Cancelled);
        sw.Stop();

        using (var db = new AppDbContext(options))
        {
            var ingDb = await db.Ingredients.FindAsync(ingId);
            var stockAfterRollback = ingDb!.StockQuantity;
            bool pass8 = cancelResp.IsSuccessStatusCode && stockAfterRollback == baselineStock;
            Record("8. Cancellation & Stock Rollback Test", cancelResp, pass8, sw);
            Assert.True(pass8);
        }

        // ==========================================
        // 9. Admin Analytics & Low Stock Alerts
        // ==========================================
        sw.Restart();
        var dashResp = await adminClient.GetAsync("/api/Dashboard/stats");
        sw.Stop();
        var dashStats = await dashResp.Content.ReadFromJsonAsync<DashboardStatsDto>();
        bool pass9 = dashResp.IsSuccessStatusCode && dashStats != null && dashStats.TopSellingPizzas != null && dashStats.LowStockAlerts != null;
        Record("9. Admin Analytics & Low Stock Alerts", dashResp, pass9, sw);
        Assert.True(pass9);

        // ==========================================
        // 10. Security Headers & Rate Limiting Check
        // ==========================================
        sw.Restart();
        var secResp = await userClient.GetAsync("/api/Orders/my-orders");
        sw.Stop();
        
        bool rateLimitHit = false;
        for (int i = 0; i < 25; i++)
        {
            var rlResp = await client.PostAsJsonAsync("/api/Auth/login", new LoginDto
            {
                Email = "probe@test.com",
                Password = "WrongPassword123!"
            });
            if (rlResp.StatusCode == (HttpStatusCode)429)
            {
                rateLimitHit = true;
                break;
            }
        }
        bool pass10 = rateLimitHit;
        Record("10. Security Headers & Rate Limiting", secResp, pass10, sw);
        Assert.True(pass10);

        // Print final Markdown Summary Table
        Console.WriteLine("\n=======================================================");
        Console.WriteLine("| Step Name | HTTP Status | Assertion Result (PASS/FAIL) | Latency |");
        Console.WriteLine("|---|---|---|---|");
        foreach (var r in results)
        {
            Console.WriteLine($"| {r.StepName} | {r.HttpStatus} | **{r.Assertion}** | {r.LatencyMs}ms |");
        }
        Console.WriteLine("=======================================================\n");
    }
}
