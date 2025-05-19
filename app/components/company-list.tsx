"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { CompanyForm } from "@/app/components/company-form";
import { PairForm } from "@/app/components/pair-form";

interface Company {
  id: number;
  name: string;
  pairs: Pair[];
}

interface Pair {
  id: number;
  name: string;
  link?: string;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  companyId: number;
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

  // 企業のペア情報を取得
  const fetchCompanyPairs = async (companyId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/pairs`);
      
      if (!response.ok) {
        throw new Error("ペア情報の取得に失敗しました");
      }
      
      const pairs = await response.json();
      
      // 企業のペア情報を更新
      setCompanies(
        companies.map((company) =>
          company.id === companyId
            ? { ...company, pairs }
            : company
        )
      );
      
      // 選択中の企業のペア情報も更新
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany({
          ...selectedCompany,
          pairs,
        });
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
      setCompanies([...companies, { ...newCompany, pairs: [] }]);
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
      setCompanies(
        companies.map((company) =>
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

      setCompanies(companies.filter((company) => company.id !== id));
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
    <div className="container mx-auto py-8">
      {/* ナビゲーションバー */}
      <div className="bg-gray-100 p-4 mb-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">サヤ取り分配くん</h1>
            {selectedCompany && (
              <>
                <span className="text-gray-500">/</span>
                <span className="font-semibold">{selectedCompany.name}</span>
              </>
            )}
          </div>
          {selectedCompany ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsAddPairOpen(true)}>ペア情報を追加</Button>
              <Button variant="outline" onClick={handleBackToCompanies}>
                企業一覧に戻る
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsAddCompanyOpen(true)}>企業を追加</Button>
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
    </div>
  );
}
