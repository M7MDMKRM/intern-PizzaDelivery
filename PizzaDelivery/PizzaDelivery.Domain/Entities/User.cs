using System;
using System.Collections.Generic;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;

    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpires { get; set; }
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiresAt { get; set; }
    public int OtpFailedAttempts { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = new List<Order>();

    public string phonenumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;


    public User()
    {
    }
}