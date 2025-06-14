"use client";

import { Button } from "@/app/components/ui/button";
import { Company } from "@/app/types";

interface CompanyCardProps {
  company: Company;
  onShowPairs: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: number) => void;
}

export function CompanyCard({ company, onShowPairs, onEdit, onDelete }: CompanyCardProps) {
  return (
    <div className="border p-4 rounded-lg flex justify-between items-center">
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
        <Button onClick={() => onShowPairs(company)}>
          ペア情報を表示
        </Button>
        <Button variant="outline" onClick={() => onEdit(company)}>
          編集
        </Button>
        <Button variant="destructive" onClick={() => onDelete(company.id)}>
          削除
        </Button>
      </div>
    </div>
  );
}
