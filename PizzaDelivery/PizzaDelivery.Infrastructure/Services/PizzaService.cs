using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Application.DTOs.Pizzas;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class PizzaService : IPizzaService
{
    private readonly AppDbContext _context;

    public PizzaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PizzaResponseDto>> GetAllAsync(bool? availableOnly = null)
    {
        var query = _context.Pizzas
            .AsNoTracking()
            .Include(p => p.PizzaIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .AsQueryable();

        if (availableOnly.HasValue && availableOnly.Value)
        {
            query = query.Where(p => p.IsAvailable);
        }

        var pizzas = await query.ToListAsync();
        return pizzas.Select(MapToResponseDto);
    }

    public async Task<PizzaResponseDto?> GetByIdAsync(int id)
    {
        var pizza = await _context.Pizzas
            .AsNoTracking()
            .Include(p => p.PizzaIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .FirstOrDefaultAsync(p => p.Id == id);

        return pizza is null ? null : MapToResponseDto(pizza);
    }

    public async Task<PizzaResponseDto> CreateAsync(CreatePizzaDto dto)
    {
        var pizza = new Pizza
        {
            Name = dto.Name,
            Description = dto.Description ?? string.Empty,
            Price = dto.Price,
            Size = dto.Size,
            ImageUrl = dto.ImageUrl,
            IsAvailable = true,
            DiscountPrice = dto.DiscountPrice,
            OfferStartDate = dto.OfferStartDate,
            OfferEndDate = dto.OfferEndDate
        };

        if (dto.Ingredients != null && dto.Ingredients.Any())
        {
            foreach (var item in dto.Ingredients)
            {
                pizza.PizzaIngredients.Add(new PizzaIngredient
                {
                    IngredientId = item.IngredientId,
                    QuantityRequired = item.QuantityRequired
                });
            }
        }

        _context.Pizzas.Add(pizza);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(pizza.Id))!;
    }

    public async Task<PizzaResponseDto?> UpdateAsync(int id, UpdatePizzaDto dto)
    {
        var pizza = await _context.Pizzas.FirstOrDefaultAsync(p => p.Id == id);
        if (pizza is null) return null;

        pizza.Name = dto.Name;
        pizza.Description = dto.Description ?? string.Empty;
        pizza.Price = dto.Price;
        pizza.Size = dto.Size;
        pizza.ImageUrl = dto.ImageUrl;
        pizza.IsAvailable = dto.IsAvailable;
        pizza.DiscountPrice = dto.DiscountPrice;
        pizza.OfferStartDate = dto.OfferStartDate;
        pizza.OfferEndDate = dto.OfferEndDate;

        if (dto.Ingredients != null && dto.Ingredients.Any())
        {
            var inputIngredientIds = dto.Ingredients.Select(i => i.IngredientId).Distinct().ToList();
            var existingCount = await _context.Ingredients.CountAsync(i => inputIngredientIds.Contains(i.Id));
            if (existingCount != inputIngredientIds.Count)
            {
                throw new ArgumentException("واحد أو أكثر من المكونات المحددة غير موجود في قاعدة البيانات.");
            }

            var oldIngredients = await _context.Set<PizzaIngredient>()
                .Where(pi => pi.PizzaId == id)
                .ToListAsync();

            _context.Set<PizzaIngredient>().RemoveRange(oldIngredients);

            foreach (var item in dto.Ingredients)
            {
                _context.Set<PizzaIngredient>().Add(new PizzaIngredient
                {
                    PizzaId = id,
                    IngredientId = item.IngredientId,
                    QuantityRequired = item.QuantityRequired
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(pizza.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pizza = await _context.Pizzas
            .Include(p => p.PizzaIngredients)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pizza is null) return false;

        // التحقق من وجود فواتير مرتبطة بالبيتزا لمنع خطأ Foreign Key
        bool hasAssociatedOrders = await _context.OrderItems.AnyAsync(oi => oi.PizzaId == id);

        if (hasAssociatedOrders)
        {
            pizza.IsAvailable = false; // تعطيل الإتاحة بدلاً من الحذف الفيزيائي
        }
        else
        {
            _context.Set<PizzaIngredient>().RemoveRange(pizza.PizzaIngredients);
            _context.Pizzas.Remove(pizza);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private static PizzaResponseDto MapToResponseDto(Pizza pizza)
    {
        var now = DateTime.UtcNow;

        bool hasActiveDiscount = pizza.DiscountPrice.HasValue
            && pizza.DiscountPrice.Value < pizza.Price
            && (!pizza.OfferStartDate.HasValue || pizza.OfferStartDate.Value <= now)
            && (!pizza.OfferEndDate.HasValue || pizza.OfferEndDate.Value >= now);

        decimal currentPrice = hasActiveDiscount ? pizza.DiscountPrice!.Value : pizza.Price;

        int discountPercentage = hasActiveDiscount && pizza.Price > 0
            ? (int)Math.Round((1 - (pizza.DiscountPrice!.Value / pizza.Price)) * 100)
            : 0;

        return new PizzaResponseDto
        {
            Id = pizza.Id,
            Name = pizza.Name,
            Description = pizza.Description,
            Price = pizza.Price,
            Size = pizza.Size,
            IsAvailable = pizza.IsAvailable,
            ImageUrl = pizza.ImageUrl,
            DiscountPrice = pizza.DiscountPrice,
            OfferStartDate = pizza.OfferStartDate,
            OfferEndDate = pizza.OfferEndDate,
            CurrentPrice = currentPrice,
            HasActiveDiscount = hasActiveDiscount,
            DiscountPercentage = discountPercentage,
            Ingredients = pizza.PizzaIngredients.Select(pi => new PizzaIngredientResponseDto
            {
                IngredientId = pi.IngredientId,
                IngredientName = pi.Ingredient?.Name ?? string.Empty,
                QuantityRequired = pi.QuantityRequired,
                Unit = pi.Ingredient?.Unit ?? default
            }).ToList()
        };
    }
}