"use client";

import { useState, useEffect } from "react";
import { CompanyList } from "@/app/components/company-list";
import { DuplicatePairsView } from "@/app/components/duplicate-pairs-view";
import { TradingHistory } from "@/app/components/trading-history";
import { CompaniesResponse } from "@/app/types";

// 画面の種類を定義
type ViewType = 'companies' | 'duplicatePairs' | 'tradingHistory';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('companies');

  return (
    <div className="min-h-screen bg-background">
      {/* グローバルナビゲーションバー */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="px-4 mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">サヤ取り分配くん</div>
          <div className="flex gap-4">
            <button 
              className={`px-3 py-1 rounded ${currentView === 'companies' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setCurrentView('companies')}
            >
              企業一覧
            </button>
            <button 
              className={`px-3 py-1 rounded ${currentView === 'duplicatePairs' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setCurrentView('duplicatePairs')}
            >
              重複ペア一覧
            </button>
            <button 
              className={`px-3 py-1 rounded ${currentView === 'tradingHistory' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setCurrentView('tradingHistory')}
            >
              取引履歴
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="mx-auto p-4">
        {currentView === 'companies' ? (
          <CompanyListWrapper />
        ) : currentView === 'duplicatePairs' ? (
          <DuplicatePairsView onBack={() => setCurrentView('companies')} />
        ) : (
          <TradingHistory onBack={() => setCurrentView('companies')} />
        )}
      </div>
    </div>
  );
}

// クライアントコンポーネントでデータを取得するためのラッパー
function CompanyListWrapper() {
  const [companiesData, setCompaniesData] = useState<CompaniesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/companies?page=1&limit=5', { cache: 'no-store' });
        const data: CompaniesResponse = await response.json();
        
        // Prismaから取得したデータを適切な形式に変換
        const formattedData: CompaniesResponse = {
          companies: data.companies.map((company: any) => ({
            id: company.id,
            name: company.name,
            totalProfitLoss: company.totalProfitLoss, // 企業全体の損益を追加
            pairs: company.pairs ? company.pairs.map((pair: any) => ({
              id: pair.id,
              name: pair.name,
              link: pair.link || undefined, // nullの場合はundefinedに変換
              analysisRecord: pair.analysisRecord || undefined, // nullの場合はundefinedに変換
              buyShares: pair.buyShares,
              sellShares: pair.sellShares,
              buyPrice: pair.buyPrice,
              sellPrice: pair.sellPrice,
              buyStockCode: pair.buyStockCode || undefined, // 証券コードを追加
              sellStockCode: pair.sellStockCode || undefined, // 証券コードを追加
              companyId: pair.companyId,
              currentBuyPrice: pair.currentBuyPrice, // 現在の買い価格を追加
              currentSellPrice: pair.currentSellPrice, // 現在の売り価格を追加
              profitLoss: pair.profitLoss, // 損益情報を追加
              buyProfitLoss: pair.buyProfitLoss, // 買いの損益情報を追加
              sellProfitLoss: pair.sellProfitLoss, // 売りの損益情報を追加
              isSettled: pair.isSettled || false, // 決済状態を追加
              settledAt: pair.settledAt || undefined // 決済日時を追加
            })) : []
          })),
          pagination: data.pagination
        };
        
        setCompaniesData(formattedData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">データを読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">エラー: {error}</div>;
  }

  if (!companiesData) {
    return <div className="container mx-auto py-8 text-center text-red-500">データの取得に失敗しました</div>;
  }

  return <CompanyList initialData={companiesData} />;
}
