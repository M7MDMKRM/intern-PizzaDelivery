using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using PizzaDelivery.Application.DTOs.Orders;
using PizzaDelivery.Application.DTOs.Pizzas;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;
using PizzaDelivery.Infrastructure.Services;
using System.Security.Cryptography;
using System.Text;

namespace PizzaDelivery.Tests;

public class PizzaDeliveryCoreTests
{
    private static readonly byte[] DummyRowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 };

    private AppDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CheckoutAsync_ShouldThrowException_WhenStockIsInsufficient()
    {
        // Arrange
        var db = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var inMemorySettings = new Dictionary<string, string?> { { "CustomPizzaBasePrice", "30.0" } };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();

        var cheese = new Ingredient 
        { 
            Id = 1, 
            Name = "Cheese", 
            StockQuantity = 1, 
            MinThreshold = 5, 
            IsActive = true,
            RowVersion = DummyRowVersion
        };
        var pizza = new Pizza { Id = 1, Name = "Margherita", Price = 100, IsAvailable = true };
        pizza.PizzaIngredients.Add(new PizzaIngredient { IngredientId = 1, QuantityRequired = 5 });

        db.Ingredients.Add(cheese);
        db.Pizzas.Add(pizza);

        var cart = new Cart { Id = 1, UserId = 1 };
        cart.Items.Add(new CartItem { Id = 1, PizzaId = 1, Quantity = 1, UnitPrice = 100 });
        db.Carts.Add(cart);
        await db.SaveChangesAsync();

        var orderService = new OrderService(db, config);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await orderService.CheckoutAsync(1, new CheckoutDto
            {
                OrderType = OrderType.Delivery,
                PhoneNumber = "01000000000",
                DeliveryAddress = "Cairo, Egypt"
            });
        });
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_ShouldEnforceAllowedTransitions()
    {
        // Arrange
        var db = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var inMemorySettings = new Dictionary<string, string?> { { "CustomPizzaBasePrice", "30.0" } };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();

        var order = new Order
        {
            Id = 10,
            UserId = 1,
            Status = OrderStatus.OrderReceived,
            TotalAmount = 150,
            RowVersion = DummyRowVersion
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var orderService = new OrderService(db, config);

        // Act & Assert: OrderReceived -> Delivered is NOT allowed directly
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await orderService.UpdateOrderStatusAsync(10, OrderStatus.Delivered);
        });

        // Act & Assert: OrderReceived -> Preparing IS allowed
        var success = await orderService.UpdateOrderStatusAsync(10, OrderStatus.Preparing);
        Assert.True(success);

        var updatedOrder = await db.Orders.FindAsync(10);
        Assert.Equal(OrderStatus.Preparing, updatedOrder!.Status);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_RollbackStockOnlyOnce_WhenCancelled()
    {
        // Arrange
        var db = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var inMemorySettings = new Dictionary<string, string?> { { "CustomPizzaBasePrice", "30.0" } };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();

        var cheese = new Ingredient 
        { 
            Id = 1, 
            Name = "Cheese", 
            StockQuantity = 10, 
            MinThreshold = 2, 
            IsActive = true,
            RowVersion = DummyRowVersion
        };
        var pizza = new Pizza { Id = 5, Name = "Cheese Pizza", Price = 50, IsAvailable = true };
        pizza.PizzaIngredients.Add(new PizzaIngredient { IngredientId = 1, QuantityRequired = 3 });

        db.Ingredients.Add(cheese);
        db.Pizzas.Add(pizza);

        var order = new Order
        {
            Id = 20,
            UserId = 1,
            Status = OrderStatus.Preparing,
            TotalAmount = 100,
            RowVersion = DummyRowVersion
        };
        var item = new OrderItem { Id = 1, OrderId = 20, PizzaId = 5, IsCustom = false, Quantity = 2, UnitPrice = 50 }; // 2 * 3 = 6
        order.OrderItems.Add(item);

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var orderService = new OrderService(db, config);

        // Act: First cancellation -> Rolls back stock (+6)
        var cancelled = await orderService.UpdateOrderStatusAsync(20, OrderStatus.Cancelled);
        Assert.True(cancelled);

        var ingredientAfterFirstCancel = await db.Ingredients.FindAsync(1);
        Assert.Equal(16, ingredientAfterFirstCancel!.StockQuantity);

        // Act: Second attempt to cancel an already cancelled order should fail due to State Machine
        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await orderService.UpdateOrderStatusAsync(20, OrderStatus.Cancelled);
        });

        var ingredientAfterSecondAttempt = await db.Ingredients.FindAsync(1);
        Assert.Equal(16, ingredientAfterSecondAttempt!.StockQuantity); // Unchanged
    }

    [Fact]
    public async Task PizzaService_ShouldCalculateCurrentPrice_BasedOnOfferDates()
    {
        // Arrange
        var db = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var now = DateTime.UtcNow;

        // Active discount
        var activeOfferPizza = new Pizza
        {
            Id = 1,
            Name = "Active Offer Pizza",
            Price = 100,
            DiscountPrice = 80,
            OfferStartDate = now.AddDays(-1),
            OfferEndDate = now.AddDays(1),
            IsAvailable = true
        };

        // Expired discount
        var expiredOfferPizza = new Pizza
        {
            Id = 2,
            Name = "Expired Offer Pizza",
            Price = 100,
            DiscountPrice = 60,
            OfferStartDate = now.AddDays(-5),
            OfferEndDate = now.AddDays(-1),
            IsAvailable = true
        };

        db.Pizzas.AddRange(activeOfferPizza, expiredOfferPizza);
        await db.SaveChangesAsync();

        var pizzaService = new PizzaService(db);

        // Act
        var activeDto = await pizzaService.GetByIdAsync(1);
        var expiredDto = await pizzaService.GetByIdAsync(2);

        // Assert
        Assert.NotNull(activeDto);
        Assert.True(activeDto.HasActiveDiscount);
        Assert.Equal(80, activeDto.CurrentPrice);
        Assert.Equal(20, activeDto.DiscountPercentage);

        Assert.NotNull(expiredDto);
        Assert.False(expiredDto.HasActiveDiscount);
        Assert.Equal(100, expiredDto.CurrentPrice);
    }

    [Fact]
    public void PaymentSignature_Verification_ValidAndInvalidChecks()
    {
        // Arrange
        var keySecret = "rzp_test_secret_12345";
        var orderId = "order_9A33XWu170gUtm";
        var paymentId = "pay_29Mo3xsH6WUUm5";

        var payload = $"{orderId}|{paymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(keySecret));
        var validSignature = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLower();

        // Act & Assert 1: Valid signature
        var computedValid = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLower();
        Assert.Equal(validSignature, computedValid);

        // Act & Assert 2: Invalid signature
        var invalidSignature = "invalid_hex_signature";
        Assert.NotEqual(validSignature, invalidSignature);
    }
}
