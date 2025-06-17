"use client";

import { useState } from "react";
import { Pair } from "@/app/types";

interface UsePairFilterProps {
  pairs: Pair[];
  showCompanyFilter?: boolean;
}

export function usePairFilter({ pairs, showCompanyFilter = false }: UsePairFilterProps) {
  const [stockCodeFilter, setStockCodeFilter] = useState<string>('');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // フィルタリング処理
  const filteredPairs = pairs.filter(pair => {
    // 企業フィルター（全企業表示時のみ）
    if (showCompanyFilter && companyFilter !== 'all') {
      if (pair.companyId.toString() !== companyFilter) {
        return false;
      }
    }

    // 証券コードフィルター
    if (stockCodeFilter) {
      const hasMatchingCode = 
        (pair.buyStockCode && pair.buyStockCode.includes(stockCodeFilter)) ||
        (pair.sellStockCode && pair.sellStockCode.includes(stockCodeFilter));
      if (!hasMatchingCode) {
        return false;
      }
    }

    // 決済状態フィルター
    if (settlementStatusFilter === 'active' && pair.isSettled) {
      return false;
    }
    if (settlementStatusFilter === 'settled' && !pair.isSettled) {
      return false;
    }

    return true;
  });

  // フィルタークリア関数
  const clearFilters = () => {
    setStockCodeFilter('');
    setSettlementStatusFilter('all');
    if (showCompanyFilter) {
      setCompanyFilter('all');
    }
  };

  return {
    // フィルター状態
    stockCodeFilter,
    setStockCodeFilter,
    settlementStatusFilter,
    setSettlementStatusFilter,
    companyFilter,
    setCompanyFilter,
    
    // フィルタリング結果
    filteredPairs,
    
    // ユーティリティ関数
    clearFilters,
  };
}
