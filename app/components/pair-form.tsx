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

interface PairFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    link?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
  }) => void;
  initialData?: {
    id: number;
    name: string;
    link?: string;
    buyShares: number;
    sellShares: number;
    buyPrice: number;
    sellPrice: number;
  };
  title: string;
}

export function PairForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: PairFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [buyShares, setBuyShares] = useState(initialData?.buyShares || 0);
  const [sellShares, setSellShares] = useState(initialData?.sellShares || 0);
  const [buyPrice, setBuyPrice] = useState(initialData?.buyPrice || 0);
  const [sellPrice, setSellPrice] = useState(initialData?.sellPrice || 0);
  
  // initialDataが変更されたときに状態を更新
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLink(initialData.link || "");
      setBuyShares(initialData.buyShares);
      setSellShares(initialData.sellShares);
      setBuyPrice(initialData.buyPrice);
      setSellPrice(initialData.sellPrice);
    }
  }, [initialData]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        link: link || undefined,
        buyShares: Number(buyShares),
        sellShares: Number(sellShares),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
      });
      onClose();
    } catch (error) {
      console.error("ペア情報の保存に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ペア名
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                リンク
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="col-span-3"
                placeholder="https://jp.tradingview.com/chart/..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buyShares" className="text-right">
                買い株数
              </Label>
              <Input
                id="buyShares"
                type="number"
                value={buyShares}
                onChange={(e) => setBuyShares(Number(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellShares" className="text-right">
                売り株数
              </Label>
              <Input
                id="sellShares"
                type="number"
                value={sellShares}
                onChange={(e) => setSellShares(Number(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buyPrice" className="text-right">
                買い単価
              </Label>
              <Input
                id="buyPrice"
                type="number"
                step="0.01"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellPrice" className="text-right">
                売り単価
              </Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
