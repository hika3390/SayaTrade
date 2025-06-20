import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JQUANTS_USERNAME: process.env.JQUANTS_USERNAME,
    JQUANTS_PASSWORD: process.env.JQUANTS_PASSWORD,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Amplifyでのビルド最適化
  output: 'standalone',
};

export default nextConfig;
