namespace PizzaDelivery.Domain.Entities;

public class Branch
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = "10:00 AM - 12:00 AM";
    public bool IsActive { get; set; } = true;
}