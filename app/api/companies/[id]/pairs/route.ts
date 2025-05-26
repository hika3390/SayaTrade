import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 特定の企業のペア情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }
    
    // 企業の存在確認
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    const pairs = await prisma.pair.findMany({
      where: { companyId: parseInt(id) },
    });
    
    return NextResponse.json(pairs);
  } catch (error) {
    console.error('ペア情報の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'ペア情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新しいペア情報を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }
    
    // 企業の存在確認
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // バリデーション
    if (!data.name) {
      return NextResponse.json(
        { error: 'ペア名は必須です' },
        { status: 400 }
      );
    }
    
    // 数値フィールドのバリデーション
    const buyShares = parseInt(data.buyShares);
    const sellShares = parseInt(data.sellShares);
    const buyPrice = parseFloat(data.buyPrice);
    const sellPrice = parseFloat(data.sellPrice);
    
    if (isNaN(buyShares) || isNaN(sellShares) || isNaN(buyPrice) || isNaN(sellPrice)) {
      return NextResponse.json(
        { error: '株数と単価は数値で入力してください' },
        { status: 400 }
      );
    }
    
    const pair = await prisma.pair.create({
      data: {
        name: data.name,
        link: data.link || null,
        buyShares,
        sellShares,
        buyPrice,
        sellPrice,
        buyStockCode: data.buyStockCode || null,
        sellStockCode: data.sellStockCode || null,
        companyId: parseInt(id),
      },
    });
    
    return NextResponse.json(pair, { status: 201 });
  } catch (error) {
    console.error('ペア情報の追加に失敗しました:', error);
    return NextResponse.json(
      { error: 'ペア情報の追加に失敗しました' },
      { status: 500 }
    );
  }
}
