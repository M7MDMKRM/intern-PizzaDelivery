using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PizzaDelivery.Application.Common;
using PizzaDelivery.Application.DTOs.Orders;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Domain.Enums;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly decimal _customPizzaBasePrice;

    public OrderService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _customPizzaBasePrice = decimal.TryParse(configuration["CustomPizzaBasePrice"], out var price) ? price : 0m;
    }

    public async Task<OrderResponseDto> CheckoutAsync(int userId, CheckoutDto dto)
    {
        // 1. جلب سلة المستخدم مع كافة العناصر والبيتزا والمكونات المرتبطة بها
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Pizza)
            .Include(c => c.Items)
                .ThenInclude(i => i.Ingredients)
                    .ThenInclude(cii => cii.Ingredient)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("سلة المشتريات فارغة، لا يمكن إتمام الطلب.");

        // 2. التحقق من نوع الطلب (Delivery vs Carryout)
        Branch? selectedBranch = null;
        if (dto.OrderType == OrderType.Delivery)
        {
            if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
                throw new ArgumentException("عنوان التوصيل مطلوب في حالة طلب التوصيل (Delivery).");
        }
        else if (dto.OrderType == OrderType.Carryout)
        {
            if (!dto.BranchId.HasValue)
                throw new ArgumentException("يجب اختيار الفرع المراد الاستلام منه في حالة الاستلام (Carryout).");

            selectedBranch = await _context.Branches.FirstOrDefaultAsync(b => b.Id == dto.BranchId.Value && b.IsActive);
            if (selectedBranch == null)
                throw new ArgumentException("الفرع المحدد غير موجود أو غير متاح حالياً.");
        }

        // 3. إنشاء كائن الطلب الجديد
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.OrderReceived,
            PaymentStatus = PaymentStatus.Pending,
            OrderType = dto.OrderType,
            DeliveryAddress = dto.OrderType == OrderType.Delivery ? dto.DeliveryAddress : null,
            BranchId = dto.OrderType == OrderType.Carryout ? dto.BranchId : null,
            PhoneNumber = dto.PhoneNumber,
            OrderItems = new List<OrderItem>()
        };

        var now = DateTime.UtcNow;
        var pizzaIds = cart.Items.Where(i => !i.IsCustom && i.PizzaId.HasValue)
                                 .Select(i => i.PizzaId!.Value).Distinct().ToList();
        var pizzas = await _context.Pizzas.AsNoTracking()
            .Where(p => pizzaIds.Contains(p.Id) && p.IsAvailable)
            .ToDictionaryAsync(p => p.Id);

        decimal totalAmount = 0;
        foreach (var cartItem in cart.Items)
        {
            decimal unitPrice;
            var orderItem = new OrderItem
            {
                PizzaId = cartItem.PizzaId,
                IsCustom = cartItem.IsCustom,
                CustomDetails = cartItem.CustomDetails,
                Quantity = cartItem.Quantity
            };

            if (!cartItem.IsCustom)
            {
                if (!pizzas.TryGetValue(cartItem.PizzaId!.Value, out var pizza))
                    throw new ArgumentException("إحدى البيتزات لم تعد متاحة.");

                bool hasDiscount = pizza.DiscountPrice.HasValue
                    && pizza.DiscountPrice.Value < pizza.Price
                    && (!pizza.OfferStartDate.HasValue || pizza.OfferStartDate <= now)
                    && (!pizza.OfferEndDate.HasValue || pizza.OfferEndDate >= now);

                unitPrice = hasDiscount ? pizza.DiscountPrice!.Value : pizza.Price;
            }
            else
            {
                unitPrice = await CalculateCustomPizzaPriceAndPopulateIngredientsAsync(cartItem, orderItem);
            }

            orderItem.UnitPrice = unitPrice;
            order.OrderItems.Add(orderItem);
            totalAmount += unitPrice * cartItem.Quantity;
        }

        order.TotalAmount = totalAmount;

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            await DeductStockForOrderAsync(order.OrderItems);
            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.Items);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync();
            throw new InvalidOperationException("المخزون اتغير أثناء إتمام طلبك، من فضلك حاول مرة أخرى.");
        }

        var user = await _context.Users.FindAsync(userId);
        return MapToResponseDto(order, user?.FullName ?? string.Empty, selectedBranch?.Name);
    }

    private async Task<decimal> CalculateCustomPizzaPriceAndPopulateIngredientsAsync(CartItem cartItem, OrderItem orderItem)
    {
        var ingredientIds = cartItem.Ingredients.Select(i => i.IngredientId).Distinct().ToList();

        // 7) لو مفيش مكونات ارمي ArgumentException بدل return cartItem.UnitPrice
        if (!ingredientIds.Any())
        {
            throw new ArgumentException("لا توجد مكونات محددة للبيتزا المخصصة.");
        }

        var ingredients = await _context.Ingredients
            .Include(i => i.Category)
            .Where(i => ingredientIds.Contains(i.Id) && i.IsActive)
            .ToListAsync();

        if (ingredients.Count != ingredientIds.Count)
            throw new ArgumentException("أحد مكونات البيتزا المخصصة لم يعد متاحاً.");

        // التحقق من صحة الفئات
        var allCategories = await _context.IngredientCategories.ToListAsync();
        var groupedByCat = ingredients.GroupBy(i => i.CategoryId).ToDictionary(g => g.Key, g => g.ToList());

        foreach (var cat in allCategories)
        {
            var count = groupedByCat.TryGetValue(cat.Id, out var ings) ? ings.Count : 0;
            if (cat.IsRequired && count == 0)
            {
                throw new ArgumentException($"يجب اختيار مكون واحد على الأقل من قسم '{cat.Name}'.");
            }
            if (!cat.AllowMultiple && count > 1)
            {
                throw new ArgumentException($"غير مسموح باختيار أكثر من مكون من قسم '{cat.Name}'.");
            }
        }

        // بناء OrderItemIngredient باستخدام DefaultPortion
        orderItem.Ingredients = ingredients.Select(ing => new OrderItemIngredient
        {
            IngredientId = ing.Id,
            Quantity = ing.DefaultPortion > 0 ? ing.DefaultPortion : 1.0m
        }).ToList();

        // حساب السعر الفعلي بالكامل من السيرفر: Base Price + مجموع أسعار المكونات
        return _customPizzaBasePrice + ingredients.Sum(i => i.ExtraPrice);
    }

    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedTransitions = new()
    {
        [OrderStatus.OrderReceived]  = new[] { OrderStatus.Preparing, OrderStatus.Cancelled },
        [OrderStatus.Preparing]      = new[] { OrderStatus.InTheOven, OrderStatus.Cancelled },
        [OrderStatus.InTheOven]      = new[] { OrderStatus.OutForDelivery, OrderStatus.Cancelled },
        [OrderStatus.OutForDelivery] = new[] { OrderStatus.Delivered },
        [OrderStatus.Delivered]      = Array.Empty<OrderStatus>(),
        [OrderStatus.Cancelled]      = Array.Empty<OrderStatus>(),
    };

    public async Task<OrderResponseDto?> GetOrderByIdAsync(int orderId, int userId, bool isAdmin)
    {
        var query = _context.Orders.AsNoTracking();

        if (!isAdmin)
        {
            query = query.Where(o => o.UserId == userId);
        }

        var order = await query
            .Include(o => o.User)
            .Include(o => o.Branch)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Pizza)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Ingredients)
                    .ThenInclude(oii => oii.Ingredient)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;

        return MapToResponseDto(order);
    }

    public async Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, int page = 1, int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(page, 1);

        var query = _context.Orders.AsNoTracking().Where(o => o.UserId == userId);
        var total = await query.CountAsync();

        var orders = await query
            .Include(o => o.User)
            .Include(o => o.Branch)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Pizza)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Ingredients)
                    .ThenInclude(oii => oii.Ingredient)
            .AsSplitQuery()
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<OrderResponseDto>(orders.Select(o => MapToResponseDto(o)).ToList(), total, page, pageSize);
    }

    public async Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int page = 1, int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(page, 1);

        var query = _context.Orders.AsNoTracking();
        var total = await query.CountAsync();

        var orders = await query
            .Include(o => o.User)
            .Include(o => o.Branch)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Pizza)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Ingredients)
                    .ThenInclude(oii => oii.Ingredient)
            .AsSplitQuery()
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<OrderResponseDto>(orders.Select(o => MapToResponseDto(o)).ToList(), total, page, pageSize);
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Ingredients)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return false;

        if (!AllowedTransitions.TryGetValue(order.Status, out var allowed) || !allowed.Contains(newStatus))
        {
            throw new InvalidOperationException($"لا يمكن تغيير الحالة من {order.Status} إلى {newStatus}.");
        }

        if (newStatus == OrderStatus.Cancelled)
        {
            await RollbackStockForOrderAsync(order.OrderItems);
        }

        order.Status = newStatus;
        try
        {
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync();
            throw new InvalidOperationException("الطلب اتعدّل بواسطة شخص آخر، أعد المحاولة.");
        }

        return true;
    }

    public async Task<OrderTrackingDto?> TrackOrderByCodeAsync(Guid trackingCode)
    {
        var order = await _context.Orders
            .Include(o => o.Branch)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Pizza)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.TrackingCode == trackingCode);

        if (order == null) return null;

        var (statusText, statusDesc, progress) = order.Status switch
        {
            OrderStatus.OrderReceived => ("تم استلام الطلب", "تم تأكيد طلبك وجاري إرساله للمطبخ", 25),
            OrderStatus.Preparing => ("قيد التحضير", "يتم تحضير المكونات وعجن البيتزا طازجة الآن", 50),
            OrderStatus.InTheOven => ("في الفرن", "البيتزا الآن في الفرن ويتم خبزها", 75),
            OrderStatus.OutForDelivery => (
                order.OrderType == OrderType.Delivery ? "خرج للتوصيل" : "جاهز للاستلام",
                order.OrderType == OrderType.Delivery ? "الطلب مع مندوب التوصيل في طريقه إليك" : "الطلب جاهز الآن في الفرن ويمكنك الحضور لاستلامه",
                90),
            OrderStatus.Delivered => (
                order.OrderType == OrderType.Delivery ? "تم التسليم" : "تم الاستلام",
                "بالهناء والشفاء! نتمنى لك وجبة ممتعة",
                100),
            OrderStatus.Cancelled => ("تم الإلغاء", "تم إلغاء هذا الطلب", 0),
            _ => ("غير معروف", "", 0)
        };

        // 10) تأمين عنوان التوصيل من DestinationInfo
        string destination = order.OrderType == OrderType.Delivery
            ? "توصيل إلى عنوانك المسجل"
            : $"استلام من فرع: {order.Branch?.Name}";

        return new OrderTrackingDto
        {
            OrderId = order.Id,
            TrackingCode = order.TrackingCode,
            OrderDate = order.OrderDate,
            Status = order.Status,
            StatusText = statusText,
            StatusDescription = statusDesc,
            ProgressPercentage = progress,
            OrderType = order.OrderType,
            OrderTypeText = order.OrderType == OrderType.Delivery ? "Delivery" : "Carryout",
            DestinationInfo = destination,
            DeliveryAddress = order.DeliveryAddress,
            PhoneNumber = order.PhoneNumber,
            TotalAmount = order.TotalAmount,
            ItemsSummary = order.OrderItems.Select(i => $"{i.Quantity}x {(i.Pizza != null ? i.Pizza.Name : (i.IsCustom ? "بيتزا مخصصة" : "بيتزا"))}").ToList()
        };
    }

    public async Task<OrderTrackingDto?> TrackOrderAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Branch)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Pizza)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return null;

        return await TrackOrderByCodeAsync(order.TrackingCode);
    }

    private static OrderResponseDto MapToResponseDto(
        Order order,
        string? customerName = null,
        string? branchName = null,
        Dictionary<int, Pizza>? pizzas = null)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            TrackingCode = order.TrackingCode,
            UserId = order.UserId,
            CustomerName = customerName ?? order.User?.FullName ?? string.Empty,
            OrderDate = order.OrderDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            PhoneNumber = order.PhoneNumber,
            DeliveryAddress = order.DeliveryAddress,
            OrderType = order.OrderType,
            BranchId = order.BranchId,
            BranchName = branchName ?? order.Branch?.Name,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                PizzaId = oi.PizzaId,
                PizzaName = oi.IsCustom
                    ? "Custom Pizza"
                    : (oi.Pizza?.Name ?? (pizzas != null && oi.PizzaId.HasValue && pizzas.ContainsKey(oi.PizzaId.Value) ? pizzas[oi.PizzaId.Value].Name : string.Empty)),
                IsCustom = oi.IsCustom,
                CustomDetails = oi.CustomDetails,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.SubTotal
            }).ToList()
        };
    }

    /// <summary>
    /// التحقق من توفر كميات المكونات في المخزن وخصمها فعلياً عند إتمام الطلب للبيتزا الجاهزة والـ Custom
    /// </summary>
    private async Task DeductStockForOrderAsync(IEnumerable<OrderItem> orderItems)
    {
        var requiredIngredients = new Dictionary<int, decimal>();

        var normalPizzaIds = orderItems
            .Where(oi => !oi.IsCustom && oi.PizzaId.HasValue)
            .Select(oi => oi.PizzaId!.Value)
            .Distinct()
            .ToList();

        if (normalPizzaIds.Any())
        {
            var pizzaRecipes = await _context.Set<PizzaIngredient>()
                .Where(pi => normalPizzaIds.Contains(pi.PizzaId))
                .ToListAsync();

            foreach (var item in orderItems.Where(oi => !oi.IsCustom && oi.PizzaId.HasValue))
            {
                var ingredientsForThisPizza = pizzaRecipes.Where(r => r.PizzaId == item.PizzaId!.Value);
                foreach (var recipe in ingredientsForThisPizza)
                {
                    var totalNeeded = recipe.QuantityRequired * item.Quantity;
                    requiredIngredients[recipe.IngredientId] = requiredIngredients.GetValueOrDefault(recipe.IngredientId) + totalNeeded;
                }
            }
        }

        // حساب مكونات البيتزا المخصصة (Custom Pizza)
        foreach (var item in orderItems.Where(oi => oi.IsCustom))
        {
            foreach (var ing in item.Ingredients)
            {
                requiredIngredients[ing.IngredientId] = requiredIngredients.GetValueOrDefault(ing.IngredientId) + ing.Quantity * item.Quantity;
            }
        }

        if (!requiredIngredients.Any()) return;

        var ingredientIds = requiredIngredients.Keys.ToList();
        var stockIngredients = await _context.Ingredients
            .Where(i => ingredientIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, i => i);

        foreach (var req in requiredIngredients)
        {
            if (!stockIngredients.TryGetValue(req.Key, out var ingredient))
            {
                throw new InvalidOperationException($"المكون برقم {req.Key} غير موجود في المخزن.");
            }

            if (ingredient.StockQuantity < req.Value)
            {
                throw new InvalidOperationException($"عذراً، كمية المكون '{ingredient.Name}' في المخزن غير كافية لإتمام طلبك (المتوفر: {ingredient.StockQuantity}، المطلوب: {req.Value}).");
            }
        }

        foreach (var req in requiredIngredients)
        {
            var ingredient = stockIngredients[req.Key];
            ingredient.StockQuantity -= req.Value;
        }
    }

    /// <summary>
    /// استرجاع كميات المكونات إلى المخزن في حال إلغاء الطلب للبيتزا الجاهزة والـ Custom
    /// </summary>
    private async Task RollbackStockForOrderAsync(IEnumerable<OrderItem> orderItems)
    {
        var toRestore = new Dictionary<int, decimal>();

        var normalPizzaIds = orderItems
            .Where(oi => !oi.IsCustom && oi.PizzaId.HasValue)
            .Select(oi => oi.PizzaId!.Value)
            .Distinct()
            .ToList();

        if (normalPizzaIds.Any())
        {
            var pizzaRecipes = await _context.Set<PizzaIngredient>()
                .Where(pi => normalPizzaIds.Contains(pi.PizzaId))
                .ToListAsync();

            foreach (var item in orderItems.Where(oi => !oi.IsCustom && oi.PizzaId.HasValue))
            {
                var recipes = pizzaRecipes.Where(r => r.PizzaId == item.PizzaId!.Value);
                foreach (var r in recipes)
                {
                    var total = r.QuantityRequired * item.Quantity;
                    toRestore[r.IngredientId] = toRestore.GetValueOrDefault(r.IngredientId) + total;
                }
            }
        }

        // استرجاع مكونات البيتزا المخصصة (Custom Pizza)
        foreach (var item in orderItems.Where(oi => oi.IsCustom))
        {
            foreach (var ing in item.Ingredients)
            {
                toRestore[ing.IngredientId] = toRestore.GetValueOrDefault(ing.IngredientId) + ing.Quantity * item.Quantity;
            }
        }

        if (!toRestore.Any()) return;

        var ingredients = await _context.Ingredients
            .Where(i => toRestore.Keys.Contains(i.Id))
            .ToListAsync();

        foreach (var ing in ingredients)
        {
            ing.StockQuantity += toRestore[ing.Id];
        }
    }
}