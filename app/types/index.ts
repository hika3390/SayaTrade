export interface Pair {
  id: number;
  name: string;
  link?: string;
  analysisRecord?: string;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  buyStockCode?: string;
  sellStockCode?: string;
  companyId: number;
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
  buyProfitLoss?: number;
  sellProfitLoss?: number;
  isSettled?: boolean;
  settledAt?: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  amount: number;
  unit: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
}

export interface Company {
  id: number;
  name: string;
  pairs: Pair[];
  assets?: Asset[];
  totalProfitLoss?: number;
}

export interface PairFormData {
  name: string;
  link?: string;
  analysisRecord?: string;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  buyStockCode?: string;
  sellStockCode?: string;
}

export interface AssetFormData {
  name: string;
  type: string;
  amount: number;
  unit: string;
  description?: string;
}

export interface CompanyFormData {
  name: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CompaniesResponse {
  companies: Company[];
  pagination: PaginationInfo;
}
