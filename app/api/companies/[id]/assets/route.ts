import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 企業の預かり資産一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }

    const assets = await prisma.asset.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('預かり資産の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '預かり資産の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新しい預かり資産を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: '無効な企業IDです' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // バリデーション
    if (!data.name || !data.type || data.amount === undefined) {
      return NextResponse.json(
        { error: '資産名、タイプ、金額は必須です' },
        { status: 400 }
      );
    }

    if (typeof data.amount !== 'number' || data.amount < 0) {
      return NextResponse.json(
        { error: '金額は0以上の数値である必要があります' },
        { status: 400 }
      );
    }

    // 企業が存在するかチェック
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        amount: data.amount,
        unit: data.unit || '円',
        description: data.description,
        companyId: companyId,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('預かり資産の追加に失敗しました:', error);
    return NextResponse.json(
      { error: '預かり資産の追加に失敗しました' },
      { status: 500 }
    );
  }
}
