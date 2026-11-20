using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public UploadsController(IWebHostEnvironment environment, IConfiguration configuration)
    {
        _environment = environment;
        _configuration = configuration;
    }

    /// <summary>
    /// رفع صورة صنف بيتزا أو مكون من جهاز الأدمن
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "يرجى تحديد ملف صورة صالح." });
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(new { message = "حجم الصورة كبير جداً، الحد الأقصى المسموح به هو 5 ميجابايت." });
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "صيغة الملف غير مدعومة. الصيغ المسموحة هي: JPG, JPEG, PNG, WEBP, GIF." });
        }

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsDir = Path.Combine(webRoot, "uploads", "pizzas");
        Directory.CreateDirectory(uploadsDir);

        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var destinationPath = Path.Combine(uploadsDir, uniqueFileName);

        using (var stream = new FileStream(destinationPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var appUrl = _configuration["AppUrl"]?.TrimEnd('/') ?? $"{Request.Scheme}://{Request.Host}";
        var relativeUrl = $"/uploads/pizzas/{uniqueFileName}";
        var fullUrl = $"{appUrl}{relativeUrl}";

        return Ok(new
        {
            url = fullUrl,
            relativeUrl = relativeUrl,
            fileName = uniqueFileName
        });
    }
}
