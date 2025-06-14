"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { CompanyForm } from "@/app/components/company-form";
import { PairForm } from "@/app/components/pair-form";
import { CompanyCard } from "@/app/components/company-card";
import { CompanyDetail } from "@/app/components/company-detail";
import { Pagination } from "@/app/components/pagination";
import { Company, Pair, PairFormData, CompanyFormData, CompaniesResponse, PaginationInfo } from "@/app/types";

interface CompanyListProps {
  initialData: CompaniesResponse;
}

export function CompanyList({ initialData }: CompanyListProps) {
  const [companies, setCompanies] = useState<Company[]>(initialData.companies);
  const [pagination, setPagination] = useState<PaginationInfo>(initialData.pagination);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isAddPairOpen, setIsAddPairOpen] = useState(false);
  const [isEditPairOpen, setIsEditPairOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 企業一覧を取得する関数
  const fetchCompanies = async (page: number = 1, limit: number = 5) => {
    try {
      const response = await fetch(`/api/companies?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("企業一覧の取得に失敗しました");
      }
      
      const data: CompaniesResponse = await response.json();
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (error) {
      console.error("企業一覧の取得に失敗しました:", error);
    }
  };

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

  // 企業のペア情報を取得
  const fetchCompanyPairs = async (companyId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/pairs`);
      
      if (!response.ok) {
        throw new Error("ペア情報の取得に失敗しました");
      }
      
      const pairs = await response.json();
      
      // ペア情報に決済状態のフィールドを含めて整形
      const formattedPairs = pairs.map((pair: any) => ({
        ...pair,
        isSettled: pair.isSettled || false,
        settledAt: pair.settledAt || undefined
      }));

      // 企業のペア情報を更新（関数型更新を使用）
      setCompanies(prevCompanies =>
        prevCompanies.map((company) =>
          company.id === companyId
            ? { ...company, pairs: formattedPairs }
            : company
        )
      );
      
      // 選択中の企業のペア情報も更新（関数型更新を使用）
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(prevSelectedCompany => 
          prevSelectedCompany ? { ...prevSelectedCompany, pairs: formattedPairs } : null
        );
      }
    } catch (error) {
      console.error("ペア情報の取得に失敗しました:", error);
    }
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
            ? { ...updatedCompany, pairs: company.pairs }
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
  };

  return (
    <div className="mx-auto p-4">
      {/* メインコンテンツ */}
      {!selectedCompany ? (
        <>
          {/* 企業一覧ヘッダー */}
          <div className="bg-gray-100 p-4 mb-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">企業一覧</h1>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddCompanyOpen(true)}>企業を追加</Button>
                <Button 
                  variant="outline"
                  onClick={fetchAllProfitLossData}
                  disabled={isLoading}
                >
                  {isLoading ? "計算中..." : "全体の損益計算"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* 企業一覧 */}
          <div className="grid gap-4">
            {companies.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                企業が登録されていません。「企業を追加」ボタンから企業を登録してください。
              </p>
            ) : (
              companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onShowPairs={handleShowPairs}
                  onEdit={(company) => {
                    setCompanyToEdit(company);
                    setIsEditCompanyOpen(true);
                  }}
                  onDelete={handleDeleteCompany}
                />
              ))
            )}
          </div>

          {/* ページネーション */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        // 選択された企業のペア情報
        <CompanyDetail
          company={selectedCompany}
          isLoading={isLoading}
          onAddPair={() => setIsAddPairOpen(true)}
          onBackToCompanies={handleBackToCompanies}
          onEditPair={(pair) => {
            setSelectedPair(pair);
            setIsEditPairOpen(true);
          }}
          onDeletePair={handleDeletePair}
          onSettlePair={handleSettlePair}
          onCalculateProfitLoss={fetchCompanyProfitLossData}
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
    </div>
  );
}
