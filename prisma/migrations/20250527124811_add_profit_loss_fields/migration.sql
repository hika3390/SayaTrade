-- AlterTable
ALTER TABLE "pairs" ADD COLUMN     "currentBuyPrice" DOUBLE PRECISION,
ADD COLUMN     "currentSellPrice" DOUBLE PRECISION,
ADD COLUMN     "profitLoss" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
