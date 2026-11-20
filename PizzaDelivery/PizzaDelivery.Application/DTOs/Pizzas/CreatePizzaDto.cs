using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Application.DTOs.Pizzas;

public class CreatePizzaDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public PizzaSize Size { get; set; } = PizzaSize.Medium;
    public string? ImageUrl { get; set; }

    public decimal? DiscountPrice { get; set; }
    public DateTime? OfferStartDate { get; set; }
    public DateTime? OfferEndDate { get; set; }
    public List<PizzaIngredientInputDto> Ingredients { get; set; } = new();
}