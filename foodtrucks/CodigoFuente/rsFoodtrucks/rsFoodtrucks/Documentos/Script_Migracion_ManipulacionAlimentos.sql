-- Si prefieres aplicar el cambio directamente en la base de datos PostgreSQL en lugar de usar comandos EF Core (dotnet ef database update), puedes correr este script en pgAdmin o tu cliente SQL:

ALTER TABLE "FT_Foodtrucks"
ADD COLUMN "ManipulacionAlimentos" bytea NULL;
