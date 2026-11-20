namespace PizzaDelivery.Application.DTOs.Cart;

public class CartResponseDto
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public List<CartItemResponseDto> Items { get; set; } = new();

    public decimal TotalAmount => Items.Sum(i => i.SubTotal);

    public int TotalItemsCount => Items.Sum(i => i.Quantity);
}