import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Pre-built skeleton layouts
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton height={200} className="rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton height={400} />
        <Skeleton height={300} />
      </div>
      <div className="space-y-4">
        <Skeleton height={150} />
        <Skeleton height={150} />
        <Skeleton height={150} />
      </div>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <Skeleton width="60%" height={24} />
    <Skeleton height={16} />
    <Skeleton height={16} />
    <Skeleton height={16} width="80%" />
  </div>
);

export default Skeleton;
