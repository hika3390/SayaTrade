import { Button } from "@/app/components/ui/button";

interface CompanyListEmptyProps {
  onAddCompany: () => void;
}

export function CompanyListEmpty({ onAddCompany }: CompanyListEmptyProps) {
  return (
    <div className="card">
      <div className="card-content">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-2">企業が登録されていません</h3>
          <p className="text-muted-foreground mb-4">
            「企業を追加」ボタンから新しい企業を登録してください。
          </p>
          <Button onClick={onAddCompany} className="flex items-center space-x-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>企業を追加</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
