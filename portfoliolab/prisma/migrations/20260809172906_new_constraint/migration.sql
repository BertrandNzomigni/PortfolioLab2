/*
  Warnings:

  - A unique constraint covering the columns `[companyId,datetime]` on the table `StockPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StockPrice" ALTER COLUMN "volume" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "StockPrice_companyId_datetime_key" ON "StockPrice"("companyId", "datetime");
