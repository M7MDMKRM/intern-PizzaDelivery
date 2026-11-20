using PizzaDelivery.Application.DTOs.Ingredients;

namespace PizzaDelivery.Application.Interfaces;

public interface IIngredientService
{
    Task<IEnumerable<IngredientResponseDto>> GetAllAsync();
    Task<IngredientResponseDto?> GetByIdAsync(int id);
    Task<IngredientResponseDto> CreateAsync(CreateIngredientDto dto);
    Task<IngredientResponseDto?> UpdateAsync(int id, UpdateIngredientDto dto);
    Task<bool> DeleteAsync(int id);

    Task<List<IngredientCategoryGroupDto>> GetBuilderOptionsAsync();
    Task<List<IngredientCategoryDto>> GetCategoriesAsync();
}