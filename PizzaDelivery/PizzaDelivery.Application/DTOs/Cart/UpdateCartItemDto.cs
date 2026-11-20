using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Cart;

public class UpdateCartItemDto
{
    [Range(1, 50, ErrorMessage = "الكمية يجب أن تكون بين 1 و 50")]
    public int Quantity { get; set; }
}