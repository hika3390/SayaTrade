"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  totalCompanies: number;
  totalPairs: number;
  totalActivePairs: number;
  totalSettledPairs: number;
  totalProfitLoss: number;
  monthlyPerformance: number;
  totalAssets: number;
}

interface RecentPair {
  id: number;
  name: string;
  companyName: string;
  profitLoss?: number;
  entryDate?: string;
  isSettled: boolean;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPairs, setRecentPairs] = useState<RecentPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 統計データを取得
      const companiesRes = await fetch('/api/companies?page=1&limit=1000'); // 全企業データを取得

      if (!companiesRes.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const companiesData = await companiesRes.json();

      // 統計データを計算
      const companies = companiesData.companies || [];
      const allPairs = companies.flatMap((company: any) => 
        (company.pairs || []).map((pair: any) => ({
          ...pair,
          companyName: company.name
        }))
      );

      const activePairs = allPairs.filter((pair: any) => !pair.isSettled);
      const settledPairs = allPairs.filter((pair: any) => pair.isSettled);
      
      // 全体の損益を計算
      const totalProfitLoss = companies.reduce((total: number, company: any) => {
        return total + (company.totalProfitLoss || 0);
      }, 0);

      // 月間パフォーマンスを計算（今月決済されたペアの損益合計）
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthlyPerformance = allPairs
        .filter((pair: any) => {
          if (!pair.isSettled || !pair.settledAt) return false;
          const settledDate = new Date(pair.settledAt);
          return settledDate >= monthStart && settledDate <= currentMonth;
        })
        .reduce((total: number, pair: any) => total + (pair.profitLoss || 0), 0);

      // トータル資産を計算（全企業の預かり資産合計）
      const totalAssets = companies.reduce((total: number, company: any) => {
        const companyAssets = (company.assets || []).reduce((companyTotal: number, asset: any) => {
          return companyTotal + (asset.amount || 0);
        }, 0);
        return total + companyAssets;
      }, 0);

      const dashboardStats: DashboardStats = {
        totalCompanies: companies.length,
        totalPairs: allPairs.length,
        totalActivePairs: activePairs.length,
        totalSettledPairs: settledPairs.length,
        totalProfitLoss,
        monthlyPerformance,
        totalAssets
      };

      // 最近のペア（エントリー日順）
      const recentPairsData = allPairs
        .filter((pair: any) => pair.entryDate)
        .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
        .slice(0, 5)
        .map((pair: any) => ({
          id: pair.id,
          name: pair.name,
          companyName: pair.companyName,
          profitLoss: pair.profitLoss,
          entryDate: pair.entryDate,
          isSettled: pair.isSettled || false
        }));

      setStats(dashboardStats);
      setRecentPairs(recentPairsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message="ダッシュボードデータを読み込み中..." 
        className="py-16"
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>エラー: {error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          再読み込み
        </Button>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">データがありません</div>;
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground">
              サヤ取り分配くんの概要情報
            </p>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">企業数</p>
              <p className="text-2xl font-bold">{stats.totalCompanies}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">総ペア数</p>
              <p className="text-2xl font-bold">{stats.totalPairs}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">アクティブペア</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalActivePairs}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">決済済みペア</p>
              <p className="text-2xl font-bold text-gray-600">{stats.totalSettledPairs}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 損益サマリー */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">損益サマリー</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">全体の損益</p>
            <p className={`text-3xl font-bold ${stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalProfitLoss.toLocaleString()} 円
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">月間パフォーマンス</p>
            <p className={`text-2xl font-bold ${stats.monthlyPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyPerformance.toLocaleString()} 円
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">トータル資産</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalAssets.toLocaleString()} 円
            </p>
            <p className="text-xs text-gray-400 mt-1">預かり資産合計</p>
          </div>
        </div>
      </div>

      {/* 最近のペア */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近のペア</h2>
          <Link href="/companies">
            <Button variant="outline" size="sm">
              すべて見る
            </Button>
          </Link>
        </div>
        {recentPairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ペア名</th>
                  <th className="text-left py-2">企業</th>
                  <th className="text-center py-2">エントリー日</th>
                  <th className="text-center py-2">状態</th>
                  <th className="text-right py-2">損益</th>
                </tr>
              </thead>
              <tbody>
                {recentPairs.map((pair) => (
                  <tr key={pair.id} className="border-b">
                    <td className="py-2">{pair.name}</td>
                    <td className="py-2">{pair.companyName}</td>
                    <td className="py-2 text-center">
                      {pair.entryDate ? new Date(pair.entryDate).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pair.isSettled 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {pair.isSettled ? '決済済み' : 'アクティブ'}
                      </span>
                    </td>
                    <td className={`py-2 text-right font-medium ${
                      pair.profitLoss !== undefined && pair.profitLoss !== null
                        ? pair.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        : 'text-gray-400'
                    }`}>
                      {pair.profitLoss !== undefined && pair.profitLoss !== null 
                        ? `${pair.profitLoss.toLocaleString()} 円` 
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">最近のペアがありません</p>
        )}
      </div>

      {/* クイックアクション */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/companies">
            <Button className="w-full h-12 flex items-center justify-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>企業管理</span>
            </Button>
          </Link>
          <Link href="/duplicate-pairs">
            <Button variant="outline" className="w-full h-12 flex items-center justify-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>重複ペア</span>
            </Button>
          </Link>
          <Link href="/trading-history">
            <Button variant="outline" className="w-full h-12 flex items-center justify-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>取引履歴</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
