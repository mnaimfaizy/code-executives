import React, { useState } from 'react';

const ErrorHandling: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState('basics');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 via-white to-orange-50 rounded-2xl p-8 mb-8 border border-red-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RxJS Error Handling</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Build resilient reactive applications with robust error handling strategies and recovery
            patterns
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Error Fundamentals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Understanding RxJS Errors
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* How Errors Work */}
            <div className="bg-white rounded-xl p-8 border border-red-200 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Propagation</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                In RxJS, <strong>errors terminate the stream</strong> immediately. Once an error
                occurs, no more values can be emitted, and all subscribers receive the error
                notification.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Immediate Termination:</strong> Stream stops on first error
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>No Recovery:</strong> Stream cannot continue naturally
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Error Boundary:</strong> Must be handled explicitly
                  </span>
                </div>
              </div>
            </div>

            {/* Error vs Exception */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Error Types</h3>
              <div className="space-y-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Synchronous Errors</h4>
                  <div className="bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// Thrown immediately
const source$ = new Observable(subscriber => {
  subscriber.next(1);
  throw new Error('Sync error');
  subscriber.next(2); // Never reached
});`}
                    </pre>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">⚡ Asynchronous Errors</h4>
                  <div className="bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// From async operations
const apiCall$ = ajax.get('/api/data').pipe(
  map(response => {
    if (!response.data) {
      throw new Error('No data received');
    }
    return response.data;
  })
);`}
                    </pre>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">🌐 Network Errors</h4>
                  <div className="bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// HTTP errors, timeouts, network failures
