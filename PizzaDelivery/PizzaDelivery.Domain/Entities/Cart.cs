namespace PizzaDelivery.Domain.Entities;

public class Cart
{
    public int Id { get; set; }

    // ربط السلة بالمستخدم (كل مستخدم له سلة واحدة)
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // عناصر السلة
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}