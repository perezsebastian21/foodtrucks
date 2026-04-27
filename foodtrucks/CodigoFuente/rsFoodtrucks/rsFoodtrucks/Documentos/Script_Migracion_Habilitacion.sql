-- ============================================================
-- Script: Script_Migracion_Habilitacion.sql
-- Propósito: Reemplazar columna "Habilitacion" por tres hojas: "HabHoja1", "HabHoja2" y "HabHoja3"
-- ============================================================

-- 1. Eliminar columna original
ALTER TABLE public."FT_Foodtrucks"
    DROP COLUMN IF EXISTS "Habilitacion";

-- 2. Agregar las tres columnas nuevas
ALTER TABLE public."FT_Foodtrucks"
    ADD COLUMN IF NOT EXISTS "HabHoja1" bytea,
    ADD COLUMN IF NOT EXISTS "HabHoja2" bytea,
    ADD COLUMN IF NOT EXISTS "HabHoja3" bytea;
