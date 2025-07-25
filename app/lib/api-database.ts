import { prisma } from './prisma';

// データベース操作の共通関数
export async function findCompanyById(id: number) {
  return await prisma.company.findUnique({
    where: { id },
  });
}

export async function findPairById(id: number) {
  return await prisma.pair.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });
}

// 損益情報をデータベースに保存する関数
export async function saveProfitLossToDatabase(
  pairId: number,
  currentBuyPrice: number | null,
  currentSellPrice: number | null,
  profitLoss: number | null,
  buyProfitLoss: number | null,
  sellProfitLoss: number | null
): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (currentBuyPrice !== null) {
      updateData.currentBuyPrice = currentBuyPrice;
    }
    
    if (currentSellPrice !== null) {
      updateData.currentSellPrice = currentSellPrice;
    }
    
    if (profitLoss !== null) {
      updateData.profitLoss = profitLoss;
    }
    
    if (buyProfitLoss !== null) {
      updateData.buyProfitLoss = buyProfitLoss;
    }
    
    if (sellProfitLoss !== null) {
      updateData.sellProfitLoss = sellProfitLoss;
    }
    
    await prisma.pair.update({
      where: { id: pairId },
      data: updateData,
    });
    console.log(`ペアID ${pairId} の損益情報を保存しました`);
  } catch (error) {
    console.error(`ペアID ${pairId} の損益情報の保存に失敗しました:`, error);
    throw error;
  }
}
