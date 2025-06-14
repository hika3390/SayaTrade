-- AlterTable
ALTER TABLE "pairs" ADD COLUMN     "isSettled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "settledAt" TIMESTAMP(3);
