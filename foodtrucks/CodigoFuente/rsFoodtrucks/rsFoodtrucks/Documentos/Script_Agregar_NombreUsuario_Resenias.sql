-- Script de migración: Agregar columna NombreUsuario a FT_Resenias
-- Fecha: 2026-04-10

ALTER TABLE public."FT_Resenias" ADD COLUMN "NombreUsuario" varchar(255) NULL;
