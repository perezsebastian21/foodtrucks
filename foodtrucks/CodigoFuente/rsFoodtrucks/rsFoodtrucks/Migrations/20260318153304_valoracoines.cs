using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace rsFoodtrucks.Migrations
{
    public partial class valoracoines : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FT_Preguntas",
                schema: "public",
                columns: table => new
                {
                    IdPregunta = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "varchar(255)", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_Id_Pregunta_PK", x => x.IdPregunta);
                });

            migrationBuilder.CreateTable(
                name: "FT_Resenias",
                schema: "public",
                columns: table => new
                {
                    IdResenia = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FoodtruckId = table.Column<int>(nullable: false),
                    UsuarioId = table.Column<int>(nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_Id_Resenia_PK", x => x.IdResenia);
                    table.ForeignKey(
                        name: "FT_Resenias_FoodtruckId_fkey",
                        column: x => x.FoodtruckId,
                        principalSchema: "public",
                        principalTable: "FT_Foodtrucks",
                        principalColumn: "IdFT",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FT_Resenias_UsuarioId_fkey",
                        column: x => x.UsuarioId,
                        principalSchema: "public",
                        principalTable: "FT_Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FT_Puntajes",
                schema: "public",
                columns: table => new
                {
                    ReseniaId = table.Column<int>(nullable: false),
                    PreguntaId = table.Column<int>(nullable: false),
                    Score = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("FT_Id_Puntajes_PK", x => new { x.ReseniaId, x.PreguntaId });
                    table.ForeignKey(
                        name: "FT_Puntajes_PreguntaId_fkey",
                        column: x => x.PreguntaId,
                        principalSchema: "public",
                        principalTable: "FT_Preguntas",
                        principalColumn: "IdPregunta",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FT_Puntajes_ReseniaId_fkey",
                        column: x => x.ReseniaId,
                        principalSchema: "public",
                        principalTable: "FT_Resenias",
                        principalColumn: "IdResenia",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FT_Puntajes_PreguntaId",
                schema: "public",
                table: "FT_Puntajes",
                column: "PreguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_FT_Resenias_FoodtruckId",
                schema: "public",
                table: "FT_Resenias",
                column: "FoodtruckId");

            migrationBuilder.CreateIndex(
                name: "IX_FT_Resenias_UsuarioId",
                schema: "public",
                table: "FT_Resenias",
                column: "UsuarioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FT_Puntajes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FT_Preguntas",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FT_Resenias",
                schema: "public");
        }
    }
}
