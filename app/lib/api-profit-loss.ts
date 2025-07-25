import { fetchStockPrice } from './stock-price-utils';
import { PairWithPrices } from './api-types';

// 損益計算関数
export function calculateBuyProfitLoss(
  buyShares: number,
  buyPrice: number,
  currentBuyPrice: number
): number {
  return (buyShares * currentBuyPrice) - (buyShares * buyPrice);
}

export function calculateSellProfitLoss(
  sellShares: number,
  sellPrice: number,
  currentSellPrice: number
): number {
  return (sellShares * sellPrice) - (sellShares * currentSellPrice);
}

export function calculateTotalProfitLoss(
  buyProfitLoss: number | null,
  sellProfitLoss: number | null
): number | null {
  if (buyProfitLoss !== null && sellProfitLoss !== null) {
    return buyProfitLoss + sellProfitLoss;
  } else if (buyProfitLoss !== null) {
    return buyProfitLoss;
  } else if (sellProfitLoss !== null) {
    return sellProfitLoss;
  }
  return null;
}

// ペアトレード用の損益計算（duplicate-pairs用）
export function calculatePairTradeProfitLoss(
  buyShares: number,
  buyPrice: number,
  currentBuyPrice: number,
  sellShares: number,
  sellPrice: number,
  currentSellPrice: number
): number {
  const buyPositionPL = (buyShares * buyPrice) - (buyShares * currentBuyPrice);
  const sellPositionPL = (sellShares * sellPrice) - (sellShares * currentSellPrice);
  
  if (Math.abs(buyPositionPL) >= Math.abs(sellPositionPL)) {
    return buyPositionPL - sellPositionPL;
  } else {
    return sellPositionPL - buyPositionPL;
  }
}

// 株価取得と損益計算を行う共通関数
export async function calculateAndUpdatePairProfitLoss(pair: any): Promise<PairWithPrices | null> {
  let currentBuyPrice: number | null = null;
  let currentSellPrice: number | null = null;
  let buyProfitLoss: number | null = null;
  let sellProfitLoss: number | null = null;

  // 買い証券コードがある場合、買い株価を取得
  if (pair.buyStockCode) {
    currentBuyPrice = await fetchStockPrice(pair.buyStockCode);
    if (currentBuyPrice !== null) {
      buyProfitLoss = calculateBuyProfitLoss(
        pair.buyShares,
        pair.buyPrice,
        currentBuyPrice
      );
    }
  }

  // 売り証券コードがある場合、売り株価を取得
  if (pair.sellStockCode) {
    currentSellPrice = await fetchStockPrice(pair.sellStockCode);
    if (currentSellPrice !== null) {
      sellProfitLoss = calculateSellProfitLoss(
        pair.sellShares,
        pair.sellPrice,
        currentSellPrice
      );
    }
  }

  // 合計損益を計算
  const profitLoss = calculateTotalProfitLoss(buyProfitLoss, sellProfitLoss);

  // 何らかの損益が計算できた場合のみ結果を返す
  if (buyProfitLoss !== null || sellProfitLoss !== null) {
    return {
      ...pair,
      currentBuyPrice: currentBuyPrice || undefined,
      currentSellPrice: currentSellPrice || undefined,
      profitLoss: profitLoss || undefined,
      buyProfitLoss: buyProfitLoss || undefined,
      sellProfitLoss: sellProfitLoss || undefined
    };
  }

  return null;
}

// ペアトレード用の株価取得と損益計算
export async function calculatePairTradeProfitLossWithPrices(pair: any): Promise<PairWithPrices | null> {
  if (!pair.buyStockCode || !pair.sellStockCode) {
    return null;
  }

  const currentBuyPrice = await fetchStockPrice(pair.buyStockCode);
  const currentSellPrice = await fetchStockPrice(pair.sellStockCode);

  if (currentBuyPrice !== null && currentSellPrice !== null) {
    const profitLoss = calculatePairTradeProfitLoss(
      pair.buyShares,
      pair.buyPrice,
      currentBuyPrice,
      pair.sellShares,
      pair.sellPrice,
      currentSellPrice
    );

    return {
      ...pair,
      currentBuyPrice,
      currentSellPrice,
      profitLoss
    };
  }

  return null;
}
