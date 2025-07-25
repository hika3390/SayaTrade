
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { LoadingSpinner } from '@/app/components/loading-spinner';
import { AuthModal } from '@/app/components/auth/auth-modal';
import { Button } from '@/app/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ログインが必要です
              </h2>
              <p className="text-gray-600 mb-6">
                この機能を使用するにはアカウントにログインしてください
              </p>
              <Button 
                onClick={() => setAuthModalOpen(true)}
                size="lg"
                className="w-full sm:w-auto"
              >
                ログイン / 新規登録
              </Button>
            </div>
          </div>
        )}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  return <>{children}</>;
}
