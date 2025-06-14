import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

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
      },
      skip,
      take: limit,
      orderBy: {
        id: 'desc', // 新しい企業から表示
      },
    });
    
    // 各企業の合計損益を計算
    const companiesWithProfitLoss = companies.map(company => {
      let totalProfitLoss = 0;
      
      // 各ペアの損益を合計
      company.pairs.forEach(pair => {
        if (pair.profitLoss !== null && pair.profitLoss !== undefined) {
          totalProfitLoss += pair.profitLoss;
        }
      });
      
      return {
        ...company,
        totalProfitLoss: company.pairs.some(pair => pair.profitLoss !== null && pair.profitLoss !== undefined) 
          ? totalProfitLoss 
          : undefined
      };
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      companies: companiesWithProfitLoss,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('企業一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '企業一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新しい企業を追加
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // バリデーション
    if (!data.name) {
      return NextResponse.json(
        { error: '企業名は必須です' },
        { status: 400 }
      );
    }
    
    const company = await prisma.company.create({
      data: {
        name: data.name,
      },
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('企業の追加に失敗しました:', error);
    return NextResponse.json(
      { error: '企業の追加に失敗しました' },
      { status: 500 }
    );
  }
}
