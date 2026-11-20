using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Application.DTOs.Ingredients;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class IngredientService : IIngredientService
{
    private readonly AppDbContext _context;

    public IngredientService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<IngredientResponseDto>> GetAllAsync()
    {
        return await _context.Ingredients
            .Include(i => i.Category)
            .AsNoTracking()
            .Select(i => MapToResponseDto(i))
            .ToListAsync();
    }

    public async Task<IngredientResponseDto?> GetByIdAsync(int id)
    {
        var i = await _context.Ingredients
            .Include(i => i.Category)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (i == null) return null;

        return MapToResponseDto(i);
    }

    public async Task<IngredientResponseDto> CreateAsync(CreateIngredientDto dto)
    {
        var category = await _context.IngredientCategories.FindAsync(dto.CategoryId);
        if (category == null)
            throw new ArgumentException("فئة المكون غير موجودة.");

        var ingredient = new Ingredient
        {
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            Unit = dto.Unit,
            CostPrice = dto.CostPrice,
            ExtraPrice = dto.ExtraPrice,
            StockQuantity = dto.StockQuantity,
            MinThreshold = dto.MinThreshold,
            MaxThreshold = dto.MaxThreshold,
            IsExtraAllowed = dto.IsExtraAllowed,
            CanBeRemoved = dto.CanBeRemoved,
            IsActive = true,
            IsAllergen = dto.IsAllergen
        };

        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();

        ingredient.Category = category;
        return MapToResponseDto(ingredient);
    }

    public async Task<IngredientResponseDto?> UpdateAsync(int id, UpdateIngredientDto dto)
    {
        var ingredient = await _context.Ingredients
            .Include(i => i.Category)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (ingredient == null) return null;

        ingredient.Name = dto.Name;
        ingredient.CategoryId = dto.CategoryId;
        ingredient.Unit = dto.Unit;
        ingredient.CostPrice = dto.CostPrice;
        ingredient.ExtraPrice = dto.ExtraPrice;
        ingredient.StockQuantity = dto.StockQuantity;
        ingredient.MinThreshold = dto.MinThreshold;
        ingredient.MaxThreshold = dto.MaxThreshold;
        ingredient.IsExtraAllowed = dto.IsExtraAllowed;
        ingredient.CanBeRemoved = dto.CanBeRemoved;
        ingredient.IsActive = dto.IsActive;
        ingredient.IsAllergen = dto.IsAllergen;

        await _context.SaveChangesAsync();

        return MapToResponseDto(ingredient);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);
        if (ingredient == null) return false;

        try
        {
            _context.Ingredients.Remove(ingredient);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException)
        {
            // If the ingredient is linked to orders/pizzas, soft delete it
            _context.Entry(ingredient).State = EntityState.Unchanged;
            ingredient.IsActive = false;
            ingredient.StockQuantity = 0;
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<List<IngredientCategoryDto>> GetCategoriesAsync()
    {
        var existingNames = await _context.IngredientCategories
            .Select(c => c.Name.ToLower())
            .ToListAsync();

        bool changed = false;
        if (!existingNames.Contains("vegetables") && !existingNames.Contains("toppings"))
        {
            _context.IngredientCategories.Add(new IngredientCategory
            {
                Name = "Vegetables",
                Description = "Fresh vegetables, herbs, and pizza toppings",
                DisplayOrder = 4,
                IsRequired = false,
                AllowMultiple = true
            });
            changed = true;
        }

        if (!existingNames.Contains("meat") && !existingNames.Contains("proteins"))
        {
            _context.IngredientCategories.Add(new IngredientCategory
            {
                Name = "Meat",
                Description = "Gourmet pepperoni, smoked chicken, and artisan meats",
                DisplayOrder = 5,
                IsRequired = false,
                AllowMultiple = true
            });
            changed = true;
        }

        if (changed)
        {
            await _context.SaveChangesAsync();
        }

        return await _context.IngredientCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new IngredientCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsRequired = c.IsRequired,
                AllowMultiple = c.AllowMultiple
            })
            .ToListAsync();
    }

    public async Task<List<IngredientCategoryGroupDto>> GetBuilderOptionsAsync()
    {
        return await _context.IngredientCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new IngredientCategoryGroupDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                StepOrder = c.DisplayOrder,
                IsRequired = c.IsRequired,
                AllowMultiple = c.AllowMultiple,
                Ingredients = c.Ingredients
                    .Where(i => i.IsActive && i.StockQuantity > 0) // متاح وله رصيد في المخزن
                    .Select(i => new IngredientOptionDto
                    {
                        Id = i.Id,
                        Name = i.Name,
                        Price = i.ExtraPrice,
                        IsAllergen = i.IsAllergen,
                        IsExtraAllowed = i.IsExtraAllowed
                    })
                    .ToList()
            })
            .ToListAsync();
    }

    private static IngredientResponseDto MapToResponseDto(Ingredient i)
    {
        return new IngredientResponseDto
        {
            Id = i.Id,
            Name = i.Name,
            CategoryId = i.CategoryId,
            CategoryName = i.Category != null ? i.Category.Name : string.Empty,
            Unit = i.Unit,
            CostPrice = i.CostPrice,
            ExtraPrice = i.ExtraPrice,
            StockQuantity = i.StockQuantity,
            MinThreshold = i.MinThreshold,
            MaxThreshold = i.MaxThreshold,
            IsExtraAllowed = i.IsExtraAllowed,
            CanBeRemoved = i.CanBeRemoved,
            IsActive = i.IsActive,
            IsAllergen = i.IsAllergen
        };
    }
}