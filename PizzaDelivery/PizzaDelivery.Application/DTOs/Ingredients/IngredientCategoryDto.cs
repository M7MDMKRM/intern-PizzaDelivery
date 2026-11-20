namespace PizzaDelivery.Application.DTOs.Ingredients;

public class IngredientCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsRequired { get; set; }
    public bool AllowMultiple { get; set; }
}
