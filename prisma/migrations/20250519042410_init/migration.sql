-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "buyShares" INTEGER NOT NULL,
    "sellShares" INTEGER NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "pairs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pairs" ADD CONSTRAINT "pairs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
