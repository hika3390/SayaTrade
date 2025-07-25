"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthModal } from "@/app/components/auth/auth-modal";
import { UserMenu } from "./user-menu";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";
import { ViewType, navigationItems } from "./navigation-items";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
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
          
          <div className="flex items-center space-x-4">
            {/* デスクトップナビゲーション */}
            <DesktopNav
              navigationItems={navigationItems}
              currentView={currentView}
              onNavigation={handleNavigation}
            />

            {/* 認証ボタン・ユーザーメニュー */}
            <div className="hidden md:flex items-center space-x-2">
              <UserMenu onAuthModalOpen={handleAuthModalOpen} />
            </div>
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
        <MobileMenu
          isOpen={isMobileMenuOpen}
          navigationItems={navigationItems}
          currentView={currentView}
          onNavigation={handleNavigation}
          onAuthModalOpen={handleAuthModalOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* 認証モーダル */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </nav>
  );
}
