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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      key: 'companies' as ViewType,
      label: '企業一覧',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      key: 'duplicatePairs' as ViewType,
      label: '重複ペア一覧',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'tradingHistory' as ViewType,
      label: '取引履歴',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const handleNavigation = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* グローバルナビゲーションバー */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="w-full px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">S</span>
                </div>
                <h1 className="text-xl font-bold text-foreground">サヤ取り分配くん</h1>
              </div>
            </div>
            
            {/* デスクトップナビゲーション */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button 
                  key={item.key}
                  className={`nav-item ${currentView === item.key ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavigation(item.key)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* モバイルハンバーガーメニューボタン */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニューを開く"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* モバイルメニュー */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-card/95 backdrop-blur">
              <div className="py-2 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.key}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                      currentView === item.key ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-foreground'
                    }`}
                    onClick={() => handleNavigation(item.key)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="w-full px-4 py-6">
        {currentView === 'companies' ? (
          <CompanyListWrapper />
        ) : currentView === 'duplicatePairs' ? (
          <DuplicatePairsView onBack={() => setCurrentView('companies')} />
        ) : (
          <TradingHistory onBack={() => setCurrentView('companies')} />
        )}
      </main>
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
              entryDate: pair.entryDate || undefined, // エントリー日を追加
              isSettled: pair.isSettled || false, // 決済状態を追加
              settledAt: pair.settledAt || undefined // 決済日時を追加
            })) : [],
            assets: company.assets ? company.assets.map((asset: any) => ({
              id: asset.id,
              name: asset.name,
              type: asset.type,
              amount: asset.amount,
              unit: asset.unit,
              description: asset.description || undefined,
              createdAt: asset.createdAt,
              updatedAt: asset.updatedAt,
              companyId: asset.companyId
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
