import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { fetchStockPrice } from '@/app/lib/stock-price-utils';

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
  buyProfitLoss?: number;
  sellProfitLoss?: number;
}

// 買い損益を計算する関数
function calculateBuyProfitLoss(
  buyShares: number,
  buyPrice: number,
  currentBuyPrice: number
): number {
  // 買い損益: (買い株数 * 現在の単価) - (買い株数 * 買い単価)
  return (buyShares * currentBuyPrice) - (buyShares * buyPrice);
}

// 売り損益を計算する関数
function calculateSellProfitLoss(
  sellShares: number,
  sellPrice: number,
  currentSellPrice: number
): number {
  // 売り損益: (売り株数 * 売り単価) - (売り株数 * 現在の単価)
  return (sellShares * sellPrice) - (sellShares * currentSellPrice);
}

// 合計損益を計算する関数
function calculateTotalProfitLoss(
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

// 損益情報をデータベースに保存する関数
async function saveProfitLossToDatabase(
  pairId: number,
  currentBuyPrice: number | null,
  currentSellPrice: number | null,
  profitLoss: number | null,
  buyProfitLoss: number | null,
  sellProfitLoss: number | null
): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (currentBuyPrice !== null) {
      updateData.currentBuyPrice = currentBuyPrice;
    }
    
    if (currentSellPrice !== null) {
      updateData.currentSellPrice = currentSellPrice;
    }
    
    if (profitLoss !== null) {
      updateData.profitLoss = profitLoss;
    }
    
    if (buyProfitLoss !== null) {
      updateData.buyProfitLoss = buyProfitLoss;
    }
    
    if (sellProfitLoss !== null) {
      updateData.sellProfitLoss = sellProfitLoss;
    }
    
    await prisma.pair.update({
      where: { id: pairId },
      data: updateData,
    });
    console.log(`ペアID ${pairId} の損益情報を保存しました`);
  } catch (error) {
    console.error(`ペアID ${pairId} の損益情報の保存に失敗しました:`, error);
    throw error;
  }
}

// 特定企業の損益を計算するAPI
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }

    // 指定された企業とそのペア情報を取得（決済済みペアを除外）
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        pairs: {
          where: {
            isSettled: false, // 決済済みペアを除外
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    // 結果を格納するオブジェクト
    const result = {
      id: company.id,
      name: company.name,
      pairs: [] as PairWithPrices[],
      totalProfitLoss: 0
    };
    
    // 各ペアについて処理
    for (const pair of company.pairs) {
      // 買いまたは売りの証券コードが入力されているペアを処理
      if (pair.buyStockCode || pair.sellStockCode) {
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
        
        // 何らかの損益が計算できた場合のみデータベースに保存
        if (buyProfitLoss !== null || sellProfitLoss !== null) {
          await saveProfitLossToDatabase(
            pair.id,
            currentBuyPrice,
            currentSellPrice,
            profitLoss,
            buyProfitLoss,
            sellProfitLoss
          );
          
          // 結果をペア情報に追加
          const pairWithPrices: PairWithPrices = {
            ...pair,
            currentBuyPrice: currentBuyPrice || undefined,
            currentSellPrice: currentSellPrice || undefined,
            profitLoss: profitLoss || undefined,
            buyProfitLoss: buyProfitLoss || undefined,
            sellProfitLoss: sellProfitLoss || undefined
          };
          
          result.pairs.push(pairWithPrices);
          if (profitLoss !== null) {
            result.totalProfitLoss += profitLoss;
          }
        }
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

// 特定企業の損益を計算してデータベースに保存するAPI
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }

    // 指定された企業の買いまたは売りの証券コードが入力されているペアを取得（決済済みペアを除外）
    const pairs = await prisma.pair.findMany({
      where: {
        companyId: companyId,
        isSettled: false, // 決済済みペアを除外
        OR: [
          { buyStockCode: { not: null } },
          { sellStockCode: { not: null } }
        ]
      },
    });
    
    // 処理結果を格納する配列
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // 各ペアについて処理
    for (const pair of pairs) {
      try {
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
        
        // 何らかの損益が計算できた場合のみデータベースに保存
        if (buyProfitLoss !== null || sellProfitLoss !== null) {
          await saveProfitLossToDatabase(
            pair.id,
            currentBuyPrice,
            currentSellPrice,
            profitLoss,
            buyProfitLoss,
            sellProfitLoss
          );
          
          results.push({
            pairId: pair.id,
            success: true,
            currentBuyPrice,
            currentSellPrice,
            profitLoss,
            buyProfitLoss,
            sellProfitLoss
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
      companyId,
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
