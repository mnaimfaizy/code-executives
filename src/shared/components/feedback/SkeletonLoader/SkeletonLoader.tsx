import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'page' | 'section' | 'card' | 'text' | 'visualization';
  count?: number;
  className?: string;
}

/**
 * Skeleton loader component for better loading states
 * Provides content placeholders during lazy loading
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'section',
  count = 1,
  className = '',
}) => {
  const baseClasses =
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded';

  const renderSkeleton = () => {
    switch (variant) {
      case 'page':
        return (
          <div className={`space-y-6 ${className}`}>
            {/* Hero section skeleton */}
            <div className="text-center space-y-4 mb-8">
              <div className={`${baseClasses} h-12 w-3/4 mx-auto`} />
              <div className={`${baseClasses} h-6 w-2/3 mx-auto`} />
              <div className={`${baseClasses} h-6 w-1/2 mx-auto`} />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${baseClasses} h-24 rounded-xl`} />
              ))}
            </div>

            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${baseClasses} h-64 rounded-xl`} />
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className={`${baseClasses} h-48 rounded-xl`} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'section':
        return (
          <div className={`space-y-4 ${className}`}>
            <div className={`${baseClasses} h-8 w-1/2`} />
            <div className={`${baseClasses} h-4 w-full`} />
            <div className={`${baseClasses} h-4 w-5/6`} />
            <div className={`${baseClasses} h-4 w-4/5`} />
            <div className={`${baseClasses} h-48 mt-4 rounded-xl`} />
          </div>
        );

      case 'card':
        return (
          <div className={`space-y-3 p-6 border border-gray-200 rounded-xl ${className}`}>
            <div className={`${baseClasses} h-6 w-3/4`} />
            <div className={`${baseClasses} h-4 w-full`} />
            <div className={`${baseClasses} h-4 w-5/6`} />
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`${baseClasses} h-4 ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />
            ))}
          </div>
        );

      case 'visualization':
        return (
          <div className={`space-y-4 ${className}`}>
            <div className={`${baseClasses} h-8 w-1/3 mx-auto`} />
            <div className={`${baseClasses} h-64 rounded-xl`} />
            <div className="flex justify-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${baseClasses} h-10 w-10 rounded-lg`} />
              ))}
            </div>
          </div>
        );

      default:
        return <div className={`${baseClasses} h-32 rounded-xl ${className}`} />;
    }
  };

  return (
    <div className="animate-fadeIn">
      {count > 1 && variant !== 'text' ? (
        <div className="space-y-6">
          {[...Array(count)].map((_, i) => (
            <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
          ))}
        </div>
      ) : (
        renderSkeleton()
      )}
    </div>
  );
};

// Preset skeleton variants for common use cases
export const PageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <SkeletonLoader variant="page" className={className} />
);

export const SectionSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <SkeletonLoader variant="section" className={className} />
);

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className,
}) => <SkeletonLoader variant="card" count={count} className={className} />;

export const VisualizationSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <SkeletonLoader variant="visualization" className={className} />
);

export default SkeletonLoader;
