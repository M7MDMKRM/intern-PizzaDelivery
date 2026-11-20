using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PizzaDelivery.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPizzaIngredientsRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ingredients_Pizzas_PizzaId",
                table: "Ingredients");

            migrationBuilder.DropForeignKey(
                name: "FK_Pizzas_Ingredients_BaseId",
                table: "Pizzas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pizzas_Ingredients_CheeseId",
                table: "Pizzas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pizzas_Ingredients_SauceId",
                table: "Pizzas");

            migrationBuilder.DropIndex(
                name: "IX_Pizzas_BaseId",
                table: "Pizzas");

            migrationBuilder.DropIndex(
                name: "IX_Pizzas_CheeseId",
                table: "Pizzas");

            migrationBuilder.DropIndex(
                name: "IX_Pizzas_SauceId",
                table: "Pizzas");

            migrationBuilder.DropIndex(
                name: "IX_Ingredients_PizzaId",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "BaseId",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "CheeseId",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "SauceId",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "PizzaId",
                table: "Ingredients");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Pizzas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Pizzas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAvailable",
                table: "Pizzas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PizzaIngredients",
                columns: table => new
                {
                    PizzaId = table.Column<int>(type: "int", nullable: false),
                    IngredientId = table.Column<int>(type: "int", nullable: false),
                    QuantityRequired = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PizzaIngredients", x => new { x.PizzaId, x.IngredientId });
                    table.ForeignKey(
                        name: "FK_PizzaIngredients_Ingredients_IngredientId",
                        column: x => x.IngredientId,
                        principalTable: "Ingredients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PizzaIngredients_Pizzas_PizzaId",
                        column: x => x.PizzaId,
                        principalTable: "Pizzas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PizzaIngredients_IngredientId",
                table: "PizzaIngredients",
                column: "IngredientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PizzaIngredients");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Pizzas");

            migrationBuilder.DropColumn(
                name: "IsAvailable",
                table: "Pizzas");

            migrationBuilder.AddColumn<int>(
                name: "BaseId",
                table: "Pizzas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CheeseId",
                table: "Pizzas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SauceId",
                table: "Pizzas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PizzaId",
                table: "Ingredients",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pizzas_BaseId",
                table: "Pizzas",
                column: "BaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Pizzas_CheeseId",
                table: "Pizzas",
                column: "CheeseId");

            migrationBuilder.CreateIndex(
                name: "IX_Pizzas_SauceId",
                table: "Pizzas",
                column: "SauceId");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_PizzaId",
                table: "Ingredients",
                column: "PizzaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ingredients_Pizzas_PizzaId",
                table: "Ingredients",
                column: "PizzaId",
                principalTable: "Pizzas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pizzas_Ingredients_BaseId",
                table: "Pizzas",
                column: "BaseId",
                principalTable: "Ingredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pizzas_Ingredients_CheeseId",
                table: "Pizzas",
                column: "CheeseId",
                principalTable: "Ingredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pizzas_Ingredients_SauceId",
                table: "Pizzas",
                column: "SauceId",
                principalTable: "Ingredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
