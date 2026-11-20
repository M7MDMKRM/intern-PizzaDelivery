namespace PizzaDelivery.Domain.Entities;

public class OrderItemIngredient
{
    public int Id { get; set; }

    public int OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;

    public int IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!;

    public decimal Quantity { get; set; } // الكمية لكل وحدة بيتزا
}
