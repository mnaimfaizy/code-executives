import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';

interface ChunkLoadErrorProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  resetErrorBoundary?: () => void;
  variant?: 'page' | 'section' | 'inline';
  maxRetries?: number;
}

/**
 * Component for handling chunk loading failures with retry logic
 * Specifically designed for lazy-loaded component failures
 */
export const ChunkLoadError: React.FC<ChunkLoadErrorProps> = ({
  error,
  onRetry,
  onGoHome,
  resetErrorBoundary,
  variant = 'page',
  maxRetries = 3,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if this is a chunk loading error
  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.name === 'ChunkLoadError';

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Wait a bit before retrying (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      // Clear module cache and retry
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // Trigger retry
      if (resetErrorBoundary) {
        resetErrorBoundary();
      } else if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const getMessage = () => {
    if (!isOnline) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    if (isChunkError) {
      return 'Failed to load this content. This might be due to a network issue or an outdated cached version.';
    }

    return 'An error occurred while loading this content.';
  };

  const getTitle = () => {
    if (!isOnline) {
      return 'Connection Lost';
    }

    if (isChunkError) {
      return 'Loading Failed';
    }

    return 'Something Went Wrong';
  };

  if (variant === 'inline') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Failed to load content</p>
            <p className="text-sm text-yellow-700 mt-1">{getMessage()}</p>
            <button
              onClick={handleRetry}
              disabled={isRetrying || retryCount >= maxRetries || !isOnline}
              className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const containerClass =
    variant === 'section'
      ? 'rounded-xl border border-yellow-200 bg-white shadow-sm p-6'
      : 'min-h-[400px] flex items-center justify-center p-6';

  return (
    <div className={containerClass}>
      <div className="max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            {!isOnline ? (
              <WifiOff className="h-8 w-8 text-yellow-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>

        <p className="text-gray-600 mb-4">{getMessage()}</p>

        {!isOnline && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <WifiOff className="h-4 w-4" />
            <span>No internet connection detected</span>
          </div>
        )}

        {retryCount > 0 && retryCount < maxRetries && (
          <p className="text-sm text-gray-500 mb-4">
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}

        {retryCount >= maxRetries && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">
              Maximum retry attempts reached. Please refresh the page or try again later.
            </p>
          </div>
        )}

        {import.meta.env.DEV && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">{error.toString()}</pre>
              {error.stack && <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={isRetrying || retryCount >= maxRetries || !isOnline}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {retryCount >= maxRetries ? 'Max Retries Reached' : 'Try Again'}
              </>
            )}
          </button>

          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>
        </div>

        {!isOnline && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-sm font-medium text-blue-900 mb-2">
              <Wifi className="inline h-4 w-4 mr-1" />
              Troubleshooting Tips:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Check your Wi-Fi or cellular connection</li>
              <li>Try disabling and re-enabling airplane mode</li>
              <li>Restart your router if using Wi-Fi</li>
              <li>Contact your network administrator if on a corporate network</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChunkLoadError;
