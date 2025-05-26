import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface PairWithPrices {
  id: number;
  name: string;
  link?: string | null;
  buyShares: number;
  sellShares: number;
  buyPrice: number;
  sellPrice: number;
  buyStockCode?: string | null;
  sellStockCode?: string | null;
  companyId: number;
  company: {
    id: number;
    name: string;
  };
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
}

interface DuplicatePairGroup {
  stockCodes: {
    buyStockCode: string;
    sellStockCode: string;
  };
  pairs: PairWithPrices[];
  totalProfitLoss: number;
}

// 現在の株価を取得する関数
async function fetchStockPrice(stockCode: string): Promise<number | null> {
  try {
    // 絶対URLを構築
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // 内部APIを呼び出して株価を取得
    const response = await fetch(`${baseUrl}/api/stock-price?code=${stockCode}`, {
      // キャッシュを無効化して常に最新の株価を取得
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`株価の取得に失敗しました: ${response.status} ${response.statusText}`, errorText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || typeof data.price !== 'number') {
      console.error('無効な株価データ:', data);
      return null;
    }
    
    console.log(`証券コード ${stockCode} の株価を取得: ${data.price}円 (${data.date || '日付不明'})`);
    return data.price;
  } catch (error) {
    console.error(`証券コード ${stockCode} の株価取得中にエラーが発生しました:`, error);
    return null;
  }
}

// 損益を計算する関数
function calculateProfitLoss(
  buyShares: number,
  buyPrice: number,
  currentBuyPrice: number,
  sellShares: number,
  sellPrice: number,
  currentSellPrice: number
): number {
  // 買いポジションの損益: (買い株数 * 買い単価) - (買い株数 * 現在の単価)
  const buyPositionPL = (buyShares * buyPrice) - (buyShares * currentBuyPrice);
  
  // 売りポジションの損益: (売り株数 * 売り単価) - (売り株数 * 現在の単価)
  const sellPositionPL = (sellShares * sellPrice) - (sellShares * currentSellPrice);
  
  // 合計損益: 絶対値が大きい方から小さい方を引く
  if (Math.abs(buyPositionPL) >= Math.abs(sellPositionPL)) {
    return buyPositionPL - sellPositionPL;
  } else {
    return sellPositionPL - buyPositionPL;
  }
}

// 重複するペアとユニークなペアを取得するAPI
export async function GET() {
  try {
    // 全てのペア情報を取得（企業情報も含む）
    const pairs = await prisma.pair.findMany({
      include: {
        company: true,
      },
      where: {
        // 買いと売りの両方に証券コードが入力されているペアのみ
        buyStockCode: { not: null },
        sellStockCode: { not: null },
      },
    });
    
    // 証券コードの組み合わせでグループ化
    const pairGroups: Record<string, PairWithPrices[]> = {};
    
    // 各ペアについて処理
    for (const pair of pairs) {
      if (pair.buyStockCode && pair.sellStockCode) {
        // 買いと売りの証券コードの組み合わせをキーとして使用
        // 常に同じ順序になるようにソート
        const codes = [pair.buyStockCode, pair.sellStockCode].sort();
        const key = `${codes[0]}-${codes[1]}`;
        
        if (!pairGroups[key]) {
          pairGroups[key] = [];
        }
        
        pairGroups[key].push(pair as PairWithPrices);
      }
    }
    
    // 重複するペアグループと単一のペアを分ける
    const duplicatePairGroups: DuplicatePairGroup[] = [];
    const uniquePairs: PairWithPrices[] = [];
    
    // 各グループについて処理
    for (const key in pairGroups) {
      const group = pairGroups[key];
      
      if (group.length > 1) {
        // 重複するペアグループ
        // 各ペアの現在の株価を取得して損益を計算
        let totalProfitLoss = 0;
        
        for (const pair of group) {
          if (pair.buyStockCode && pair.sellStockCode) {
            // 現在の株価を取得
            const currentBuyPrice = await fetchStockPrice(pair.buyStockCode);
            const currentSellPrice = await fetchStockPrice(pair.sellStockCode);
            
            // 両方の株価が取得できた場合のみ損益を計算
            if (currentBuyPrice !== null && currentSellPrice !== null) {
              const profitLoss = calculateProfitLoss(
                pair.buyShares,
                pair.buyPrice,
                currentBuyPrice,
                pair.sellShares,
                pair.sellPrice,
                currentSellPrice
              );
              
              // ペアの損益を設定
              pair.currentBuyPrice = currentBuyPrice;
              pair.currentSellPrice = currentSellPrice;
              pair.profitLoss = profitLoss;
              
              // グループの合計損益に加算
              totalProfitLoss += profitLoss;
            }
          }
        }
        
        // 最初のペアから証券コードの組み合わせを取得
        const firstPair = group[0];
        
        duplicatePairGroups.push({
          stockCodes: {
            buyStockCode: firstPair.buyStockCode!,
            sellStockCode: firstPair.sellStockCode!,
          },
          pairs: group,
          totalProfitLoss,
        });
      } else {
        // 単一のペア
        const pair = group[0];
        
        if (pair.buyStockCode && pair.sellStockCode) {
          // 現在の株価を取得
          const currentBuyPrice = await fetchStockPrice(pair.buyStockCode);
          const currentSellPrice = await fetchStockPrice(pair.sellStockCode);
          
          // 両方の株価が取得できた場合のみ損益を計算
          if (currentBuyPrice !== null && currentSellPrice !== null) {
            const profitLoss = calculateProfitLoss(
              pair.buyShares,
              pair.buyPrice,
              currentBuyPrice,
              pair.sellShares,
              pair.sellPrice,
              currentSellPrice
            );
            
            // ペアの損益を設定
            pair.currentBuyPrice = currentBuyPrice;
            pair.currentSellPrice = currentSellPrice;
            pair.profitLoss = profitLoss;
            
            uniquePairs.push(pair);
          }
        }
      }
    }
    
    // 結果を返す
    return NextResponse.json({
      duplicatePairGroups,
      uniquePairs,
    });
  } catch (error) {
    console.error('重複ペアの取得に失敗しました:', error);
    return NextResponse.json(
      { error: '重複ペアの取得に失敗しました' },
      { status: 500 }
    );
  }
}
