"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { CompanyForm } from "@/app/components/company-form";
import { PairForm } from "@/app/components/pair-form";

interface Company {
  id: number;
  name: string;
  pairs: Pair[];
  totalProfitLoss?: number;
}

interface Pair {
  id: number;
  name: string;
  link?: string;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  buyStockCode?: string;
  sellStockCode?: string;
  companyId: number;
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
  buyProfitLoss?: number;
  sellProfitLoss?: number;
}

interface CompanyListProps {
  initialCompanies: Company[];
}

export function CompanyList({ initialCompanies }: CompanyListProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isAddPairOpen, setIsAddPairOpen] = useState(false);
  const [isEditPairOpen, setIsEditPairOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 全企業の損益計算APIを呼び出す関数
  const fetchAllProfitLossData = async () => {
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
      
      // 企業のペア情報を更新（関数型更新を使用）
      setCompanies(prevCompanies =>
        prevCompanies.map((company) =>
          company.id === companyId
            ? { ...company, pairs }
            : company
        )
      );
      
      // 選択中の企業のペア情報も更新（関数型更新を使用）
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(prevSelectedCompany => 
          prevSelectedCompany ? { ...prevSelectedCompany, pairs } : null
        );
      }
    } catch (error) {
      console.error("ペア情報の取得に失敗しました:", error);
    }
  };

  // 企業の追加
  const handleAddCompany = async (data: { name: string }) => {
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
  const handleUpdateCompany = async (data: { name: string }) => {
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
  const handleAddPair = async (data: {
    name: string;
    link?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
    buyStockCode?: string;
    sellStockCode?: string;
  }) => {
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
  const handleUpdatePair = async (data: {
    name: string;
    link?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
    buyStockCode?: string;
    sellStockCode?: string;
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
      {/* ローカルヘッダー */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              {selectedCompany ? `企業詳細: ${selectedCompany.name}` : '企業一覧'}
            </h1>
          </div>
          {selectedCompany ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsAddPairOpen(true)}>ペア情報を追加</Button>
              <Button variant="outline" onClick={handleBackToCompanies}>
                企業一覧に戻る
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      {!selectedCompany ? (
        // 企業一覧
        <div className="grid gap-4">
          {companies.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              企業が登録されていません。「企業を追加」ボタンから企業を登録してください。
            </p>
          ) : (
            companies.map((company) => (
              <div
                key={company.id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <p className="text-sm text-gray-500">
                    登録ペア数: {company.pairs.length}
                  </p>
                  {company.totalProfitLoss !== undefined && (
                    <p className={`text-sm font-medium ${company.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      損益合計: {company.totalProfitLoss.toLocaleString()} 円
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleShowPairs(company)}
                  >
                    ペア情報を表示
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCompanyToEdit(company);
                      setIsEditCompanyOpen(true);
                    }}
                  >
                    編集
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // 選択された企業のペア情報
        <div>
          {selectedCompany.pairs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              ペア情報が登録されていません。「ペア情報を追加」ボタンからペア情報を登録してください。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">ペア名</th>
                    <th className="border p-2 text-left">リンク</th>
                    <th className="border p-2 text-right">買い株数</th>
                    <th className="border p-2 text-right">売り株数</th>
                    <th className="border p-2 text-right">買い単価</th>
                    <th className="border p-2 text-right">売り単価</th>
                    <th className="border p-2 text-center">買い証券コード</th>
                    <th className="border p-2 text-center">売り証券コード</th>
                    <th className="border p-2 text-right">現在買値</th>
                    <th className="border p-2 text-right">現在売値</th>
                    <th className="border p-2 text-right">買い損益</th>
                    <th className="border p-2 text-right">売り損益</th>
                    <th className="border p-2 text-right">損益</th>
                    <th className="border p-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCompany.pairs.map((pair) => (
                    <tr key={pair.id}>
                      <td className="border p-2">{pair.name}</td>
                      <td className="border p-2">
                        {pair.link ? (
                          <a
                            href={pair.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            リンク
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border p-2 text-right">{pair.buyShares}</td>
                      <td className="border p-2 text-right">{pair.sellShares}</td>
                      <td className="border p-2 text-right">{pair.buyPrice}</td>
                      <td className="border p-2 text-right">{pair.sellPrice}</td>
                      <td className="border p-2 text-center">{pair.buyStockCode || "-"}</td>
                      <td className="border p-2 text-center">{pair.sellStockCode || "-"}</td>
                      <td className="border p-2 text-right">{pair.currentBuyPrice?.toLocaleString() || "-"}</td>
                      <td className="border p-2 text-right">{pair.currentSellPrice?.toLocaleString() || "-"}</td>
                      <td className={`border p-2 text-right ${pair.buyProfitLoss !== undefined ? (pair.buyProfitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                        {pair.buyProfitLoss !== undefined && pair.buyProfitLoss !== null ? `${pair.buyProfitLoss?.toLocaleString()} 円` : "-"}
                      </td>
                      <td className={`border p-2 text-right ${pair.sellProfitLoss !== undefined ? (pair.sellProfitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                        {pair.sellProfitLoss !== undefined && pair.sellProfitLoss !== null ? `${pair.sellProfitLoss?.toLocaleString()} 円` : "-"}
                      </td>
                      <td className={`border p-2 text-right ${pair.profitLoss !== undefined ? (pair.profitLoss >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                        {pair.profitLoss !== undefined && pair.profitLoss !== null ? `${pair.profitLoss?.toLocaleString()} 円` : "-"}
                      </td>
                      <td className="border p-2">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPair(pair);
                              setIsEditPairOpen(true);
                            }}
                          >
                            編集
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePair(pair.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

      {/* 損益計算ボタン */}
      {selectedCompany && (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => fetchCompanyProfitLossData(selectedCompany.id)}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? "計算中..." : "損益を再計算"}
          </Button>
        </div>
      )}
    </div>
  );
}
