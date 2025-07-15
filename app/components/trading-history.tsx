"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { PairFilter } from "@/app/components/pair-filter";
import { usePairFilter } from "@/app/hooks/use-pair-filter";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { Company, Pair } from "@/app/types";

interface TradingHistoryProps {
  onBack: () => void;
}

export function TradingHistory({ onBack }: TradingHistoryProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  const fetchAllCompanies = async () => {
    try {
      setIsLoading(true);
      // 全企業のデータを取得（ページネーションなしで全件取得）
      const response = await fetch('/api/companies?page=1&limit=1000', { cache: 'no-store' });
      const data = await response.json();
      
      const formattedCompanies: Company[] = data.companies.map((company: any) => ({
        id: company.id,
        name: company.name,
        totalProfitLoss: company.totalProfitLoss,
        pairs: company.pairs ? company.pairs.map((pair: any) => ({
          id: pair.id,
          name: pair.name,
          link: pair.link || undefined,
          analysisRecord: pair.analysisRecord || undefined,
          buyShares: pair.buyShares,
          sellShares: pair.sellShares,
          buyPrice: pair.buyPrice,
          sellPrice: pair.sellPrice,
          buyStockCode: pair.buyStockCode || undefined,
          sellStockCode: pair.sellStockCode || undefined,
          companyId: pair.companyId,
          currentBuyPrice: pair.currentBuyPrice,
          currentSellPrice: pair.currentSellPrice,
          profitLoss: pair.profitLoss,
          buyProfitLoss: pair.buyProfitLoss,
          sellProfitLoss: pair.sellProfitLoss,
          entryDate: pair.entryDate || undefined,
          isSettled: pair.isSettled || false,
          settledAt: pair.settledAt || undefined
        })) : []
      }));
      
      setCompanies(formattedCompanies);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 全ペアを取得
  const allPairs = companies.flatMap(company => 
    company.pairs.map(pair => ({
      ...pair,
      companyName: company.name
    }))
  );

  // フィルターフックを使用
  const {
    stockCodeFilter,
    setStockCodeFilter,
    settlementStatusFilter,
    setSettlementStatusFilter,
    companyFilter,
    setCompanyFilter,
    filteredPairs,
    clearFilters,
  } = usePairFilter({ pairs: allPairs, showCompanyFilter: true });

  // 未決済と決済済みに分離（型を明示的にキャスト）
  const activePairs = filteredPairs.filter(pair => !pair.isSettled) as (Pair & { companyName: string })[];
  const settledPairs = filteredPairs.filter(pair => pair.isSettled) as (Pair & { companyName: string })[];

  // 統計情報の計算
  const totalActivePairs = activePairs.length;
  const totalSettledPairs = settledPairs.length;
  const totalProfitLoss = settledPairs.reduce((sum, pair) => sum + (pair.profitLoss || 0), 0);
  const unrealizedProfitLoss = activePairs.reduce((sum, pair) => sum + (pair.profitLoss || 0), 0);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner 
          size="lg" 
          message="取引履歴を読み込み中..." 
          className="py-16"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-center text-red-500">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4">
      {/* ヘッダー */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">全企業取引履歴</h1>
              <p className="text-muted-foreground">
                全企業の取引ペアを一覧で確認し、フィルタリングできます
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>フィルタークリア</span>
            </Button>
          </div>
        </div>
        
        {/* フィルター */}
        {allPairs.length > 0 && (
          <div className="mb-4">
            <PairFilter
              stockCodeFilter={stockCodeFilter}
              setStockCodeFilter={setStockCodeFilter}
              settlementStatusFilter={settlementStatusFilter}
              setSettlementStatusFilter={setSettlementStatusFilter}
              onClearFilters={clearFilters}
              showCompanyFilter={true}
              companyFilter={companyFilter}
              setCompanyFilter={setCompanyFilter}
              companies={companies}
            />
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded border">
            <div className="text-lg font-semibold text-blue-600">{totalActivePairs}</div>
            <div className="text-sm text-gray-600">未決済ペア</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-lg font-semibold text-green-600">{totalSettledPairs}</div>
            <div className="text-sm text-gray-600">決済済みペア</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className={`text-lg font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfitLoss.toLocaleString()} 円
            </div>
            <div className="text-sm text-gray-600">確定損益</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className={`text-lg font-semibold ${unrealizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {unrealizedProfitLoss.toLocaleString()} 円
            </div>
            <div className="text-sm text-gray-600">含み損益</div>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="space-y-8">
        {/* 未決済ペア */}
        {activePairs.length > 0 && (
          <div>
            <EnhancedPairTable
              pairs={activePairs}
              title="未決済ペア"
              isSettled={false}
              showCompanyName={companyFilter === 'all'}
            />
          </div>
        )}

        {/* 決済済みペア */}
        {settledPairs.length > 0 && (
          <div>
            <EnhancedPairTable
              pairs={settledPairs}
              title="決済済みペア"
              isSettled={true}
              showCompanyName={companyFilter === 'all'}
            />
          </div>
        )}

        {/* データがない場合 */}
        {activePairs.length === 0 && settledPairs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filteredPairs.length === 0 && allPairs.length > 0
              ? 'フィルター条件に一致する取引履歴がありません'
              : companyFilter === 'all' 
                ? '取引履歴がありません' 
                : '選択した企業の取引履歴がありません'
            }
          </div>
        )}
      </div>
    </div>
  );
}

// 企業名を含む拡張されたペアテーブル
interface EnhancedPairTableProps {
  pairs: (Pair & { companyName: string })[];
  title: string;
  isSettled: boolean;
  showCompanyName: boolean;
}

function EnhancedPairTable({ pairs, title, isSettled, showCompanyName }: EnhancedPairTableProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title} ({pairs.length}件)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={isSettled ? "bg-gray-50" : "bg-gray-100"}>
              {showCompanyName && (
                <th className="border p-2 text-left">企業名</th>
              )}
              <th className="border p-2 text-left">ペア名</th>
              <th className="border p-2 text-left">リンク</th>
              <th className="border p-2 text-left">分析記録</th>
              <th className="border p-2 text-center">エントリー日</th>
              <th className="border p-2 text-right">買い株数</th>
              <th className="border p-2 text-right">売り株数</th>
              <th className="border p-2 text-right">買い単価</th>
              <th className="border p-2 text-right">売り単価</th>
              <th className="border p-2 text-center">買い証券コード</th>
              <th className="border p-2 text-center">売り証券コード</th>
              <th className="border p-2 text-right">現在買値</th>
              <th className="border p-2 text-right">現在売値</th>
              <th className="border p-2 text-right">買い損益</th>
              <th className="border p-2 text-right">売り損益</th>
              <th className="border p-2 text-right">損益</th>
              <th className="border p-2 text-center">
                {isSettled ? "決済日時" : "状態"}
              </th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.id} className={isSettled ? "bg-gray-50" : ""}>
                {showCompanyName && (
                  <td className="border p-2 font-medium">{pair.companyName}</td>
                )}
                <td className="border p-2">{pair.name}</td>
                <td className="border p-2">
                  {pair.link ? (
                    <a
                      href={pair.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      リンク
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border p-2">
                  {pair.analysisRecord ? (
                    <a
                      href={pair.analysisRecord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      分析記録
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border p-2 text-center">
                  {pair.entryDate ? new Date(pair.entryDate).toLocaleDateString('ja-JP') : "-"}
                </td>
                <td className="border p-2 text-right">{pair.buyShares}</td>
                <td className="border p-2 text-right">{pair.sellShares}</td>
                <td className="border p-2 text-right">{pair.buyPrice}</td>
                <td className="border p-2 text-right">{pair.sellPrice}</td>
                <td className="border p-2 text-center">{pair.buyStockCode || "-"}</td>
                <td className="border p-2 text-center">{pair.sellStockCode || "-"}</td>
                <td className="border p-2 text-right">{pair.currentBuyPrice?.toLocaleString() || "-"}</td>
                <td className="border p-2 text-right">{pair.currentSellPrice?.toLocaleString() || "-"}</td>
                <td className={`border p-2 text-right ${pair.buyProfitLoss !== undefined ? (pair.buyProfitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                  {pair.buyProfitLoss !== undefined && pair.buyProfitLoss !== null ? `${pair.buyProfitLoss?.toLocaleString()} 円` : "-"}
                </td>
                <td className={`border p-2 text-right ${pair.sellProfitLoss !== undefined ? (pair.sellProfitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                  {pair.sellProfitLoss !== undefined && pair.sellProfitLoss !== null ? `${pair.sellProfitLoss?.toLocaleString()} 円` : "-"}
                </td>
                <td className={`border p-2 text-right ${pair.profitLoss !== undefined ? (pair.profitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                  {pair.profitLoss !== undefined && pair.profitLoss !== null ? `${pair.profitLoss?.toLocaleString()} 円` : "-"}
                </td>
                <td className="border p-2 text-center">
                  {isSettled ? (
                    <div className="text-sm">
                      {pair.settledAt ? new Date(pair.settledAt).toLocaleString('ja-JP') : "-"}
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      未決済
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
