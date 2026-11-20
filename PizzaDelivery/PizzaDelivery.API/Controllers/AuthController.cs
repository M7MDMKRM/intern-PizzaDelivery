using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PizzaDelivery.Application.DTOs.Auth;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpGet("verify-email")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        var result = await _authService.VerifyEmailAsync(token);
        if (!result)
            return BadRequest(new { message = "Invalid or expired verification token." });

        return Ok(new { message = "Email verified successfully!" });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var origin = Request.Headers["Origin"].ToString();
        await _authService.ForgotPasswordAsync(dto.Email, origin);
        return Ok(new { message = "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك بنجاح." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto);
        if (!result)
            return BadRequest(new { message = "Invalid token, expired token, or incorrect email." });

        return Ok(new { message = "Password has been reset successfully. You can now login with your new password." });
    }

    [HttpPost("resend-verification-email")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResendVerificationEmail([FromQuery] string email)
    {
        await _authService.ResendVerificationEmailAsync(email);
        return Ok(new { message = "إذا كان الحساب مسجلاً لدينا وغير مفعّل، فقد تم إرسال رابط التفعيل إلى بريدك الإلكتروني." });
    }
}
