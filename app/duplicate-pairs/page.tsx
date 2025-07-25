"use client";

import { DuplicatePairsView } from "@/app/components/duplicate-pairs-view";
import { Navigation } from "@/app/components/layout/navigation";

export default function DuplicatePairsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <DuplicatePairsView />
      </main>
    </div>
  );
}
