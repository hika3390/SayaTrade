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
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title} ({pairs.length}件)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={isSettled ? "bg-gray-50" : "bg-gray-100"}>
              <th className="border p-2 text-left">ペア名</th>
              <th className="border p-2 text-left">リンク</th>
              <th className="border p-2 text-left">分析記録</th>
              <th className="border p-2 text-center">エントリー日</th>
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
              <th className="border p-2 text-center">
                {isSettled ? "決済日時" : "操作"}
              </th>
              {isSettled && (
                <th className="border p-2 text-center">操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pairs.length > 0 ? (
              pairs.map((pair) => (
                <tr key={pair.id} className={isSettled ? "bg-gray-50" : ""}>
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
                  <td className="border p-2">
                    {pair.analysisRecord ? (
                      <a
                        href={pair.analysisRecord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        分析記録
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {pair.entryDate ? new Date(pair.entryDate).toLocaleDateString('ja-JP') : "-"}
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
                    {isSettled ? (
                      <div className="text-center text-sm">
                        {pair.settledAt ? new Date(pair.settledAt).toLocaleString('ja-JP') : "-"}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1 flex-wrap">
                        {onSettle && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onSettle(pair.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            決済
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(pair)}
                          >
                            編集
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(pair.id)}
                          >
                            削除
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                  {isSettled && (
                    <td className="border p-2">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(pair)}
                          >
                            編集
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(pair.id)}
                          >
                            削除
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSettled ? 17 : 16} className="border p-4 text-center text-gray-500">
                  {isSettled ? "決済済みペアはありません" : "未決済ペアはありません"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
