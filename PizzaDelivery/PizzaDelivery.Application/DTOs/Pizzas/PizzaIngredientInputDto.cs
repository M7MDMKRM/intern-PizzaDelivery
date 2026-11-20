using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PizzaDelivery.Application.DTOs.Pizzas;

public class PizzaIngredientInputDto
{
    public int IngredientId { get; set; }
    public decimal QuantityRequired { get; set; }
}
