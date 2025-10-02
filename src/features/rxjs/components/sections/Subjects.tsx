import React, { useState } from 'react';
import SubjectTypes2D from '../visualizations/2d/SubjectTypes2D';
// TODO: Fix TypeScript errors in SubjectTypes2D component
// import SubjectTypes2D from '../../../components/models2d/rxjs/SubjectTypes2D';

const Subjects: React.FC = () => {
  const [activeSubjectType, setActiveSubjectType] = useState('subject');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-8 mb-8 border border-green-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RxJS Subjects</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The bridge between imperative and reactive programming - Observables that can multicast
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* What is a Subject */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is a Subject?</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Definition */}
            <div className="bg-white rounded-xl p-8 border border-green-200 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Observable + Observer</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                A Subject is both an <strong>Observable</strong> and an <strong>Observer</strong>.
                It can emit values to multiple subscribers (multicast) and can also be subscribed
                to.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Hot Observable:</strong> Shares execution among subscribers
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Multicast:</strong> All subscribers receive the same values
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Imperative Bridge:</strong> Push values imperatively
                  </span>
                </div>
              </div>
            </div>

            {/* Subject vs Observable */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Subject vs Observable</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Regular Observable</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>• Cold (unicast)</div>
                    <div>• Each subscriber gets own execution</div>
                    <div>• Producer defined in constructor</div>
                    <div>• Can't push values imperatively</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Subject</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>• Hot (multicast)</div>
                    <div>• All subscribers share execution</div>
                    <div>• No initial producer needed</div>
                    <div>• Can call .next(), .error(), .complete()</div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-white overflow-x-auto">
                    {`import { Subject } from 'rxjs';

const subject = new Subject();

// Subscribe first observer
subject.subscribe(x => console.log('A:', x));

// Push values imperatively
subject.next(1);
subject.next(2);

// Subscribe second observer
subject.subscribe(x => console.log('B:', x));

subject.next(3); // Both A and B receive this

// Output:
// A: 1
// A: 2  
// A: 3
// B: 3`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Subject Types Visualization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Subject Types Comparison
          </h2>
          <SubjectTypes2D />
        </div>

        {/* Types of Subjects */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Subjects</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Subject Type Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'subject', label: 'Subject', icon: '🎯', color: 'green' },
                { id: 'behavior', label: 'BehaviorSubject', icon: '💾', color: 'blue' },
                { id: 'replay', label: 'ReplaySubject', icon: '📼', color: 'purple' },
                { id: 'async', label: 'AsyncSubject', icon: '⏰', color: 'orange' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveSubjectType(type.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeSubjectType === type.id
                      ? `border-${type.color}-500 text-${type.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Subject Type Content */}
            <div className="max-w-5xl mx-auto">
              {activeSubjectType === 'subject' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Subject</h3>
                    <p className="text-gray-600">
                      The basic Subject - no initial value, no replay behavior
                    </p>
                  </div>

                  {/* Basic Usage */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Basic Usage</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { Subject } from 'rxjs';

const eventBus = new Subject();

// Multiple subscribers
eventBus.subscribe(data => 
  console.log('Component A:', data)
);

eventBus.subscribe(data => 
  console.log('Component B:', data)
);

// Emit events
eventBus.next({ type: 'USER_LOGIN', user: 'John' });
eventBus.next({ type: 'DATA_LOADED', data: [...] });

// Complete the subject
eventBus.complete();`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-green-100 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2">Characteristics:</h5>
                          <ul className="space-y-1 text-sm text-green-700">
                            <li>• No initial value</li>
                            <li>• Late subscribers miss previous values</li>
                            <li>• Perfect for event buses</li>
                            <li>• Completes when .complete() is called</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Use Cases:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Component communication</li>
                            <li>• Event broadcasting</li>
                            <li>• Custom operators</li>
                            <li>• Converting callbacks to streams</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Bus Example */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Real-World Example: Event Bus
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-6">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Event Bus Service
class EventBusService {
  private eventSubject = new Subject<any>();
  
  // Observable for components to subscribe to
  events$ = this.eventSubject.asObservable();
  
  // Method to emit events
  emit(event: any) {
    this.eventSubject.next(event);
  }
}

// Usage in components
const eventBus = new EventBusService();

// Component A - listens for events
eventBus.events$.subscribe(event => {
  if (event.type === 'NOTIFICATION') {
    showNotification(event.message);
  }
});

// Component B - emits events
function onUserAction() {
  eventBus.emit({
    type: 'NOTIFICATION',
    message: 'Action completed successfully!'
  });
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeSubjectType === 'behavior' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">BehaviorSubject</h3>
                    <p className="text-gray-600">
                      Remembers the current value - perfect for state management
                    </p>
                  </div>

                  {/* BehaviorSubject Features */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Key Features</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { BehaviorSubject } from 'rxjs';

// Requires initial value
const currentUser = new BehaviorSubject(null);

// Late subscribers immediately get current value
currentUser.subscribe(user => 
  console.log('Current user:', user)
); // Output: Current user: null

currentUser.next({ name: 'John', id: 1 });
// Output: Current user: { name: 'John', id: 1 }

// New subscriber gets current value immediately
currentUser.subscribe(user => 
  console.log('New subscriber:', user)
); // Output: New subscriber: { name: 'John', id: 1 }

// Get current value synchronously  
console.log('Current value:', currentUser.value);`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-2">Characteristics:</h5>
                          <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Requires initial value</li>
                            <li>• Always has a current value</li>
                            <li>• New subscribers get current value immediately</li>
                            <li>• Can access current value with .value</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Perfect For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Application state</li>
                            <li>• Current user info</li>
                            <li>• Theme/settings</li>
                            <li>• Loading states</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* State Management Example */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      State Management Example
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-6">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// User State Service
class UserStateService {
  private userSubject = new BehaviorSubject(null);
  
  // Observable for components
  user$ = this.userSubject.asObservable();
  
  // Get current user synchronously
  get currentUser() {
    return this.userSubject.value;
  }
  
  // Update user state
  setUser(user: User) {
    this.userSubject.next(user);
  }
  
  // Clear user state
  clearUser() {
    this.userSubject.next(null);
  }
  
  // Check if user is logged in
  get isLoggedIn() {
    return !!this.userSubject.value;
  }
}

// Usage
const userState = new UserStateService();

// Component automatically gets current state
userState.user$.subscribe(user => {
  if (user) {
    showUserDashboard(user);
  } else {
    showLoginForm();
  }
});

// Login action
async function login(credentials) {
  const user = await authenticate(credentials);
  userState.setUser(user); // All subscribers notified
}`}
                      </pre>
                    </div>
                  </div>

                  {/* React Hook Example */}
                  <div className="bg-blue-100 rounded-xl p-6 border border-blue-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">React Hook Integration</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Custom React hook
function useUserState() {
  const [user, setUser] = useState(userState.currentUser);
  
  useEffect(() => {
    const subscription = userState.user$.subscribe(setUser);
    return () => subscription.unsubscribe();
  }, []);
  
  return user;
}

// Component usage
function UserProfile() {
  const user = useUserState();
  
  if (!user) return <LoginForm />;
  
  return <div>Welcome, {user.name}!</div>;
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeSubjectType === 'replay' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">ReplaySubject</h3>
                    <p className="text-gray-600">
                      Replays a specified number of previous values to new subscribers
                    </p>
                  </div>

                  {/* ReplaySubject Features */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Replay Behavior</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { ReplaySubject } from 'rxjs';

// Replay last 3 values
const history = new ReplaySubject(3);

history.next('Event 1');
history.next('Event 2');
history.next('Event 3');
history.next('Event 4');

// New subscriber gets last 3 values
history.subscribe(event => 
  console.log('Subscriber A:', event)
);
// Output:
// Subscriber A: Event 2
// Subscriber A: Event 3  
// Subscriber A: Event 4

history.next('Event 5');
// Output: Subscriber A: Event 5

// Another subscriber gets last 3 values
history.subscribe(event => 
  console.log('Subscriber B:', event)
);
// Output:
// Subscriber B: Event 3
// Subscriber B: Event 4
// Subscriber B: Event 5`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-purple-100 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-800 mb-2">Parameters:</h5>
                          <ul className="space-y-1 text-sm text-purple-700">
                            <li>
                              • <strong>bufferSize:</strong> Number of values to replay
                            </li>
                            <li>
                              • <strong>windowTime:</strong> Time window for replay (optional)
                            </li>
                            <li>
                              • <strong>scheduler:</strong> Custom scheduler (optional)
                            </li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Use Cases:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Chat message history</li>
                            <li>• Recent activity logs</li>
                            <li>• Undo/redo functionality</li>
                            <li>• Caching recent API responses</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Window Example */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Time Window Replay</h4>
                    <div className="bg-gray-900 rounded-lg p-6">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Replay values from last 5 seconds
const recentActivity = new ReplaySubject(
  100,     // Buffer up to 100 values
  5000     // But only from last 5 seconds
);

recentActivity.next('Action 1');
await delay(2000);
recentActivity.next('Action 2');
await delay(4000); // Action 1 is now older than 5 seconds

// New subscriber only gets Action 2
recentActivity.subscribe(action => 
  console.log('Recent:', action)
); // Output: Recent: Action 2

// Chat History Example
class ChatService {
  private messagesSubject = new ReplaySubject(50); // Last 50 messages
  
  messages$ = this.messagesSubject.asObservable();
  
  sendMessage(message) {
    this.messagesSubject.next({
      ...message,
      timestamp: Date.now()
    });
  }
}

// New users joining chat get recent message history
const chat = new ChatService();
chat.messages$.subscribe(msg => displayMessage(msg));`}
                      </pre>
                    </div>
                  </div>

                  {/* Activity Log Example */}
                  <div className="bg-purple-100 rounded-xl p-6 border border-purple-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Activity Log Pattern</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Activity tracking with replay
class ActivityTracker {
  private activitySubject = new ReplaySubject(10);
  
  activity$ = this.activitySubject.asObservable();
  
  logActivity(action: string, details?: any) {
    this.activitySubject.next({
      action,
      details,
      timestamp: new Date().toISOString(),
      user: getCurrentUser()
    });
  }
}

// Usage - new dashboard widgets get recent activity
const tracker = new ActivityTracker();

// Widget subscribes and immediately sees recent activity
tracker.activity$.subscribe(activity => {
  updateActivityFeed(activity);
});

tracker.logActivity('USER_LOGIN', { method: 'oauth' });
tracker.logActivity('FILE_UPLOADED', { fileName: 'report.pdf' });`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeSubjectType === 'async' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AsyncSubject</h3>
                    <p className="text-gray-600">
                      Emits only the last value when the sequence completes
                    </p>
                  </div>

                  {/* AsyncSubject Features */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Completion-Based Emission
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { AsyncSubject } from 'rxjs';

const computation = new AsyncSubject();

// Subscribers don't get values until completion
computation.subscribe(result => 
  console.log('Result:', result)
);

computation.next('Intermediate 1');
computation.next('Intermediate 2');
computation.next('Final Result');

// Nothing emitted yet...

computation.complete(); 
// NOW subscribers get the last value:
// Output: Result: Final Result

// New subscribers still get the final value
computation.subscribe(result => 
  console.log('Late subscriber:', result)
); 
// Output: Late subscriber: Final Result`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-orange-100 rounded-lg p-4">
                          <h5 className="font-semibold text-orange-800 mb-2">Behavior:</h5>
                          <ul className="space-y-1 text-sm text-orange-700">
                            <li>• Emits only the last value</li>
                            <li>• Only when .complete() is called</li>
                            <li>• Similar to Promise behavior</li>
                            <li>• If error occurs, no values emitted</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">Perfect For:</h5>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Long-running computations</li>
                            <li>• Final results of processes</li>
                            <li>• Converting Observables to Promise-like behavior</li>
                            <li>• Batch processing results</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Computation Example */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Long-Running Computation
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-6">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Data processing pipeline
class DataProcessor {
  private resultSubject = new AsyncSubject();
  
  result$ = this.resultSubject.asObservable();
  
  async processData(data: any[]) {
    // Process data in chunks
    for (let i = 0; i < data.length; i += 100) {
      const chunk = data.slice(i, i + 100);
      const processed = await processChunk(chunk);
      
      // Update intermediate result (not emitted)
      this.resultSubject.next(processed);
    }
    
    // Only when complete, subscribers get final result
    this.resultSubject.complete();
  }
}

// Usage
const processor = new DataProcessor();

// Subscribe before processing starts
processor.result$.subscribe(finalResult => {
  console.log('Processing complete:', finalResult);
  updateUI(finalResult);
});

// Start processing
processor.processData(bigDataArray);`}
                      </pre>
                    </div>
                  </div>

                  {/* Promise-like Behavior */}
                  <div className="bg-orange-100 rounded-xl p-6 border border-orange-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Promise-like Pattern</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`// Convert Observable to Promise-like behavior
function toPromiseLike<T>(source$: Observable<T>): Observable<T> {
  const asyncSubject = new AsyncSubject<T>();
  
  source$.subscribe({
    next: value => asyncSubject.next(value),
    error: err => asyncSubject.error(err),
    complete: () => asyncSubject.complete()
  });
  
  return asyncSubject.asObservable();
}

// Usage
const multipleEmissions$ = interval(1000).pipe(
  map(x => x * 2),
  take(5)
);

const promiseLike$ = toPromiseLike(multipleEmissions$);

promiseLike$.subscribe(finalValue => {
  console.log('Final value only:', finalValue); // Output: 8
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject Comparison Chart */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Subject Comparison</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-green-600 bg-green-50 rounded-t-lg">
                    Subject
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600 bg-blue-50 rounded-t-lg">
                    BehaviorSubject
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-600 bg-purple-50 rounded-t-lg">
                    ReplaySubject
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-orange-600 bg-orange-50 rounded-t-lg">
                    AsyncSubject
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Initial Value</td>
                  <td className="text-center py-3 px-4 bg-green-50">❌ None</td>
                  <td className="text-center py-3 px-4 bg-blue-50">✅ Required</td>
                  <td className="text-center py-3 px-4 bg-purple-50">❌ None</td>
                  <td className="text-center py-3 px-4 bg-orange-50">❌ None</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Late Subscribers</td>
                  <td className="text-center py-3 px-4 bg-green-50">Miss previous</td>
                  <td className="text-center py-3 px-4 bg-blue-50">Get current</td>
                  <td className="text-center py-3 px-4 bg-purple-50">Get buffered</td>
                  <td className="text-center py-3 px-4 bg-orange-50">Get last (if complete)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Emission Pattern</td>
                  <td className="text-center py-3 px-4 bg-green-50">On next()</td>
                  <td className="text-center py-3 px-4 bg-blue-50">On next() + current</td>
                  <td className="text-center py-3 px-4 bg-purple-50">On next() + buffer</td>
                  <td className="text-center py-3 px-4 bg-orange-50">On complete() only</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Memory Usage</td>
                  <td className="text-center py-3 px-4 bg-green-50">Low</td>
                  <td className="text-center py-3 px-4 bg-blue-50">Low</td>
                  <td className="text-center py-3 px-4 bg-purple-50">Higher</td>
                  <td className="text-center py-3 px-4 bg-orange-50">Low</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Best Use Case</td>
                  <td className="text-center py-3 px-4 bg-green-50">Event bus</td>
                  <td className="text-center py-3 px-4 bg-blue-50">State mgmt</td>
                  <td className="text-center py-3 px-4 bg-purple-50">History/Cache</td>
                  <td className="text-center py-3 px-4 bg-orange-50">Final results</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Best Practices & Patterns
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Memory Management */}
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
                Memory Management
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Potential Issues</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Subjects never complete automatically</li>
                    <li>• ReplaySubject can accumulate memory</li>
                    <li>• Subscribers aren't automatically cleaned up</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Solutions</h4>
                  <div className="bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// Always complete subjects
ngOnDestroy() {
  this.destroySubject.next();
  this.destroySubject.complete();
}

// Limit ReplaySubject buffer
const limitedReplay = new ReplaySubject(10, 5000);

// Use takeUntil for automatic cleanup
source$.pipe(
  takeUntil(this.destroy$)
).subscribe();`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Patterns */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Common Patterns
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Loading State</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`const loading$ = new BehaviorSubject(false);

function fetchData() {
  loading$.next(true);
  return api.getData().pipe(
    finalize(() => loading$.next(false))
  );
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Form State</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`const formData$ = new BehaviorSubject({});
const formErrors$ = new BehaviorSubject([]);

const isValid$ = combineLatest([
  formData$, formErrors$
]).pipe(
  map(([data, errors]) => 
    Object.keys(data).length > 0 && 
    errors.length === 0
  )
);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Subjects Mastered! 🎉</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            You now understand all core RxJS components! Ready to explore advanced operators and
            real-world patterns that leverage these powerful building blocks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Advanced Operators');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Advanced Operators</span>
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
                const encodedSection = encodeURIComponent('Core Components');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Core Components</span>
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

export default Subjects;
