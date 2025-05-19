import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発環境では、ホットリロード時に複数のPrismaClientインスタンスが作成されるのを防ぐ
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
