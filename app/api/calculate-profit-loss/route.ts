import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { PairWithPrices } from '@/app/lib/api-types';
import {
  extractUniqueStockCodes,
  fetchStockPricesInBatches,
  calculatePairProfitLossWithCache
} from '@/app/lib/api-profit-loss';
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
            OR: [
              { buyStockCode: { not: null } },
              { sellStockCode: { not: null } }
            ]
          },
        },
      },
    });

    // 全ペアを平坦化
    const allPairs = companies.flatMap(company =>
      company.pairs.map(pair => ({ ...pair, companyId: company.id, companyName: company.name }))
    );

    console.log(`処理対象ペア数: ${allPairs.length}`);

    // 全ペアから重複のない証券コードを抽出
    const uniqueStockCodes = extractUniqueStockCodes(allPairs);
    console.log(`取得対象証券コード数: ${uniqueStockCodes.length}, コード: ${uniqueStockCodes.join(', ')}`);

    // バッチサイズ制限付きで並列株価取得
    const priceCache = await fetchStockPricesInBatches(uniqueStockCodes, 10);

    // 結果を格納する配列
    const result: {
      companies: {
        id: number;
        name: string;
        pairs: PairWithPrices[];
        totalProfitLoss?: number;
      }[]
    } = { companies: [] };

    // 企業ごとに結果を整理
    const companyMap = new Map<number, {
      id: number;
      name: string;
      pairs: PairWithPrices[];
      totalProfitLoss: number;
    }>();

    // 各ペアについて損益計算
    for (const pair of allPairs) {
      const updatedPair = calculatePairProfitLossWithCache(pair, priceCache);

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

        // 企業ごとの結果を構築
        if (!companyMap.has(pair.companyId)) {
          companyMap.set(pair.companyId, {
            id: pair.companyId,
            name: pair.companyName,
            pairs: [],
            totalProfitLoss: 0
          });
        }

        const company = companyMap.get(pair.companyId)!;
        company.pairs.push(updatedPair);
        if (updatedPair.profitLoss !== undefined) {
          company.totalProfitLoss += updatedPair.profitLoss;
        }
      }
    }

    // 結果を配列に変換
    result.companies = Array.from(companyMap.values());

    console.log(`処理完了: ${result.companies.length}社、合計ペア数: ${result.companies.reduce((sum, c) => sum + c.pairs.length, 0)}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('損益計算エラー:', error);
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

    console.log(`処理対象ペア数: ${pairs.length}`);

    // 全ペアから重複のない証券コードを抽出
    const uniqueStockCodes = extractUniqueStockCodes(pairs);
    console.log(`取得対象証券コード数: ${uniqueStockCodes.length}, コード: ${uniqueStockCodes.join(', ')}`);

    // バッチサイズ制限付きで並列株価取得
    const priceCache = await fetchStockPricesInBatches(uniqueStockCodes, 10);

    // 処理結果を格納する配列
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 各ペアについて処理
    for (const pair of pairs) {
      try {
        const updatedPair = calculatePairProfitLossWithCache(pair, priceCache);

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

    console.log(`処理完了: 成功=${successCount}, エラー=${errorCount}`);

    return NextResponse.json({
      totalProcessed: pairs.length,
      successCount,
      errorCount,
      results
    });
  } catch (error) {
    console.error('損益計算と保存エラー:', error);
    return createErrorResponse('損益計算と保存に失敗しました');
  }
}
