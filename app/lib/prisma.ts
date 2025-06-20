import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
declare global {
  var prisma: PrismaClient | undefined;
}

// 動的にデータベースURLを設定してPrismaClientを作成
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  // 環境変数の存在確認
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in environment variables');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Initializing Prisma Client with DATABASE_URL:', databaseUrl.substring(0, 20) + '...');

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
};

// 開発環境では、ホットリロード時に複数のPrismaClientインスタンスが作成されるのを防ぐ
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// 接続テスト関数
export const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// アプリケーション終了時の接続クリーンアップ
export const disconnectPrisma = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};
