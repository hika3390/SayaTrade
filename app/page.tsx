"use client";

import { Dashboard } from "@/app/components/dashboard";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
