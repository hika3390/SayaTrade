import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { validateId, validatePairData, parseDate } from '@/app/lib/api-validation';
import { findCompanyById } from '@/app/lib/api-database';
import { createErrorResponse, createNotFoundResponse, createValidationErrorResponse } from '@/app/lib/api-errors';

// 特定の企業のペア情報を取得
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
    
    // 企業の存在確認
    const company = await findCompanyById(parseInt(id));
    
    if (!company) {
      return createNotFoundResponse('企業');
    }
    
    const pairs = await prisma.pair.findMany({
      where: { companyId: parseInt(id) },
    });
    
    return NextResponse.json(pairs);
  } catch (error) {
    return createErrorResponse('ペア情報の取得に失敗しました');
  }
}

// 新しいペア情報を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const validation = validateId(id);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!);
    }
    
    // 企業の存在確認
    const company = await findCompanyById(parseInt(id));
    
    if (!company) {
      return createNotFoundResponse('企業');
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
    
    // データオブジェクトを構築
    const createData: any = {
      name: data.name,
      link: data.link || null,
      analysisRecord: data.analysisRecord || null,
      buyShares,
      sellShares,
      buyPrice,
      sellPrice,
      buyStockCode: data.buyStockCode || null,
      sellStockCode: data.sellStockCode || null,
      companyId: parseInt(id),
    };

    // entryDateが提供されている場合のみ追加
    if (data.entryDate) {
      const parsedDate = parseDate(data.entryDate);
      if (parsedDate) {
        createData.entryDate = parsedDate;
      }
    }

    const pair = await prisma.pair.create({
      data: createData,
    });
    
    return NextResponse.json(pair, { status: 201 });
  } catch (error) {
    return createErrorResponse('ペア情報の追加に失敗しました');
  }
}
