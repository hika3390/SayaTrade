"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { PairTable } from "@/app/components/pair-table";
import { PairFilter } from "@/app/components/pair-filter";
import { AssetTable } from "@/app/components/asset-table";
import { AssetForm } from "@/app/components/asset-form";
import { PerformanceTab } from "@/app/components/performance-tab";
import { usePairFilter } from "@/app/hooks/use-pair-filter";
import { Company, Pair, Asset, AssetFormData } from "@/app/types";

interface CompanyDetailProps {
  company: Company;
  isLoading: boolean;
  onAddPair: () => void;
  onBackToCompanies: () => void;
  onEditPair: (pair: Pair) => void;
  onDeletePair: (id: number) => void;
  onSettlePair: (id: number) => void;
  onCalculateProfitLoss: (companyId: number) => void;
  onRefresh?: () => void;
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
  onRefresh,
}: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState<"pairs" | "assets" | "performance">("pairs");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetLoading, setAssetLoading] = useState(false);

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

  // 預かり資産の処理
  const handleAddAsset = async (data: AssetFormData) => {
    setAssetLoading(true);
    try {
      const response = await fetch(`/api/companies/${company.id}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '預かり資産の追加に失敗しました');
      }

      setShowAssetForm(false);
      onRefresh?.();
    } catch (error) {
      console.error('預かり資産の追加エラー:', error);
      alert(error instanceof Error ? error.message : '預かり資産の追加に失敗しました');
    } finally {
      setAssetLoading(false);
    }
  };

  const handleEditAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;
    
    setAssetLoading(true);
    try {
      const response = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '預かり資産の更新に失敗しました');
      }

      setEditingAsset(null);
      onRefresh?.();
    } catch (error) {
      console.error('預かり資産の更新エラー:', error);
      alert(error instanceof Error ? error.message : '預かり資産の更新に失敗しました');
    } finally {
      setAssetLoading(false);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (!confirm('この預かり資産を削除しますか？')) return;

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '預かり資産の削除に失敗しました');
      }

      onRefresh?.();
    } catch (error) {
      console.error('預かり資産の削除エラー:', error);
      alert(error instanceof Error ? error.message : '預かり資産の削除に失敗しました');
    }
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
            <Button variant="outline" onClick={onBackToCompanies}>
              企業一覧に戻る
            </Button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pairs")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pairs"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ペア取引
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "assets"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            預かり資産
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "performance"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            パフォーマンス
          </button>
        </div>
      </div>

      {/* ペア取引タブ */}
      {activeTab === "pairs" && (
        <div>
          {/* フィルターとボタン */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                フィルタークリア
              </Button>
              <Button onClick={onAddPair}>ペア情報を追加</Button>
            </div>
          </div>

          {/* フィルター */}
          {company.pairs.length > 0 && (
            <div className="mb-6">
              <PairFilter
                stockCodeFilter={stockCodeFilter}
                setStockCodeFilter={setStockCodeFilter}
                settlementStatusFilter={settlementStatusFilter}
                setSettlementStatusFilter={setSettlementStatusFilter}
                onClearFilters={clearFilters}
                showCompanyFilter={false}
              />
            </div>
          )}

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
      )}

      {/* 預かり資産タブ */}
      {activeTab === "assets" && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowAssetForm(true)}>
              預かり資産を追加
            </Button>
          </div>

          <AssetTable
            assets={company.assets || []}
            onEdit={(asset) => setEditingAsset(asset)}
            onDelete={handleDeleteAsset}
          />
        </div>
      )}

      {/* パフォーマンスタブ */}
      {activeTab === "performance" && (
        <PerformanceTab company={company} />
      )}

      {/* 預かり資産追加ダイアログ */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">預かり資産を追加</h2>
            <AssetForm
              onSubmit={handleAddAsset}
              onCancel={() => setShowAssetForm(false)}
              isLoading={assetLoading}
            />
          </div>
        </div>
      )}

      {/* 預かり資産編集ダイアログ */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">預かり資産を編集</h2>
            <AssetForm
              initialData={{
                name: editingAsset.name,
                type: editingAsset.type,
                amount: editingAsset.amount,
                unit: editingAsset.unit,
                description: editingAsset.description,
              }}
              onSubmit={handleEditAsset}
              onCancel={() => setEditingAsset(null)}
              isLoading={assetLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
