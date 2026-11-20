using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaDelivery.Application.DTOs.Cart;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    /// <summary>
    /// استعراض محتويات السلة للمستخدم الحالي مع الإجمالي
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetCurrentUserId();
        var cart = await _cartService.GetCartByUserIdAsync(userId);
        return Ok(cart);
    }

    /// <summary>
    /// إضافة عنصر للسلة (بيتزا عادية أو بيتزا مخصصة)
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.AddToCartAsync(userId, dto);
            return Ok(cart);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// تعديل كمية عنصر محدد داخل السلة
    /// </summary>
    [HttpPut("items/{cartItemId:int}")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] UpdateCartItemDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.UpdateQuantityAsync(userId, cartItemId, dto);
            return Ok(cart);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// حذف عنصر محدد من السلة
    /// </summary>
    [HttpDelete("items/{cartItemId:int}")]
    [ProducesResponseType(typeof(CartResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveItem(int cartItemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.RemoveItemAsync(userId, cartItemId);
            return Ok(cart);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// تفريغ السلة بالكامل
    /// </summary>
    [HttpDelete("clear")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetCurrentUserId();
        await _cartService.ClearCartAsync(userId);
        return NoContent();
    }

    // دالة مساعدة لاستخراج الـ UserId من الـ JWT Claims بأمان
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("تعذر التعرف على هوية المستخدم من الـ Token.");
        }

        return userId;
    }
}