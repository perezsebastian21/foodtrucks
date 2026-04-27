using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace rsFoodtrucks.Migrations
{
    public partial class conregistro2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FT_FoodtruckFT_Categoria",
                schema: "public",
                columns: table => new
                {
                    Id_FT_FoodtruckFT_Categoria = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdFT = table.Column<int>(nullable: false),
                    IdCategoria = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FT_FoodtruckFT_Categoria", x => x.Id_FT_FoodtruckFT_Categoria);
                    table.ForeignKey(
                        name: "FK_FT_FoodtruckFT_Categoria_FT_Categorias_IdCategoria",
                        column: x => x.IdCategoria,
                        principalSchema: "public",
                        principalTable: "FT_Categorias",
                        principalColumn: "IdCategoria",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FT_FoodtruckFT_Categoria_FT_Foodtrucks_IdFT",
                        column: x => x.IdFT,
                        principalSchema: "public",
                        principalTable: "FT_Foodtrucks",
                        principalColumn: "IdFT",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FT_FoodtruckFT_Categoria_IdCategoria",
                schema: "public",
                table: "FT_FoodtruckFT_Categoria",
                column: "IdCategoria");

            migrationBuilder.CreateIndex(
                name: "IX_FT_FoodtruckFT_Categoria_IdFT",
                schema: "public",
                table: "FT_FoodtruckFT_Categoria",
                column: "IdFT");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FT_FoodtruckFT_Categoria",
                schema: "public");
        }
    }
}
