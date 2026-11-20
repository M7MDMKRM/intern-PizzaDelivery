namespace PizzaDelivery.Domain.Entities;

public class CartItem
{
    public int Id { get; set; }

    // ربط العنصر بالسلة
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    // في حالة البيتزا العادية من المنيو
    public int? PizzaId { get; set; }
    public Pizza? Pizza { get; set; }

    // في حالة البيتزا المخصصة (Custom Pizza)
    public bool IsCustom { get; set; } = false;
    public string? CustomDetails { get; set; } // أسماء المكونات المختارة

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }

    // المكونات الخاصة بالبيتزا المخصصة داخل السلة
    public ICollection<CartItemIngredient> Ingredients { get; set; } = new List<CartItemIngredient>();

    // السعر الإجمالي للعنصر (الكمية × سعر الحبة)
    public decimal SubTotal => Quantity * UnitPrice;
}