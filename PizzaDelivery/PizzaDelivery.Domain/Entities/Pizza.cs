using System.Collections.Generic;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Domain.Entities;

public class Pizza
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public PizzaSize Size { get; set; } = PizzaSize.Medium;
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }
    public decimal? DiscountPrice { get; set; }
    public DateTime? OfferStartDate { get; set; }
    public DateTime? OfferEndDate { get; set; }

    public ICollection<PizzaIngredient> PizzaIngredients { get; set; } = new List<PizzaIngredient>();
}