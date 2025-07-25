import { CompanyListHeader } from "./company-list-header";
import { CompanyListEmpty } from "./company-list-empty";
import { CompanyListGrid } from "./company-list-grid";
import { Pagination } from "@/app/components/pagination";
import { Company, PaginationInfo } from "@/app/types";

interface CompanyListViewProps {
  companies: Company[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onAddCompany: () => void;
  onCalculateAllProfitLoss: () => void;
  onShowPairs: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

export function CompanyListView({
  companies,
  pagination,
  isLoading,
  onAddCompany,
  onCalculateAllProfitLoss,
  onShowPairs,
  onEdit,
  onDelete,
  onPageChange,
}: CompanyListViewProps) {
  return (
    <>
      {/* 企業一覧ヘッダー */}
      <CompanyListHeader
        onAddCompany={onAddCompany}
        onCalculateAllProfitLoss={onCalculateAllProfitLoss}
        isLoading={isLoading}
      />
      
      {/* 企業一覧 */}
      {companies.length === 0 ? (
        <CompanyListEmpty onAddCompany={onAddCompany} />
      ) : (
        <CompanyListGrid
          companies={companies}
          onShowPairs={onShowPairs}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      {/* ページネーション */}
      {companies.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
