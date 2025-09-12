/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Barbershop` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,barbershopId]` on the table `BarbershopService` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" ADD COLUMN     "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "update_At" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."BarbershopService" ADD COLUMN     "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "update_At" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Booking" ALTER COLUMN "updateAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_name_key" ON "public"."Barbershop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BarbershopService_name_barbershopId_key" ON "public"."BarbershopService"("name", "barbershopId");
