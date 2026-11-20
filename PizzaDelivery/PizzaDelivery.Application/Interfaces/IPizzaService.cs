using PizzaDelivery.Application.DTOs.Pizzas;

namespace PizzaDelivery.Application.Interfaces;

public interface IPizzaService
{
    Task<IEnumerable<PizzaResponseDto>> GetAllAsync(bool? availableOnly = null);
    Task<PizzaResponseDto?> GetByIdAsync(int id);
    Task<PizzaResponseDto> CreateAsync(CreatePizzaDto dto);
    Task<PizzaResponseDto?> UpdateAsync(int id, UpdatePizzaDto dto);
    Task<bool> DeleteAsync(int id);
}