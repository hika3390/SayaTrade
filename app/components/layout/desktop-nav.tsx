'use client';

import { useAuth } from '@/app/contexts/auth-context';
import { ViewType, NavigationItem } from './navigation-items';

interface DesktopNavProps {
  navigationItems: NavigationItem[];
  currentView: ViewType;
  onNavigation: (path: string) => void;
}

export function DesktopNav({ navigationItems, currentView, onNavigation }: DesktopNavProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => (
        <button 
          key={item.key}
          className={`nav-item ${currentView === item.key ? 'nav-item-active' : ''}`}
          onClick={() => onNavigation(item.path)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
