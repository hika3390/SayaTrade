"use client";

import { CompanyList } from "@/app/components/company-list";
import { Navigation } from "@/app/components/layout/navigation";

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <CompanyList />
      </main>
    </div>
  );
}
