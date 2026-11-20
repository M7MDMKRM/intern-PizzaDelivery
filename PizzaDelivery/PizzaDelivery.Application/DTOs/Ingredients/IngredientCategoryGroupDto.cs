namespace PizzaDelivery.Application.DTOs.Ingredients;

public class IngredientOptionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAllergen { get; set; }
    public bool IsExtraAllowed { get; set; }
}

public class IngredientCategoryGroupDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsRequired { get; set; }
    public bool AllowMultiple { get; set; }
    public List<IngredientOptionDto> Ingredients { get; set; } = new();
}