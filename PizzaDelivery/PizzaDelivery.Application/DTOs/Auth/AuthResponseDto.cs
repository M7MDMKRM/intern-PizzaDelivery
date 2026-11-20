using PizzaDelivery.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PizzaDelivery.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public int userid { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty ;
        
        public DateTime Expireson { get; set; }


    }
}
