"use client";

import { Asset } from "@/app/types";
import { Button } from "@/app/components/ui/button";

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  cash: "現金",
  stock: "株式",
  bond: "債券",
  fund: "投資信託",
  deposit: "預金",
  other: "その他",
};

export function AssetTable({ assets, onEdit, onDelete }: AssetTableProps) {
  const formatAmount = (amount: number, unit: string) => {
    return `${amount.toLocaleString()} ${unit}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const calculateTotalValue = () => {
    // 円単位の資産のみ合計を計算
    return assets
      .filter(asset => asset.unit === '円')
      .reduce((total, asset) => total + asset.amount, 0);
  };

  const totalValue = calculateTotalValue();

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        預かり資産が登録されていません。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 合計金額表示 */}
      {totalValue > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">預かり資産合計（円建て）</div>
            <div className="text-2xl font-bold text-blue-800">
              {totalValue.toLocaleString()} 円
            </div>
          </div>
        </div>
      )}

      {/* 資産テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                資産名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額・数量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {asset.name}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ASSET_TYPE_LABELS[asset.type] || asset.type}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAmount(asset.amount, asset.unit)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {asset.description || "-"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {formatDate(asset.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(asset)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(asset.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
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
    </div>
  );
}
