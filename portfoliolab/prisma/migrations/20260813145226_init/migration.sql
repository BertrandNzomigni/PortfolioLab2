/*
  Warnings:

  - You are about to alter the column `openPrice` on the `StockPrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `highPrice` on the `StockPrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `lowPrice` on the `StockPrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `closePrice` on the `StockPrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "StockPrice" ALTER COLUMN "openPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "highPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "lowPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "closePrice" SET DATA TYPE DECIMAL(10,2);
