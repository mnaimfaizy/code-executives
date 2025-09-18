import React, { useState } from 'react';

const AdvancedOperators: React.FC = () => {
  const [activeOperator, setActiveOperator] = useState('switchmap');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-2xl p-8 mb-8 border border-purple-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced RxJS Operators</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Master higher-order operators for complex asynchronous data flows and concurrency
            control
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Higher-Order Operators Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Higher-Order Operators
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What are Higher-Order Operators */}
            <div className="bg-white rounded-xl p-8 border border-purple-200 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Observable of Observables</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Higher-order operators handle{' '}
                <strong>Observables that emit other Observables</strong>. They provide different
                strategies for flattening these nested streams.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Flattening:</strong> Combines inner Observables into a single stream
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Concurrency:</strong> Controls how many inner Observables run
                    simultaneously
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Cancellation:</strong> Manages when to cancel previous inner
                    subscriptions
                  </span>
                </div>
              </div>
            </div>

            {/* The Problem They Solve */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Problem They Solve</h3>
              <div className="space-y-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">
                    ❌ Without Higher-Order Operators
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// This creates Observable<Observable<Response>>
const searches$ = searchTerm$.pipe(
  map(term => http.get(\`/api/search?q=\${term}\`))
);

// You can't directly subscribe to nested Observables
searches$.subscribe(innerObservable => {
  // innerObservable is still an Observable!
  innerObservable.subscribe(response => {
    // Finally get the actual response
    console.log(response);
  });
});`}
                    </pre>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ With Higher-Order Operators
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// This creates Observable<Response>
const searches$ = searchTerm$.pipe(
  switchMap(term => 
    http.get(\`/api/search?q=\${term}\`)
  )
);

// Clean, direct subscription
searches$.subscribe(response => {
  console.log(response); // Direct response!
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Types Navigation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            The Big Four: Flattening Operators
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Operator Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                {
                  id: 'switchmap',
                  label: 'switchMap',
                  icon: '🔄',
                  color: 'purple',
                  description: 'Cancel previous',
                },
                {
                  id: 'mergemap',
                  label: 'mergeMap',
                  icon: '🌊',
                  color: 'blue',
                  description: 'Run concurrent',
                },
                {
                  id: 'concatmap',
                  label: 'concatMap',
                  icon: '⏭️',
                  color: 'green',
                  description: 'Queue sequential',
                },
                {
                  id: 'exhaustmap',
                  label: 'exhaustMap',
                  icon: '🚫',
                  color: 'orange',
                  description: 'Ignore while busy',
                },
              ].map((operator) => (
                <button
                  key={operator.id}
                  onClick={() => setActiveOperator(operator.id)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex flex-col items-center space-y-1 ${
                    activeOperator === operator.id
                      ? `border-${operator.color}-500 text-${operator.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{operator.icon}</span>
                    <span>{operator.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{operator.description}</span>
                </button>
              ))}
            </div>

            {/* Operator Content */}
            <div className="max-w-5xl mx-auto">
              {activeOperator === 'switchmap' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">switchMap</h3>
                    <p className="text-gray-600">
                      Cancels the previous inner Observable when a new one arrives
                    </p>
                  </div>

                  {/* How it Works */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">How switchMap Works</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { switchMap, fromEvent } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const searchInput = document.getElementById('search');

fromEvent(searchInput, 'input').pipe(
  // Extract the search term
  map(event => event.target.value),
  
  // Debounce to avoid too many requests
  debounceTime(300),
  
  // Switch to new search, canceling previous
  switchMap(searchTerm => 
    ajax.get(\`/api/search?q=\${searchTerm}\`)
  )
).subscribe(response => {
  displaySearchResults(response.data);
});`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-purple-100 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-800 mb-2">Behavior:</h5>
                          <ul className="space-y-1 text-sm text-purple-700">
                            <li>• Only latest inner Observable emits</li>
                            <li>• Previous requests are cancelled</li>
                            <li>• Perfect for search-as-you-type</li>
                            <li>• Prevents race conditions</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Best For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Search suggestions</li>
                            <li>• Auto-complete</li>
                            <li>• Navigation (route changes)</li>
                            <li>• Latest data fetching</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">switchMap Timeline</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="font-mono text-sm space-y-2">
                        <div className="text-gray-600">Source: --a-----b-----c-----|</div>
                        <div className="text-purple-600">Inner a: --1--2--3--4--5--|</div>
                        <div className="text-purple-600">Inner b: --6--7--8--9--|</div>
                        <div className="text-purple-600">Inner c: --10-11-12--|</div>
                        <div className="text-green-600">Output: -----1--6-----10-11-12--|</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Notice how inner 'a' is cancelled when 'b' starts, and inner 'b' is
                        cancelled when 'c' starts.
                      </p>
                    </div>
                  </div>

                  {/* Real-World Example */}
                  <div className="bg-purple-100 rounded-xl p-6 border border-purple-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Real-World: Auto-complete Search
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Search service with cancellation
class SearchService {
  search(query: string): Observable<SearchResult[]> {
    return ajax.get(\`/api/search?q=\${encodeURIComponent(query)}\`).pipe(
      map(response => response.data),
      catchError(() => of([])) // Graceful error handling
    );
  }
}

// Auto-complete component
class AutoCompleteComponent {
  private searchInput$ = new Subject<string>();
  private searchService = new SearchService();
  
  suggestions$ = this.searchInput$.pipe(
    // Wait for user to stop typing
    debounceTime(300),
    
    // Don't search for empty queries
    filter(query => query.length > 2),
    
    // Cancel previous search when new query comes
    switchMap(query => 
      this.searchService.search(query).pipe(
        // Start with loading state
        startWith({ loading: true }),
        
        // Add query context
        map(results => ({ query, results, loading: false }))
      )
    )
  );
  
  onInputChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchInput$.next(query);
  }
}

// Usage in template
this.suggestions$.subscribe(state => {
  if (state.loading) {
    showLoadingSpinner();
  } else {
    displaySuggestions(state.results);
  }
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeOperator === 'mergemap' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">mergeMap</h3>
                    <p className="text-gray-600">
                      Runs all inner Observables concurrently - no cancellation
                    </p>
                  </div>

                  {/* How it Works */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">How mergeMap Works</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { mergeMap, fromEvent } from 'rxjs';

// Handle multiple file uploads concurrently
const fileInput = document.getElementById('files');

fromEvent(fileInput, 'change').pipe(
  // Get selected files
  map(event => Array.from(event.target.files)),
  
  // Flatten the file array
  switchMap(files => from(files)),
  
  // Upload each file concurrently
  mergeMap(file => 
    uploadFile(file).pipe(
      map(response => ({ file: file.name, ...response }))
    )
  )
).subscribe(uploadResult => {
  console.log(\`\${uploadResult.file} uploaded!\`);
  updateProgressBar(uploadResult);
});

function uploadFile(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  return ajax.post('/api/upload', formData);
}`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Behavior:</h5>
                          <ul className="space-y-1 text-sm text-blue-700">
                            <li>• All inner Observables run concurrently</li>
                            <li>• No cancellation of previous requests</li>
                            <li>• Results come in completion order</li>
                            <li>• Maximum concurrency can be limited</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Best For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• File uploads/downloads</li>
                            <li>• Parallel API calls</li>
                            <li>• Real-time notifications</li>
                            <li>• Independent operations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Concurrency Control */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Concurrency Control</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3">Unlimited Concurrency</h5>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <pre className="text-xs text-white overflow-x-auto">
                            {`// All requests run simultaneously
source$.pipe(
  mergeMap(item => processItem(item))
)`}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3">Limited Concurrency</h5>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <pre className="text-xs text-white overflow-x-auto">
                            {`// Maximum 3 concurrent requests
source$.pipe(
  mergeMap(item => processItem(item), 3)
)`}
                          </pre>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Pro Tip:</strong> Use concurrency limits to prevent overwhelming
                        your server or browser when processing many items simultaneously.
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">mergeMap Timeline</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="font-mono text-sm space-y-2">
                        <div className="text-gray-600">Source: --a-----b-----c-----|</div>
                        <div className="text-blue-600">Inner a: --1--2--3--4--5--|</div>
                        <div className="text-blue-600">Inner b: --6--7--8--9--|</div>
                        <div className="text-blue-600">Inner c: --10-11-12--|</div>
                        <div className="text-green-600">
                          Output: -----1--2-6-3-7-4-8-5-9-10-11-12--|
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        All inner Observables run concurrently, values are merged as they arrive.
                      </p>
                    </div>
                  </div>

                  {/* Batch Processing Example */}
                  <div className="bg-blue-100 rounded-xl p-6 border border-blue-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Real-World: Batch Data Processing
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Process large dataset with controlled concurrency
class BatchProcessor {
  processData(items: any[], batchSize = 100, concurrency = 5) {
    return from(items).pipe(
      // Group items into batches
      bufferCount(batchSize),
      
      // Process batches with limited concurrency
      mergeMap(batch => 
        this.processBatch(batch).pipe(
          // Add batch metadata
          map(result => ({
            batchSize: batch.length,
            processedAt: new Date(),
            result
          }))
        ), 
        concurrency // Max 5 concurrent batches
      ),
      
      // Collect all results
      toArray(),
      
      // Final processing
      map(batchResults => ({
        totalBatches: batchResults.length,
        totalItems: batchResults.reduce((sum, batch) => sum + batch.batchSize, 0),
        completedAt: new Date(),
        results: batchResults
      }))
    );
  }
  
  private processBatch(batch: any[]): Observable<any> {
    return ajax.post('/api/process-batch', { items: batch }).pipe(
      map(response => response.data),
      retry(2), // Retry failed batches
      catchError(error => {
        console.error('Batch processing failed:', error);
        return of({ error: error.message, items: batch });
      })
    );
  }
}

// Usage
const processor = new BatchProcessor();
const largeDataset = generateLargeDataset(10000);

processor.processData(largeDataset, 100, 3).subscribe(result => {
  console.log(\`Processed \${result.totalItems} items in \${result.totalBatches} batches\`);
  displayProcessingResults(result);
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeOperator === 'concatmap' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">concatMap</h3>
                    <p className="text-gray-600">
                      Processes inner Observables one at a time, in order
                    </p>
                  </div>

                  {/* How it Works */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">How concatMap Works</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { concatMap, fromEvent } from 'rxjs';

// Sequential API calls that depend on order
const actionQueue$ = new Subject<Action>();

actionQueue$.pipe(
  // Process actions one at a time
  concatMap(action => 
    this.executeAction(action).pipe(
      // Log successful completion
      tap(result => 
        console.log(\`Action \${action.id} completed\`)
      ),
      
      // Handle errors without breaking the queue
      catchError(error => {
        console.error(\`Action \${action.id} failed:\`, error);
        return of({ error, action });
      })
    )
  )
).subscribe(result => {
  updateActionHistory(result);
});

// Queue multiple actions
actionQueue$.next({ id: 'action-1', type: 'CREATE_USER' });
actionQueue$.next({ id: 'action-2', type: 'SEND_EMAIL' });
actionQueue$.next({ id: 'action-3', type: 'UPDATE_DATABASE' });`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-green-100 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2">Behavior:</h5>
                          <ul className="space-y-1 text-sm text-green-700">
                            <li>• Waits for each inner Observable to complete</li>
                            <li>• Maintains order of execution</li>
                            <li>• Queues subsequent requests</li>
                            <li>• No overlapping requests</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Best For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Sequential operations</li>
                            <li>• Order-dependent tasks</li>
                            <li>• Database transactions</li>
                            <li>• Step-by-step processes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">concatMap Timeline</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="font-mono text-sm space-y-2">
                        <div className="text-gray-600">Source: --a-----b-----c-----|</div>
                        <div className="text-green-600">Inner a: --1--2--3--4--5--|</div>
                        <div className="text-green-600">Inner b: --6--7--8--9--|</div>
                        <div className="text-green-600">Inner c: --10-11-12--|</div>
                        <div className="text-green-600">
                          Output: -----1--2--3--4--5----6--7--8--9----10-11-12--|
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Each inner Observable completes before the next one starts. Perfect order
                        preservation.
                      </p>
                    </div>
                  </div>

                  {/* Sequential Processing Example */}
                  <div className="bg-green-100 rounded-xl p-6 border border-green-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Real-World: Multi-Step Workflow
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Multi-step user onboarding process
class OnboardingService {
  processNewUser(userData: UserData): Observable<OnboardingResult> {
    const steps = [
      { name: 'validation', fn: () => this.validateUser(userData) },
      { name: 'creation', fn: (user) => this.createUser(user) },
      { name: 'profile', fn: (user) => this.setupProfile(user) },
      { name: 'permissions', fn: (user) => this.assignPermissions(user) },
      { name: 'notification', fn: (user) => this.sendWelcomeEmail(user) },
      { name: 'analytics', fn: (user) => this.trackUserCreation(user) }
    ];
    
    return from(steps).pipe(
      // Execute steps sequentially
      concatMap((step, index) => 
        defer(() => {
          console.log(\`Step \${index + 1}: \${step.name}\`);
          return step.fn(userData);
        }).pipe(
          // Add step metadata
          map(result => ({
            step: step.name,
            stepNumber: index + 1,
            totalSteps: steps.length,
            result,
            timestamp: new Date()
          })),
          
          // Handle step failures
          catchError(error => {
            console.error(\`Step \${step.name} failed:\`, error);
            throw new Error(\`Onboarding failed at step: \${step.name}\`);
          })
        )
      ),
      
      // Collect all step results
      toArray(),
      
      // Final result
      map(stepResults => ({
        success: true,
        user: userData,
        steps: stepResults,
        completedAt: new Date(),
        duration: stepResults[stepResults.length - 1].timestamp.getTime() - 
                 stepResults[0].timestamp.getTime()
      }))
    );
  }
  
  private validateUser(userData: UserData): Observable<UserData> {
    return timer(500).pipe( // Simulate API delay
      map(() => {
        if (!userData.email || !userData.password) {
          throw new Error('Invalid user data');
        }
        return { ...userData, validated: true };
      })
    );
  }
  
  private createUser(userData: UserData): Observable<User> {
    return ajax.post('/api/users', userData).pipe(
      map(response => response.data)
    );
  }
  
  private setupProfile(user: User): Observable<Profile> {
    return ajax.post('/api/profiles', { userId: user.id }).pipe(
      map(response => response.data)
    );
  }
  
  // ... other step methods
}

// Usage with progress tracking
const onboarding = new OnboardingService();

onboarding.processNewUser({
  email: 'john@example.com',
  password: 'secure123',
  name: 'John Doe'
}).subscribe({
  next: (stepResult) => {
    updateProgressBar(stepResult.stepNumber, stepResult.totalSteps);
    console.log(\`Completed: \${stepResult.step}\`);
  },
  error: (error) => {
    showErrorMessage(error.message);
    rollbackPartialCreation();
  },
  complete: () => {
    console.log('User onboarding completed successfully!');
    redirectToWelcomePage();
  }
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeOperator === 'exhaustmap' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">exhaustMap</h3>
                    <p className="text-gray-600">
                      Ignores new values while inner Observable is active
                    </p>
                  </div>

                  {/* How it Works */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">How exhaustMap Works</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { exhaustMap, fromEvent } from 'rxjs';

// Prevent double-clicking on submit button
const submitButton = document.getElementById('submit');

fromEvent(submitButton, 'click').pipe(
  // Ignore clicks while form is submitting
  exhaustMap(() => 
    this.submitForm().pipe(
      // Show submission state
      startWith({ submitting: true }),
      
      // Handle the actual submission
      switchMap(() => 
        ajax.post('/api/form', this.formData).pipe(
          map(response => ({ 
            submitting: false, 
            success: true, 
            data: response.data 
          }))
        )
      ),
      
      // Handle errors
      catchError(error => of({ 
        submitting: false, 
        success: false, 
        error: error.message 
      }))
    )
  )
).subscribe(state => {
  if (state.submitting) {
    showLoadingSpinner();
    disableSubmitButton();
  } else {
    hideLoadingSpinner();
    enableSubmitButton();
    
    if (state.success) {
      showSuccessMessage();
    } else {
      showErrorMessage(state.error);
    }
  }
});`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-orange-100 rounded-lg p-4">
                          <h5 className="font-semibold text-orange-800 mb-2">Behavior:</h5>
                          <ul className="space-y-1 text-sm text-orange-700">
                            <li>• Ignores source emissions while inner is active</li>
                            <li>• Prevents overlapping operations</li>
                            <li>• Perfect for preventing duplicate actions</li>
                            <li>• Maintains single operation at a time</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Best For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Form submissions</li>
                            <li>• Save/update operations</li>
                            <li>• One-time actions</li>
                            <li>• Rate limiting</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">exhaustMap Timeline</h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="font-mono text-sm space-y-2">
                        <div className="text-gray-600">Source: --a-----b-----c-----|</div>
                        <div className="text-orange-600">Inner a: --1--2--3--4--5--|</div>
                        <div className="text-gray-400">Inner b: (ignored)</div>
                        <div className="text-orange-600">Inner c: --10-11-12--|</div>
                        <div className="text-green-600">
                          Output: -----1--2--3--4--5----10-11-12--|
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Source value 'b' is ignored because inner 'a' is still active. 'c' is
                        processed after 'a' completes.
                      </p>
                    </div>
                  </div>

                  {/* Login Protection Example */}
                  <div className="bg-orange-100 rounded-xl p-6 border border-orange-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Real-World: Login Protection
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Prevent multiple simultaneous login attempts
class AuthService {
  private loginAttempts$ = new Subject<LoginCredentials>();
  
  // Only one login attempt at a time
  login$ = this.loginAttempts$.pipe(
    exhaustMap(credentials => 
      this.authenticateUser(credentials).pipe(
        timeout(10000), // 10 second timeout
        
        map(response => ({
          success: true,
          user: response.data.user,
          token: response.data.token,
          timestamp: new Date()
        })),
        
        catchError(error => of({
          success: false,
          error: this.getErrorMessage(error),
          timestamp: new Date()
        })),
        
        // Always complete to allow next attempt
        finalize(() => {
          console.log('Login attempt completed');
        })
      )
    )
  );
  
  // Public method to trigger login
  attemptLogin(credentials: LoginCredentials) {
    this.loginAttempts$.next(credentials);
  }
  
  private authenticateUser(credentials: LoginCredentials): Observable<any> {
    return ajax.post('/api/auth/login', credentials).pipe(
      // Add artificial delay for better UX
      delay(1000)
    );
  }
  
  private getErrorMessage(error: any): string {
    if (error.name === 'TimeoutError') {
      return 'Login request timed out. Please try again.';
    }
    if (error.status === 401) {
      return 'Invalid credentials. Please check your email and password.';
    }
    if (error.status === 429) {
      return 'Too many login attempts. Please wait before trying again.';
    }
    return 'Login failed. Please try again later.';
  }
}

// Usage in login component
class LoginComponent {
  private authService = new AuthService();
  private loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });
  
  ngOnInit() {
    // Subscribe to login results
    this.authService.login$.subscribe(result => {
      if (result.success) {
        this.handleLoginSuccess(result);
      } else {
        this.handleLoginError(result.error);
      }
    });
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      // This will be ignored if a login is already in progress
      this.authService.attemptLogin(credentials);
      
      // Show loading state
      this.showLoadingState();
    }
  }
  
  private handleLoginSuccess(result: any) {
    this.hideLoadingState();
    this.storeAuthToken(result.token);
    this.redirectToDashboard();
    this.showSuccessMessage(\`Welcome back, \${result.user.name}!\`);
  }
  
  private handleLoginError(error: string) {
    this.hideLoadingState();
    this.showErrorMessage(error);
    this.loginForm.get('password')?.reset();
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Comparison Guide
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Scenario</th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-600 bg-purple-50 rounded-t-lg">
                    switchMap
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600 bg-blue-50 rounded-t-lg">
                    mergeMap
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-green-600 bg-green-50 rounded-t-lg">
                    concatMap
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-orange-600 bg-orange-50 rounded-t-lg">
                    exhaustMap
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Search as you type</td>
                  <td className="text-center py-3 px-4 bg-purple-50">✅ Perfect</td>
                  <td className="text-center py-3 px-4 bg-blue-50">❌ Race conditions</td>
                  <td className="text-center py-3 px-4 bg-green-50">❌ Too slow</td>
                  <td className="text-center py-3 px-4 bg-orange-50">❌ Misses input</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">File uploads</td>
                  <td className="text-center py-3 px-4 bg-purple-50">❌ Cancels uploads</td>
                  <td className="text-center py-3 px-4 bg-blue-50">✅ Perfect</td>
                  <td className="text-center py-3 px-4 bg-green-50">⚠️ Too slow</td>
                  <td className="text-center py-3 px-4 bg-orange-50">❌ Blocks uploads</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Order matters</td>
                  <td className="text-center py-3 px-4 bg-purple-50">❌ Skips items</td>
                  <td className="text-center py-3 px-4 bg-blue-50">❌ Wrong order</td>
                  <td className="text-center py-3 px-4 bg-green-50">✅ Perfect</td>
                  <td className="text-center py-3 px-4 bg-orange-50">❌ Skips items</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Form submission</td>
                  <td className="text-center py-3 px-4 bg-purple-50">❌ Cancels submit</td>
                  <td className="text-center py-3 px-4 bg-blue-50">❌ Double submit</td>
                  <td className="text-center py-3 px-4 bg-green-50">⚠️ Queues submits</td>
                  <td className="text-center py-3 px-4 bg-orange-50">✅ Perfect</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Navigation</td>
                  <td className="text-center py-3 px-4 bg-purple-50">✅ Perfect</td>
                  <td className="text-center py-3 px-4 bg-blue-50">❌ Multiple routes</td>
                  <td className="text-center py-3 px-4 bg-green-50">❌ Queues routes</td>
                  <td className="text-center py-3 px-4 bg-orange-50">❌ Blocks routes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision Tree */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Decision Tree: Which Operator to Use?
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {/* Start */}
                <div className="text-center">
                  <div className="inline-block bg-gray-100 rounded-lg px-6 py-3 font-semibold text-gray-800">
                    Do you need the latest result only?
                  </div>
                </div>

                {/* First Branch */}
                <div className="flex justify-center space-x-12">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 mb-2">Yes</div>
                    <div className="bg-purple-100 rounded-lg px-4 py-2 border border-purple-300">
                      <div className="font-semibold text-purple-800">switchMap</div>
                      <div className="text-xs text-purple-600">Cancel previous</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600 mb-2">No</div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3 font-medium text-gray-700">
                      Can operations run concurrently?
                    </div>
                  </div>
                </div>

                {/* Second Branch */}
                <div className="flex justify-end mr-12">
                  <div className="flex space-x-12">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600 mb-2">Yes</div>
                      <div className="bg-gray-100 rounded-lg px-4 py-3 font-medium text-gray-700">
                        Should new ones be ignored when busy?
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600 mb-2">No</div>
                      <div className="bg-green-100 rounded-lg px-4 py-2 border border-green-300">
                        <div className="font-semibold text-green-800">concatMap</div>
                        <div className="text-xs text-green-600">Sequential order</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Branch */}
                <div className="flex justify-end mr-48">
                  <div className="flex space-x-12">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600 mb-2">Yes</div>
                      <div className="bg-orange-100 rounded-lg px-4 py-2 border border-orange-300">
                        <div className="font-semibold text-orange-800">exhaustMap</div>
                        <div className="text-xs text-orange-600">Ignore while busy</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600 mb-2">No</div>
                      <div className="bg-blue-100 rounded-lg px-4 py-2 border border-blue-300">
                        <div className="font-semibold text-blue-800">mergeMap</div>
                        <div className="text-xs text-blue-600">Run concurrent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common Patterns & Best Practices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Error Handling */}
            <div className="bg-white rounded-xl p-8 border border-red-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Error Handling
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-white overflow-x-auto">
                  {`// Global error handling pattern
source$.pipe(
  switchMap(value => 
    riskyOperation(value).pipe(
      // Handle errors per operation
      catchError(error => {
        console.error('Operation failed:', error);
        // Return fallback or empty
        return of(null);
      }),
      
      // Filter out failed operations
      filter(result => result !== null)
    )
  ),
  
  // Global error boundary
  catchError(error => {
    // Log critical errors
    errorReporting.report(error);
    
    // Return safe fallback
    return EMPTY;
  })
)`}
                </pre>
              </div>
            </div>

            {/* Loading States */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Loading States
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-white overflow-x-auto">
                  {`// Loading state pattern
const action$ = trigger$.pipe(
  switchMap(() => 
    asyncOperation().pipe(
      // Start with loading
      startWith({ loading: true }),
      
      // Transform result
      map(data => ({ 
        loading: false, 
        data, 
        error: null 
      })),
      
      // Handle errors
      catchError(error => of({ 
        loading: false, 
        data: null, 
        error: error.message 
      }))
    )
  )
);

// Usage
action$.subscribe(state => {
  updateUI(state);
});`}
                </pre>
              </div>
            </div>

            {/* Retry Logic */}
            <div className="bg-white rounded-xl p-8 border border-green-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Retry Strategies
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-white overflow-x-auto">
                  {`// Smart retry with exponential backoff
source$.pipe(
  switchMap(value => 
    unreliableOperation(value).pipe(
      // Retry with increasing delay
      retryWhen(errors => 
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) {
              throw error; // Give up after 3 tries
            }
            return retryCount + 1;
          }, 0),
          
          // Exponential backoff
          delayWhen(retryCount => 
            timer(Math.pow(2, retryCount) * 1000)
          )
        )
      )
    )
  )
)`}
                </pre>
              </div>
            </div>

            {/* Cancellation */}
            <div className="bg-white rounded-xl p-8 border border-orange-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Cancellation Tokens
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-white overflow-x-auto">
                  {`// Cancellation with cleanup
const destroy$ = new Subject();

source$.pipe(
  switchMap(value => 
    longRunningOperation(value).pipe(
      // Cancel when destroy signal
      takeUntil(destroy$),
      
      // Cleanup on cancellation
      finalize(() => {
        cleanup();
        console.log('Operation cancelled');
      })
    )
  ),
  
  // Complete on destroy
  takeUntil(destroy$)
).subscribe();

// Trigger cancellation
onDestroy() {
  destroy$.next();
  destroy$.complete();
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Advanced Operators Mastered! 🚀</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            You now understand the most powerful RxJS operators for handling complex asynchronous
            flows. Ready to explore marble diagrams and error handling strategies!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Marble Diagrams');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Marble Diagrams</span>
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
                const encodedSection = encodeURIComponent('Subjects');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Subjects</span>
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

export default AdvancedOperators;
