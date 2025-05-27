"use client";

import { useState, useEffect } from "react";
import { CompanyList } from "@/app/components/company-list";
import { DuplicatePairsView } from "@/app/components/duplicate-pairs-view";

// 画面の種類を定義
type ViewType = 'companies' | 'duplicatePairs';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('companies');

  return (
    <div className="min-h-screen bg-background">
      {/* グローバルナビゲーションバー */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
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
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="container mx-auto py-4">
        {currentView === 'companies' ? (
          <CompanyListWrapper />
        ) : (
          <DuplicatePairsView onBack={() => setCurrentView('companies')} />
        )}
      </div>
    </div>
  );
}

// クライアントコンポーネントでデータを取得するためのラッパー
function CompanyListWrapper() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetch('/api/companies', { cache: 'no-store' });
        const companiesData = await data.json();
        
        // Prismaから取得したデータを適切な形式に変換
        const formattedCompanies = companiesData.map((company: any) => ({
          id: company.id,
          name: company.name,
          totalProfitLoss: company.totalProfitLoss, // 企業全体の損益を追加
          pairs: company.pairs ? company.pairs.map((pair: any) => ({
            id: pair.id,
            name: pair.name,
            link: pair.link || undefined, // nullの場合はundefinedに変換
            buyShares: pair.buyShares,
            sellShares: pair.sellShares,
            buyPrice: pair.buyPrice,
            sellPrice: pair.sellPrice,
            buyStockCode: pair.buyStockCode || undefined, // 証券コードを追加
            sellStockCode: pair.sellStockCode || undefined, // 証券コードを追加
            companyId: pair.companyId,
            currentBuyPrice: pair.currentBuyPrice, // 現在の買い価格を追加
            currentSellPrice: pair.currentSellPrice, // 現在の売り価格を追加
            profitLoss: pair.profitLoss // 損益情報を追加
          })) : []
        }));
        
        setCompanies(formattedCompanies);
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

  return <CompanyList initialCompanies={companies} />;
}
