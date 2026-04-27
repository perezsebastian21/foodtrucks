-- Script para eliminar las columnas FtTrasera, FtIzquierda y FtDerecha de la tabla FT_Foodtrucks

ALTER TABLE "public"."FT_Foodtrucks" DROP COLUMN IF EXISTS "FtTrasera";
ALTER TABLE "public"."FT_Foodtrucks" DROP COLUMN IF EXISTS "FtDerecha";
ALTER TABLE "public"."FT_Foodtrucks" DROP COLUMN IF EXISTS "FtIzquierda";
