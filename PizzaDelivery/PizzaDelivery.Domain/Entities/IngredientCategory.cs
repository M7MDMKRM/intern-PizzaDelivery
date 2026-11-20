namespace PizzaDelivery.Domain.Entities;

public class IngredientCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;       
    public string? Description { get; set; }
    public int DisplayOrder { get; set; } = 1;             
    public bool IsRequired { get; set; } = true;           
    public bool AllowMultiple { get; set; } = false;       

    public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
}