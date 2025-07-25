import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { PairWithPrices } from '@/app/lib/api-types';
import { calculateAndUpdatePairProfitLoss } from '@/app/lib/api-profit-loss';
import { saveProfitLossToDatabase } from '@/app/lib/api-database';
import { createErrorResponse } from '@/app/lib/api-errors';

// 全ペアの損益を計算するAPI
export async function GET() {
  try {
    // 全ての企業とそのペア情報を取得（決済済みペアを除外）
    const companies = await prisma.company.findMany({
      include: {
        pairs: {
          where: {
            isSettled: false, // 決済済みペアを除外
          },
        },
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
        // 買いまたは売りの証券コードが入力されているペアを処理
        if (pair.buyStockCode || pair.sellStockCode) {
          const updatedPair = await calculateAndUpdatePairProfitLoss(pair);
          
          if (updatedPair) {
            // データベースに保存
            await saveProfitLossToDatabase(
              pair.id,
              updatedPair.currentBuyPrice || null,
              updatedPair.currentSellPrice || null,
              updatedPair.profitLoss || null,
              updatedPair.buyProfitLoss || null,
              updatedPair.sellProfitLoss || null
            );
            
            processedCompany.pairs.push(updatedPair);
            if (updatedPair.profitLoss !== undefined) {
              processedCompany.totalProfitLoss += updatedPair.profitLoss;
            }
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
    return createErrorResponse('損益計算に失敗しました');
  }
}

// 全ペアの損益を計算してデータベースに保存するAPI
export async function POST() {
  try {
    // 買いまたは売りの証券コードが入力されているペアを取得（決済済みペアを除外）
    const pairs = await prisma.pair.findMany({
      where: {
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
        const updatedPair = await calculateAndUpdatePairProfitLoss(pair);
        
        if (updatedPair) {
          // データベースに保存
          await saveProfitLossToDatabase(
            pair.id,
            updatedPair.currentBuyPrice || null,
            updatedPair.currentSellPrice || null,
            updatedPair.profitLoss || null,
            updatedPair.buyProfitLoss || null,
            updatedPair.sellProfitLoss || null
          );
          
          results.push({
            pairId: pair.id,
            success: true,
            currentBuyPrice: updatedPair.currentBuyPrice || null,
            currentSellPrice: updatedPair.currentSellPrice || null,
            profitLoss: updatedPair.profitLoss || null,
            buyProfitLoss: updatedPair.buyProfitLoss || null,
            sellProfitLoss: updatedPair.sellProfitLoss || null
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
      totalProcessed: pairs.length,
      successCount,
      errorCount,
      results
    });
  } catch (error) {
    return createErrorResponse('損益計算と保存に失敗しました');
  }
}