const httpRequest$ = ajax.get('/api/users').pipe(
  timeout(5000), // TimeoutError after 5s
  catchError(error => {
    if (error.name === 'TimeoutError') {
      return throwError('Request timed out');
    }
    return throwError(error);
  })
);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling Strategies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Error Handling Strategies
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Strategy Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'basics', label: 'Error Basics', icon: '🔍', color: 'red' },
                { id: 'catch', label: 'Catch & Replace', icon: '🛡️', color: 'blue' },
                { id: 'retry', label: 'Retry Patterns', icon: '🔄', color: 'green' },
                { id: 'advanced', label: 'Advanced Strategies', icon: '⚡', color: 'purple' },
                { id: 'testing', label: 'Testing Errors', icon: '🧪', color: 'orange' },
              ].map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setActiveStrategy(strategy.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeStrategy === strategy.id
                      ? `border-${strategy.color}-500 text-${strategy.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{strategy.icon}</span>
                  <span>{strategy.label}</span>
                </button>
              ))}
            </div>

            {/* Strategy Content */}
            <div className="max-w-5xl mx-auto">
              {activeStrategy === 'basics' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Handling Basics</h3>
                    <p className="text-gray-600">
                      Fundamental patterns for detecting and responding to errors
                    </p>
                  </div>

                  {/* Basic Error Handling */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Subscribe Error Handler
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`// Basic error handling in subscription
source$.subscribe({
  next: value => {
    console.log('Received:', value);
    updateUI(value);
  },
  error: error => {
    console.error('Stream error:', error);
    showErrorMessage(error.message);
    // Stream is now terminated
  },
  complete: () => {
    console.log('Stream completed successfully');
    hideLoadingSpinner();
  }
});

// Alternative syntax
source$.subscribe(
  value => console.log(value),    // next
  error => console.error(error),  // error
  () => console.log('complete')   // complete
);`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-red-100 rounded-lg p-4">
                          <h5 className="font-semibold text-red-800 mb-2">Key Points:</h5>
                          <ul className="space-y-1 text-sm text-red-700">
                            <li>• Error handler receives the error object</li>
                            <li>• Stream terminates immediately after error</li>
                            <li>• Complete handler won't be called</li>
                            <li>• Subscription is automatically unsubscribed</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Marble Diagram:</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border">
                            <div className="text-gray-600">Source: --1--2--3--X</div>
                            <div className="text-red-600">Error: Stream terminated</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Detection */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Error Detection Patterns
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-white overflow-x-auto">
                          {`// 1. Try-catch in operators
source$.pipe(
  map(value => {
    try {
      return riskyTransformation(value);
    } catch (error) {
      throw new Error(\`Transformation failed: \${error.message}\`);
    }
  })
).subscribe({
  error: error => console.error(error)
});

// 2. Validation with errors
source$.pipe(
  map(data => {
    if (!data || !data.id) {
      throw new Error('Invalid data: missing required fields');
    }
    if (data.id < 0) {
      throw new Error('Invalid ID: must be positive');
    }
    return data;
  })
).subscribe({
  next: validData => processData(validData),
  error: error => handleValidationError(error)
});

// 3. Conditional error throwing
source$.pipe(
  switchMap(userId => {
    if (!userId) {
      return throwError(new Error('User ID is required'));
    }
    return ajax.get(\`/api/users/\${userId}\`);
  })
).subscribe({
  next: user => displayUser(user),
  error: error => showUserError(error)
});`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Global Error Handling */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Global Error Handling</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Global error handler service
class GlobalErrorHandler {
  private errorSubject = new Subject<ErrorInfo>();
  
  // Observable for components to subscribe to
  errors$ = this.errorSubject.asObservable();
  
  handleError(error: any, context?: string) {
    const errorInfo: ErrorInfo = {
      error,
      context: context || 'Unknown',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log to console
    console.error(\`[Global Error Handler] \${context}:\`, error);
    
    // Send to error reporting service
    this.reportError(errorInfo);
    
    // Notify subscribers
    this.errorSubject.next(errorInfo);
  }
  
  private reportError(errorInfo: ErrorInfo) {
    // Send to external error tracking service
    // Sentry, LogRocket, etc.
    ajax.post('/api/errors', errorInfo).subscribe({
      error: err => console.warn('Failed to report error:', err)
    });
  }
}

// Usage in components
const errorHandler = new GlobalErrorHandler();

// Subscribe to global errors
errorHandler.errors$.subscribe(errorInfo => {
  showToastNotification(\`Error: \${errorInfo.error.message}\`);
});

// Use in streams
source$.subscribe({
  next: value => processValue(value),
  error: error => errorHandler.handleError(error, 'Data Processing')
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategy === 'catch' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Catch & Replace Strategies
                    </h3>
                    <p className="text-gray-600">
                      Handle errors gracefully by providing fallback values or alternative streams
                    </p>
                  </div>

                  {/* catchError Operator */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      catchError() - The Primary Error Handler
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { catchError, of, EMPTY } from 'rxjs';

// 1. Return fallback value
source$.pipe(
  catchError(error => {
    console.error('Caught error:', error);
    return of('fallback value');
  })
).subscribe(value => {
  console.log(value); // Will receive fallback
});

// 2. Return empty stream (completes immediately)
source$.pipe(
  catchError(error => {
    logError(error);
    return EMPTY; // Stream completes with no values
  })
).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Stream completed')
});

// 3. Return alternative stream
source$.pipe(
  catchError(error => {
    if (error.status === 404) {
      // Try alternative data source
      return ajax.get('/api/fallback-data');
    }
    // Re-throw other errors
    return throwError(error);
  })
).subscribe(data => displayData(data));`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Return Options:</h5>
                          <ul className="space-y-1 text-sm text-blue-700">
                            <li>
                              • <strong>of(value):</strong> Single fallback value
                            </li>
                            <li>
                              • <strong>EMPTY:</strong> Complete immediately
                            </li>
                            <li>
                              • <strong>NEVER:</strong> Never complete or emit
                            </li>
                            <li>
                              • <strong>Alternative Observable:</strong> Switch data source
                            </li>
                            <li>
                              • <strong>throwError():</strong> Re-throw or transform error
                            </li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Marble Diagram:</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border">
                            <div className="text-gray-600">Source: --1--2--X</div>
                            <div className="text-blue-600">catchError: of('fallback')</div>
                            <div className="text-green-600">Output: --1--2--fallback|</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditional Error Handling */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Conditional Error Handling
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Handle different error types differently
source$.pipe(
  catchError(error => {
    // Network errors - retry with exponential backoff
    if (error.name === 'HttpErrorResponse' && error.status >= 500) {
      return throwError(error); // Let retry handler deal with it
    }
    
    // Authentication errors - redirect to login
    if (error.status === 401) {
      authService.logout();
      router.navigate(['/login']);
      return EMPTY;
    }
    
    // Permissions errors - show message and continue
    if (error.status === 403) {
      showPermissionDeniedMessage();
      return of({ error: 'Permission denied', data: null });
    }
    
    // Client errors - show user-friendly message
    if (error.status >= 400 && error.status < 500) {
      const userMessage = getUserFriendlyErrorMessage(error);
      showErrorToast(userMessage);
      return of({ error: userMessage, data: null });
    }
    
    // Unknown errors - log and show generic message
    console.error('Unexpected error:', error);
    showErrorToast('Something went wrong. Please try again.');
    return of({ error: 'Unknown error', data: null });
  })
).subscribe(result => {
  if (result.error) {
    handleErrorResult(result);
  } else {
    handleSuccessfulResult(result);
  }
});

function getUserFriendlyErrorMessage(error: any): string {
  const errorMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    404: 'The requested resource was not found.',
    409: 'This operation conflicts with existing data.',
    422: 'The data provided is invalid.',
    429: 'Too many requests. Please wait a moment.'
  };
  
  return errorMessages[error.status] || 'An error occurred while processing your request.';
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Error Recovery Chains */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Error Recovery Chains</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Multi-level error recovery
const fetchUserData = (userId: string) => {
  return ajax.get(\`/api/users/\${userId}\`).pipe(
    // First fallback: try cache
    catchError(error => {
      console.log('Primary API failed, trying cache...');
      return cacheService.getUser(userId).pipe(
        map(cachedUser => ({ ...cachedUser, fromCache: true }))
      );
    }),
    
    // Second fallback: try alternative API
    catchError(error => {
      console.log('Cache failed, trying alternative API...');
      return ajax.get(\`/api/v1/users/\${userId}\`).pipe(
        map(response => ({ ...response.data, fromLegacyAPI: true }))
      );
    }),
    
    // Final fallback: return placeholder
    catchError(error => {
      console.log('All sources failed, using placeholder');
      return of({
        id: userId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        isPlaceholder: true
      });
    })
  );
};

// Usage
fetchUserData('123').subscribe(user => {
  if (user.isPlaceholder) {
    showPlaceholderWarning();
  } else if (user.fromCache) {
    showCacheWarning();
  } else if (user.fromLegacyAPI) {
    showLegacyAPIWarning();
  }
  
  displayUser(user);
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategy === 'retry' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Retry Patterns</h3>
                    <p className="text-gray-600">
                      Automatically retry failed operations with intelligent backoff strategies
                    </p>
                  </div>

                  {/* Basic Retry */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">retry() - Simple Retry</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { retry, delay } from 'rxjs/operators';

// Retry up to 3 times
source$.pipe(
  retry(3)
).subscribe({
  next: value => console.log(value),
  error: error => {
    // Only called after all retries exhausted
    console.error('Failed after 3 retries:', error);
  }
});

// Retry with delay between attempts
source$.pipe(
  retryWhen(errors => errors.pipe(
    delay(1000), // Wait 1 second between retries
    take(3)      // Max 3 retries
  ))
).subscribe({
  next: value => handleSuccess(value),
  error: error => handleFinalFailure(error)
});

// Immediate retry for specific errors only
source$.pipe(
  retryWhen(errors => errors.pipe(
    filter(error => error.status >= 500), // Only server errors
    delay(500),
    take(2)
  ))
).subscribe(handleResult);`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-green-100 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2">Retry Strategies:</h5>
                          <ul className="space-y-1 text-sm text-green-700">
                            <li>
                              • <strong>retry(n):</strong> Immediate retry up to n times
                            </li>
                            <li>
                              • <strong>retryWhen:</strong> Custom retry logic
                            </li>
                            <li>
                              • <strong>Conditional:</strong> Retry only specific errors
                            </li>
                            <li>
                              • <strong>Delayed:</strong> Wait between attempts
                            </li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Marble Diagram:</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border">
                            <div className="text-gray-600">Attempt 1: --1--X</div>
                            <div className="text-gray-600">Attempt 2: --1--2--3|</div>
                            <div className="text-green-600">Output: --1----1--2--3|</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exponential Backoff */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Exponential Backoff</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Exponential backoff with jitter
const exponentialBackoffRetry = (maxRetries: number = 3, baseDelay: number = 1000) => {
  return (source: Observable<any>) => source.pipe(
    retryWhen(errors => errors.pipe(
      scan((retryCount, error) => {
        if (retryCount >= maxRetries) {
          throw error; // Give up after max retries
        }
        return retryCount + 1;
      }, 0),
      
      // Calculate delay with exponential backoff + jitter
      delayWhen(retryCount => {
        const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
        const jitter = Math.random() * 1000; // Add randomness
        const totalDelay = exponentialDelay + jitter;
        
        console.log(\`Retry \${retryCount} in \${totalDelay}ms\`);
        return timer(totalDelay);
      })
    ))
  );
};

// Usage
const fetchWithBackoff = ajax.get('/api/data').pipe(
  exponentialBackoffRetry(3, 1000), // 3 retries, starting with 1s delay
  catchError(error => {
    console.error('All retries failed:', error);
    return of({ error: 'Service temporarily unavailable' });
  })
);

fetchWithBackoff.subscribe(result => {
  if (result.error) {
    showServiceUnavailableMessage();
  } else {
    displayData(result);
  }
});

// Advanced retry with circuit breaker pattern
class CircuitBreakerRetry {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 30000; // 30 seconds
  
  retryWithCircuitBreaker<T>() {
    return (source: Observable<T>) => source.pipe(
      retryWhen(errors => errors.pipe(
        tap(() => {
          this.failureCount++;
          this.lastFailureTime = Date.now();
        }),
        
        switchMap(error => {
          // Circuit is open (too many failures)
          if (this.failureCount >= this.failureThreshold) {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            
            if (timeSinceLastFailure < this.recoveryTimeout) {
              // Still in timeout period
              return throwError('Circuit breaker is open');
            } else {
              // Try to close circuit (half-open state)
              this.failureCount = 0;
              return timer(1000); // Short delay for half-open retry
            }
          }
          
          // Normal retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, this.failureCount - 1), 10000);
          return timer(delay);
        }),
        
        take(this.failureThreshold)
      ))
    );
  }
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Smart Retry Logic */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Smart Retry Logic</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Intelligent retry based on error type and conditions
const smartRetry = <T>(config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    retryableErrors = [500, 502, 503, 504, 'timeout', 'network'],
    onRetry = () => {}
  } = config;
  
  return (source: Observable<T>) => source.pipe(
    retryWhen(errors => errors.pipe(
      scan((acc, error) => {
        const { retryCount, error: lastError } = acc;
        
        // Check if error is retryable
        const isRetryable = retryableErrors.some(retryableError => {
          if (typeof retryableError === 'number') {
            return error.status === retryableError;
          }
          return error.name?.toLowerCase().includes(retryableError) ||
                 error.message?.toLowerCase().includes(retryableError);
        });
        
        if (!isRetryable || retryCount >= maxRetries) {
          throw error;
        }
        
        return { retryCount: retryCount + 1, error };
      }, { retryCount: 0, error: null }),
      
      delayWhen(({ retryCount, error }) => {
        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = Math.min(
          baseDelay * Math.pow(2, retryCount - 1),
          maxDelay
        );
        const jitter = Math.random() * 0.1 * exponentialDelay;
        const totalDelay = exponentialDelay + jitter;
        
        // Call retry callback
        onRetry({ retryCount, error, delay: totalDelay });
        
        return timer(totalDelay);
      })
    ))
  );
};

// Usage
const apiCall$ = ajax.get('/api/users').pipe(
  timeout(5000),
  smartRetry({
    maxRetries: 3,
    baseDelay: 1000,
    retryableErrors: [500, 502, 503, 504, 'timeout'],
    onRetry: ({ retryCount, error, delay }) => {
      console.log(\`Retry \${retryCount} after \${delay}ms due to:\`, error.message);
      showRetryMessage(retryCount, Math.ceil(delay / 1000));
    }
  }),
  catchError(error => {
    console.error('All retries exhausted:', error);
    return of({ error: 'Service is currently unavailable' });
  })
);`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategy === 'advanced' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Advanced Error Strategies
                    </h3>
                    <p className="text-gray-600">
                      Sophisticated patterns for complex error scenarios and recovery mechanisms
                    </p>
                  </div>

                  {/* Error Boundaries */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Stream Error Boundaries
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Isolate errors to prevent stream termination
const createErrorBoundary = <T>(fallbackValue?: T) => {
  return (source: Observable<T>) => source.pipe(
    catchError(error => {
      console.warn('Error boundary caught:', error);
      
      // Log error but don't terminate main stream
      errorReportingService.report(error);
      
      // Return fallback or empty
      return fallbackValue !== undefined ? of(fallbackValue) : EMPTY;
    })
  );
};

// Usage: Process items independently
const items$ = of([1, 2, 3, 4, 5]);

items$.pipe(
  switchMap(items => merge(
    ...items.map(item => 
      processItem(item).pipe(
        createErrorBoundary(\`Error processing item \${item}\`)
      )
    )
  )),
  toArray()
).subscribe(results => {
  console.log('All results (including errors):', results);
  // Continue processing even if some items failed
});

// Error isolation for parallel operations
const parallelOperations$ = forkJoin({
  userData: fetchUser(userId).pipe(
    createErrorBoundary({ id: userId, name: 'Unknown' })
  ),
  preferences: fetchPreferences(userId).pipe(
    createErrorBoundary({ theme: 'default', language: 'en' })
  ),
  permissions: fetchPermissions(userId).pipe(
    createErrorBoundary([])
  )
});

parallelOperations$.subscribe(result => {
  // All operations complete, even if some failed
  initializeApp(result);
});`}
                      </pre>
                    </div>
                  </div>

                  {/* Graceful Degradation */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Graceful Degradation</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Feature degradation based on available services
class FeatureDegradationService {
  private features = new BehaviorSubject<FeatureFlags>({
    realTimeUpdates: true,
    advancedSearch: true,
    recommendations: true,
    analytics: true
  });
  
  features$ = this.features.asObservable();
  
  initializeFeatures() {
    // Test each feature and disable if not working
    const featureTests = [
      this.testRealTimeUpdates(),
      this.testAdvancedSearch(),
      this.testRecommendations(),
      this.testAnalytics()
    ];
    
    forkJoin(featureTests).subscribe(results => {
      const [realTime, search, recommendations, analytics] = results;
      
      this.features.next({
        realTimeUpdates: realTime,
        advancedSearch: search,
        recommendations: recommendations,
        analytics: analytics
      });
    });
  }
  
  private testRealTimeUpdates(): Observable<boolean> {
    return ajax.get('/api/realtime/test').pipe(
      timeout(2000),
      map(() => true),
      catchError(() => {
        console.warn('Real-time updates unavailable, falling back to polling');
        return of(false);
      })
    );
  }
  
  private testAdvancedSearch(): Observable<boolean> {
    return ajax.get('/api/search/advanced/test').pipe(
      timeout(1000),
      map(() => true),
      catchError(() => {
        console.warn('Advanced search unavailable, using basic search');
        return of(false);
      })
    );
  }
  
  // ... other feature tests
}

// Usage in components
const degradationService = new FeatureDegradationService();

degradationService.features$.subscribe(features => {
  if (!features.realTimeUpdates) {
    // Fall back to polling
    startPollingForUpdates();
  }
  
  if (!features.advancedSearch) {
    // Hide advanced search UI
    hideAdvancedSearchOptions();
  }
  
  if (!features.recommendations) {
    // Show static content instead
    showStaticContent();
  }
});`}
                      </pre>
                    </div>
                  </div>

                  {/* Error Recovery Strategies */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Automated Error Recovery
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Self-healing stream with multiple recovery strategies
class SelfHealingStream<T> {
  private healthCheck$ = interval(30000); // Check every 30 seconds
  private isHealthy = true;
  
  create(sourceFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      if (!this.isHealthy) {
        // Wait for health check to pass
        return this.waitForHealthy().pipe(
          switchMap(() => this.createStream(sourceFactory))
        );
      }
      
      return this.createStream(sourceFactory);
    });
  }
  
  private createStream(sourceFactory: () => Observable<T>): Observable<T> {
    return sourceFactory().pipe(
      // Monitor stream health
      tap(() => {
        this.isHealthy = true;
      }),
      
      // Handle errors with progressive recovery
      retryWhen(errors => errors.pipe(
        scan((retryCount, error) => {
          this.isHealthy = false;
          
          // Progressive recovery strategy
          if (retryCount < 2) {
            // Quick retries for transient errors
            return { count: retryCount + 1, delay: 1000 };
          } else if (retryCount < 5) {
            // Medium retries with exponential backoff
            return { count: retryCount + 1, delay: 2000 * Math.pow(2, retryCount - 2) };
          } else {
            // Long recovery attempts
            return { count: retryCount + 1, delay: 60000 }; // 1 minute
          }
        }, { count: 0, delay: 0 }),
        
        delayWhen(({ delay }) => timer(delay)),
        
        // Health check before retry
        switchMap(() => this.performHealthCheck()),
        
        // Limit total retry attempts
        take(10)
      )),
      
      // Final fallback
      catchError(error => {
        console.error('Stream recovery failed:', error);
        return this.getFallbackStream();
      })
    );
  }
  
  private waitForHealthy(): Observable<void> {
    return this.healthCheck$.pipe(
      switchMap(() => this.performHealthCheck()),
      filter(isHealthy => isHealthy),
      take(1),
      map(() => void 0)
    );
  }
  
  private performHealthCheck(): Observable<boolean> {
    return ajax.get('/api/health').pipe(
      timeout(5000),
      map(() => {
        this.isHealthy = true;
        return true;
      }),
      catchError(() => {
        this.isHealthy = false;
        return of(false);
      })
    );
  }
  
  private getFallbackStream(): Observable<T> {
    // Return cached data or offline mode
    return cacheService.getCachedData<T>().pipe(
      map(data => ({ ...data, isOffline: true }))
    );
  }
}

// Usage
const selfHealing = new SelfHealingStream<UserData>();

const userData$ = selfHealing.create(() => 
  ajax.get('/api/user/current').pipe(
    map(response => response.data)
  )
);

userData$.subscribe(user => {
  if (user.isOffline) {
    showOfflineIndicator();
  }
  displayUser(user);
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategy === 'testing' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Testing Error Scenarios
                    </h3>
                    <p className="text-gray-600">
                      Ensure your error handling works correctly with comprehensive testing
                    </p>
                  </div>

                  {/* Basic Error Testing */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Testing Error Handling</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { TestScheduler } from 'rxjs/testing';
import { cold, hot } from 'jasmine-marbles';

describe('Error Handling', () => {
  let testScheduler: TestScheduler;
  
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  
  it('should handle errors with catchError', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('--a--b--#', { a: 1, b: 2 });
      const expected = '    --a--b--c|';
      const expectedValues = { a: 1, b: 2, c: 'error handled' };
      
      const result$ = source$.pipe(
        catchError(() => of('error handled'))
      );
      
      expectObservable(result$).toBe(expected, expectedValues);
    });
  });
  
  it('should retry specified number of times', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('--#', {}, new Error('test error'));
      const expected = '    --------#'; // 3 attempts: --# --# --#
      
      const result$ = source$.pipe(retry(2));
      
      expectObservable(result$).toBe(expected, {}, new Error('test error'));
    });
  });
  
  it('should implement exponential backoff retry', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source$ = cold('--#');
      const expected = '    --    ----    --------#'; // 1s, 2s, 4s delays
      
      const result$ = source$.pipe(
        retryWhen(errors => errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 2) throw error;
            return retryCount + 1;
          }, 0),
          delayWhen(retryCount => timer(1000 * Math.pow(2, retryCount)))
        ))
      );
      
      expectObservable(result$).toBe(expected);
    });
  });
});`}
                      </pre>
                    </div>
                  </div>

                  {/* Mock Error Scenarios */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Mock Error Scenarios</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Error simulation utilities
class ErrorSimulator {
  static networkError(delay = 0): Observable<never> {
    return timer(delay).pipe(
      switchMap(() => throwError({
        name: 'HttpErrorResponse',
        status: 0,
        message: 'Network error'
      }))
    );
  }
  
  static serverError(status = 500, delay = 0): Observable<never> {
    return timer(delay).pipe(
      switchMap(() => throwError({
        name: 'HttpErrorResponse',
        status,
        message: \`Server error: \${status}\`
      }))
    );
  }
  
  static timeoutError(delay = 5000): Observable<never> {
    return timer(delay).pipe(
      switchMap(() => throwError({
        name: 'TimeoutError',
        message: 'Request timed out'
      }))
    );
  }
  
  static intermittentFailure<T>(
    successValue: T, 
    failureRate = 0.3
  ): Observable<T> {
    return defer(() => {
      if (Math.random() < failureRate) {
        return throwError(new Error('Intermittent failure'));
      }
      return of(successValue);
    });
  }
}

// Integration tests
describe('API Service with Error Handling', () => {
  let apiService: ApiService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should handle network errors gracefully', fakeAsync(() => {
    let result: any;
    let error: any;
    
    apiService.getUser(123).subscribe({
      next: value => result = value,
      error: err => error = err
    });
    
    // Simulate network error
    const req = httpMock.expectOne('/api/users/123');
    req.error(new ErrorEvent('Network error'));
    
    tick();
    
    expect(error).toBeDefined();
    expect(error.message).toContain('Network error');
  }));
  
  it('should retry failed requests', fakeAsync(() => {
    let result: any;
    
    apiService.getUserWithRetry(123).subscribe(value => result = value);
    
    // First attempt fails
    const req1 = httpMock.expectOne('/api/users/123');
    req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    
    tick(1000); // Wait for retry delay
    
    // Second attempt succeeds
    const req2 = httpMock.expectOne('/api/users/123');
    req2.flush({ id: 123, name: 'John Doe' });
    
    tick();
    
    expect(result).toEqual({ id: 123, name: 'John Doe' });
  }));
  
  it('should fallback to cache on repeated failures', fakeAsync(() => {
    spyOn(cacheService, 'getUser').and.returnValue(
      of({ id: 123, name: 'Cached User', fromCache: true })
    );
    
    let result: any;
    
    apiService.getUserWithFallback(123).subscribe(value => result = value);
    
    // All attempts fail
    for (let i = 0; i < 3; i++) {
      const req = httpMock.expectOne('/api/users/123');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      tick(1000 * Math.pow(2, i)); // Exponential backoff
    }
    
    expect(result.fromCache).toBe(true);
    expect(cacheService.getUser).toHaveBeenCalledWith(123);
  }));
});`}
                      </pre>
                    </div>
                  </div>

                  {/* Error Monitoring */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Error Monitoring & Metrics
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Error monitoring and metrics collection
class ErrorMonitor {
  private errorMetrics = new BehaviorSubject<ErrorMetrics>({
    totalErrors: 0,
    errorsByType: {},
    errorRate: 0,
    lastError: null
  });
  
  metrics$ = this.errorMetrics.asObservable();
  
  private errorHistory: ErrorRecord[] = [];
  
  trackError(error: any, context?: string) {
    const errorRecord: ErrorRecord = {
      error,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.errorHistory.push(errorRecord);
    
    // Keep only last 100 errors
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift();
    }
    
    this.updateMetrics();
    this.reportToExternalService(errorRecord);
  }
  
  private updateMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentErrors = this.errorHistory.filter(
      record => record.timestamp.getTime() > oneHourAgo
    );
    
    const errorsByType = recentErrors.reduce((acc, record) => {
      const errorType = record.error.name || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const metrics: ErrorMetrics = {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorRate: recentErrors.length / 60, // Errors per minute
      lastError: this.errorHistory[this.errorHistory.length - 1] || null
    };
    
    this.errorMetrics.next(metrics);
  }
  
  private reportToExternalService(errorRecord: ErrorRecord) {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    ajax.post('/api/errors', errorRecord).subscribe({
      error: err => console.warn('Failed to report error:', err)
    });
  }
  
  // Create monitoring operator
  monitorErrors<T>(context?: string) {
    return (source: Observable<T>) => source.pipe(
      tap({
        error: error => this.trackError(error, context)
      })
    );
  }
}

// Usage in application
const errorMonitor = new ErrorMonitor();

// Monitor specific streams
const userData$ = ajax.get('/api/user').pipe(
  errorMonitor.monitorErrors('User Data Fetch'),
  catchError(error => of({ error: 'Failed to load user data' }))
);

// Dashboard for error metrics
errorMonitor.metrics$.subscribe(metrics => {
  updateErrorDashboard(metrics);
  
  if (metrics.errorRate > 10) {
    alertHighErrorRate(metrics);
  }
});

// Integration with global error boundary
window.addEventListener('unhandledrejection', event => {
  errorMonitor.trackError(event.reason, 'Unhandled Promise Rejection');
});

window.addEventListener('error', event => {
  errorMonitor.trackError(event.error, 'Global Error Handler');
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Practices Summary */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Error Handling Best Practices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Do's */}
            <div className="bg-white rounded-xl p-8 border border-green-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                ✅ Best Practices
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Always handle errors explicitly in subscriptions</li>
                    <li>• Use catchError to prevent stream termination</li>
                    <li>• Implement retry logic for transient failures</li>
                    <li>• Provide meaningful fallback values</li>
                    <li>• Log errors with sufficient context</li>
                    <li>• Test error scenarios thoroughly</li>
                    <li>• Use error boundaries to isolate failures</li>
                    <li>• Monitor error rates and patterns</li>
                    <li>• Implement graceful degradation</li>
                    <li>• Provide user-friendly error messages</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Don'ts */}
            <div className="bg-white rounded-xl p-8 border border-red-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                ❌ Common Mistakes
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Don't ignore errors in subscriptions</li>
                    <li>• Don't retry non-retryable errors (404, 401)</li>
                    <li>• Don't use infinite retry without limits</li>
                    <li>• Don't swallow errors without logging</li>
                    <li>• Don't expose technical errors to users</li>
                    <li>• Don't forget to unsubscribe on errors</li>
                    <li>• Don't let errors crash the entire app</li>
                    <li>• Don't retry immediately without delays</li>
                    <li>• Don't assume all errors are recoverable</li>
                    <li>• Don't test only happy path scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error Handling Mastered! 🛡️</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            You now have comprehensive knowledge of RxJS error handling strategies. Ready to explore
            real-world examples and build robust reactive applications!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Real-World Examples');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Real-World Examples</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Marble Diagrams');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Marble Diagrams</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorHandling;
