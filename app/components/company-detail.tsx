"use client";

import { Button } from "@/app/components/ui/button";
import { PairTable } from "@/app/components/pair-table";
import { PairFilter } from "@/app/components/pair-filter";
import { usePairFilter } from "@/app/hooks/use-pair-filter";
import { Company, Pair } from "@/app/types";

interface CompanyDetailProps {
  company: Company;
  isLoading: boolean;
  onAddPair: () => void;
  onBackToCompanies: () => void;
  onEditPair: (pair: Pair) => void;
  onDeletePair: (id: number) => void;
  onSettlePair: (id: number) => void;
  onCalculateProfitLoss: (companyId: number) => void;
}

export function CompanyDetail({
  company,
  isLoading,
  onAddPair,
  onBackToCompanies,
  onEditPair,
  onDeletePair,
  onSettlePair,
  onCalculateProfitLoss,
}: CompanyDetailProps) {
  // フィルターフックを使用
  const {
    stockCodeFilter,
    setStockCodeFilter,
    settlementStatusFilter,
    setSettlementStatusFilter,
    filteredPairs,
    clearFilters,
  } = usePairFilter({ pairs: company.pairs, showCompanyFilter: false });

  const activePairs = filteredPairs.filter(pair => !pair.isSettled);
  const settledPairs = filteredPairs.filter(pair => pair.isSettled);

  // 未決済ペアの含み損益を計算
  const calculateUnrealizedProfitLoss = () => {
    let totalBuyProfitLoss = 0;
    let totalSellProfitLoss = 0;
    let totalProfitLoss = 0;
    let hasData = false;

    activePairs.forEach(pair => {
      if (pair.buyProfitLoss !== undefined && pair.buyProfitLoss !== null) {
        totalBuyProfitLoss += pair.buyProfitLoss;
        hasData = true;
      }
      if (pair.sellProfitLoss !== undefined && pair.sellProfitLoss !== null) {
        totalSellProfitLoss += pair.sellProfitLoss;
        hasData = true;
      }
      if (pair.profitLoss !== undefined && pair.profitLoss !== null) {
        totalProfitLoss += pair.profitLoss;
        hasData = true;
      }
    });

    return hasData ? {
      totalBuyProfitLoss,
      totalSellProfitLoss,
      totalProfitLoss
    } : null;
  };

  const unrealizedProfitLoss = calculateUnrealizedProfitLoss();

  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">企業詳細: {company.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              フィルタークリア
            </Button>
            <Button onClick={onAddPair}>ペア情報を追加</Button>
            <Button variant="outline" onClick={onBackToCompanies}>
              企業一覧に戻る
            </Button>
          </div>
        </div>

        {/* フィルター */}
        {company.pairs.length > 0 && (
          <PairFilter
            stockCodeFilter={stockCodeFilter}
            setStockCodeFilter={setStockCodeFilter}
            settlementStatusFilter={settlementStatusFilter}
            setSettlementStatusFilter={setSettlementStatusFilter}
            onClearFilters={clearFilters}
            showCompanyFilter={false}
          />
        )}
      </div>

      {/* メインコンテンツ */}
      {company.pairs.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          ペア情報が登録されていません。「ペア情報を追加」ボタンからペア情報を登録してください。
        </p>
      ) : filteredPairs.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          フィルター条件に一致するペアがありません。
        </p>
      ) : (
        <div className="space-y-8">
          {/* 未決済ペアテーブル */}
          {activePairs.length > 0 && (
            <div>
              {/* 未決済ペアの含み損益サマリー */}
              {unrealizedProfitLoss && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">含み損益サマリー</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">買いポジション含み損益</div>
                      <div className={`text-lg font-semibold ${unrealizedProfitLoss.totalBuyProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {unrealizedProfitLoss.totalBuyProfitLoss.toLocaleString()} 円
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">売りポジション含み損益</div>
                      <div className={`text-lg font-semibold ${unrealizedProfitLoss.totalSellProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {unrealizedProfitLoss.totalSellProfitLoss.toLocaleString()} 円
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">合計含み損益</div>
                      <div className={`text-xl font-bold ${unrealizedProfitLoss.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {unrealizedProfitLoss.totalProfitLoss.toLocaleString()} 円
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <PairTable
                pairs={activePairs}
                title="未決済ペア"
                isSettled={false}
                onEdit={onEditPair}
                onDelete={onDeletePair}
                onSettle={onSettlePair}
              />
              {/* 損益計算ボタン */}
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => onCalculateProfitLoss(company.id)}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? "更新中..." : "損益データを更新"}
                </Button>
              </div>
            </div>
          )}

          {/* 決済済みペアテーブル */}
          {settledPairs.length > 0 && (
            <PairTable
              pairs={settledPairs}
              title="決済済みペア"
              isSettled={true}
              onEdit={onEditPair}
              onDelete={onDeletePair}
            />
          )}
        </div>
      )}
    </div>
  );
}
