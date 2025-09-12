/*
  Warnings:

  - You are about to drop the column `created_At` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `update_At` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `created_At` on the `BarbershopService` table. All the data in the column will be lost.
  - You are about to drop the column `update_At` on the `BarbershopService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" DROP COLUMN "created_At",
DROP COLUMN "update_At";

-- AlterTable
ALTER TABLE "public"."BarbershopService" DROP COLUMN "created_At",
DROP COLUMN "update_At";
