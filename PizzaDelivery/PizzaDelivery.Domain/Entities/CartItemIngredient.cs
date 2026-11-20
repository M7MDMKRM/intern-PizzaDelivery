namespace PizzaDelivery.Domain.Entities;

public class CartItemIngredient
{
    public int Id { get; set; }

    public int CartItemId { get; set; }
    public CartItem CartItem { get; set; } = null!;

    public int IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!;

    public decimal Quantity { get; set; } = 1;
}
