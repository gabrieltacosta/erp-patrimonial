/*
  Warnings:

  - You are about to alter the column `taxaMensal` on the `Depreciacao` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,4)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "Depreciacao" ALTER COLUMN "taxaMensal" SET DATA TYPE DECIMAL(15,2);
