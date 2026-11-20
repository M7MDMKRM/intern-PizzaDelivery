using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Cart;

public class AddToCartDto
{
    public int? PizzaId { get; set; }

    public bool IsCustom { get; set; } = false;

    [MaxLength(20, ErrorMessage = "لا يمكن اختيار أكثر من 20 مكون للبيتزا المخصصة")]
    public List<int> SelectedIngredientIds { get; set; } = new();

    [Range(1, 50, ErrorMessage = "الكمية يجب أن تكون بين 1 و 50")]
    public int Quantity { get; set; } = 1;
}