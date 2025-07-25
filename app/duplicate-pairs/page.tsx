"use client";

import { DuplicatePairsView } from "@/app/components/duplicate-pairs-view";
import { Navigation } from "@/app/components/layout/navigation";
import { useRouter } from "next/navigation";

export default function DuplicatePairsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/companies');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <DuplicatePairsView onBack={handleBack} />
      </main>
    </div>
  );
}
