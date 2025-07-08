"use client";

import { Company } from "@/app/types";

interface PerformanceTabProps {
  company: Company;
}

export function PerformanceTab({ company }: PerformanceTabProps) {
  // 預かり資産の合計（円建て）を計算
  const calculateTotalAssets = () => {
    if (!company.assets) return 0;
    return company.assets
      .filter(asset => asset.unit === '円')
      .reduce((total, asset) => total + asset.amount, 0);
  };

  // 確定損益を計算（決済済みペアの損益合計）
  const calculateRealizedProfitLoss = () => {
    if (!company.pairs) return 0;
    return company.pairs
      .filter(pair => pair.isSettled)
      .reduce((total, pair) => {
        // 決済済みペアのprofitLossフィールドを使用
        return total + (pair.profitLoss || 0);
      }, 0);
  };

  // 含み損益を計算（未決済ペアの含み損益合計）
  const calculateUnrealizedProfitLoss = () => {
    if (!company.pairs) return 0;
    return company.pairs
      .filter(pair => !pair.isSettled)
      .reduce((total, pair) => {
        return total + (pair.profitLoss || 0);
      }, 0);
  };

  const totalAssets = calculateTotalAssets();
  const realizedProfitLoss = calculateRealizedProfitLoss();
  const unrealizedProfitLoss = calculateUnrealizedProfitLoss();
  const currentAssets = totalAssets + realizedProfitLoss + unrealizedProfitLoss;

  // 月間パフォーマンス（仮の計算 - 実際には前月末データが必要）
  const monthlyPerformance = unrealizedProfitLoss; // 仮の値
  const monthlyPerformanceRate = totalAssets > 0 ? (monthlyPerformance / totalAssets) * 100 : 0;

  // トータルパフォーマンス
  const totalPerformance = realizedProfitLoss + unrealizedProfitLoss;
  const totalPerformanceRate = totalAssets > 0 ? (totalPerformance / totalAssets) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 現在資産 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">現在資産</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">受託金額</div>
            <div className="text-lg font-semibold text-blue-600">
              {totalAssets.toLocaleString()} 円
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">確定損益</div>
            <div className={`text-lg font-semibold ${realizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {realizedProfitLoss.toLocaleString()} 円
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">含み損益</div>
            <div className={`text-lg font-semibold ${unrealizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {unrealizedProfitLoss.toLocaleString()} 円
            </div>
          </div>
          <div className="text-center border-l-2 border-blue-300 pl-4">
            <div className="text-sm text-gray-600 mb-1">現在資産合計</div>
            <div className={`text-xl font-bold ${currentAssets >= totalAssets ? 'text-green-600' : 'text-red-600'}`}>
              {currentAssets.toLocaleString()} 円
            </div>
          </div>
        </div>
      </div>

      {/* 月間パフォーマンス */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-800">月間パフォーマンス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">今月の損益</div>
            <div className={`text-2xl font-bold ${monthlyPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyPerformance.toLocaleString()} 円
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">月間収益率</div>
            <div className={`text-2xl font-bold ${monthlyPerformanceRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyPerformanceRate.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          ※ 月間パフォーマンスは前月末の現在資産からの変動を表示します（現在は含み損益を表示）
        </div>
      </div>

      {/* トータルパフォーマンス */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-800">トータルパフォーマンス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">累計損益</div>
            <div className={`text-2xl font-bold ${totalPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPerformance.toLocaleString()} 円
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">累計収益率</div>
            <div className={`text-2xl font-bold ${totalPerformanceRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPerformanceRate.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          ※ トータルパフォーマンスは運用開始からの累計成績を表示します
        </div>
      </div>

      {/* パフォーマンス詳細 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">パフォーマンス詳細</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">アクティブペア数</div>
            <div className="text-lg font-semibold text-blue-600">
              {company.pairs?.filter(pair => !pair.isSettled).length || 0} 件
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">決済済みペア数</div>
            <div className="text-lg font-semibold text-green-600">
              {company.pairs?.filter(pair => pair.isSettled).length || 0} 件
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">預かり資産種類</div>
            <div className="text-lg font-semibold text-purple-600">
              {company.assets?.length || 0} 種類
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
