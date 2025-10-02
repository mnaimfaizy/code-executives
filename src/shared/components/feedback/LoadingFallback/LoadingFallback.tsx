import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageSkeleton, SectionSkeleton, VisualizationSkeleton } from '../SkeletonLoader';

interface LoadingFallbackProps {
  message?: string;
  variant?: 'spinner' | 'minimal' | 'skeleton-page' | 'skeleton-section' | 'skeleton-viz';
  showMessage?: boolean;
}

/**
 * Enhanced loading fallback component with skeleton loaders
 * Provides better UX during lazy loading with content placeholders
 */
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  variant = 'spinner',
  showMessage = false,
}) => {
  // Minimal spinner for inline loading states
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Skeleton loaders for better perceived performance
  if (variant === 'skeleton-page') {
    return (
      <div className="animate-fadeIn">
        <PageSkeleton />
        {showMessage && (
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {message}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'skeleton-section') {
    return (
      <div className="animate-fadeIn">
        <SectionSkeleton />
        {showMessage && (
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {message}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'skeleton-viz') {
    return (
      <div className="animate-fadeIn">
        <VisualizationSkeleton />
        {showMessage && (
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {message}
          </div>
        )}
      </div>
    );
  }

  // Default centered spinner
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
