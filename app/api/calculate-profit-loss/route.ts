import { NextResponse } from 'next/server';
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
  currentBuyPrice?: number;
  currentSellPrice?: number;
  profitLoss?: number;
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

// 全ペアの損益を計算するAPI
export async function GET() {
  try {
    // 全ての企業とそのペア情報を取得
    const companies = await prisma.company.findMany({
      include: {
        pairs: true,
      },
    });
    
    // 結果を格納する配列
    const result: { 
      companies: { 
        id: number; 
        name: string; 
        pairs: PairWithPrices[]; 
        totalProfitLoss?: number;
      }[] 
    } = { companies: [] };
    
    // 各企業のペアについて処理
    for (const company of companies) {
      const processedCompany = {
        id: company.id,
        name: company.name,
        pairs: [] as PairWithPrices[],
        totalProfitLoss: 0
      };
      
      // 各ペアについて処理
      for (const pair of company.pairs) {
        // 買いと売りの両方に証券コードが入力されているペアのみ処理
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
            
            // 結果をペア情報に追加
            const pairWithPrices: PairWithPrices = {
              ...pair,
              currentBuyPrice,
              currentSellPrice,
              profitLoss
            };
            
            processedCompany.pairs.push(pairWithPrices);
            processedCompany.totalProfitLoss += profitLoss;
          }
        }
      }
      
      // ペアが1つ以上ある場合のみ結果に追加
      if (processedCompany.pairs.length > 0) {
        result.companies.push(processedCompany);
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('損益計算に失敗しました:', error);
    return NextResponse.json(
      { error: '損益計算に失敗しました' },
      { status: 500 }
    );
  }
}
