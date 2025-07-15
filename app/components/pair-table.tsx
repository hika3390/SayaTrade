"use client";

import { Button } from "@/app/components/ui/button";
import { Pair } from "@/app/types";

interface PairTableProps {
  pairs: Pair[];
  title: string;
  isSettled?: boolean;
  onEdit?: (pair: Pair) => void;
  onDelete?: (id: number) => void;
  onSettle?: (id: number) => void;
}

export function PairTable({ pairs, title, isSettled = false, onEdit, onDelete, onSettle }: PairTableProps) {
  const getProfitLossDisplay = (profitLoss: number | undefined | null) => {
    if (profitLoss === undefined || profitLoss === null) return "—";
    const status = profitLoss >= 0 ? 'status-profit' : 'status-loss';
    return (
      <span className={`status-indicator ${status}`}>
        {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()} 円
      </span>
    );
  };

  if (pairs.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSettled ? 'bg-muted' : 'bg-primary/10'}`}>
              <svg className={`h-4 w-4 ${isSettled ? 'text-muted-foreground' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="card-title text-lg">{title} (0件)</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-muted-foreground">
              {isSettled ? "決済済みペアはありません" : "未決済ペアはありません"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSettled ? 'bg-muted' : 'bg-primary/10'}`}>
            <svg className={`h-4 w-4 ${isSettled ? 'text-muted-foreground' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="card-title text-lg">{title} ({pairs.length}件)</h3>
        </div>
      </div>
      <div className="card-content">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">ペア名</th>
                <th className="table-head">リンク</th>
                <th className="table-head">分析記録</th>
                <th className="table-head text-center">エントリー日</th>
                <th className="table-head text-right">買い株数</th>
                <th className="table-head text-right">売り株数</th>
                <th className="table-head text-right">買い単価</th>
                <th className="table-head text-right">売り単価</th>
                <th className="table-head text-center">買い証券コード</th>
                <th className="table-head text-center">売り証券コード</th>
                <th className="table-head text-right">現在買値</th>
                <th className="table-head text-right">現在売値</th>
                <th className="table-head text-right">買い損益</th>
                <th className="table-head text-right">売り損益</th>
                <th className="table-head text-right">損益</th>
                <th className="table-head text-center">
                  {isSettled ? "決済日時" : "操作"}
                </th>
                {isSettled && (
                  <th className="table-head text-center">操作</th>
                )}
              </tr>
            </thead>
            <tbody className="table-body">
              {pairs.map((pair) => (
                <tr key={pair.id} className="table-row">
                  <td className="table-cell">
                    <div className="font-medium text-foreground">{pair.name}</div>
                  </td>
                  <td className="table-cell">
                    {pair.link ? (
                      <a
                        href={pair.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>リンク</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {pair.analysisRecord ? (
                      <a
                        href={pair.analysisRecord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>分析記録</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <span className="text-muted-foreground">
                      {pair.entryDate ? new Date(pair.entryDate).toLocaleDateString('ja-JP') : "—"}
                    </span>
                  </td>
                  <td className="table-cell text-right font-medium">{pair.buyShares.toLocaleString()}</td>
                  <td className="table-cell text-right font-medium">{pair.sellShares.toLocaleString()}</td>
                  <td className="table-cell text-right font-medium">¥{pair.buyPrice.toLocaleString()}</td>
                  <td className="table-cell text-right font-medium">¥{pair.sellPrice.toLocaleString()}</td>
                  <td className="table-cell text-center">
                    <span className="badge badge-outline">{pair.buyStockCode || "—"}</span>
                  </td>
                  <td className="table-cell text-center">
                    <span className="badge badge-outline">{pair.sellStockCode || "—"}</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="text-muted-foreground">
                      {pair.currentBuyPrice ? `¥${pair.currentBuyPrice.toLocaleString()}` : "—"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="text-muted-foreground">
                      {pair.currentSellPrice ? `¥${pair.currentSellPrice.toLocaleString()}` : "—"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    {getProfitLossDisplay(pair.buyProfitLoss)}
                  </td>
                  <td className="table-cell text-right">
                    {getProfitLossDisplay(pair.sellProfitLoss)}
                  </td>
                  <td className="table-cell text-right">
                    {getProfitLossDisplay(pair.profitLoss)}
                  </td>
                  <td className="table-cell">
                    {isSettled ? (
                      <div className="text-center text-sm text-muted-foreground min-w-[120px]">
                        {pair.settledAt ? new Date(pair.settledAt).toLocaleString('ja-JP') : "—"}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1 min-w-[140px]">
                        {onSettle && (
                          <Button
                            size="sm"
                            onClick={() => onSettle(pair.id)}
                            className="h-8 px-3 flex-shrink-0 whitespace-nowrap"
                          >
                            決済
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(pair)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(pair.id)}
                            className="h-8 w-8 p-0 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                  {isSettled && (
                    <td className="table-cell">
                      <div className="flex justify-center gap-1 min-w-[80px]">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(pair)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(pair.id)}
                            className="h-8 w-8 p-0 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
