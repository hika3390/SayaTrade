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

  const getAssetTypeVariant = (type: string) => {
    switch (type) {
      case 'cash':
        return 'badge-success';
      case 'stock':
        return 'badge-default';
      case 'bond':
        return 'badge-secondary';
      case 'fund':
        return 'badge-warning';
      case 'deposit':
        return 'badge-success';
      default:
        return 'badge-outline';
    }
  };

  const totalValue = calculateTotalValue();

  if (assets.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">預かり資産がありません</h3>
            <p className="text-muted-foreground">
              預かり資産が登録されていません。新しい資産を追加してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 合計金額表示 */}
      {totalValue > 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground mb-2">預かり資産合計（円建て）</div>
              <div className="text-3xl font-bold text-primary">
                ¥{totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 資産テーブル */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-head">資産名</th>
              <th className="table-head">タイプ</th>
              <th className="table-head text-right">金額・数量</th>
              <th className="table-head">説明</th>
              <th className="table-head">登録日</th>
              <th className="table-head text-center">操作</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {assets.map((asset) => (
              <tr key={asset.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{asset.name}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${getAssetTypeVariant(asset.type)}`}>
                    {ASSET_TYPE_LABELS[asset.type] || asset.type}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="font-medium text-foreground">
                    {formatAmount(asset.amount, asset.unit)}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-muted-foreground max-w-xs truncate">
                    {asset.description || "—"}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-muted-foreground">
                    {formatDate(asset.createdAt)}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(asset)}
                      className="h-8 w-8 p-0"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(asset.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
