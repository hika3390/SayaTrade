"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";

interface SettledPairFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    link?: string;
    analysisRecord?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
    buyStockCode?: string;
    sellStockCode?: string;
    currentBuyPrice?: number;
    currentSellPrice?: number;
  }) => void;
  initialData?: {
    id: number;
    name: string;
    link?: string;
    analysisRecord?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
    buyStockCode?: string;
    sellStockCode?: string;
    currentBuyPrice?: number;
    currentSellPrice?: number;
    profitLoss?: number;
    buyProfitLoss?: number;
    sellProfitLoss?: number;
  };
  title: string;
}

export function SettledPairForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: SettledPairFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [analysisRecord, setAnalysisRecord] = useState(initialData?.analysisRecord || "");
  const [buyShares, setBuyShares] = useState(initialData?.buyShares || 0);
  const [sellShares, setSellShares] = useState(initialData?.sellShares || 0);
  const [buyPrice, setBuyPrice] = useState(initialData?.buyPrice || 0);
  const [sellPrice, setSellPrice] = useState(initialData?.sellPrice || 0);
  const [buyStockCode, setBuyStockCode] = useState(initialData?.buyStockCode || "");
  const [sellStockCode, setSellStockCode] = useState(initialData?.sellStockCode || "");
  const [currentBuyPrice, setCurrentBuyPrice] = useState<number | "">(
    initialData?.currentBuyPrice || ""
  );
  const [currentSellPrice, setCurrentSellPrice] = useState<number | "">(
    initialData?.currentSellPrice || ""
  );
  
  // 損益計算用の状態
  const [calculatedBuyProfitLoss, setCalculatedBuyProfitLoss] = useState<number | undefined>(
    initialData?.buyProfitLoss
  );
  const [calculatedSellProfitLoss, setCalculatedSellProfitLoss] = useState<number | undefined>(
    initialData?.sellProfitLoss
  );
  const [calculatedProfitLoss, setCalculatedProfitLoss] = useState<number | undefined>(
    initialData?.profitLoss
  );
  
  // initialDataが変更されたときに状態を更新
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLink(initialData.link || "");
      setAnalysisRecord(initialData.analysisRecord || "");
      setBuyShares(initialData.buyShares);
      setSellShares(initialData.sellShares);
      setBuyPrice(initialData.buyPrice);
      setSellPrice(initialData.sellPrice);
      setBuyStockCode(initialData.buyStockCode || "");
      setSellStockCode(initialData.sellStockCode || "");
      setCurrentBuyPrice(initialData.currentBuyPrice || "");
      setCurrentSellPrice(initialData.currentSellPrice || "");
      setCalculatedBuyProfitLoss(initialData.buyProfitLoss);
      setCalculatedSellProfitLoss(initialData.sellProfitLoss);
      setCalculatedProfitLoss(initialData.profitLoss);
    }
  }, [initialData]);

  // 損益計算を行う関数
  const calculateProfitLoss = (
    buyShares: number,
    sellShares: number,
    buyPrice: number,
    sellPrice: number,
    currentBuyPrice: number | "",
    currentSellPrice: number | ""
  ) => {
    if (currentBuyPrice !== "" && currentSellPrice !== "" && buyShares > 0 && sellShares > 0 && buyPrice > 0 && sellPrice > 0) {
      // 買いポジションの損益計算（現在価格 - 買い単価）× 株数
      const buyProfitLoss = (Number(currentBuyPrice) - buyPrice) * buyShares;
      
      // 売りポジションの損益計算（売り単価 - 現在価格）× 株数
      const sellProfitLoss = (sellPrice - Number(currentSellPrice)) * sellShares;
      
      // 総損益
      const profitLoss = buyProfitLoss + sellProfitLoss;

      setCalculatedBuyProfitLoss(buyProfitLoss);
      setCalculatedSellProfitLoss(sellProfitLoss);
      setCalculatedProfitLoss(profitLoss);
    } else {
      setCalculatedBuyProfitLoss(undefined);
      setCalculatedSellProfitLoss(undefined);
      setCalculatedProfitLoss(undefined);
    }
  };

  // 損益に影響する値が変更されたときに再計算
  useEffect(() => {
    calculateProfitLoss(buyShares, sellShares, buyPrice, sellPrice, currentBuyPrice, currentSellPrice);
  }, [buyShares, sellShares, buyPrice, sellPrice, currentBuyPrice, currentSellPrice]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        link: link || undefined,
        analysisRecord: analysisRecord || undefined,
        buyShares: Number(buyShares),
        sellShares: Number(sellShares),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        buyStockCode: buyStockCode || undefined,
        sellStockCode: sellStockCode || undefined,
        currentBuyPrice: currentBuyPrice === "" ? undefined : Number(currentBuyPrice),
        currentSellPrice: currentSellPrice === "" ? undefined : Number(currentSellPrice),
      });
      onClose();
    } catch (error) {
      console.error("決済済みペア情報の更新に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // フォームをリセット
    if (initialData) {
      setName(initialData.name);
      setLink(initialData.link || "");
      setAnalysisRecord(initialData.analysisRecord || "");
      setBuyShares(initialData.buyShares);
      setSellShares(initialData.sellShares);
      setBuyPrice(initialData.buyPrice);
      setSellPrice(initialData.sellPrice);
      setBuyStockCode(initialData.buyStockCode || "");
      setSellStockCode(initialData.sellStockCode || "");
      setCurrentBuyPrice(initialData.currentBuyPrice || "");
      setCurrentSellPrice(initialData.currentSellPrice || "");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            {/* ペア名 */}
            <div className="flex items-center gap-4">
              <Label htmlFor="name" className="w-24 text-right shrink-0">
                ペア名
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
                required
              />
            </div>
            
            {/* リンク */}
            <div className="flex items-center gap-4">
              <Label htmlFor="link" className="w-24 text-right shrink-0">
                リンク
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="flex-1"
                placeholder="https://jp.tradingview.com/chart/..."
              />
            </div>
            
            {/* 分析記録 */}
            <div className="flex items-center gap-4">
              <Label htmlFor="analysisRecord" className="w-24 text-right shrink-0">
                分析記録
              </Label>
              <Input
                id="analysisRecord"
                value={analysisRecord}
                onChange={(e) => setAnalysisRecord(e.target.value)}
                className="flex-1"
                placeholder="https://docs.google.com/..."
              />
            </div>
            
            {/* 買い株数・売り株数 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right shrink-0">株数</Label>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="buyShares" className="text-sm text-gray-600">買い</Label>
                  <Input
                    id="buyShares"
                    type="number"
                    value={buyShares}
                    onChange={(e) => setBuyShares(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="sellShares" className="text-sm text-gray-600">売り</Label>
                  <Input
                    id="sellShares"
                    type="number"
                    value={sellShares}
                    onChange={(e) => setSellShares(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* 買い単価・売り単価 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right shrink-0">単価</Label>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="buyPrice" className="text-sm text-gray-600">買い</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="0.01"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="sellPrice" className="text-sm text-gray-600">売り</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    step="0.01"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* 証券コード */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right shrink-0">証券コード</Label>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="buyStockCode" className="text-sm text-gray-600">買い</Label>
                  <Input
                    id="buyStockCode"
                    value={buyStockCode}
                    onChange={(e) => setBuyStockCode(e.target.value)}
                    placeholder="例: 1234"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="sellStockCode" className="text-sm text-gray-600">売り</Label>
                  <Input
                    id="sellStockCode"
                    value={sellStockCode}
                    onChange={(e) => setSellStockCode(e.target.value)}
                    placeholder="例: 5678"
                  />
                </div>
              </div>
            </div>
            
            {/* 現在価格 */}
            <div className="flex items-center gap-4">
              <Label className="w-24 text-right shrink-0">現在価格</Label>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="currentBuyPrice" className="text-sm text-gray-600">買い</Label>
                  <Input
                    id="currentBuyPrice"
                    type="number"
                    step="0.01"
                    value={currentBuyPrice}
                    onChange={(e) => setCurrentBuyPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="現在の買値"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="currentSellPrice" className="text-sm text-gray-600">売り</Label>
                  <Input
                    id="currentSellPrice"
                    type="number"
                    step="0.01"
                    value={currentSellPrice}
                    onChange={(e) => setCurrentSellPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="現在の売値"
                  />
                </div>
              </div>
            </div>

            {/* 損益情報の表示（編集不可・リアルタイム計算） */}
            {(calculatedBuyProfitLoss !== undefined || calculatedSellProfitLoss !== undefined || calculatedProfitLoss !== undefined) && (
              <>
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">損益情報</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label className="w-24 text-right shrink-0 text-gray-600">損益</Label>
                  <div className="flex-1 flex gap-2">
                    {calculatedBuyProfitLoss !== undefined && (
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">買い損益</Label>
                        <div className={`p-2 bg-gray-50 rounded border text-center ${calculatedBuyProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatedBuyProfitLoss?.toLocaleString()} 円
                        </div>
                      </div>
                    )}
                    
                    {calculatedSellProfitLoss !== undefined && (
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">売り損益</Label>
                        <div className={`p-2 bg-gray-50 rounded border text-center ${calculatedSellProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatedSellProfitLoss?.toLocaleString()} 円
                        </div>
                      </div>
                    )}
                    
                    {calculatedProfitLoss !== undefined && (
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">総損益</Label>
                        <div className={`p-2 bg-gray-50 rounded border text-center font-medium ${calculatedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatedProfitLoss?.toLocaleString()} 円
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* 注意事項 */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong> 決済済みペアでは損益情報以外の全ての項目を編集可能です。<br />
                損益情報は現在価格の変更時に自動で再計算されます。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
