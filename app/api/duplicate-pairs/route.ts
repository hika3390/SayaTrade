import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { PairWithPrices } from '@/app/lib/api-types';
import { calculatePairTradeProfitLossWithPrices } from '@/app/lib/api-profit-loss';
import { createErrorResponse } from '@/app/lib/api-errors';

interface DuplicatePairGroup {
  stockCodes: {
    buyStockCode: string;
    sellStockCode: string;
  };
  pairs: PairWithPrices[];
  totalProfitLoss: number;
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
        // 未決済ポジションのみ
        isSettled: false,
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
          else {
            const updatedPair = await calculatePairTradeProfitLossWithPrices(pair);
            if (updatedPair && updatedPair.profitLoss !== undefined) {
              // ペアの損益を設定
              pair.currentBuyPrice = updatedPair.currentBuyPrice;
              pair.currentSellPrice = updatedPair.currentSellPrice;
              pair.profitLoss = updatedPair.profitLoss;
              
              // グループの合計損益に加算
              totalProfitLoss += updatedPair.profitLoss;
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
        else {
          const updatedPair = await calculatePairTradeProfitLossWithPrices(pair);
          if (updatedPair && updatedPair.profitLoss !== undefined) {
            // ペアの損益を設定
            pair.currentBuyPrice = updatedPair.currentBuyPrice;
            pair.currentSellPrice = updatedPair.currentSellPrice;
            pair.profitLoss = updatedPair.profitLoss;
            
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
    return createErrorResponse('重複ペアの取得に失敗しました');
  }
}
