// 共通の型定義
export interface PairWithPrices {
  id: number;
  name: string;
  link?: string | null;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  buyStockCode?: string | null;
  sellStockCode?: string | null;
  companyId: number;
  company?: {
    id: number;
    name: string;
  };
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
  buyProfitLoss?: number;
  sellProfitLoss?: number;
  isSettled?: boolean;
  entryDate?: Date | null;
  analysisRecord?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
