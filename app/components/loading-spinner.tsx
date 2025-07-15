import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'データを読み込み中...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${containerClasses[size]} ${className}`}>
      {/* スピナーアニメーション */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
      </div>
      
      {/* ローディングメッセージ */}
      {message && (
        <p className="text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// より高度なローディングアニメーション（ドット）
export const LoadingDots: React.FC<{ message?: string; className?: string }> = ({ 
  message = 'データを読み込み中',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <p className="text-gray-600 font-medium">
        {message}
        <span className="animate-pulse">...</span>
      </p>
    </div>
  );
};

// パルスローディング（カードスケルトン風）
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};
