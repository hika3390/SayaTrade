"use client";

import { Button } from "@/app/components/ui/button";
import { PaginationInfo } from "@/app/types";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalCount, limit, hasNext, hasPrev } = pagination;

  // ページ番号のリストを生成
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 総ページ数が少ない場合は全て表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在のページを中心に表示
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      // 開始位置の調整
      if (end - start < maxVisiblePages - 1) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }
      
      // 最初のページを追加
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push(-1); // 省略記号用
        }
      }
      
      // 中間のページを追加
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 最後のページを追加
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1); // 省略記号用
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* 表示件数情報 */}
      <div className="text-sm text-gray-600">
        {totalCount > 0 ? (
          <>
            {startItem}〜{endItem}件 / 全{totalCount}件
          </>
        ) : (
          "0件"
        )}
      </div>

      {/* ページネーションボタン */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* 前のページボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev}
          >
            前へ
          </Button>

          {/* ページ番号ボタン */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === -1) {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* 次のページボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
