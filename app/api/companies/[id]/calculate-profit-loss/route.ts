import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { 
  extractUniqueStockCodes, 
  fetchStockPricesInBatches, 
  calculatePairProfitLossWithCache 
} from '@/app/lib/api-profit-loss';
import { saveProfitLossToDatabase } from '@/app/lib/api-database';

import { PairWithPrices } from '@/app/lib/api-types';

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
            OR: [
              { buyStockCode: { not: null } },
              { sellStockCode: { not: null } }
            ]
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

    console.log(`企業 ${company.name} の処理対象ペア数: ${company.pairs.length}`);

    // 全ペアから重複のない証券コードを抽出
    const uniqueStockCodes = extractUniqueStockCodes(company.pairs);
    console.log(`取得対象証券コード数: ${uniqueStockCodes.length}, コード: ${uniqueStockCodes.join(', ')}`);

    // バッチサイズ制限付きで並列株価取得
    const priceCache = await fetchStockPricesInBatches(uniqueStockCodes, 10);

    // 結果を格納するオブジェクト
    const result = {
      id: company.id,
      name: company.name,
      pairs: [] as PairWithPrices[],
      totalProfitLoss: 0
    };

    // 各ペアについて損益計算
    for (const pair of company.pairs) {
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

        result.pairs.push(updatedPair);
        if (updatedPair.profitLoss !== undefined) {
          result.totalProfitLoss += updatedPair.profitLoss;
        }
      }
    }

    console.log(`企業 ${company.name} の処理完了: ${result.pairs.length}ペア`);

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

    console.log(`企業ID ${companyId} の処理対象ペア数: ${pairs.length}`);

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

    console.log(`企業ID ${companyId} の処理完了: 成功=${successCount}, エラー=${errorCount}`);

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
