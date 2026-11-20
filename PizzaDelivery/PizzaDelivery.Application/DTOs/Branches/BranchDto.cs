namespace PizzaDelivery.Application.DTOs.Branches;

public class BranchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}