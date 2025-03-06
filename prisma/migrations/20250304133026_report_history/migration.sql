/*
  Warnings:

  - The `status` column on the `ReportHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReportHistoryStatus" AS ENUM ('completed', 'generating', 'failed');

-- DropIndex
DROP INDEX "ReportHistory_userId_idx";

-- AlterTable
ALTER TABLE "ReportHistory" ADD COLUMN     "error" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pdfUrl" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ReportHistoryStatus" NOT NULL DEFAULT 'completed';

-- CreateIndex
CREATE INDEX "ReportHistory_userId_status_idx" ON "ReportHistory"("userId", "status");

-- CreateIndex
CREATE INDEX "ReportHistory_generatedAt_idx" ON "ReportHistory"("generatedAt");
