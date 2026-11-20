using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Orders;

public class CreateOrderItemDto
{
    // البيتزا العادية من المنيو
    public int? PizzaId { get; set; }

    // مؤشر البيتزا المخصصة
    public bool IsCustom { get; set; } = false;

    // قائمة الـ IDs الخاصة بالمكونات المختارة في حالة البيتزا المخصصة
    public List<int> SelectedIngredientIds { get; set; } = new();

    [Range(1, 50, ErrorMessage = "الكمية يجب أن تكون بين 1 و 50")]
    public int Quantity { get; set; } = 1;
}