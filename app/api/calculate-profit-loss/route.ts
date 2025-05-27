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

// 損益情報をデータベースに保存する関数
async function saveProfitLossToDatabase(
  pairId: number,
  currentBuyPrice: number,
  currentSellPrice: number,
  profitLoss: number
): Promise<void> {
  try {
    await prisma.pair.update({
      where: { id: pairId },
      data: {
        currentBuyPrice,
        currentSellPrice,
        profitLoss,
        updatedAt: new Date(),
      },
    });
    console.log(`ペアID ${pairId} の損益情報を保存しました`);
  } catch (error) {
    console.error(`ペアID ${pairId} の損益情報の保存に失敗しました:`, error);
    throw error;
  }
}

// 全ペアの損益を計算するAPI（データベースには保存しない）
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

            // データベースに保存
            await saveProfitLossToDatabase(
              pair.id,
              currentBuyPrice,
              currentSellPrice,
              profitLoss
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

// 全ペアの損益を計算してデータベースに保存するAPI
export async function POST() {
  try {
    // 買いと売りの両方に証券コードが入力されているペアを取得
    const pairs = await prisma.pair.findMany({
      where: {
        buyStockCode: { not: null },
        sellStockCode: { not: null },
      },
    });
    
    // 処理結果を格納する配列
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // 各ペアについて処理
    for (const pair of pairs) {
      try {
        if (pair.buyStockCode && pair.sellStockCode) {
          // 現在の株価を取得
          const currentBuyPrice = await fetchStockPrice(pair.buyStockCode);
          const currentSellPrice = await fetchStockPrice(pair.sellStockCode);
          
          // 両方の株価が取得できた場合のみ損益を計算してデータベースに保存
          if (currentBuyPrice !== null && currentSellPrice !== null) {
            const profitLoss = calculateProfitLoss(
              pair.buyShares,
              pair.buyPrice,
              currentBuyPrice,
              pair.sellShares,
              pair.sellPrice,
              currentSellPrice
            );
            
            // データベースに保存
            await saveProfitLossToDatabase(
              pair.id,
              currentBuyPrice,
              currentSellPrice,
              profitLoss
            );
            
            results.push({
              pairId: pair.id,
              success: true,
              currentBuyPrice,
              currentSellPrice,
              profitLoss
            });
            
            successCount++;
          } else {
            results.push({
              pairId: pair.id,
              success: false,
              error: '株価の取得に失敗しました'
            });
            
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`ペアID ${pair.id} の処理中にエラーが発生しました:`, error);
        
        results.push({
          pairId: pair.id,
          success: false,
          error: '処理中にエラーが発生しました'
        });
        
        errorCount++;
      }
    }
    
    return NextResponse.json({
      totalProcessed: pairs.length,
      successCount,
      errorCount,
      results
    });
  } catch (error) {
    console.error('損益計算と保存に失敗しました:', error);
    return NextResponse.json(
      { error: '損益計算と保存に失敗しました' },
      { status: 500 }
    );
  }
}
