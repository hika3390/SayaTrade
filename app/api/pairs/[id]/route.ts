import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { validateId, validatePairData, parseDate } from '@/app/lib/api-validation';
import { findPairById } from '@/app/lib/api-database';
import { createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/app/lib/api-errors';

// 特定のペア情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const validation = validateId(id);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!);
    }
    
    const pair = await findPairById(parseInt(id));
    
    if (!pair) {
      return createNotFoundResponse('ペア情報');
    }
    
    return NextResponse.json(pair);
  } catch (error) {
    return createErrorResponse('ペア情報の取得に失敗しました');
  }
}

// ペア情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const validation = validateId(id);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!);
    }
    
    // ペア情報の存在確認
    const existingPair = await findPairById(parseInt(id));
    
    if (!existingPair) {
      return createNotFoundResponse('ペア情報');
    }
    
    const data = await request.json();
    
    // バリデーション
    const dataValidation = validatePairData(data);
    if (!dataValidation.isValid) {
      return createValidationErrorResponse(dataValidation.error!);
    }
    
    // 数値フィールドの取得
    const buyShares = parseInt(data.buyShares);
    const sellShares = parseInt(data.sellShares);
    const buyPrice = parseFloat(data.buyPrice);
    const sellPrice = parseFloat(data.sellPrice);
    
    const currentBuyPrice = data.currentBuyPrice ? parseFloat(data.currentBuyPrice) : existingPair.currentBuyPrice;
    const currentSellPrice = data.currentSellPrice ? parseFloat(data.currentSellPrice) : existingPair.currentSellPrice;
    let buyProfitLoss = existingPair.buyProfitLoss;
    let sellProfitLoss = existingPair.sellProfitLoss;
    let profitLoss = existingPair.profitLoss;

    if (existingPair.isSettled) {
      if (currentBuyPrice !== null && currentSellPrice !== null) {
        // 買いポジションの損益計算（現在価格 - 買い単価）× 株数
        buyProfitLoss = (currentBuyPrice - buyPrice) * buyShares;
        // 売りポジションの損益計算（売り単価 - 現在価格）× 株数
        sellProfitLoss = (sellPrice - currentSellPrice) * sellShares;
        // 総損益
        profitLoss = buyProfitLoss + sellProfitLoss;
      }
    }

    // データオブジェクトを構築
    const updateData: any = {
      name: data.name,
      link: data.link || null,
      analysisRecord: data.analysisRecord || null,
      buyShares,
      sellShares,
      buyPrice,
      sellPrice,
      buyStockCode: data.buyStockCode || null,
      sellStockCode: data.sellStockCode || null,
      currentBuyPrice,
      currentSellPrice,
      buyProfitLoss,
      sellProfitLoss,
      profitLoss,
    };

    // entryDateが提供されている場合のみ追加
    if (data.entryDate) {
      const parsedDate = parseDate(data.entryDate);
      if (parsedDate) {
        updateData.entryDate = parsedDate;
      }
    }

    const updatedPair = await prisma.pair.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    
    return NextResponse.json(updatedPair);
  } catch (error) {
    return createErrorResponse('ペア情報の更新に失敗しました');
  }
}

// ペア情報を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const validation = validateId(id);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!);
    }
    
    // ペア情報の存在確認
    const existingPair = await findPairById(parseInt(id));
    
    if (!existingPair) {
      return createNotFoundResponse('ペア情報');
    }
    
    await prisma.pair.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse('ペア情報の削除に失敗しました');
  }
}
