// ページネーション用のヘルパー関数
export function createPaginationInfo(page: number, limit: number, totalCount: number) {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
