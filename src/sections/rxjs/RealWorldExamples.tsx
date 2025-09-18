import React, { useState } from 'react';

const RealWorldExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('search');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Real-World RxJS Examples</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Practical implementations of RxJS patterns in modern web applications
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            From Theory to Practice
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Production Ready</h3>
                <p className="text-gray-600">
                  Battle-tested patterns used in real applications with proper error handling and
                  performance optimization.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Common Use Cases</h3>
                <p className="text-gray-600">
                  Real scenarios developers face daily: API calls, user interactions, data
                  synchronization, and more.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Best Practices</h3>
                <p className="text-gray-600">
                  Learn the right way to implement RxJS patterns with proper memory management and
                  performance considerations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Examples Navigation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Practical Examples</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Example Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'search', label: 'Search & Autocomplete', icon: '🔍', color: 'blue' },
                { id: 'realtime', label: 'Real-time Data', icon: '📡', color: 'green' },
                { id: 'forms', label: 'Form Validation', icon: '📝', color: 'purple' },
                { id: 'api', label: 'API Management', icon: '🌐', color: 'indigo' },
                { id: 'ui', label: 'UI Interactions', icon: '🎯', color: 'orange' },
                { id: 'state', label: 'State Management', icon: '🗄️', color: 'red' },
              ].map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeExample === example.id
                      ? `border-${example.color}-500 text-${example.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{example.icon}</span>
                  <span>{example.label}</span>
                </button>
              ))}
            </div>

            {/* Example Content */}
            <div className="max-w-5xl mx-auto">
              {activeExample === 'search' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Search & Autocomplete</h3>
                    <p className="text-gray-600">
                      Implement efficient search with debouncing, caching, and error handling
                    </p>
                  </div>

                  {/* Basic Search with Debouncing */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Debounced Search Implementation
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`// Search service with debouncing and caching
import { fromEvent, of, EMPTY } from 'rxjs';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError,
  map,
  startWith,
  share,
  filter
} from 'rxjs/operators';

class SearchService {
  private cache = new Map<string, any[]>();
  
  createSearch(inputElement: HTMLInputElement) {
    return fromEvent(inputElement, 'input').pipe(
      // Extract the search term
      map(event => (event.target as HTMLInputElement).value),
      
      // Wait for user to stop typing (300ms)
      debounceTime(300),
      
      // Only search if term changed
      distinctUntilChanged(),
      
      // Filter out empty searches
      filter(term => term.length >= 2),
      
      // Switch to new search (cancel previous)
      switchMap(term => this.performSearch(term)),
      
      // Handle errors gracefully
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      }),
      
      // Start with empty results
      startWith([]),
      
