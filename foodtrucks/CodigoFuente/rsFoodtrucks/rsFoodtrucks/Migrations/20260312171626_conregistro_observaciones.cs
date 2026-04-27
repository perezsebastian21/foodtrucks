using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace rsFoodtrucks.Migrations
{
    public partial class conregistro_observaciones : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.AlterColumn<string>(
                name: "Vegetariano",
                schema: "public",
                table: "FT_Foodtrucks",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "char(1)",
                oldNullable: true,
                oldDefaultValue: "N");

            migrationBuilder.AlterColumn<string>(
                name: "Vegano",
                schema: "public",
                table: "FT_Foodtrucks",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "char(1)",
                oldNullable: true,
                oldDefaultValue: "N");

            migrationBuilder.AlterColumn<string>(
                name: "Celiaco",
                schema: "public",
                table: "FT_Foodtrucks",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "char(1)",
                oldNullable: true,
                oldDefaultValue: "N");

            migrationBuilder.AlterColumn<byte[]>(
                name: "CartaMenu",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "char(1)",
                nullable: true,
                defaultValueSql: "true");

            migrationBuilder.AddColumn<string>(
                name: "Observaciones",
                schema: "public",
                table: "FT_Foodtrucks",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "Observaciones",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.AlterColumn<string>(
                name: "Vegetariano",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "char(1)",
                nullable: true,
                defaultValue: "N",
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Vegano",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "char(1)",
                nullable: true,
                defaultValue: "N",
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Celiaco",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "char(1)",
                nullable: true,
                defaultValue: "N",
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CartaMenu",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "boolean",
                nullable: true,
                defaultValueSql: "true");
        }
    }
}
