"use client";

import { CompanyList } from "@/app/components/company-list";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

export default function CompaniesPage() {
  return (
    <ProtectedRoute>
      <CompanyList />
    </ProtectedRoute>
  );
}
