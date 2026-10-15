-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "subindustry" TEXT NOT NULL,
    "headquarters" TEXT NOT NULL,
    "founded_year" INTEGER NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_symbol_key" ON "Company"("symbol");
