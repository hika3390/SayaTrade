"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// 画面の種類を定義
type ViewType = 'dashboard' | 'companies' | 'duplicatePairs' | 'tradingHistory';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 現在のパスから現在のビューを判定
  const getCurrentView = (): ViewType => {
    if (pathname === '/') return 'dashboard';
    if (pathname.includes('/duplicate-pairs')) return 'duplicatePairs';
    if (pathname.includes('/trading-history')) return 'tradingHistory';
    if (pathname.includes('/companies')) return 'companies';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const navigationItems = [
    {
      key: 'dashboard' as ViewType,
      label: 'ダッシュボード',
      path: '/',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      key: 'companies' as ViewType,
      label: '企業一覧',
      path: '/companies',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      key: 'duplicatePairs' as ViewType,
      label: '重複ペア一覧',
      path: '/duplicate-pairs',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'tradingHistory' as ViewType,
      label: '取引履歴',
      path: '/trading-history',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
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
                onClick={() => handleNavigation(item.path)}
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
                  onClick={() => handleNavigation(item.path)}
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
  );
}
