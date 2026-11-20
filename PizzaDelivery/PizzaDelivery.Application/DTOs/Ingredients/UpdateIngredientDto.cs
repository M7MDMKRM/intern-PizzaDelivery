using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Ingredients;

public class UpdateIngredientDto
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public UnitOfMeasure Unit { get; set; }

    public decimal CostPrice { get; set; }
    public decimal ExtraPrice { get; set; }

    public decimal StockQuantity { get; set; }
    public decimal MinThreshold { get; set; }
    public decimal MaxThreshold { get; set; }

    public bool IsExtraAllowed { get; set; }
    public bool CanBeRemoved { get; set; }
    public bool IsActive { get; set; }
    public bool IsAllergen { get; set; }
}