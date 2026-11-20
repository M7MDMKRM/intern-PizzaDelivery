namespace PizzaDelivery.Application.DTOs.Orders;

public class OrderItemResponseDto
{
    public int? PizzaId { get; set; }
    public string PizzaName { get; set; } = string.Empty;
    public bool IsCustom { get; set; }
    public string? CustomDetails { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
}