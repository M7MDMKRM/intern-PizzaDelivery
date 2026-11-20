using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Pizzas;

public class PizzaResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; } 
    public PizzaSize Size { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }

    public decimal? DiscountPrice { get; set; }
    public DateTime? OfferStartDate { get; set; }
    public DateTime? OfferEndDate { get; set; }

    public decimal CurrentPrice { get; set; } 
    public bool HasActiveDiscount { get; set; } 
    public int DiscountPercentage { get; set; } 

    public List<PizzaIngredientResponseDto> Ingredients { get; set; } = new();
}

public class PizzaIngredientResponseDto
{
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal QuantityRequired { get; set; }
    public UnitOfMeasure Unit { get; set; }
}