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

// 日付をYYYY-MM-DD形式にフォーマットする関数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 現在の株価を取得する関数
async function fetchStockPrice(stockCode: string): Promise<number | null> {
  try {
    // J-Quants APIを直接使用して株価を取得
    const JQuantsApi = (await import('@/app/lib/jquants/api')).default;
    const jquantsApi = JQuantsApi.getInstance();
    
    // 現在の日付を取得
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // 7日前の日付を取得（休日や株価が取得できない日に対応するため）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedSevenDaysAgo = formatDate(sevenDaysAgo);
    
    // J-Quants APIから株価データを取得
    const quotes = await jquantsApi.getDailyQuotes(
      stockCode,
      formattedSevenDaysAgo,
      formattedDate
    );
    
    if (!quotes || quotes.length === 0) {
      console.error(`証券コード ${stockCode} の株価データが見つかりません`);
      return null;
    }
    
    // 最新の株価を取得（配列の最後の要素）
    const latestQuote = quotes[quotes.length - 1];
    const price = latestQuote.Close;
    
    console.log(`証券コード ${stockCode} の株価を取得: ${price}円 (${latestQuote.Date || '日付不明'})`);
    return price;
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
        let totalProfitLoss = 0;
        
        for (const pair of group) {
          // データベースに保存されている損益情報がある場合はそれを使用
          if (pair.currentBuyPrice !== null && pair.currentSellPrice !== null && pair.profitLoss !== null && pair.profitLoss !== undefined) {
            // グループの合計損益に加算
            totalProfitLoss += pair.profitLoss;
          } 
          // 損益情報がない場合は計算して一時的に設定（データベースには保存しない）
          else if (pair.buyStockCode && pair.sellStockCode) {
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
        
        // データベースに保存されている損益情報がある場合はそれを使用
        if (pair.currentBuyPrice !== null && pair.currentSellPrice !== null && pair.profitLoss !== null && pair.profitLoss !== undefined) {
          uniquePairs.push(pair);
        }
        // 損益情報がない場合は計算して一時的に設定（データベースには保存しない）
        else if (pair.buyStockCode && pair.sellStockCode) {
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
