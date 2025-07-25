import { Button } from "@/app/components/ui/button";

interface CompanyListHeaderProps {
  onAddCompany: () => void;
  onCalculateAllProfitLoss: () => void;
  isLoading: boolean;
}

export function CompanyListHeader({ 
  onAddCompany, 
  onCalculateAllProfitLoss, 
  isLoading 
}: CompanyListHeaderProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">企業一覧</h1>
            <p className="text-muted-foreground">
              登録されている企業とその取引ペア情報を管理します
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onAddCompany} className="flex items-center space-x-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>企業を追加</span>
          </Button>
          <Button 
            variant="outline"
            onClick={onCalculateAllProfitLoss}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{isLoading ? "計算中..." : "全体の損益計算"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