      // Share subscription among multiple subscribers
      share()
    );
  }
  
  private performSearch(term: string): Observable<SearchResult[]> {
    // Check cache first
    if (this.cache.has(term)) {
      return of(this.cache.get(term)!);
    }
    
    // Perform API search
    return ajax.get(\`/api/search?q=\${encodeURIComponent(term)}\`).pipe(
      map(response => response.data),
      
      // Cache successful results
      tap(results => this.cache.set(term, results)),
      
      // Handle API errors
      catchError(error => {
        if (error.status === 429) {
          // Rate limited - return cached results or empty
          return of(this.getRelatedCachedResults(term));
        }
        throw error;
      })
    );
  }
  
  private getRelatedCachedResults(term: string): SearchResult[] {
    // Find similar cached terms
    for (const [cachedTerm, results] of this.cache.entries()) {
      if (cachedTerm.includes(term) || term.includes(cachedTerm)) {
        return results;
      }
    }
    return [];
  }
}

// Usage in React component
const SearchComponent: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!inputRef.current) return;
    
    const searchService = new SearchService();
    const search$ = searchService.createSearch(inputRef.current);
    
    const subscription = search$.subscribe({
      next: results => {
        setResults(results);
        setIsLoading(false);
      },
      error: error => {
        console.error('Search failed:', error);
        setIsLoading(false);
      }
    });
    
    // Show loading state
    const inputSubscription = fromEvent(inputRef.current, 'input').pipe(
      debounceTime(100)
    ).subscribe(() => setIsLoading(true));
    
    return () => {
      subscription.unsubscribe();
      inputSubscription.unsubscribe();
    };
  }, []);
  
  return (
    <div className="search-container">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className="search-input"
      />
      {isLoading && <div className="loading">Searching...</div>}
      <SearchResults results={results} />
    </div>
  );
};`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Key Features:</h5>
                          <ul className="space-y-1 text-sm text-blue-700">
                            <li>
                              • <strong>Debouncing:</strong> Wait for user to stop typing
                            </li>
                            <li>
                              • <strong>Caching:</strong> Avoid duplicate API calls
                            </li>
                            <li>
                              • <strong>Cancellation:</strong> Cancel previous searches
                            </li>
                            <li>
                              • <strong>Error Handling:</strong> Graceful degradation
                            </li>
                            <li>
                              • <strong>Loading States:</strong> User feedback
                            </li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Search Flow:</h5>
                          <div className="space-y-2 text-sm text-yellow-700">
                            <div>1. User types → debounce 300ms</div>
                            <div>2. Check cache → return if found</div>
                            <div>3. API call → cache result</div>
                            <div>4. Display results → handle errors</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Autocomplete */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Advanced Autocomplete with Highlighting
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Advanced autocomplete with keyboard navigation and highlighting
class AutocompleteService {
  createAutocomplete(inputElement: HTMLInputElement) {
    // Search stream
    const search$ = fromEvent(inputElement, 'input').pipe(
      map(e => (e.target as HTMLInputElement).value),
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 1),
      switchMap(term => this.searchWithHighlighting(term)),
      catchError(() => of([])),
      share()
    );
    
    // Keyboard navigation stream
    const keydown$ = fromEvent(inputElement, 'keydown').pipe(
      filter((e: KeyboardEvent) => ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key))
    );
    
    // Combined interaction stream
    return combineLatest([search$, keydown$.pipe(startWith(null))]).pipe(
      scan((state, [results, keyEvent]) => {
        if (keyEvent) {
          return this.handleKeyboardNavigation(state, keyEvent as KeyboardEvent, results);
        }
        return { ...state, results, selectedIndex: -1 };
      }, { results: [], selectedIndex: -1, isOpen: false })
    );
  }
  
  private searchWithHighlighting(term: string): Observable<AutocompleteItem[]> {
    return ajax.get(\`/api/autocomplete?q=\${encodeURIComponent(term)}\`).pipe(
      map(response => response.data.map((item: any) => ({
        ...item,
        highlighted: this.highlightMatch(item.text, term)
      }))),
      timeout(5000),
      retry(2)
    );
  }
  
  private highlightMatch(text: string, term: string): string {
    const regex = new RegExp(\`(\${term})\`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  private handleKeyboardNavigation(
    state: AutocompleteState, 
    event: KeyboardEvent, 
    results: AutocompleteItem[]
  ): AutocompleteState {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        return {
          ...state,
          selectedIndex: Math.min(state.selectedIndex + 1, results.length - 1),
          isOpen: true
        };
        
      case 'ArrowUp':
        event.preventDefault();
        return {
          ...state,
          selectedIndex: Math.max(state.selectedIndex - 1, -1),
          isOpen: true
        };
        
      case 'Enter':
        event.preventDefault();
        if (state.selectedIndex >= 0 && results[state.selectedIndex]) {
          this.selectItem(results[state.selectedIndex]);
          return { ...state, isOpen: false, selectedIndex: -1 };
        }
        return state;
        
      case 'Escape':
        return { ...state, isOpen: false, selectedIndex: -1 };
        
      default:
        return state;
    }
  }
  
  private selectItem(item: AutocompleteItem) {
    // Emit selection event
    this.onItemSelected.next(item);
  }
}

// React Hook for Autocomplete
const useAutocomplete = (onSelect: (item: AutocompleteItem) => void) => {
  const [state, setState] = useState<AutocompleteState>({
    results: [],
    selectedIndex: -1,
    isOpen: false
  });
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!inputRef.current) return;
    
    const autocomplete = new AutocompleteService();
    autocomplete.onItemSelected.subscribe(onSelect);
    
    const subscription = autocomplete
      .createAutocomplete(inputRef.current)
      .subscribe(setState);
    
    return () => subscription.unsubscribe();
  }, [onSelect]);
  
  return { state, inputRef };
};

// Usage
const AutocompleteComponent: React.FC = () => {
  const { state, inputRef } = useAutocomplete((item) => {
    console.log('Selected:', item);
    // Navigate or perform action
  });
  
  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        placeholder="Type to search..."
        className="autocomplete-input"
      />
      {state.isOpen && (
        <div className="autocomplete-dropdown">
          {state.results.map((item, index) => (
            <div
              key={item.id}
              className={\`autocomplete-item \${
                index === state.selectedIndex ? 'selected' : ''
              }\`}
              dangerouslySetInnerHTML={{ __html: item.highlighted }}
            />
          ))}
        </div>
      )}
    </div>
  );
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'realtime' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-time Data</h3>
                    <p className="text-gray-600">
                      Handle live data streams, WebSockets, and real-time synchronization
                    </p>
                  </div>

                  {/* WebSocket Connection */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      WebSocket Connection Management
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Robust WebSocket service with reconnection logic
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject$ = new Subject<any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Public observable for messages
  messages$ = this.messagesSubject$.asObservable();
  
  // Connection status
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>('connecting');
  status$ = this.connectionStatus$.asObservable();
  
  connect(url: string): Observable<any> {
    return defer(() => {
      if (!this.socket$ || this.socket$.closed) {
        this.socket$ = this.createWebSocketConnection(url);
      }
      return this.socket$;
    }).pipe(
      // Handle reconnection
      retryWhen(errors => this.handleReconnection(errors)),
      
      // Share connection among subscribers
      share(),
      
      // Update connection status
      tap({
        next: () => {
          this.connectionStatus$.next('connected');
          this.reconnectAttempts = 0;
        },
        error: () => {
          this.connectionStatus$.next('disconnected');
        }
      })
    );
  }
  
  private createWebSocketConnection(url: string): WebSocketSubject<any> {
    return webSocket({
      url,
      openObserver: {
        next: () => {
          console.log('WebSocket connected');
          this.connectionStatus$.next('connected');
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket disconnected');
          this.connectionStatus$.next('disconnected');
        }
      }
    });
  }
  
  private handleReconnection(errors: Observable<any>): Observable<any> {
    return errors.pipe(
      tap(error => {
        console.error('WebSocket error:', error);
        this.connectionStatus$.next('reconnecting');
      }),
      
      delayWhen(() => {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        const jitter = Math.random() * 1000;
        this.reconnectAttempts++;
        
        return timer(delay + jitter);
      }),
      
      take(this.maxReconnectAttempts),
      
      finalize(() => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionStatus$.next('failed');
        }
      })
    );
  }
  
  send(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.warn('WebSocket not connected');
    }
  }
  
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.connectionStatus$.next('disconnected');
    }
  }
}

// Real-time data synchronization
class RealTimeDataService {
  private wsService = new WebSocketService();
  private dataCache$ = new BehaviorSubject<DataState>({ items: [], lastUpdate: null });
  
  // Public data stream
  data$ = this.dataCache$.asObservable();
  
  initialize(websocketUrl: string): Observable<any> {
    return this.wsService.connect(websocketUrl).pipe(
      tap(message => this.handleMessage(message)),
      catchError(error => {
        console.error('Real-time sync error:', error);
        // Fall back to polling
        return this.startPolling();
      })
    );
  }
  
  private handleMessage(message: any): void {
    const currentData = this.dataCache$.value;
    
    switch (message.type) {
      case 'ITEM_ADDED':
        this.dataCache$.next({
          items: [...currentData.items, message.data],
          lastUpdate: new Date()
        });
        break;
        
      case 'ITEM_UPDATED':
        this.dataCache$.next({
          items: currentData.items.map(item => 
            item.id === message.data.id ? { ...item, ...message.data } : item
          ),
          lastUpdate: new Date()
        });
        break;
        
      case 'ITEM_DELETED':
        this.dataCache$.next({
          items: currentData.items.filter(item => item.id !== message.data.id),
          lastUpdate: new Date()
        });
        break;
        
      case 'BULK_UPDATE':
        this.dataCache$.next({
          items: message.data,
          lastUpdate: new Date()
        });
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  // Fallback to polling if WebSocket fails
  private startPolling(): Observable<any> {
    return interval(5000).pipe(
      switchMap(() => ajax.get('/api/data')),
      map(response => response.data),
      tap(data => {
        this.dataCache$.next({
          items: data,
          lastUpdate: new Date()
        });
      })
    );
  }
  
  // Optimistic updates
  updateItem(item: any): void {
    // Update local state immediately
    const currentData = this.dataCache$.value;
    this.dataCache$.next({
      items: currentData.items.map(i => i.id === item.id ? item : i),
      lastUpdate: new Date()
    });
    
    // Send update through WebSocket
    this.wsService.send({
      type: 'UPDATE_ITEM',
      data: item
    });
    
    // Revert on failure (implement conflict resolution)
    timer(5000).pipe(
      takeUntil(this.wsService.messages$.pipe(
        filter(msg => msg.type === 'ITEM_UPDATED' && msg.data.id === item.id)
      ))
    ).subscribe(() => {
      console.warn('Update confirmation timeout, reverting...');
      // Implement revert logic
    });
  }
}

// React Hook for real-time data
const useRealTimeData = (websocketUrl: string) => {
  const [data, setData] = useState<DataState>({ items: [], lastUpdate: null });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  
  useEffect(() => {
    const service = new RealTimeDataService();
    
    const subscriptions = [
      service.data$.subscribe(setData),
      service.wsService.status$.subscribe(setConnectionStatus),
      service.initialize(websocketUrl).subscribe()
    ];
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      service.wsService.disconnect();
    };
  }, [websocketUrl]);
  
  return { data, connectionStatus };
};`}
                      </pre>
                    </div>
                  </div>

                  {/* Live Updates Component */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Live Dashboard Component
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Real-time dashboard with live updates
const LiveDashboard: React.FC = () => {
  const { data, connectionStatus } = useRealTimeData('ws://localhost:8080/data');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Handle new items notification
  useEffect(() => {
    const subscription = data$.pipe(
      pairwise(), // Compare current and previous values
      filter(([prev, curr]) => curr.items.length > prev.items.length),
      map(([prev, curr]) => {
        const newItems = curr.items.slice(prev.items.length);
        return newItems.map(item => ({
          id: Date.now() + Math.random(),
          message: \`New item added: \${item.name}\`,
          type: 'info' as const,
          timestamp: new Date()
        }));
      })
    ).subscribe(newNotifications => {
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Auto-remove notifications after 5 seconds
      timer(5000).subscribe(() => {
        setNotifications(prev => 
          prev.filter(n => !newNotifications.some(nn => nn.id === n.id))
        );
      });
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div className="dashboard">
      {/* Connection Status */}
      <div className={\`status-bar \${connectionStatus}\`}>
        <StatusIcon status={connectionStatus} />
        <span>
          {connectionStatus === 'connected' && 'Live'}
          {connectionStatus === 'connecting' && 'Connecting...'}
          {connectionStatus === 'disconnected' && 'Offline'}
          {connectionStatus === 'reconnecting' && 'Reconnecting...'}
          {connectionStatus === 'failed' && 'Connection Failed'}
        </span>
        {data.lastUpdate && (
          <span className="last-update">
            Last update: {formatDistanceToNow(data.lastUpdate)} ago
          </span>
        )}
      </div>
      
      {/* Live Data */}
      <div className="data-grid">
        {data.items.map(item => (
          <DataCard key={item.id} item={item} />
        ))}
      </div>
      
      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'forms' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Form Validation</h3>
                    <p className="text-gray-600">
                      Reactive form validation with real-time feedback and async validation
                    </p>
                  </div>

                  {/* Form Validation Service */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Reactive Form Validation
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Comprehensive form validation service
class FormValidationService {
  createValidator<T extends Record<string, any>>(
    formElement: HTMLFormElement,
    validationRules: ValidationRules<T>
  ): Observable<ValidationState<T>> {
    
    // Create observables for each form field
    const fieldObservables = this.createFieldObservables(formElement, validationRules);
    
    // Combine all field validations
    return combineLatest(fieldObservables).pipe(
      map(fieldStates => this.combineFieldStates(fieldStates)),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      ),
      share()
    );
  }
  
  private createFieldObservables<T>(
    form: HTMLFormElement,
    rules: ValidationRules<T>
  ): Record<keyof T, Observable<FieldState>> {
    const fieldObservables: any = {};
    
    Object.keys(rules).forEach(fieldName => {
      const field = form.querySelector(\`[name="\${fieldName}"]\`) as HTMLInputElement;
      if (!field) return;
      
      const fieldRules = rules[fieldName];
      
      // Create field validation stream
      fieldObservables[fieldName] = merge(
        // Input events for immediate feedback
        fromEvent(field, 'input').pipe(map(() => field.value)),
        
        // Blur events for validation
        fromEvent(field, 'blur').pipe(map(() => field.value)),
        
        // Initial value
        of(field.value)
      ).pipe(
        // Debounce input events but not blur
        debounceTime(300),
        distinctUntilChanged(),
        
        // Perform validation
        switchMap(value => this.validateField(value, fieldRules)),
        
        // Start with initial state
        startWith({ value: field.value, errors: [], isValid: false, isPending: false })
      );
    });
    
    return fieldObservables;
  }
  
  private validateField(
    value: any, 
    rules: FieldValidationRules
  ): Observable<FieldState> {
    const errors: string[] = [];
    
    // Synchronous validations
    if (rules.required && (!value || value.trim() === '')) {
      errors.push('This field is required');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(\`Minimum length is \${rules.minLength} characters\`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(\`Maximum length is \${rules.maxLength} characters\`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || 'Invalid format');
    }
    
    // If sync validation fails, return immediately
    if (errors.length > 0) {
      return of({
        value,
        errors,
        isValid: false,
        isPending: false
      });
    }
    
    // Asynchronous validations
    if (rules.asyncValidator) {
      return rules.asyncValidator(value).pipe(
        map(asyncErrors => ({
          value,
          errors: [...errors, ...asyncErrors],
          isValid: errors.length === 0 && asyncErrors.length === 0,
          isPending: false
        })),
        startWith({
          value,
          errors,
          isValid: false,
          isPending: true
        }),
        catchError(() => of({
          value,
          errors: [...errors, 'Validation failed'],
          isValid: false,
          isPending: false
        }))
      );
    }
    
    return of({
      value,
      errors,
      isValid: errors.length === 0,
      isPending: false
    });
  }
  
  private combineFieldStates<T>(
    fieldStates: Record<keyof T, FieldState>
  ): ValidationState<T> {
    const values = {} as T;
    const errors = {} as Record<keyof T, string[]>;
    let isValid = true;
    let isPending = false;
    
    Object.keys(fieldStates).forEach(fieldName => {
      const fieldState = fieldStates[fieldName as keyof T];
      
      values[fieldName as keyof T] = fieldState.value;
      errors[fieldName as keyof T] = fieldState.errors;
      
      if (!fieldState.isValid) {
        isValid = false;
      }
      
      if (fieldState.isPending) {
        isPending = true;
      }
    });
    
    return {
      values,
      errors,
      isValid: isValid && !isPending,
      isPending
    };
  }
}

// Async validators
const createAsyncValidators = () => ({
  // Username availability check
  usernameAvailable: (username: string): Observable<string[]> => {
    if (!username || username.length < 3) {
      return of([]);
    }
    
    return ajax.get(\`/api/users/check-username?username=\${username}\`).pipe(
      map(response => response.data.available ? [] : ['Username is already taken']),
      delay(500), // Simulate network delay
      timeout(5000),
      catchError(() => of(['Unable to verify username availability']))
    );
  },
  
  // Email validation
  emailValid: (email: string): Observable<string[]> => {
    if (!email) return of([]);
    
    return ajax.post('/api/validate-email', { email }).pipe(
      map(response => response.data.valid ? [] : ['Invalid email address']),
      timeout(3000),
      catchError(() => of(['Email validation failed']))
    );
  },
  
  // Password strength check
  passwordStrength: (password: string): Observable<string[]> => {
    return timer(300).pipe(
      map(() => {
        const errors: string[] = [];
        
        if (password.length < 8) {
          errors.push('Password must be at least 8 characters');
        }
        
        if (!/[A-Z]/.test(password)) {
          errors.push('Password must contain an uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
          errors.push('Password must contain a lowercase letter');
        }
        
        if (!/\\d/.test(password)) {
          errors.push('Password must contain a number');
        }
        
        if (!/[^A-Za-z0-9]/.test(password)) {
          errors.push('Password must contain a special character');
        }
        
        return errors;
      })
    );
  }
});

// Usage in React
const RegistrationForm: React.FC = () => {
  const [validationState, setValidationState] = useState<ValidationState<RegistrationData>>();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (!formRef.current) return;
    
    const validationService = new FormValidationService();
    const asyncValidators = createAsyncValidators();
    
    const validationRules: ValidationRules<RegistrationData> = {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        patternMessage: 'Username can only contain letters, numbers, and underscores',
        asyncValidator: asyncValidators.usernameAvailable
      },
      email: {
        required: true,
        pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
        patternMessage: 'Please enter a valid email address',
        asyncValidator: asyncValidators.emailValid
      },
      password: {
        required: true,
        minLength: 8,
        asyncValidator: asyncValidators.passwordStrength
      },
      confirmPassword: {
        required: true,
        customValidator: (value, formValues) => {
          return value === formValues.password ? [] : ['Passwords do not match'];
        }
      }
    };
    
    const subscription = validationService
      .createValidator(formRef.current, validationRules)
      .subscribe(setValidationState);
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationState?.isValid) {
      console.log('Form is valid, submitting:', validationState.values);
      // Submit form
    } else {
      console.log('Form has errors:', validationState?.errors);
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="registration-form">
      <div className="field-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          className={getFieldClassName('username', validationState)}
        />
        <FieldErrors errors={validationState?.errors.username} />
        <FieldStatus isPending={validationState?.isPending} field="username" />
      </div>
      
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          className={getFieldClassName('email', validationState)}
        />
        <FieldErrors errors={validationState?.errors.email} />
      </div>
      
      <div className="field-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          className={getFieldClassName('password', validationState)}
        />
        <FieldErrors errors={validationState?.errors.password} />
        <PasswordStrengthIndicator password={validationState?.values.password} />
      </div>
      
      <div className="field-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          className={getFieldClassName('confirmPassword', validationState)}
        />
        <FieldErrors errors={validationState?.errors.confirmPassword} />
      </div>
      
      <button
        type="submit"
        disabled={!validationState?.isValid || validationState?.isPending}
        className="submit-button"
      >
        {validationState?.isPending ? 'Validating...' : 'Register'}
      </button>
    </form>
  );
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional examples would follow the same pattern... */}
              {activeExample === 'api' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">API Management</h3>
                    <p className="text-gray-600">
                      Handle complex API interactions with caching, retry logic, and request
                      cancellation
                    </p>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Complete API Service Example
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Coming soon - Advanced API management patterns
// Including request deduplication, intelligent caching,
// and coordinated API calls with dependencies

class APIService {
  // Implementation details...
}

// This section will cover:
// - Request deduplication
// - Intelligent caching strategies  
// - Coordinated API calls
// - Background sync
// - Offline-first patterns`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'ui' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">UI Interactions</h3>
                    <p className="text-gray-600">
                      Handle complex user interactions with drag & drop, gestures, and animations
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Interactive UI Patterns
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Coming soon - UI interaction patterns
// Including drag & drop, touch gestures,
// and complex animation sequences

class UIInteractionService {
  // Implementation details...
}

// This section will cover:
// - Drag and drop implementation
// - Touch gesture recognition
// - Animation coordination
// - Scroll-based interactions
// - Complex UI state management`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'state' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">State Management</h3>
                    <p className="text-gray-600">
                      Build reactive state management systems with RxJS
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Reactive State Management
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Coming soon - State management patterns
// Including Redux-like patterns with RxJS,
// local component state, and global app state

class StateManager {
  // Implementation details...
}

// This section will cover:
// - Redux-like patterns with RxJS
// - Local component state management
// - Global application state
// - State synchronization
// - Time-travel debugging`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Patterns Summary */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common Implementation Patterns
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pattern 1 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Debounce + Switch</h3>
              <p className="text-gray-600 text-sm mb-4">
                Perfect for search, autocomplete, and user input handling. Prevents excessive API
                calls.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                debounceTime(300)
                <br />
                .pipe(switchMap(...))
              </div>
            </div>

            {/* Pattern 2 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Retry + Exponential Backoff</h3>
              <p className="text-gray-600 text-sm mb-4">
                Handle transient failures gracefully with intelligent retry strategies.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                retryWhen(errors =&gt;
                <br />
                &nbsp;&nbsp;errors.pipe(delay(...))
              </div>
            </div>

            {/* Pattern 3 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cache + Fallback</h3>
              <p className="text-gray-600 text-sm mb-4">
                Implement intelligent caching with graceful fallback strategies.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                switchMap(key =&gt;
                <br />
                &nbsp;&nbsp;cache.get(key) ||
                <br />
                &nbsp;&nbsp;api.fetch(key)
              </div>
            </div>

            {/* Pattern 4 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error Boundary</h3>
              <p className="text-gray-600 text-sm mb-4">
                Isolate errors to prevent stream termination and provide fallbacks.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                catchError(error =&gt;
                <br />
                &nbsp;&nbsp;of(fallbackValue)
              </div>
            </div>

            {/* Pattern 5 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Share + Replay</h3>
              <p className="text-gray-600 text-sm mb-4">
                Share expensive operations across multiple subscribers efficiently.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                shareReplay(1)
                <br />
                // or share()
              </div>
            </div>

            {/* Pattern 6 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Combine Latest</h3>
              <p className="text-gray-600 text-sm mb-4">
                Coordinate multiple data sources and react to any changes in dependent streams.
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                combineLatest([
                <br />
                &nbsp;&nbsp;stream1$, stream2$
                <br />
                ])
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build Real Applications! 🚀</h2>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            You now have practical examples of RxJS in action. Ready to explore advanced
            visualization tools and create your own reactive masterpieces!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Visualization Tool');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Visualization Tool</span>
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
                const encodedSection = encodeURIComponent('Error Handling');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Error Handling</span>
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

export default RealWorldExamples;
