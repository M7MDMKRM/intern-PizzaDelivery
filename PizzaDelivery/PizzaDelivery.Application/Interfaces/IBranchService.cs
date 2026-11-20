using PizzaDelivery.Application.DTOs.Branches;

namespace PizzaDelivery.Application.Interfaces;

public interface IBranchService
{
    Task<IEnumerable<BranchDto>> GetAllBranchesAsync(bool onlyActive = true);
    Task<BranchDto?> GetBranchByIdAsync(int id);
    Task<BranchDto> CreateBranchAsync(CreateBranchDto dto);
    Task<bool> UpdateBranchStatusAsync(int id, bool isActive);
}