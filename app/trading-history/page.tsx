"use client";

import { TradingHistory } from "@/app/components/trading-history";
import { Navigation } from "@/app/components/layout/navigation";
import { useRouter } from "next/navigation";

export default function TradingHistoryPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/companies');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <TradingHistory onBack={handleBack} />
      </main>
    </div>
  );
}
