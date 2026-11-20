using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Ingredients;

public class CreateIngredientDto
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; } 
    public UnitOfMeasure Unit { get; set; } = UnitOfMeasure.Gram;

    public decimal CostPrice { get; set; }
    public decimal ExtraPrice { get; set; }

    public decimal StockQuantity { get; set; }
    public decimal MinThreshold { get; set; }
    public decimal MaxThreshold { get; set; }

    public bool IsExtraAllowed { get; set; } = true;
    public bool CanBeRemoved { get; set; } = true;
    public bool IsAllergen { get; set; } = false;
}