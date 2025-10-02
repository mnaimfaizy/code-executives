import { Suspense, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { LoadingFallback } from '../feedback/LoadingFallback';

interface SuspenseRouteProps {
  children: ReactElement;
  fallback?: ReactElement;
}

/**
 * Wrapper component that adds Suspense boundary to lazy-loaded route components.
 * This ensures loading states are shown during navigation between routes.
 * In development mode, adds a small delay to make loading states visible.
 */
export const SuspenseRoute: React.FC<SuspenseRouteProps> = ({
  children,
  fallback = <LoadingFallback message="Loading content..." />,
}) => {
  const [showContent, setShowContent] = useState(false);

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

  return <Suspense fallback={fallback}>{showContent ? children : fallback}</Suspense>;
};

export default SuspenseRoute;
