import { Suspense, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { LoadingFallback } from '../feedback/LoadingFallback';

interface SuspenseRouteProps {
  children: ReactElement;
  fallback?: ReactElement;
  variant?: 'spinner' | 'skeleton-page' | 'skeleton-section';
}

/**
 * Enhanced wrapper component with better Suspense fallbacks.
 * Uses skeleton loaders for improved perceived performance during lazy loading.
 * In development mode, adds a small delay to make loading states visible.
 */
export const SuspenseRoute: React.FC<SuspenseRouteProps> = ({
  children,
  fallback,
  variant = 'skeleton-page',
}) => {
  const [showContent, setShowContent] = useState(false);

  // Use provided fallback or default to skeleton loader based on variant
  const loadingFallback = fallback || (
    <LoadingFallback variant={variant} message="Loading content..." />
  );

  useEffect(() => {
    // Reset when children change (route navigation)
    setShowContent(false);

    // Small delay to ensure loading state is visible
    // In production, this won't matter as network delays will be natural
    const timer = setTimeout(
      () => {
        setShowContent(true);
      },
      import.meta.env.DEV ? 200 : 0
    );

    return () => clearTimeout(timer);
  }, [children]);

  return <Suspense fallback={loadingFallback}>{showContent ? children : loadingFallback}</Suspense>;
};

export default SuspenseRoute;
