using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaDelivery.Application.DTOs.Branches;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IBranchService _branchService;

    public BranchesController(IBranchService branchService)
    {
        _branchService = branchService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var branches = await _branchService.GetAllBranchesAsync();
        return Ok(branches);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var branch = await _branchService.GetBranchByIdAsync(id);
        if (branch == null) return NotFound(new { message = "الفرع غير موجود" });
        return Ok(branch);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBranchDto dto)
    {
        var result = await _branchService.CreateBranchAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
    {
        var success = await _branchService.UpdateBranchStatusAsync(id, isActive);
        if (!success) return NotFound(new { message = "الفرع غير موجود" });
        return Ok(new { message = "تم تحديث حالة الفرع بنجاح" });
    }
}