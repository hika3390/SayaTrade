"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";

interface Company {
  id: number;
  name: string;
}

interface Pair {
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
  company: Company;
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
}

interface DuplicatePairGroup {
  stockCodes: {
    buyStockCode: string;
    sellStockCode: string;
  };
  pairs: Pair[];
  totalProfitLoss: number;
}

interface DuplicatePairsViewProps {
  onBack?: () => void;
}

export function DuplicatePairsView({ onBack }: DuplicatePairsViewProps) {
  const [duplicatePairGroups, setDuplicatePairGroups] = useState<DuplicatePairGroup[]>([]);
  const [uniquePairs, setUniquePairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchDuplicatePairs();
  }, []);

  // 重複ペアデータを取得
  const fetchDuplicatePairs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/duplicate-pairs');
      
      if (!response.ok) {
        throw new Error('重複ペアの取得に失敗しました');
      }
      
      const data = await response.json();
      setDuplicatePairGroups(data.duplicatePairGroups || []);
      setUniquePairs(data.uniquePairs || []);
    } catch (error) {
      console.error('重複ペアの取得に失敗しました:', error);
      setError('重複ペアの取得に失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 合計損益を計算
  const calculateTotalProfitLoss = (): number => {
    let total = 0;
    
    // 重複ペアグループの損益を合計
    duplicatePairGroups.forEach(group => {
      total += group.totalProfitLoss;
    });
    
    // ユニークなペアの損益を合計
    uniquePairs.forEach(pair => {
      if (pair.profitLoss !== undefined) {
        total += pair.profitLoss;
      }
    });
    
    return total;
  };

  const totalProfitLoss = calculateTotalProfitLoss();

  return (
    <div className="container mx-auto py-8">
      {/* ヘッダー */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">重複ペア一覧</h1>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center py-8">
            <p>データを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button onClick={fetchDuplicatePairs} className="mt-4">
              再読み込み
            </Button>
          </div>
        ) : (
          <>
            {/* 合計損益 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">全体の損益</h2>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfitLoss.toLocaleString()} 円
              </p>
            </div>

            {/* 重複ペアグループ */}
            {duplicatePairGroups.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">重複ペアグループ</h2>
                <div className="space-y-6">
                  {duplicatePairGroups.map((group, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            証券コード: {group.stockCodes.buyStockCode} / {group.stockCodes.sellStockCode}
                          </h3>
                          <p className={`text-lg font-semibold ${group.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            グループ合計損益: {group.totalProfitLoss.toLocaleString()} 円
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          ペア数: {group.pairs.length}
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">企業</th>
                              <th className="border p-2 text-left">ペア名</th>
                              <th className="border p-2 text-right">買い株数</th>
                              <th className="border p-2 text-right">売り株数</th>
                              <th className="border p-2 text-right">買い単価</th>
                              <th className="border p-2 text-right">売り単価</th>
                              <th className="border p-2 text-right">現在買値</th>
                              <th className="border p-2 text-right">現在売値</th>
                              <th className="border p-2 text-right">損益</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.pairs.map((pair) => (
                              <tr key={pair.id}>
                                <td className="border p-2">{pair.company.name}</td>
                                <td className="border p-2">{pair.name}</td>
                                <td className="border p-2 text-right">{pair.buyShares}</td>
                                <td className="border p-2 text-right">{pair.sellShares}</td>
                                <td className="border p-2 text-right">{pair.buyPrice}</td>
                                <td className="border p-2 text-right">{pair.sellPrice}</td>
                                <td className="border p-2 text-right">{pair.currentBuyPrice?.toLocaleString() || "-"}</td>
                                <td className="border p-2 text-right">{pair.currentSellPrice?.toLocaleString() || "-"}</td>
                                <td className={`border p-2 text-right ${pair.profitLoss !== undefined ? (pair.profitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                                  {pair.profitLoss !== undefined ? `${pair.profitLoss.toLocaleString()} 円` : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ユニークなペア */}
            {uniquePairs.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">単一ペア</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">企業</th>
                        <th className="border p-2 text-left">ペア名</th>
                        <th className="border p-2 text-center">買い証券コード</th>
                        <th className="border p-2 text-center">売り証券コード</th>
                        <th className="border p-2 text-right">買い株数</th>
                        <th className="border p-2 text-right">売り株数</th>
                        <th className="border p-2 text-right">買い単価</th>
                        <th className="border p-2 text-right">売り単価</th>
                        <th className="border p-2 text-right">現在買値</th>
                        <th className="border p-2 text-right">現在売値</th>
                        <th className="border p-2 text-right">損益</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniquePairs.map((pair) => (
                        <tr key={pair.id}>
                          <td className="border p-2">{pair.company.name}</td>
                          <td className="border p-2">{pair.name}</td>
                          <td className="border p-2 text-center">{pair.buyStockCode || "-"}</td>
                          <td className="border p-2 text-center">{pair.sellStockCode || "-"}</td>
                          <td className="border p-2 text-right">{pair.buyShares}</td>
                          <td className="border p-2 text-right">{pair.sellShares}</td>
                          <td className="border p-2 text-right">{pair.buyPrice}</td>
                          <td className="border p-2 text-right">{pair.sellPrice}</td>
                          <td className="border p-2 text-right">{pair.currentBuyPrice?.toLocaleString() || "-"}</td>
                          <td className="border p-2 text-right">{pair.currentSellPrice?.toLocaleString() || "-"}</td>
                          <td className={`border p-2 text-right ${pair.profitLoss !== undefined ? (pair.profitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                            {pair.profitLoss !== undefined ? `${pair.profitLoss.toLocaleString()} 円` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {duplicatePairGroups.length === 0 && uniquePairs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>証券コードが入力されているペアがありません。</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 再読み込みボタン */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={fetchDuplicatePairs}
          disabled={isLoading}
        >
          {isLoading ? "読み込み中..." : "データを更新"}
        </Button>
      </div>
    </div>
  );
}
