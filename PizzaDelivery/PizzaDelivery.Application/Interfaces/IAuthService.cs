using PizzaDelivery.Application.DTOs.Auth;

namespace PizzaDelivery.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<bool> VerifyEmailAsync(string token);
    Task<bool> ForgotPasswordAsync(string email, string origin);
    Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
    Task<bool> ResendVerificationEmailAsync(string email);
}