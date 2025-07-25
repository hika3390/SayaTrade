"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ルートページにアクセスした場合、企業一覧ページにリダイレクト
    router.replace('/companies');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">サヤ取り分配くん</h1>
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
