using System.ComponentModel.DataAnnotations;
using PizzaDelivery.Domain.Enums;

namespace PizzaDelivery.Domain.Entities;

public class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public IngredientCategory Category { get; set; } = null!;

    public UnitOfMeasure Unit { get; set; } = UnitOfMeasure.Gram;

    public decimal CostPrice { get; set; }    // سعر التكلفة على المطعم
    public decimal ExtraPrice { get; set; }   // سعر الإضافة للزبون لو طلبها إكسترا

    // إدارة المخزون
    public decimal StockQuantity { get; set; }
    public decimal MinThreshold { get; set; }
    public decimal MaxThreshold { get; set; }
    public decimal DefaultPortion { get; set; } = 1.0m; // الكمية الافتراضية للوحدة في البيتزا المخصصة
    public DateTime? LastLowStockAlertAt { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    // خيارات التخصيص والأمان
    public bool IsExtraAllowed { get; set; } = true;  // هل مسموح إضافته كـ Extra
    public bool CanBeRemoved { get; set; } = true;    // هل مسموح للزبون إزالته
    public bool IsActive { get; set; } = true;        // متاح في المخزن أم معطل مؤقتاً
    public bool IsAllergen { get; set; } = false;     // هل يحتوي على مسببات حساسية
}