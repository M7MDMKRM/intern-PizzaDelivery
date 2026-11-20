using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using PizzaDelivery.Application.DTOs.Pizzas;
using PizzaDelivery.Application.Interfaces;

namespace PizzaDelivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PizzasController : ControllerBase
{
    private readonly IPizzaService _pizzaService;
    private readonly IMemoryCache _cache;
    private const string CacheKeyAllPizzas = "all_pizzas_cache";

    public PizzasController(IPizzaService pizzaService, IMemoryCache cache)
    {
        _pizzaService = pizzaService;
        _cache = cache;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PizzaResponseDto>>> GetAll()
    {
        if (!_cache.TryGetValue(CacheKeyAllPizzas, out IEnumerable<PizzaResponseDto>? pizzas))
        {
            pizzas = await _pizzaService.GetAllAsync();
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));
            _cache.Set(CacheKeyAllPizzas, pizzas, cacheOptions);
        }
        return Ok(pizzas);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<PizzaResponseDto>> GetById(int id)
    {
        var cacheKey = $"pizza_{id}";
        if (!_cache.TryGetValue(cacheKey, out PizzaResponseDto? pizza))
        {
            pizza = await _pizzaService.GetByIdAsync(id);
            if (pizza is null)
                return NotFound(new { message = $"Pizza with ID {id} not found." });

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));
            _cache.Set(cacheKey, pizza, cacheOptions);
        }

        return Ok(pizza);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PizzaResponseDto>> Create([FromBody] CreatePizzaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdPizza = await _pizzaService.CreateAsync(dto);
        _cache.Remove(CacheKeyAllPizzas);
        return CreatedAtAction(nameof(GetById), new { id = createdPizza.Id }, createdPizza);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PizzaResponseDto>> Update(int id, [FromBody] UpdatePizzaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updatedPizza = await _pizzaService.UpdateAsync(id, dto);
        if (updatedPizza is null)
            return NotFound(new { message = $"Pizza with ID {id} not found." });

        _cache.Remove(CacheKeyAllPizzas);
        _cache.Remove($"pizza_{id}");
        return Ok(updatedPizza);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _pizzaService.DeleteAsync(id);
        if (!isDeleted)
            return NotFound(new { message = $"Pizza with ID {id} not found." });

        _cache.Remove(CacheKeyAllPizzas);
        _cache.Remove($"pizza_{id}");
        return NoContent();
    }
}
