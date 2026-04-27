-- Script de migración: Reemplazar IdUsuario por Cuil en FT_Resenias
-- Fecha: 2026-04-09

-- 1. Agregar columna Cuil
ALTER TABLE public."FT_Resenias" ADD COLUMN "Cuil" char(11);

-- 2. Eliminar constraint de clave foránea antigua
ALTER TABLE public."FT_Resenias" DROP CONSTRAINT "FT_Resenias_UsuarioId_fkey";

-- 3. Eliminar columna UsuarioId (IdUsuario en el código C#)
-- Nota: Según solicitud del usuario, no importa la pérdida de datos históricos.
ALTER TABLE public."FT_Resenias" DROP COLUMN "UsuarioId";
