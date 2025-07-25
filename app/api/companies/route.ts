import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { validateCompanyData } from '@/app/lib/api-validation';
import { createErrorResponse, createValidationErrorResponse } from '@/app/lib/api-errors';
import { createPaginationInfo } from '@/app/lib/api-helpers';

// 企業一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    // 総企業数を取得
    const totalCount = await prisma.company.count();
    
    const companies = await prisma.company.findMany({
      include: {
        pairs: true,
        assets: true,
      },
      skip,
      take: limit,
      orderBy: {
        id: 'desc', // 新しい企業から表示
      },
    });
    
    // 各企業の合計損益を計算（保有ポジションの含み損益のみ）
    const companiesWithProfitLoss = companies.map(company => {
      let totalProfitLoss = 0;
      
      // 決済済みでないペアの損益のみを合計（保有ポジションの含み損益）
      const unsettledPairs = company.pairs.filter(pair => !pair.isSettled);
      unsettledPairs.forEach(pair => {
        if (pair.profitLoss !== null && pair.profitLoss !== undefined) {
          totalProfitLoss += pair.profitLoss;
        }
      });
      
      return {
        ...company,
        totalProfitLoss: unsettledPairs.some(pair => pair.profitLoss !== null && pair.profitLoss !== undefined) 
          ? totalProfitLoss 
          : undefined
      };
    });
    
    return NextResponse.json({
      companies: companiesWithProfitLoss,
      pagination: createPaginationInfo(page, limit, totalCount),
    });
  } catch (error) {
    return createErrorResponse('企業一覧の取得に失敗しました');
  }
}

// 新しい企業を追加
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // バリデーション
    const validation = validateCompanyData(data);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.error!);
    }
    
    const company = await prisma.company.create({
      data: {
        name: data.name,
      },
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return createErrorResponse('企業の追加に失敗しました');
  }
}
