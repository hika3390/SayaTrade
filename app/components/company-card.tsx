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
  const getProfitLossStatus = (profitLoss: number) => {
    if (profitLoss > 0) return 'status-profit';
    if (profitLoss < 0) return 'status-loss';
    return 'status-settled';
  };

  const activePairs = company.pairs.filter(pair => !pair.isSettled);
  const settledPairs = company.pairs.filter(pair => pair.isSettled);

  return (
    <div className="card hover:shadow-md transition-shadow w-full">
      <div className="card-content pt-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-3 break-words">{company.name}</h2>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="whitespace-nowrap">アクティブ: {activePairs.length}件</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="whitespace-nowrap">決済済み: {settledPairs.length}件</span>
                </div>
              </div>
              {company.totalProfitLoss !== undefined && (
                <div className="mt-3">
                  <div className={`status-indicator ${getProfitLossStatus(company.totalProfitLoss)}`}>
                    含み損益: {company.totalProfitLoss >= 0 ? '+' : ''}{company.totalProfitLoss.toLocaleString()} 円
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 xl:flex-shrink-0 xl:min-w-fit">
            <Button 
              onClick={() => onShowPairs(company)}
              className="flex items-center justify-center space-x-2 min-w-fit"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>詳細を表示</span>
            </Button>
            <div className="flex gap-2 justify-center sm:justify-start">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(company)}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(company.id)}
                className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
