using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PizzaDelivery.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackingCodeAndAlertsAndOtp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OtpCode",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OtpExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OtpFailedAttempts",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TrackingCode",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLowStockAlertAt",
                table: "Ingredients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TrackingCode",
                table: "Orders",
                column: "TrackingCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_TrackingCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "OtpCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OtpExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OtpFailedAttempts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrackingCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "LastLowStockAlertAt",
                table: "Ingredients");
        }
    }
}
