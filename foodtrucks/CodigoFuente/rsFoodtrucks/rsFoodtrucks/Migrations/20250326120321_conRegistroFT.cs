using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace rsFoodtrucks.Migrations
{
    public partial class conRegistroFT : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.RenameTable(
                name: "FT_Usuarios",
                schema: "dbo",
                newName: "FT_Usuarios",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "FT_Foodtrucks",
                schema: "dbo",
                newName: "FT_Foodtrucks",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "FT_Categorias",
                schema: "dbo",
                newName: "FT_Categorias",
                newSchema: "public");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                schema: "public",
                table: "FT_Usuarios",
                type: "boolean",
                nullable: true,
                defaultValueSql: "true",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true,
                oldDefaultValueSql: "1");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "boolean",
                nullable: true,
                defaultValueSql: "true",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true,
                oldDefaultValueSql: "1");

            migrationBuilder.AddColumn<string>(
                name: "CartaMenu",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CelContacto",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(255)",
                unicode: false,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Consumo",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CuitCuil",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(11)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "DniDorso",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "DniFrente",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DomicilioLegal",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailTitular",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaVencimiento",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FtDerecha",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FtFrente",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FtIzquierda",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FtTrasera",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroRegistro",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SolicitudIngreso",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telefono",
                schema: "public",
                table: "FT_Foodtrucks",
                type: "varchar(100)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CartaMenu",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "CelContacto",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "Consumo",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "CuitCuil",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "DniDorso",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "DniFrente",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "DomicilioLegal",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "EmailTitular",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "FechaVencimiento",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "FtDerecha",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "FtFrente",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "FtIzquierda",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "FtTrasera",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "NumeroRegistro",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "SolicitudIngreso",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.DropColumn(
                name: "Telefono",
                schema: "public",
                table: "FT_Foodtrucks");

            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.RenameTable(
                name: "FT_Usuarios",
                schema: "public",
                newName: "FT_Usuarios",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FT_Foodtrucks",
                schema: "public",
                newName: "FT_Foodtrucks",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FT_Categorias",
                schema: "public",
                newName: "FT_Categorias",
                newSchema: "dbo");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                schema: "dbo",
                table: "FT_Usuarios",
                type: "boolean",
                nullable: true,
                defaultValueSql: "1",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true,
                oldDefaultValueSql: "true");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                schema: "dbo",
                table: "FT_Foodtrucks",
                type: "boolean",
                nullable: true,
                defaultValueSql: "1",
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true,
                oldDefaultValueSql: "true");
        }
    }
}
