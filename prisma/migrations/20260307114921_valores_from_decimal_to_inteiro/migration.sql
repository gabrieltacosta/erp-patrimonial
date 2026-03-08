/*
  Warnings:

  - You are about to alter the column `valorAquisicao` on the `Bem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `valorResidual` on the `Bem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `valorDepreciado` on the `Depreciacao` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `custo` on the `Manutencao` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Bem" ALTER COLUMN "valorAquisicao" SET DATA TYPE INTEGER,
ALTER COLUMN "valorResidual" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Depreciacao" ALTER COLUMN "valorDepreciado" SET DEFAULT 0,
ALTER COLUMN "valorDepreciado" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Manutencao" ALTER COLUMN "custo" SET DATA TYPE INTEGER;
