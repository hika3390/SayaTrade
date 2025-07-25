"use client";

import { DuplicatePairsView } from "@/app/components/duplicate-pairs-view";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

export default function DuplicatePairsPage() {
  return (
    <ProtectedRoute>
      <DuplicatePairsView />
    </ProtectedRoute>
  );
}
