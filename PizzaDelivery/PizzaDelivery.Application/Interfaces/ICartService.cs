using PizzaDelivery.Application.DTOs.Cart;

namespace PizzaDelivery.Application.Interfaces;

public interface ICartService
{
    Task<CartResponseDto> GetCartByUserIdAsync(int userId);
    Task<CartResponseDto> AddToCartAsync(int userId, AddToCartDto dto);
    Task<CartResponseDto> UpdateQuantityAsync(int userId, int cartItemId, UpdateCartItemDto dto);
    Task<CartResponseDto> RemoveItemAsync(int userId, int cartItemId);
    Task<bool> ClearCartAsync(int userId);
}