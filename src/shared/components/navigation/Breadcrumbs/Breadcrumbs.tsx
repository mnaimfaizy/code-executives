import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs component for navigation hierarchy
 * Shows the current location in the application hierarchy and provides
 * quick navigation to parent pages.
 *
 * @component
 * @example
 * ```tsx
 * <Breadcrumbs />
 * ```
 *
 * **Features:**
 * - Automatically generates breadcrumbs from current URL path
 * - Home icon for root navigation
 * - Accessible keyboard navigation
 * - ARIA labels for screen readers
 */
export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null;
  }

  // Format pathname to readable text
  const formatPathname = (pathname: string): string => {
    return pathname
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home Link */}
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
            aria-label="Go to home page"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Path Segments */}
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={pathname} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" aria-hidden="true" />
              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {formatPathname(pathname)}
                </span>
              ) : (
                <Link to={routeTo} className="text-gray-500 hover:text-gray-700 transition-colors">
                  {formatPathname(pathname)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
