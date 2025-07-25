'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import { Button } from '@/app/components/ui/button';

interface UserMenuProps {
  onAuthModalOpen: () => void;
}

export function UserMenu({ onAuthModalOpen }: UserMenuProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();

  // 外部クリック検知でユーザーメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={onAuthModalOpen}
        variant="outline"
        size="sm"
      >
        ログイン
      </Button>
    );
  }

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-medium">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium">{user.name || user.email}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-medium text-foreground truncate">
                {user.name || 'ユーザー'}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
