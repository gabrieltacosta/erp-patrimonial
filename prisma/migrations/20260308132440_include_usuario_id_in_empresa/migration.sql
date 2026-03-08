-- AlterTable
ALTER TABLE "user" ADD COLUMN     "empresaId" TEXT;

-- CreateIndex
CREATE INDEX "user_empresaId_idx" ON "user"("empresaId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
