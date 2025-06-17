"use client";

import { Button } from "@/app/components/ui/button";

interface PairFilterProps {
  stockCodeFilter: string;
  setStockCodeFilter: (value: string) => void;
  settlementStatusFilter: string;
  setSettlementStatusFilter: (value: string) => void;
  onClearFilters: () => void;
  showCompanyFilter?: boolean;
  companyFilter?: string;
  setCompanyFilter?: (value: string) => void;
  companies?: Array<{ id: number; name: string }>;
}

export function PairFilter({
  stockCodeFilter,
  setStockCodeFilter,
  settlementStatusFilter,
  setSettlementStatusFilter,
  onClearFilters,
  showCompanyFilter = false,
  companyFilter,
  setCompanyFilter,
  companies = [],
}: PairFilterProps) {
  const gridCols = showCompanyFilter ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className={`grid ${gridCols} gap-4`}>
        {/* 企業フィルター（全企業表示時のみ） */}
        {showCompanyFilter && companyFilter !== undefined && setCompanyFilter && (
          <div>
            <label htmlFor="company-filter" className="block text-sm font-medium mb-2">
              企業:
            </label>
            <select
              id="company-filter"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">全企業</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 証券コードフィルター */}
        <div>
          <label htmlFor="stock-code-filter" className="block text-sm font-medium mb-2">
            証券コード:
          </label>
          <input
            id="stock-code-filter"
            type="text"
            value={stockCodeFilter}
            onChange={(e) => setStockCodeFilter(e.target.value)}
            placeholder="例: 7203"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* 決済状態フィルター */}
        <div>
          <label htmlFor="settlement-filter" className="block text-sm font-medium mb-2">
            決済状態:
          </label>
          <select
            id="settlement-filter"
            value={settlementStatusFilter}
            onChange={(e) => setSettlementStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">全て</option>
            <option value="active">未決済のみ</option>
            <option value="settled">決済済みのみ</option>
          </select>
        </div>
      </div>
    </div>
  );
}
