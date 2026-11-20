using Microsoft.EntityFrameworkCore;
using PizzaDelivery.Application.DTOs.Branches;
using PizzaDelivery.Application.Interfaces;
using PizzaDelivery.Domain.Entities;
using PizzaDelivery.Infrastructure.Data;

namespace PizzaDelivery.Infrastructure.Services;

public class BranchService : IBranchService
{
    private readonly AppDbContext _context;

    public BranchService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BranchDto>> GetAllBranchesAsync(bool onlyActive = true)
    {
        var query = _context.Branches.AsNoTracking();

        if (onlyActive)
            query = query.Where(b => b.IsActive);

        return await query.Select(b => new BranchDto
        {
            Id = b.Id,
            Name = b.Name,
            City = b.City,
            Address = b.Address,
            PhoneNumber = b.PhoneNumber,
            OpeningHours = b.OpeningHours,
            IsActive = b.IsActive
        }).ToListAsync();
    }

    public async Task<BranchDto?> GetBranchByIdAsync(int id)
    {
        var b = await _context.Branches.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (b == null) return null;

        return new BranchDto
        {
            Id = b.Id,
            Name = b.Name,
            City = b.City,
            Address = b.Address,
            PhoneNumber = b.PhoneNumber,
            OpeningHours = b.OpeningHours,
            IsActive = b.IsActive
        };
    }

    public async Task<BranchDto> CreateBranchAsync(CreateBranchDto dto)
    {
        var branch = new Branch
        {
            Name = dto.Name,
            City = dto.City,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            OpeningHours = dto.OpeningHours,
            IsActive = true
        };

        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return new BranchDto
        {
            Id = branch.Id,
            Name = branch.Name,
            City = branch.City,
            Address = branch.Address,
            PhoneNumber = branch.PhoneNumber,
            OpeningHours = branch.OpeningHours,
            IsActive = branch.IsActive
        };
    }

    public async Task<bool> UpdateBranchStatusAsync(int id, bool isActive)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return false;

        branch.IsActive = isActive;
        await _context.SaveChangesAsync();
        return true;
    }
}