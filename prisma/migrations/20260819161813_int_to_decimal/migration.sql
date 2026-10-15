/*
  Warnings:

  - You are about to alter the column `money` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "money" SET DATA TYPE DECIMAL(10,2);
