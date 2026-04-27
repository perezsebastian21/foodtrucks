ALTER TABLE "FT_Foodtrucks"
ADD COLUMN "ManipulacionAlimentos" bytea NULL;


-- 1. Añade la columna permitiendo nulos para aplicar sin fallos al inicio
ALTER TABLE "FT_Resenias"
ADD COLUMN "Visible" char(1) NULL;

-- 2. Asegura que todos los registros preexistentes tengan la reseña visible.
UPDATE "FT_Resenias"
SET "Visible" = 'S'
WHERE "Visible" IS NULL;

-- 3. (Opcional pero recomendado) Cambiar a No Nulo con valor predeterminado a futuro.
ALTER TABLE "FT_Resenias"
ALTER COLUMN "Visible" SET NOT NULL;

ALTER TABLE "FT_Resenias"
ALTER COLUMN "Visible" SET DEFAULT 'S';
