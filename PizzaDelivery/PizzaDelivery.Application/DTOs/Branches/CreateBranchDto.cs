using System.ComponentModel.DataAnnotations;

namespace PizzaDelivery.Application.DTOs.Branches;

public class CreateBranchDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    public string OpeningHours { get; set; } = "10:00 AM - 12:00 AM";
}