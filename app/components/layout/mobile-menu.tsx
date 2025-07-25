'use client';

import { useAuth } from '@/app/contexts/auth-context';
import { Button } from '@/app/components/ui/button';
import { ViewType, NavigationItem } from './navigation-items';

interface MobileMenuProps {
  isOpen: boolean;
  navigationItems: NavigationItem[];
  currentView: ViewType;
  onNavigation: (path: string) => void;
  onAuthModalOpen: () => void;
  onClose: () => void;
}

export function MobileMenu({ 
  isOpen, 
  navigationItems, 
  currentView, 
  onNavigation, 
  onAuthModalOpen,
  onClose 
}: MobileMenuProps) {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t bg-card/95 backdrop-blur">
      <div className="py-2 space-y-1">
        {/* ナビゲーション項目 - ログイン時のみ表示 */}
        {user && navigationItems.map((item) => (
          <button
            key={item.key}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
              currentView === item.key ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-foreground'
            }`}
            onClick={() => onNavigation(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* モバイル認証セクション */}
        <div className={`${user ? 'border-t pt-2 mt-2' : 'pt-2'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : user ? (
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium">{user.name || user.email}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="px-4 py-2">
              <Button
                onClick={() => {
                  onAuthModalOpen();
                  onClose();
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                ログイン
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
