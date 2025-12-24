import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-brand-orange',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
          style={{
            animation: 'pulse 1.5s ease-in-out infinite, shimmer 2s linear infinite',
          }}
        />
      ))}
    </>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col relative">
      <div className="relative w-full aspect-square bg-gray-100 rounded-xl mb-1.5 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="px-1 py-1.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton className="h-6 w-full" />
        </td>
      ))}
    </tr>
  );
};

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, message = 'جاري التحميل...' }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 font-bold text-lg">{message}</p>
      </div>
    </motion.div>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, size = 'md' }) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      {label && <p className="text-sm text-gray-600 mb-2">{label}</p>}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-brand-orange to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-left">{Math.round(progress)}%</p>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  Skeleton,
  ProductCardSkeleton,
  TableRowSkeleton,
  LoadingOverlay,
  ProgressBar,
  EmptyState
};
