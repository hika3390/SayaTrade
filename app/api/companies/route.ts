import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 企業一覧を取得
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        pairs: true,
      },
    });
    return NextResponse.json(companies);
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
