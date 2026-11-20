using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Domain.Entities;

namespace PizzaDelivery.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<IngredientCategory> IngredientCategories => Set<IngredientCategory>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<Pizza> Pizzas => Set<Pizza>();
    public DbSet<PizzaIngredient> PizzaIngredients => Set<PizzaIngredient>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemIngredient> OrderItemIngredients => Set<OrderItemIngredient>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<CartItemIngredient> CartItemIngredients => Set<CartItemIngredient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // إعدادات الـ Cart والـ CartItem
        modelBuilder.Entity<Cart>(entity =>
        {
            // منع تكرار أكثر من سلة لنفس المستخدم
            entity.HasIndex(c => c.UserId).IsUnique();

            entity.HasOne(c => c.User)
                  .WithOne()
                  .HasForeignKey<Cart>(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.Property(ci => ci.UnitPrice).HasPrecision(18, 2);

            entity.HasOne(ci => ci.Cart)
                  .WithMany(c => c.Items)
                  .HasForeignKey(ci => ci.CartId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ci => ci.Pizza)
                  .WithMany()
                  .HasForeignKey(ci => ci.PizzaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CartItemIngredient>(entity =>
        {
            entity.Property(cii => cii.Quantity).HasPrecision(18, 3);

            entity.HasOne(cii => cii.CartItem)
                  .WithMany(ci => ci.Ingredients)
                  .HasForeignKey(cii => cii.CartItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cii => cii.Ingredient)
                  .WithMany()
                  .HasForeignKey(cii => cii.IngredientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItemIngredient>(entity =>
        {
            entity.Property(oii => oii.Quantity).HasPrecision(18, 3);

            entity.HasOne(oii => oii.OrderItem)
                  .WithMany(oi => oi.Ingredients)
                  .HasForeignKey(oii => oii.OrderItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oii => oii.Ingredient)
                  .WithMany()
                  .HasForeignKey(oii => oii.IngredientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        // إعدادات جدول فئات المكونات
        modelBuilder.Entity<IngredientCategory>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Description).HasMaxLength(250);
        });

        // إعدادات حقول الـ Ingredient وربطها بالقسم
        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.Property(i => i.Name).HasMaxLength(100).IsRequired();
            entity.Property(i => i.CostPrice).HasPrecision(18, 2);
            entity.Property(i => i.ExtraPrice).HasPrecision(18, 2);
            entity.Property(i => i.StockQuantity).HasPrecision(18, 3);
            entity.Property(i => i.MinThreshold).HasPrecision(18, 3);
            entity.Property(i => i.MaxThreshold).HasPrecision(18, 3);
            entity.Property(i => i.DefaultPortion).HasPrecision(18, 3);

            // ربط المكون بالفئة (One-to-Many)
            entity.HasOne(i => i.Category)
                  .WithMany(c => c.Ingredients)
                  .HasForeignKey(i => i.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // إعدادات حقول الـ Pizza
        modelBuilder.Entity<Pizza>(entity =>
        {
            entity.Property(p => p.Price).HasPrecision(18, 2);
        });

        // إعداد جدول الربط PizzaIngredient (Many-to-Many with Payload)
        modelBuilder.Entity<PizzaIngredient>(entity =>
        {
            entity.HasKey(pi => new { pi.PizzaId, pi.IngredientId });

            entity.Property(pi => pi.QuantityRequired)
                  .HasPrecision(18, 3);

            entity.HasOne(pi => pi.Pizza)
                  .WithMany(p => p.PizzaIngredients)
                  .HasForeignKey(pi => pi.PizzaId);

            entity.HasOne(pi => pi.Ingredient)
                  .WithMany()
                  .HasForeignKey(pi => pi.IngredientId);
        });

        // إعدادات Order و OrderItem لتفادي تحذيرات الـ Precision
        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.TotalAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
        });

        // تعطيل الحذف التلقائي المتتالي لتفادي Multiple Cascade Paths

        // فهارس جدول الطلبات للبحث السريع برقم المستخدم وتاريخ الطلب وحالته
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderDate);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.Status);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.RazorpayPaymentId)
            .IsUnique()
            .HasFilter("[RazorpayPaymentId] IS NOT NULL");

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.RazorpayOrderId)
            .IsUnique()
            .HasFilter("[RazorpayOrderId] IS NOT NULL");

        modelBuilder.Entity<Order>()
            .Property(o => o.TrackingCode)
            .HasDefaultValueSql("NEWID()");

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.TrackingCode)
            .IsUnique();

        // قيد عدم سالبية المخزون
        modelBuilder.Entity<Ingredient>()
            .ToTable(t => t.HasCheckConstraint("CK_Ingredients_Stock_NonNegative", "[StockQuantity] >= 0"));

        // فهرس جدول المكونات للمكونات النشطة وكمياتها
        modelBuilder.Entity<Ingredient>()
            .HasIndex(i => new { i.IsActive, i.StockQuantity });

        // فهرس جدول المستخدمين للبحث بالبريد الإلكتروني والدور
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

    }
}