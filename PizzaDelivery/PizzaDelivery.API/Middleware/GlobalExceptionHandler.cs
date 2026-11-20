using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace PizzaDelivery.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, message) = ex switch
        {
            ArgumentException => (StatusCodes.Status400BadRequest, ex.Message),
            InvalidOperationException => (StatusCodes.Status409Conflict, ex.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, ex.Message),
            KeyNotFoundException => (StatusCodes.Status404NotFound, ex.Message),
            _ => (StatusCodes.Status500InternalServerError, "حدث خطأ غير متوقع.")
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
        }
        else
        {
            _logger.LogWarning(ex, "Handled exception ({StatusCode}): {Message}", status, ex.Message);
        }

        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Detail = message,
            Instance = ctx.Request.Path
        }, ct);

        return true;
    }
}
