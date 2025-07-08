import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 特定の企業を取得
export async function GET(
  request: NextRequest,
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
    
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        pairs: true,
        assets: true,
      },
    });
    
    if (!company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(company);
  } catch (error) {
    console.error('企業の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '企業の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 企業を更新
export async function PUT(
  request: NextRequest,
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
    
    const data = await request.json();
    
    // バリデーション
    if (!data.name) {
      return NextResponse.json(
        { error: '企業名は必須です' },
        { status: 400 }
      );
    }
    
    // 企業の存在確認
    const existingCompany = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingCompany) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
      },
    });
    
    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('企業の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '企業の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 企業を削除
export async function DELETE(
  request: NextRequest,
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
    
    // 企業の存在確認
    const existingCompany = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingCompany) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }
    
    // 企業を削除（関連するペア情報も削除される）
    await prisma.company.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('企業の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '企業の削除に失敗しました' },
      { status: 500 }
    );
  }
}
