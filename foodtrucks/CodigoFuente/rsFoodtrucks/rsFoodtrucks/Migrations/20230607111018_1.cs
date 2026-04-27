using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace rsFoodtrucks.Migrations
{
    public partial class _1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "FT_Categorias",
                schema: "dbo",
                columns: table => new
                {
                    IdCategoria = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "varchar(2000)", unicode: false, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_ID_Categoria_PK", x => x.IdCategoria);
                });

            migrationBuilder.CreateTable(
                name: "FT_Usuarios",
                schema: "dbo",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Usuario = table.Column<string>(type: "varchar(255)", unicode: false, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: true, defaultValueSql: "1")
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_Usuaior_PK", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "FT_Foodtrucks",
                schema: "dbo",
                columns: table => new
                {
                    IdFT = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdCategoria = table.Column<int>(nullable: false),
                    NombreFantasia = table.Column<string>(type: "varchar(2000)", unicode: false, nullable: false),
                    Logo = table.Column<byte[]>(nullable: true),
                    Titular = table.Column<string>(type: "varchar(2000)", unicode: false, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", unicode: false, nullable: true),
                    Menu = table.Column<string>(type: "TEXT", maxLength: 10000, nullable: true),
                    Vegano = table.Column<string>(type: "char(1)", nullable: true, defaultValue: "N"),
                    Vegetariano = table.Column<string>(type: "char(1)", nullable: true, defaultValue: "N"),
                    SinTACC = table.Column<string>(type: "char(1)", nullable: true, defaultValue: "N"),
                    Emplazado = table.Column<string>(type: "char(1)", nullable: true, defaultValue: "N"),
                    Celiaco = table.Column<string>(type: "char(1)", nullable: true, defaultValue: "N"),
                    Activo = table.Column<bool>(type: "boolean", nullable: true, defaultValueSql: "1")
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_Id_Foodtruck_PK", x => x.IdFT);
                    table.ForeignKey(
                        name: "FK_FT_Foodtrucks_FT_Categorias_IdCategoria",
                        column: x => x.IdCategoria,
                        principalSchema: "dbo",
                        principalTable: "FT_Categorias",
                        principalColumn: "IdCategoria",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FT_Foodtrucks_IdCategoria",
                schema: "dbo",
                table: "FT_Foodtrucks",
                column: "IdCategoria");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FT_Foodtrucks",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FT_Usuarios",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FT_Categorias",
                schema: "dbo");
        }
    }
}
