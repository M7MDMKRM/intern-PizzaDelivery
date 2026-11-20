namespace PizzaDelivery.Application.DTOs.Cart;

public class CartItemResponseDto
{
    public int Id { get; set; } // معرّف عنصر السلة (CartItemId) لنستخدمه عند الحذف أو التعديل
    public int? PizzaId { get; set; }
    public string PizzaName { get; set; } = string.Empty;
    public bool IsCustom { get; set; }
    public string? CustomDetails { get; set; } // أسماء المكونات المختارة
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}