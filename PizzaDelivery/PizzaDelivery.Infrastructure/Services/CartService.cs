using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PizzaDelivery.Application.DTOs.Cart;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;
    private readonly decimal _customPizzaBasePrice;

    public CartService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _customPizzaBasePrice = decimal.TryParse(configuration["CustomPizzaBasePrice"], out var price) ? price : 0m;
    }

    public async Task<CartResponseDto> GetCartByUserIdAsync(int userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        return MapToResponseDto(cart);
    }

    public async Task<CartResponseDto> AddToCartAsync(int userId, AddToCartDto dto)
    {
        var cart = await GetOrCreateCartAsync(userId);

        if (!dto.IsCustom)
        {
            // 1. التعامل مع البيتزا الجاهزة من المنيو
            if (!dto.PizzaId.HasValue)
                throw new ArgumentException("يجب تحديد البيتزا المطلوبة.");

            // 8) ابحث عن البيتزا بـ IsAvailable = true بدل FindAsync
            var pizza = await _context.Pizzas.FirstOrDefaultAsync(p => p.Id == dto.PizzaId.Value && p.IsAvailable);
            if (pizza == null)
                throw new ArgumentException("البيتزا المطلوبة غير موجودة أو غير متاحة حالياً بالمنيو.");

            // فحص الخصم الساري
            var now = DateTime.UtcNow;
            bool hasDiscount = pizza.DiscountPrice.HasValue
                && pizza.DiscountPrice.Value < pizza.Price
                && (!pizza.OfferStartDate.HasValue || pizza.OfferStartDate.Value <= now)
                && (!pizza.OfferEndDate.HasValue || pizza.OfferEndDate.Value >= now);

            var unitPrice = hasDiscount ? pizza.DiscountPrice!.Value : pizza.Price;

            // إذا كانت نفس البيتزا الجاهزة موجودة بالسلة، نزيد الكمية فقط
            var existingItem = cart.Items.FirstOrDefault(i => !i.IsCustom && i.PizzaId == dto.PizzaId.Value);
            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.UnitPrice = unitPrice; // تحديث السعر بالسعر الأحدث
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    PizzaId = dto.PizzaId.Value,
                    IsCustom = false,
                    Quantity = dto.Quantity,
                    UnitPrice = unitPrice
                });
            }
        }
        else
        {
            // 2. التعامل مع البيتزا المخصصة (Custom Pizza)
            if (!dto.SelectedIngredientIds.Any())
                throw new ArgumentException("يجب اختيار مكون واحد على الأقل للبيتزا المخصصة.");

            // 8) وضع حد أقصى 20 على SelectedIngredientIds
            if (dto.SelectedIngredientIds.Count > 20)
                throw new ArgumentException("لا يمكن اختيار أكثر من 20 مكون للبيتزا المخصصة.");

            var selectedIds = dto.SelectedIngredientIds.Distinct().ToList();
            var ingredients = await _context.Ingredients
                .Include(i => i.Category)
                .Where(i => selectedIds.Contains(i.Id) && i.IsActive)
                .ToListAsync();

            if (ingredients.Count != selectedIds.Count)
                throw new ArgumentException("أحد المكونات المختارة غير متاح أو غير موجود.");

            // التحقق من صحة الفئات (Categories Validation)
            var allCategories = await _context.IngredientCategories.ToListAsync();
            var groupedByCat = ingredients.GroupBy(i => i.CategoryId).ToDictionary(g => g.Key, g => g.ToList());

            foreach (var cat in allCategories)
            {
                var count = groupedByCat.TryGetValue(cat.Id, out var ings) ? ings.Count : 0;
                if (cat.IsRequired && count == 0)
                {
                    throw new ArgumentException($"يجب اختيار مكون واحد على الأقل من قسم '{cat.Name}'.");
                }
                if (!cat.AllowMultiple && count > 1)
                {
                    throw new ArgumentException($"غير مسموح باختيار أكثر من مكون من قسم '{cat.Name}'.");
                }
            }

            // 6) إضافة CustomPizzaBasePrice + أسعار المكونات
            decimal customPrice = _customPizzaBasePrice + ingredients.Sum(i => i.ExtraPrice);
            string details = string.Join(", ", ingredients.Select(i => i.Name));

            var newCartItem = new CartItem
            {
                PizzaId = null,
                IsCustom = true,
                CustomDetails = details,
                Quantity = dto.Quantity,
                UnitPrice = customPrice,
                // 6) استخدام DefaultPortion بدلاً من 1
                Ingredients = ingredients.Select(ing => new CartItemIngredient
                {
                    IngredientId = ing.Id,
                    Quantity = ing.DefaultPortion > 0 ? ing.DefaultPortion : 1.0m
                }).ToList()
            };

            // تضاف كعنصر مستقل دائماً لأن تركيبات المكونات تختلف
            cart.Items.Add(newCartItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponseDto(cart);
    }

    public async Task<CartResponseDto> UpdateQuantityAsync(int userId, int cartItemId, UpdateCartItemDto dto)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
            throw new ArgumentException("العنصر غير موجود في سلة المشتريات.");

        item.Quantity = dto.Quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponseDto(cart);
    }

    public async Task<CartResponseDto> RemoveItemAsync(int userId, int cartItemId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
            throw new ArgumentException("العنصر غير موجود في سلة المشتريات.");

        _context.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponseDto(cart);
    }

    public async Task<bool> ClearCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            return true;

        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    // دالة مساعدة لجلب سلة المستخدم أو إنشائها فوراً إن لم تكن مسجلة مسبقاً
    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Pizza)
            .Include(c => c.Items)
                .ThenInclude(i => i.Ingredients)
                    .ThenInclude(cii => cii.Ingredient)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                UpdatedAt = DateTime.UtcNow,
                Items = new List<CartItem>()
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private static CartResponseDto MapToResponseDto(Cart cart)
    {
        return new CartResponseDto
        {
            CartId = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(i => new CartItemResponseDto
            {
                Id = i.Id,
                PizzaId = i.PizzaId,
                PizzaName = i.IsCustom ? "بيتزا مخصصة (Custom Pizza)" : (i.Pizza?.Name ?? "Pizza"),
                IsCustom = i.IsCustom,
                CustomDetails = i.CustomDetails,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                SubTotal = i.SubTotal
            }).ToList()
        };
    }
}