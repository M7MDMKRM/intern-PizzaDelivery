using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PizzaDelivery.Application.DTOs.Auth;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new InvalidOperationException("البريد الإلكتروني مطلوب ولا يمكن تركه فارغاً.");

        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (emailExists)
            throw new InvalidOperationException("هذا البريد الإلكتروني مسجل بالفعل.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        // توليد كود OTP عادي من 6 أرقام
        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower(),
            PasswordHash = passwordHash,
            phonenumber = dto.PhoneNumber,
            Address = dto.Address,
            Role = UserRole.Customer,
            IsEmailVerified = false,
            EmailVerificationToken = otpCode,
            OtpCode = otpCode,
            OtpExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var verifyUrl = $"{frontendUrl}/verify-email?token={otpCode}";
        var emailBody = $@"
            <div dir='rtl' style='font-family: Arial, sans-serif; line-height: 1.6; text-align: center; padding: 25px; background-color: #fafafa; border-radius: 12px; border: 1px solid #e0e0e0; max-width: 500px; margin: 0 auto;'>
                <h2 style='color: #991b1b; margin-bottom: 8px;'>مرحباً بك في Pizza Delivery!</h2>
                <p style='color: #444; font-size: 15px;'>شكراً لانضمامك إلينا. استخدم رمز التحقق (OTP) التالي لتأكيد حسابك:</p>
                <div style='letter-spacing: 6px; font-size: 32px; font-weight: bold; background: #ffffff; padding: 16px 24px; border-radius: 10px; display: inline-block; margin: 20px 0; color: #991b1b; border: 2px dashed #991b1b; font-family: monospace;'>
                    {otpCode}
                </div>
                <p style='color: #666; font-size: 13px; margin-top: 15px;'>أو يمكنك تفعيل الحساب مباشرة بالضغط على الزر أدناه:</p>
                <p><a href='{verifyUrl}' style='display:inline-block; padding: 12px 28px; background-color: #991b1b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;'>تأكيد الحساب مباشرة</a></p>
                <p style='color: #999; font-size: 12px; margin-top: 20px;'>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "رمز تأكيد الحساب (OTP) - Pizza Delivery", emailBody);

        return GenerateJwtToken(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user is null)
            throw new UnauthorizedAccessException("البريد الإلكتروني أو كلمة المرور غير صحيحة.");

        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        }
        catch
        {
            isPasswordValid = false;
        }

        if (!isPasswordValid)
            throw new UnauthorizedAccessException("البريد الإلكتروني أو كلمة المرور غير صحيحة.");

        if (!user.IsEmailVerified)
            throw new UnauthorizedAccessException("يرجى تفعيل بريدك الإلكتروني أولاً قبل تسجيل الدخول.");

        return GenerateJwtToken(user);
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
        if (user is null)
            return false;

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ForgotPasswordAsync(string email, string origin)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("يرجى إدخال البريد الإلكتروني.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user is null)
            throw new InvalidOperationException("هذا البريد الإلكتروني غير مسجل لدينا في النظام.");

        // توليد كود OTP عشوائي آمن من 6 أرقام
        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        // تخزين الـ OTP وصلاحيته لمدة 10 دقائق وتصفير المحاولات الفاشلة
        user.PasswordResetToken = otpCode;
        user.ResetTokenExpires = DateTime.UtcNow.AddMinutes(10);
        user.OtpFailedAttempts = 0;

        await _context.SaveChangesAsync();

        var emailBody = $@"
            <div dir='rtl' style='font-family: Arial, sans-serif; line-height: 1.6; text-align: center; padding: 20px;'>
                <h2>طلب إعادة تعيين كلمة المرور</h2>
                <p>استخدم رمز التحقق (OTP) التالي لتغيير كلمة المرور الخاصة بحسابك:</p>
                <div style='letter-spacing: 5px; font-size: 28px; font-weight: bold; background: #f4f4f4; padding: 15px; border-radius: 8px; display: inline-block; margin: 15px 0; color: #e53935;'>
                    {otpCode}
                </div>
                <p style='color: #777; font-size: 13px;'>هذا الرمز صالح لمدة 10 دقائق فقط. لا تشاركه مع أي شخص.</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "رمز التحقق لإعادة تعيين كلمة المرور - Pizza Delivery", emailBody);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user is null) return false;

        // التحقق من تجاوز الحد الأقصى للمحاولات الفاشلة (5 محاولات)
        if (user.OtpFailedAttempts >= 5)
        {
            user.PasswordResetToken = null;
            user.ResetTokenExpires = null;
            user.OtpFailedAttempts = 0;
            await _context.SaveChangesAsync();
            throw new InvalidOperationException("تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد.");
        }

        // التحقق من صلاحية الوقت
        if (user.ResetTokenExpires is null || user.ResetTokenExpires < DateTime.UtcNow)
            return false;

        // مطابقة الكود
        if (string.IsNullOrWhiteSpace(user.PasswordResetToken) || user.PasswordResetToken != dto.Token.Trim())
        {
            user.OtpFailedAttempts++;
            if (user.OtpFailedAttempts >= 5)
            {
                user.PasswordResetToken = null;
                user.ResetTokenExpires = null;
                user.OtpFailedAttempts = 0;
                await _context.SaveChangesAsync();
                throw new InvalidOperationException("تم تجاوز 5 محاولات خاطئة. تم إلغاء الرمز، يرجى طلب رمز تحقق جديد.");
            }
            await _context.SaveChangesAsync();
            return false;
        }

        // تفعيل الحساب وتغيير كلمة المرور وتصفير المحاولات
        user.IsEmailVerified = true;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.ResetTokenExpires = null;
        user.OtpFailedAttempts = 0;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null || user.IsEmailVerified)
            return true; // عدم كشف حالة الحساب لأسباب أمنية

        var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        user.EmailVerificationToken = otpCode;
        user.OtpCode = otpCode;
        user.OtpExpiresAt = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var verifyUrl = $"{frontendUrl}/verify-email?token={otpCode}";
        var emailBody = $@"
            <div dir='rtl' style='font-family: Arial, sans-serif; line-height: 1.6; text-align: center; padding: 25px; background-color: #fafafa; border-radius: 12px; border: 1px solid #e0e0e0; max-width: 500px; margin: 0 auto;'>
                <h2 style='color: #991b1b; margin-bottom: 8px;'>إعادة إرسال رمز التحقق</h2>
                <p style='color: #444; font-size: 15px;'>استخدم رمز التحقق (OTP) التالي لتأكيد حسابك في Pizza Delivery:</p>
                <div style='letter-spacing: 6px; font-size: 32px; font-weight: bold; background: #ffffff; padding: 16px 24px; border-radius: 10px; display: inline-block; margin: 20px 0; color: #991b1b; border: 2px dashed #991b1b; font-family: monospace;'>
                    {otpCode}
                </div>
                <p style='color: #666; font-size: 13px; margin-top: 15px;'>أو يمكنك تفعيل الحساب مباشرة بالضغط على الزر أدناه:</p>
                <p><a href='{verifyUrl}' style='display:inline-block; padding: 12px 28px; background-color: #991b1b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;'>تأكيد الحساب مباشرة</a></p>
                <p style='color: #999; font-size: 12px; margin-top: 20px;'>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "رمز تأكيد الحساب الجديد (OTP) - Pizza Delivery", emailBody);
        return true;
    }

    private AuthResponseDto GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var expirationDays = double.Parse(jwtSettings["DurationInDays"] ?? "7");
        var expiresOn = DateTime.UtcNow.AddDays(expirationDays);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiresOn,
            signingCredentials: credentials
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenString = tokenHandler.WriteToken(tokenDescriptor);

        return new AuthResponseDto
        {
            userid = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = tokenString,
            Expireson = expiresOn
        };
    }
}