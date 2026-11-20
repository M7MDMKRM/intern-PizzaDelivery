namespace PizzaDelivery.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    // تحويله لـ Nullable لدعم البيتزا المخصصة
    public int? PizzaId { get; set; }
    public Pizza? Pizza { get; set; }

    // حقول دعم البيتزا المخصصة (Custom Pizza Builder)
    public bool IsCustom { get; set; } = false;
    public string? CustomDetails { get; set; } // مثال: "Classic Pan Crust, BBQ Sauce, Mozzarella"

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }

    public List<OrderItemIngredient> Ingredients { get; set; } = new();

    public decimal SubTotal => Quantity * UnitPrice;

    public OrderItem()
    {
    }
}