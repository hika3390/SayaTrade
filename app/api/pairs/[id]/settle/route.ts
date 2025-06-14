import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pairId = parseInt(id);

    if (isNaN(pairId)) {
      return NextResponse.json(
        { error: "無効なペアIDです" },
        { status: 400 }
      );
    }

    // ペアが存在するかチェック
    const existingPair = await prisma.pair.findUnique({
      where: { id: pairId },
    });

    if (!existingPair) {
      return NextResponse.json(
        { error: "ペアが見つかりません" },
        { status: 404 }
      );
    }

    // 既に決済済みかチェック
    if (existingPair.isSettled) {
      return NextResponse.json(
        { error: "このペアは既に決済済みです" },
        { status: 400 }
      );
    }

    // ペアを決済済みに更新
    const settledPair = await prisma.pair.update({
      where: { id: pairId },
      data: {
        isSettled: true,
        settledAt: new Date(),
      },
    });

    return NextResponse.json(settledPair);
  } catch (error) {
    console.error("決済処理エラー:", error);
    return NextResponse.json(
      { error: "決済処理に失敗しました" },
      { status: 500 }
    );
  }
}
