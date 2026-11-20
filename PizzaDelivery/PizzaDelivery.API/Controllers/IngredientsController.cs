using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PizzaDelivery.Application.DTOs.Ingredients;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly IIngredientService _ingredientService;
    private readonly IMemoryCache _cache;
    private const string CacheKeyAllIngredients = "all_ingredients_cache";
    private const string CacheKeyBuilderOptions = "builder_options_cache";

    public IngredientsController(IIngredientService ingredientService, IMemoryCache cache)
    {
        _ingredientService = ingredientService;
        _cache = cache;
    }

    /// <summary>
    /// جلب خطوات وتفاصيل المكونات المتاحة لشاشة الـ Custom Pizza Builder
    /// </summary>
    [HttpGet("builder-options")]
    [ProducesResponseType(typeof(List<IngredientCategoryGroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBuilderOptions()
    {
        if (!_cache.TryGetValue(CacheKeyBuilderOptions, out List<IngredientCategoryGroupDto>? options))
        {
            options = await _ingredientService.GetBuilderOptionsAsync();
            _cache.Set(CacheKeyBuilderOptions, options, TimeSpan.FromSeconds(60));
        }
        return Ok(options);
    }

    /// <summary>
    /// جلب أقسام وفئات المكونات المتاحة
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<IngredientCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _ingredientService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// جلب جميع المكونات المسجلة
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<IngredientResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        if (!_cache.TryGetValue(CacheKeyAllIngredients, out IEnumerable<IngredientResponseDto>? ingredients))
        {
            ingredients = await _ingredientService.GetAllAsync();
            _cache.Set(CacheKeyAllIngredients, ingredients, TimeSpan.FromSeconds(60));
        }
        return Ok(ingredients);
    }

    /// <summary>
    /// تفاصيل مكون محدد
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(IngredientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var cacheKey = $"ingredient_{id}";
        if (!_cache.TryGetValue(cacheKey, out IngredientResponseDto? ingredient))
        {
            ingredient = await _ingredientService.GetByIdAsync(id);
            if (ingredient == null) return NotFound(new { message = "المكون غير موجود." });
            _cache.Set(cacheKey, ingredient, TimeSpan.FromSeconds(60));
        }
        return Ok(ingredient);
    }

    /// <summary>
    /// إضافة مكون جديد وربطه بفئة معينة
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IngredientResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateIngredientDto dto)
    {
        var result = await _ingredientService.CreateAsync(dto);
        InvalidateCache(result.Id);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// تعديل بيانات مكون
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IngredientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateIngredientDto dto)
    {
        var result = await _ingredientService.UpdateAsync(id, dto);
        if (result == null) return NotFound(new { message = "المكون غير موجود." });
        InvalidateCache(id);
        return Ok(result);
    }

    /// <summary>
    /// تعديل رصيد المخزون لمكون محدد
    /// </summary>
    [HttpPut("{id:int}/stock")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest request)
    {
        var ingredient = await _ingredientService.GetByIdAsync(id);
        if (ingredient == null) return NotFound(new { message = "المكون غير موجود." });

        var updateDto = new UpdateIngredientDto
        {
            Name = ingredient.Name,
            CategoryId = ingredient.CategoryId,
            Unit = ingredient.Unit,
            CostPrice = ingredient.CostPrice,
            ExtraPrice = ingredient.ExtraPrice,
            StockQuantity = request.Stock,
            MinThreshold = ingredient.MinThreshold,
            MaxThreshold = ingredient.MaxThreshold,
            IsExtraAllowed = ingredient.IsExtraAllowed,
            CanBeRemoved = ingredient.CanBeRemoved,
            IsActive = ingredient.IsActive,
            IsAllergen = ingredient.IsAllergen
        };

        var result = await _ingredientService.UpdateAsync(id, updateDto);
        InvalidateCache(id);
        return Ok(result);
    }

    /// <summary>
    /// حذف مكون
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _ingredientService.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = "المكون غير موجود." });
        InvalidateCache(id);
        return NoContent();
    }

    private void InvalidateCache(int id)
    {
        _cache.Remove(CacheKeyAllIngredients);
        _cache.Remove(CacheKeyBuilderOptions);
        _cache.Remove($"ingredient_{id}");
    }
}

public record UpdateStockRequest(decimal Stock);

