"use client";

import { TradingHistory } from "@/app/components/trading-history";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

export default function TradingHistoryPage() {
  return (
    <ProtectedRoute>
      <TradingHistory />
    </ProtectedRoute>
  );
}
