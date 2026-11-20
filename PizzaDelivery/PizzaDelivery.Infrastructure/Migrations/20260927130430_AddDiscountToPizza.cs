using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PizzaDelivery.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountToPizza : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "Pizzas",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OfferEndDate",
                table: "Pizzas",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OfferStartDate",
                table: "Pizzas",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "OfferEndDate",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "OfferStartDate",
                table: "Pizzas");
        }
    }
}
