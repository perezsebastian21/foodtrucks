-- Script de migración: Agregar columna QrCode a FT_Foodtrucks
-- Fecha: 2026-04-17
-- Descripción: Almacena la imagen PNG del código QR para el flujo de votación

ALTER TABLE public."FT_Foodtrucks" ADD COLUMN IF NOT EXISTS "QrCode" bytea;

--COMMENT ON COLUMN public."FT_Foodtrucks"."QrCode" IS 'Imagen PNG del código QR para el flujo de votación OIDC';
