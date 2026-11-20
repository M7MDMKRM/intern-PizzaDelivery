using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PizzaDelivery.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentAndConcurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaymentStatus",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayOrderId",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayPaymentId",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Orders",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Ingredients",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RazorpayOrderId",
                table: "Orders",
                column: "RazorpayOrderId",
                unique: true,
                filter: "[RazorpayOrderId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RazorpayPaymentId",
                table: "Orders",
                column: "RazorpayPaymentId",
                unique: true,
                filter: "[RazorpayPaymentId] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Ingredients_Stock_NonNegative",
                table: "Ingredients",
                sql: "[StockQuantity] >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_RazorpayOrderId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RazorpayPaymentId",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Ingredients_Stock_NonNegative",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RazorpayOrderId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RazorpayPaymentId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Ingredients");
        }
    }
}
