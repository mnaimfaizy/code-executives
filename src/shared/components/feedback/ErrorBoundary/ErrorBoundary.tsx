import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ChunkLoadError } from '../ChunkLoadError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'app' | 'feature' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Error Boundary Caught:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      // errorTrackingService.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  isChunkLoadError = (error: Error | null): boolean => {
    if (!error) return false;

    return (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use specialized ChunkLoadError component for chunk loading failures
      if (this.isChunkLoadError(this.state.error)) {
        const { level = 'component' } = this.props;
        return (
          <ChunkLoadError
            error={this.state.error || undefined}
            resetErrorBoundary={this.handleReset}
            onGoHome={this.handleGoHome}
            variant={level === 'app' ? 'page' : 'section'}
            maxRetries={3}
          />
        );
      }

      const { level = 'component' } = this.props;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-200 shadow-lg p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {level === 'app' ? 'Application Error' : 'Something went wrong'}
            </h2>

            <p className="text-gray-600 mb-6">
              {level === 'app'
                ? 'The application encountered an unexpected error.'
                : 'This section encountered an error. You can try refreshing or return to the home page.'}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details
                </summary>
                <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 overflow-auto max-h-40">
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              {level !== 'app' && (
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
