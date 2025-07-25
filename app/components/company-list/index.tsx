"use client";

import { useState, useEffect } from "react";
import { CompanyForm } from "@/app/components/company-form";
import { PairForm } from "@/app/components/pair-form";
import { SettledPairForm } from "@/app/components/settled-pair-form";
import { CompanyDetail } from "@/app/components/company-detail";
import { CompanyListView } from "./company-list-view";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { Company, Pair, PairFormData, CompanyFormData, CompaniesResponse, PaginationInfo } from "@/app/types";

interface CompanyListProps {
  initialData?: CompaniesResponse;
}

export function CompanyList({ initialData }: CompanyListProps) {
  const [companies, setCompanies] = useState<Company[]>(initialData?.companies || []);
  const [pagination, setPagination] = useState<PaginationInfo>(initialData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5,
    hasNext: false,
    hasPrev: false
  });
  const [isInitialLoading, setIsInitialLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isAddPairOpen, setIsAddPairOpen] = useState(false);
  const [isEditPairOpen, setIsEditPairOpen] = useState(false);
  const [isEditSettledPairOpen, setIsEditSettledPairOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 企業一覧を取得する関数
  const fetchCompanies = async (page: number = 1, limit: number = 5, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
        setError(null);
      }
      
      const cacheOption = isInitial ? { cache: 'no-store' as RequestCache } : {};
      const response = await fetch(`/api/companies?page=${page}&limit=${limit}`, cacheOption);
      
      if (!response.ok) {
        throw new Error("企業一覧の取得に失敗しました");
      }
      
      const data: CompaniesResponse = await response.json();
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (err: unknown) {
      if (isInitial) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } else {
        console.error("企業一覧の取得に失敗しました:", err);
      }
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  // 初期データがない場合のみ、データを取得
  useEffect(() => {
    if (!initialData) {
      fetchCompanies(1, 5, true);
    }
  }, [initialData]);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    fetchCompanies(page, pagination.limit);
  };

  // 全企業の損益計算APIを呼び出す関数
  const fetchAllProfitLossData = async () => {
    // 処理が重たくなる旨の確認アラート
    if (!confirm("全体の損益計算を実行します。\n\n株価データの取得により処理に時間がかかる場合があります。\n実行してもよろしいですか？")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/calculate-profit-loss');
      
      if (!response.ok) {
        throw new Error('損益計算に失敗しました');
      }
      
      const data = await response.json();
      
      // 企業データを更新
      if (data.companies && data.companies.length > 0) {
        // 既存の企業データと損益計算結果をマージ
        const updatedCompanies = companies.map(company => {
          const profitLossCompany = data.companies.find((c: { id: number }) => c.id === company.id);
          if (profitLossCompany) {
            return {
              ...company,
              totalProfitLoss: profitLossCompany.totalProfitLoss,
              pairs: company.pairs.map(pair => {
                const profitLossPair = profitLossCompany.pairs.find((p: { id: number }) => p.id === pair.id);
                if (profitLossPair) {
                  return {
                    ...pair,
                    currentBuyPrice: profitLossPair.currentBuyPrice,
                    currentSellPrice: profitLossPair.currentSellPrice,
                    profitLoss: profitLossPair.profitLoss,
                    buyProfitLoss: profitLossPair.buyProfitLoss,
                    sellProfitLoss: profitLossPair.sellProfitLoss
                  };
                }
                return pair;
              })
            };
          }
          return company;
        });
        
        setCompanies(updatedCompanies);
        
        // 選択中の企業がある場合、その情報も更新
        if (selectedCompany) {
          const updatedSelectedCompany = updatedCompanies.find((c: Company) => c.id === selectedCompany.id);
          if (updatedSelectedCompany) {
            setSelectedCompany(updatedSelectedCompany);
          }
        }
      }
    } catch (error) {
      console.error('損益計算の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 特定企業の損益計算APIを呼び出す関数
  const fetchCompanyProfitLossData = async (companyId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/calculate-profit-loss`);
      
      if (!response.ok) {
        throw new Error('損益計算に失敗しました');
      }
      
      const data = await response.json();
      
      // 企業データを更新
      const updatedCompanies = companies.map(company => {
        if (company.id === companyId) {
          return {
            ...company,
            totalProfitLoss: data.totalProfitLoss,
            pairs: company.pairs.map(pair => {
              const profitLossPair = data.pairs.find((p: { id: number }) => p.id === pair.id);
              if (profitLossPair) {
                return {
                  ...pair,
                  currentBuyPrice: profitLossPair.currentBuyPrice,
                  currentSellPrice: profitLossPair.currentSellPrice,
                  profitLoss: profitLossPair.profitLoss,
                  buyProfitLoss: profitLossPair.buyProfitLoss,
                  sellProfitLoss: profitLossPair.sellProfitLoss
                };
              }
              return pair;
            })
          };
        }
        return company;
      });
      
      setCompanies(updatedCompanies);
      
      // 選択中の企業がある場合、その情報も更新
      if (selectedCompany && selectedCompany.id === companyId) {
        const updatedSelectedCompany = updatedCompanies.find((c: Company) => c.id === companyId);
        if (updatedSelectedCompany) {
          setSelectedCompany(updatedSelectedCompany);
        }
      }
    } catch (error) {
      console.error('損益計算の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 企業の詳細情報を取得（ペア情報と預かり資産を含む）
  const fetchCompanyDetails = async (companyId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      
      if (!response.ok) {
        throw new Error("企業詳細の取得に失敗しました");
      }
      
      const companyData = await response.json();
      
      // ペア情報に決済状態のフィールドを含めて整形
      const formattedPairs = companyData.pairs ? companyData.pairs.map((pair: any) => ({
        ...pair,
        isSettled: pair.isSettled || false,
        settledAt: pair.settledAt || undefined
      })) : [];

      // 預かり資産情報を整形
      const formattedAssets = companyData.assets ? companyData.assets.map((asset: any) => ({
        ...asset,
        description: asset.description || undefined
      })) : [];

      // 企業の情報を更新（関数型更新を使用）
      setCompanies(prevCompanies =>
        prevCompanies.map((company) => {
          if (company.id === companyId) {
            // 既存のtotalProfitLossを保持しつつ、他の情報を更新
            return {
              ...companyData,
              pairs: formattedPairs,
              assets: formattedAssets,
              totalProfitLoss: company.totalProfitLoss // 既存の損益合計を保持
            };
          }
          return company;
        })
      );
      
      // 選択中の企業の情報も更新（関数型更新を使用）
      if (selectedCompany && selectedCompany.id === companyId) {
        const currentCompany = companies.find(c => c.id === companyId);
        setSelectedCompany({
          ...companyData,
          pairs: formattedPairs,
          assets: formattedAssets,
          totalProfitLoss: currentCompany?.totalProfitLoss // 既存の損益合計を保持
        });
      }
    } catch (error) {
      console.error("企業詳細の取得に失敗しました:", error);
    }
  };

  // 企業のペア情報を取得（後方互換性のため残す）
  const fetchCompanyPairs = async (companyId: number) => {
    await fetchCompanyDetails(companyId);
  };

  // 企業の追加
  const handleAddCompany = async (data: CompanyFormData) => {
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("企業の追加に失敗しました");
      }

      const newCompany = await response.json();
      setCompanies(prevCompanies => [...prevCompanies, { ...newCompany, pairs: [] }]);
    } catch (error) {
      console.error("企業の追加に失敗しました:", error);
    }
  };

  // 企業の更新
  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!companyToEdit) return;

    try {
      const response = await fetch(`/api/companies/${companyToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("企業の更新に失敗しました");
      }

      const updatedCompany = await response.json();
      setCompanies(prevCompanies =>
        prevCompanies.map((company) =>
          company.id === companyToEdit.id
            ? { 
                ...updatedCompany, 
                pairs: company.pairs,
                assets: company.assets,
                totalProfitLoss: company.totalProfitLoss // 既存の損益合計を保持
              }
            : company
        )
      );
    } catch (error) {
      console.error("企業の更新に失敗しました:", error);
    }
  };

  // 企業の削除
  const handleDeleteCompany = async (id: number) => {
    if (!confirm("この企業を削除してもよろしいですか？関連するペア情報もすべて削除されます。")) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("企業の削除に失敗しました");
      }

      setCompanies(prevCompanies => prevCompanies.filter((company) => company.id !== id));
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error("企業の削除に失敗しました:", error);
    }
  };

  // ペア情報の追加
  const handleAddPair = async (data: PairFormData) => {
    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}/pairs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("ペア情報の追加に失敗しました");
      }

      // 企業のペア情報を再取得
      await fetchCompanyPairs(selectedCompany.id);
    } catch (error) {
      console.error("ペア情報の追加に失敗しました:", error);
    }
  };

  // ペア情報の更新
  const handleUpdatePair = async (data: PairFormData) => {
    if (!selectedPair || !selectedCompany) return;

    try {
      const response = await fetch(`/api/pairs/${selectedPair.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("ペア情報の更新に失敗しました");
      }

      // 企業のペア情報を再取得
      await fetchCompanyPairs(selectedCompany.id);
    } catch (error) {
      console.error("ペア情報の更新に失敗しました:", error);
    }
  };

  // 決済済みペアの更新（全項目対応）
  const handleUpdateSettledPair = async (data: {
    name: string;
    link?: string;
    analysisRecord?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
    buyStockCode?: string;
    sellStockCode?: string;
    currentBuyPrice?: number;
    currentSellPrice?: number;
  }) => {
    if (!selectedPair || !selectedCompany) return;

    try {
      const response = await fetch(`/api/pairs/${selectedPair.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("決済済みペア情報の更新に失敗しました");
      }

      // 企業のペア情報を再取得
      await fetchCompanyPairs(selectedCompany.id);
    } catch (error) {
      console.error("決済済みペア情報の更新に失敗しました:", error);
      alert(`決済済みペア情報の更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // ペア情報の削除
  const handleDeletePair = async (id: number) => {
    if (!confirm("このペア情報を削除してもよろしいですか？")) {
      return;
    }

    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/pairs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ペア情報の削除に失敗しました");
      }

      // 企業のペア情報を再取得
      await fetchCompanyPairs(selectedCompany.id);
    } catch (error) {
      console.error("ペア情報の削除に失敗しました:", error);
    }
  };

  // ペアの決済処理
  const handleSettlePair = async (pairId: number) => {
    if (!confirm("このペアを決済してもよろしいですか？")) {
      return;
    }

    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/pairs/${pairId}/settle`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "決済処理に失敗しました");
      }

      // 企業のペア情報を再取得
      await fetchCompanyPairs(selectedCompany.id);
    } catch (error) {
      console.error("決済処理に失敗しました:", error);
      alert(`決済処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // ペア情報表示ボタンのクリックハンドラ
  const handleShowPairs = (company: Company) => {
    setSelectedCompany(company);
    // 最新のペア情報を取得
    fetchCompanyPairs(company.id);
  };

  // 企業一覧に戻るハンドラ
  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    // APIリクエストは送らず、既存の状態を保持
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* メインコンテンツ */}
      {isInitialLoading ? (
        <LoadingSpinner 
          size="lg" 
          message="企業データを読み込み中..." 
          className="py-16"
        />
      ) : error ? (
        <div className="text-center py-8 text-red-500">エラー: {error}</div>
      ) : !selectedCompany ? (
        <CompanyListView
          companies={companies}
          pagination={pagination}
          isLoading={isLoading}
          onAddCompany={() => setIsAddCompanyOpen(true)}
          onCalculateAllProfitLoss={fetchAllProfitLossData}
          onShowPairs={handleShowPairs}
          onEdit={(company) => {
            setCompanyToEdit(company);
            setIsEditCompanyOpen(true);
          }}
          onDelete={handleDeleteCompany}
          onPageChange={handlePageChange}
        />
      ) : (
        // 選択された企業のペア情報
        <CompanyDetail
          company={selectedCompany}
          isLoading={isLoading}
          onAddPair={() => setIsAddPairOpen(true)}
          onBackToCompanies={handleBackToCompanies}
          onEditPair={(pair) => {
            setSelectedPair(pair);
            if (pair.isSettled) {
              setIsEditSettledPairOpen(true);
            } else {
              setIsEditPairOpen(true);
            }
          }}
          onDeletePair={handleDeletePair}
          onSettlePair={handleSettlePair}
          onCalculateProfitLoss={fetchCompanyProfitLossData}
          onRefresh={() => fetchCompanyDetails(selectedCompany.id)}
        />
      )}

      {/* 企業追加フォーム */}
      <CompanyForm
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSubmit={handleAddCompany}
        title="企業を追加"
      />

      {/* 企業編集フォーム */}
      {companyToEdit && (
        <CompanyForm
          isOpen={isEditCompanyOpen}
          onClose={() => setIsEditCompanyOpen(false)}
          onSubmit={handleUpdateCompany}
          initialData={companyToEdit}
          title="企業を編集"
        />
      )}

      {/* ペア情報追加フォーム */}
      {selectedCompany && (
        <PairForm
          isOpen={isAddPairOpen}
          onClose={() => setIsAddPairOpen(false)}
          onSubmit={handleAddPair}
          title="ペア情報を追加"
        />
      )}

      {/* ペア情報編集フォーム */}
      {selectedPair && (
        <PairForm
          isOpen={isEditPairOpen}
          onClose={() => setIsEditPairOpen(false)}
          onSubmit={handleUpdatePair}
          initialData={selectedPair}
          title="ペア情報を編集"
        />
      )}

      {/* 決済済みペア編集フォーム */}
      {selectedPair && (
        <SettledPairForm
          isOpen={isEditSettledPairOpen}
          onClose={() => setIsEditSettledPairOpen(false)}
          onSubmit={handleUpdateSettledPair}
          initialData={selectedPair}
          title="決済済みペア情報を編集"
        />
      )}
    </div>
  );
}
