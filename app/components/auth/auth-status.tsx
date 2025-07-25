'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { Button } from '@/app/components/ui/button';

interface AuthStatusProps {
  onLoginClick?: () => void;
}

export function AuthStatus({ onLoginClick }: AuthStatusProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">認証状態を確認中...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-lg font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {user.name ? `${user.name}さん、こんにちは！` : 'こんにちは！'}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">ログイン中</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">ログインしていません</h3>
          <p className="text-sm text-muted-foreground mb-4">
            アカウントにログインして、すべての機能をご利用ください
          </p>
          <Button onClick={onLoginClick} className="w-full sm:w-auto">
            ログイン / 新規登録
          </Button>
        </div>
      </div>
    </div>
  );
}
