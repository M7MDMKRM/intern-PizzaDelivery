using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PizzaDelivery.Domain.Enums;

public enum OrderStatus
{
    OrderReceived = 1,
    Preparing = 2,
    InTheOven = 3,
    OutForDelivery = 4,
    Delivered = 5,
    Cancelled = 6
}