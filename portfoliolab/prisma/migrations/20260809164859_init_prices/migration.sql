-- CreateTable
CREATE TABLE "StockPrice" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "highPrice" DOUBLE PRECISION NOT NULL,
    "lowPrice" DOUBLE PRECISION NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,

    CONSTRAINT "StockPrice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockPrice" ADD CONSTRAINT "StockPrice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
