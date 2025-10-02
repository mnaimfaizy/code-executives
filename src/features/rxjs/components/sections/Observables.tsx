import React, { useState } from 'react';
import Observable2D from '../visualizations/2d/Observable2D';

const Observables: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl p-8 mb-8 border border-blue-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Observables</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The foundation of reactive programming - streams of data that flow over time
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* What is an Observable */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What is an Observable?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Definition */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Definition</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                An Observable is a <strong>lazy Push collection</strong> of multiple values. It
                represents a stream of data that can emit values over time, and observers can
                subscribe to receive these values.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Lazy:</strong> Nothing happens until subscription
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Push:</strong> Producer decides when to send data
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Multiple:</strong> Can emit 0 to infinite values
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Observable vs Others</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Function</h4>
                    <p className="text-sm text-gray-600">Single value, Pull</p>
                  </div>
                  <div className="text-2xl">📦</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Promise</h4>
                    <p className="text-sm text-gray-600">Single value, Push</p>
                  </div>
                  <div className="text-2xl">🎁</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Iterator</h4>
                    <p className="text-sm text-gray-600">Multiple values, Pull</p>
                  </div>
                  <div className="text-2xl">📚</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <div>
                    <h4 className="font-semibold text-gray-800">Observable</h4>
                    <p className="text-sm text-gray-600">Multiple values, Push</p>
                  </div>
                  <div className="text-2xl">🌊</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observable Lifecycle */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Observable Lifecycle
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                {/* Phase 1: Creation */}
                <div className="relative flex items-start space-x-6 pb-8">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Creation</h3>
                    <p className="text-gray-600 mb-4">
                      Observable is created with a producer function that defines how values will be
                      emitted.
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`const observable = new Observable(subscriber => {
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
});`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Phase 2: Subscription */}
                <div className="relative flex items-start space-x-6 pb-8">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription</h3>
                    <p className="text-gray-600 mb-4">
                      Observer subscribes to the Observable. This triggers the execution of the
                      producer function.
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`const subscription = observable.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done!')
});`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Phase 3: Execution */}
                <div className="relative flex items-start space-x-6 pb-8">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Execution</h3>
                    <p className="text-gray-600 mb-4">
                      The Observable pushes values to the observer over time. Can be synchronous or
                      asynchronous.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-green-800 space-y-1">
                        <div>→ "Hello" (next)</div>
                        <div>→ "World" (next)</div>
                        <div>→ Complete (complete)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 4: Disposal */}
                <div className="relative flex items-start space-x-6">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Disposal</h3>
                    <p className="text-gray-600 mb-4">
                      Subscription can be unsubscribed to stop receiving values and clean up
                      resources.
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`subscription.unsubscribe(); // Clean up`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Observable Visualization */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Observable Playground
          </h2>
          <Observable2D />
        </div>

        {/* Creating Observables */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Creating Observables
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'basic', label: 'Basic Creation' },
                { id: 'creation', label: 'Creation Operators' },
                { id: 'from-events', label: 'From Events' },
                { id: 'from-promises', label: 'From Promises' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveExample(tab.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeExample === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              {activeExample === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Using the Observable Constructor
                  </h3>
                  <p className="text-gray-600">
                    The most fundamental way to create an Observable is using the constructor with a
                    producer function.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <pre className="text-sm text-white overflow-x-auto">
                      {`import { Observable } from 'rxjs';

// Create a simple Observable
const source$ = new Observable(subscriber => {
  // Emit values
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  
  // Complete the stream
  subscriber.complete();
  
  // Cleanup function (optional)
  return () => {
    console.log('Cleanup!');
  };
});

// Subscribe to the Observable
source$.subscribe({
  next: value => console.log('Value:', value),
  complete: () => console.log('Completed!')
});

// Output:
// Value: 1
// Value: 2  
// Value: 3
// Completed!`}
                    </pre>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Key Points:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• The producer function runs for each subscription</li>
                      <li>• Always call complete() or error() to end the stream</li>
                      <li>• Return a cleanup function to handle unsubscription</li>
                      <li>• The $ suffix is a naming convention for Observables</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeExample === 'creation' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Creation Operators</h3>
                  <p className="text-gray-600">
                    RxJS provides many convenient operators to create Observables from various
                    sources.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">of() - Emit sequence</h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import { of } from 'rxjs';

const source$ = of(1, 2, 3);
// Emits: 1, 2, 3, then completes`}
                      </pre>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">
                        from() - Convert to Observable
                      </h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import { from } from 'rxjs';

const source$ = from([1, 2, 3]);
// Converts array to Observable`}
                      </pre>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">
                        interval() - Emit every N ms
                      </h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import { interval } from 'rxjs';

const source$ = interval(1000);
// Emits: 0, 1, 2, 3... every second`}
                      </pre>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">
                        timer() - Delay then interval
                      </h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`import { timer } from 'rxjs';

const source$ = timer(2000, 1000);
// Wait 2s, then emit every 1s`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'from-events' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">From DOM Events</h3>
                  <p className="text-gray-600">
                    Transform DOM events into Observable streams for reactive event handling.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <pre className="text-sm text-white overflow-x-auto">
                      {`import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Basic event Observable
const clicks$ = fromEvent(document, 'click');

clicks$.subscribe(event => {
  console.log('Clicked at:', event.clientX, event.clientY);
});

// Advanced: Search input with debouncing
const searchInput = document.getElementById('search');
const search$ = fromEvent(searchInput, 'input').pipe(
  map(event => event.target.value),
  debounceTime(300),           // Wait 300ms after user stops typing
  distinctUntilChanged()       // Only emit if value changed
);

search$.subscribe(searchTerm => {
  console.log('Search for:', searchTerm);
  // Perform search...
});

// Multiple events
const mouseMove$ = fromEvent(document, 'mousemove');
const mouseDown$ = fromEvent(document, 'mousedown');
const mouseUp$ = fromEvent(document, 'mouseup');`}
                    </pre>
                  </div>
                </div>
              )}

              {activeExample === 'from-promises' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">From Promises and Async</h3>
                  <p className="text-gray-600">
                    Convert Promises and async functions into Observables for better composition.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <pre className="text-sm text-white overflow-x-auto">
                      {`import { from, defer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

// Convert Promise to Observable
const promise = fetch('/api/users');
const users$ = from(promise);

users$.subscribe({
  next: response => console.log('Response:', response),
  error: err => console.error('Error:', err)
});

// Better: Use defer for lazy evaluation
const lazyUsers$ = defer(() => fetch('/api/users'));

// Now the fetch happens only when subscribed
lazyUsers$.pipe(
  retry(3),                    // Retry up to 3 times on error
  catchError(err => {
    console.error('Failed after retries:', err);
    return of([]);            // Return empty array as fallback
  })
).subscribe(users => {
  console.log('Users:', users);
});

// Multiple async operations
const userData$ = defer(async () => {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(user.id);
  const comments = await fetchPostComments(posts[0].id);
  
  return { user, posts, comments };
});`}
                    </pre>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Why use defer()?</h4>
                    <p className="text-sm text-yellow-700">
                      Using <code>defer()</code> ensures the async operation is only executed when
                      someone subscribes, making it truly lazy and allowing for retries.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hot vs Cold Observables */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Hot vs Cold Observables
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cold Observables */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <div className="text-2xl">🧊</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Cold Observables</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Unicast - each subscription gets its own independent execution. The producer is
                created inside the Observable.
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Characteristics:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Each subscriber gets their own stream</li>
                    <li>• Data producer is created per subscription</li>
                    <li>• Values are generated independently</li>
                    <li>• Examples: HTTP requests, timers, intervals</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-white overflow-x-auto">
                    {`const cold$ = interval(1000);

// Each subscriber gets independent stream
cold$.subscribe(x => console.log('A:', x));
setTimeout(() => {
  cold$.subscribe(x => console.log('B:', x));
}, 2500);

// Output:
// A: 0    A: 1    A: 2    B: 0    A: 3    B: 1`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Hot Observables */}
            <div className="bg-white rounded-xl p-8 border border-orange-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <div className="text-2xl">🔥</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Hot Observables</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Multicast - all subscribers share the same execution. The producer exists outside
                the Observable.
              </p>
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Characteristics:</h4>
                  <ul className="space-y-1 text-sm text-orange-700">
                    <li>• All subscribers share the same stream</li>
                    <li>• Data producer exists independently</li>
                    <li>• Late subscribers miss earlier values</li>
                    <li>• Examples: DOM events, Subjects, WebSocket</li>
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-white overflow-x-auto">
                    {`const subject = new Subject();
const hot$ = subject.asObservable();

// First subscriber
hot$.subscribe(x => console.log('A:', x));

subject.next(1);
subject.next(2);

// Second subscriber (misses 1, 2)
hot$.subscribe(x => console.log('B:', x));

subject.next(3); // Both A and B receive this`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Making Cold Observable Hot */}
          <div className="mt-8 bg-white rounded-xl p-8 border border-purple-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.967 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2 11.033 2.744A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Converting Cold to Hot
            </h3>
            <p className="text-gray-600 mb-4">
              You can convert cold Observables to hot using <code>share()</code>,{' '}
              <code>publish()</code>, or <code>connect()</code>.
            </p>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-white overflow-x-auto">
                {`import { interval } from 'rxjs';
import { share, take } from 'rxjs/operators';

// Cold interval
const cold$ = interval(1000).pipe(take(5));

// Make it hot with share()
const hot$ = cold$.pipe(share());

// Both subscribers share the same stream
hot$.subscribe(x => console.log('A:', x));
setTimeout(() => {
  hot$.subscribe(x => console.log('B:', x));
}, 2500);`}
              </pre>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Subscription Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Subscription */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Subscription</h3>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <pre className="text-sm text-white overflow-x-auto">
                  {`const source$ = interval(1000);

const subscription = source$.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done')
});

// Unsubscribe to stop receiving values
setTimeout(() => {
  subscription.unsubscribe();
}, 5000);`}
                </pre>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  • <strong>next:</strong> Handle emitted values
                </p>
                <p>
                  • <strong>error:</strong> Handle errors
                </p>
                <p>
                  • <strong>complete:</strong> Handle completion
                </p>
              </div>
            </div>

            {/* Multiple Subscriptions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Managing Multiple Subscriptions
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <pre className="text-sm text-white overflow-x-auto">
                  {`import { Subscription } from 'rxjs';

const subs = new Subscription();

// Add multiple subscriptions
subs.add(source1$.subscribe(/* ... */));
subs.add(source2$.subscribe(/* ... */));
subs.add(source3$.subscribe(/* ... */));

// Unsubscribe from all at once
subs.unsubscribe();

// Or use takeUntil pattern
const destroy$ = new Subject();

source$.pipe(
  takeUntil(destroy$)
).subscribe(/* ... */);

// When component unmounts
destroy$.next();
destroy$.complete();`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common Observable Patterns
          </h2>

          <div className="space-y-8">
            {/* Auto-unsubscribing */}
            <div className="bg-white rounded-xl p-8 border border-green-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Auto-unsubscribing in Components
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">React Hook</h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-white overflow-x-auto">
                      {`import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const subscription = source$.subscribe(
      value => console.log(value)
    );
    
    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);
  
  return <div>...</div>;
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Async Pipe (Angular)</h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-white overflow-x-auto">
                      {`// Component
export class MyComponent {
  data$ = this.service.getData();
}

<!-- Template -->
<div *ngFor="let item of data$ | async">
  {{ item.name }}
</div>

<!-- Automatically subscribes/unsubscribes -->`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

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
                Error Handling Patterns
              </h3>
              <div className="bg-gray-900 rounded-lg p-6">
                <pre className="text-sm text-white overflow-x-auto">
                  {`import { catchError, retry, retryWhen, delay, take } from 'rxjs/operators';
import { of, throwError, timer } from 'rxjs';

// Basic error handling
source$.pipe(
  catchError(error => {
    console.error('Error occurred:', error);
    return of('fallback value'); // Continue with fallback
  })
).subscribe(/* ... */);

// Retry on error
source$.pipe(
  retry(3), // Retry up to 3 times
  catchError(error => {
    console.error('Failed after retries:', error);
    return of(null); // Final fallback
  })
).subscribe(/* ... */);

// Advanced retry with backoff
source$.pipe(
  retryWhen(errors => 
    errors.pipe(
      delay(1000),        // Wait 1 second between retries
      take(3)             // Max 3 retries
    )
  ),
  catchError(() => of('Failed permanently'))
).subscribe(/* ... */);`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Master Observables!</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            You now understand how Observables work. Next, learn about Operators - the powerful
            functions that transform and compose Observable streams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Operators');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Learn Operators</span>
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
              className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Back to Overview</span>
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

export default Observables;
