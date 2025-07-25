"use client";

import { TradingHistory } from "@/app/components/trading-history";
import { Navigation } from "@/app/components/layout/navigation";

export default function TradingHistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <TradingHistory />
      </main>
    </div>
  );
}
