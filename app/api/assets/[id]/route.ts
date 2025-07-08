import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 預かり資産の詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: '無効な資産IDです' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        company: true,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: '預かり資産が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('預かり資産の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '預かり資産の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 預かり資産を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);
    
    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: '無効な資産IDです' },
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

    // 資産が存在するかチェック
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: '預かり資産が見つかりません' },
        { status: 404 }
      );
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name: data.name,
        type: data.type,
        amount: data.amount,
        unit: data.unit || '円',
        description: data.description,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('預かり資産の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '預かり資産の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 預かり資産を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json(
        { error: '無効な資産IDです' },
        { status: 400 }
      );
    }

    // 資産が存在するかチェック
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: '預かり資産が見つかりません' },
        { status: 404 }
      );
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ message: '預かり資産を削除しました' });
  } catch (error) {
    console.error('預かり資産の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '預かり資産の削除に失敗しました' },
      { status: 500 }
    );
  }
}
