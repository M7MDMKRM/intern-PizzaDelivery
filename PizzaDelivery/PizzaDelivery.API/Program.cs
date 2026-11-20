using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PizzaDelivery.API.Hubs;
using PizzaDelivery.API.Middleware;
using PizzaDelivery.Application.Common;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Infrastructure.Data;
using PizzaDelivery.Infrastructure.Services;
using PizzaDelivery.Infrastructure.BackgroundServices;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Exception Handling, Problem Details & Memory Cache
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddMemoryCache();

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"];
if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.FromSeconds(30)
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 3. Register Application Services (Dependency Injection)
builder.Services.AddScoped<IIngredientService, IngredientService>();
builder.Services.AddScoped<IPizzaService, PizzaService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddSignalR();
builder.Services.AddHttpClient<IPaymentService, PaymentService>(c =>
{
    c.BaseAddress = new Uri("https://api.razorpay.com/v1/");
});
builder.Services.AddHostedService<StockMonitoringBackgroundService>();
builder.Services.AddHostedService<UnpaidOrdersCleanupService>();
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// 4. Rate Limiting Configuration
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global limiter: 100 requests per minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));

    // Specific auth policy: 20 requests per 1 minute per IP
    options.AddPolicy("auth", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        }));
});

// 5. CORS Configuration (من الـ Configuration)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

// 6. Swagger Documentation with JWT Bearer Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pizza Delivery API",
        Version = "v1",
        Description = "Clean Architecture Backend API for Pizza Delivery Application"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter token as: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Middleware Pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pizza Delivery API v1");
    });
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();
app.UseResponseCompression();

// Cache Headers: no-store فقط على مسارات العمليات الحساسة
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
    if (path.StartsWith("/api/cart") ||
        path.StartsWith("/api/orders") ||
        path.StartsWith("/api/auth") ||
        path.StartsWith("/api/payment") ||
        path.StartsWith("/api/dashboard"))
    {
        context.Response.Headers.Append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        context.Response.Headers.Append("Pragma", "no-cache");
        context.Response.Headers.Append("Expires", "0");
    }

    await next();
});

// Security Headers & CSP مبسط للـ API
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
    if (!path.StartsWith("/uploads"))
    {
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
    }
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    await next();
});

app.UseRateLimiter();
app.UseCors("AllowFrontend");
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");
        ctx.Context.Response.Headers.Append("Cache-Control", "public, max-age=604800");
    }
});
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OrderHub>("/hubs/order");

app.Run();
