import React, { useState } from 'react';
import Operators2D from '../../components/models2d/rxjs/Operators2D';

const Operators: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('transformation');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-8 mb-8 border border-purple-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RxJS Operators</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            The building blocks for transforming, filtering, and composing Observable streams
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* What Are Operators */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Are Operators?</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Definition */}
            <div className="bg-white rounded-xl p-8 border border-purple-200 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.967 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2 11.033 2.744A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pure Functions</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Operators are <strong>pure functions</strong> that take an Observable as input and
                return a new Observable as output. They don't modify the original Observable.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Immutable:</strong> Never modify the source
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Composable:</strong> Chain multiple operators
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Predictable:</strong> Same input, same output
                  </span>
                </div>
              </div>
            </div>

            {/* Pipe Function */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The pipe() Function</h3>
              <p className="text-gray-600 mb-6">
                Operators are used with the{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">pipe()</code> method to
                create transformation pipelines.
              </p>
              <div className="bg-gray-900 rounded-lg p-6">
                <pre className="text-sm text-white overflow-x-auto">
                  {`import { of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

const source$ = of(1, 2, 3, 4, 5);

const result$ = source$.pipe(
  filter(x => x % 2 === 0),  // Keep even numbers
  map(x => x * 10),          // Multiply by 10
  take(2)                    // Take first 2 values
);

result$.subscribe(console.log);
// Output: 20, 40`}
                </pre>
              </div>
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700">
                  Each operator in the pipe receives the output of the previous operator, creating a
                  functional composition pipeline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Operators Playground */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Operators Playground
          </h2>
          <Operators2D />
        </div>

        {/* Operator Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Operator Categories</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'transformation', label: 'Transformation', icon: '🔄', color: 'blue' },
                { id: 'filtering', label: 'Filtering', icon: '🔍', color: 'green' },
                { id: 'combination', label: 'Combination', icon: '🔗', color: 'purple' },
                { id: 'utility', label: 'Utility', icon: '🛠️', color: 'orange' },
                { id: 'conditional', label: 'Conditional', icon: '❓', color: 'red' },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? `border-${category.color}-500 text-${category.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>

            {/* Category Content */}
            <div className="max-w-5xl mx-auto">
              {activeCategory === 'transformation' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Transformation Operators
                    </h3>
                    <p className="text-gray-600">
                      Transform emitted values into different values or structures
                    </p>
                  </div>

                  {/* map */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        map
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">map()</h4>
                        <p className="text-sm text-gray-600">Transform each emitted value</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1, 2, 3, 4).pipe(
  map(x => x * 2)
).subscribe(console.log);

// Output: 2, 4, 6, 8`}
                          </pre>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Visual:</div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                                1
                              </div>
                              <span>→</span>
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                                2
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                                2
                              </div>
                              <span>→</span>
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                                4
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                                3
                              </div>
                              <span>→</span>
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                                6
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* flatMap/mergeMap */}
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        merge
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">mergeMap() / flatMap()</h4>
                        <p className="text-sm text-gray-600">Map to Observable and flatten</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { of, delay } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

of(1, 2, 3).pipe(
  mergeMap(x => of(x * 10).pipe(delay(x * 100)))
).subscribe(console.log);

// Output: 10, 20, 30 (with delays)`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-indigo-100 rounded-lg p-3">
                      <p className="text-sm text-indigo-800">
                        <strong>Use case:</strong> HTTP requests, async operations that can run
                        concurrently
                      </p>
                    </div>
                  </div>

                  {/* switchMap */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        switch
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">switchMap()</h4>
                        <p className="text-sm text-gray-600">
                          Cancel previous, map to new Observable
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { fromEvent } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

const searchInput = document.getElementById('search');

fromEvent(searchInput, 'input').pipe(
  debounceTime(300),
  switchMap(event => 
    fetch(\`/search?q=\${event.target.value}\`)
  )
).subscribe(results => console.log(results));`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-purple-100 rounded-lg p-3">
                      <p className="text-sm text-purple-800">
                        <strong>Use case:</strong> Search suggestions, typeahead, canceling previous
                        requests
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'filtering' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Filtering Operators</h3>
                    <p className="text-gray-600">
                      Filter emitted values based on conditions or timing
                    </p>
                  </div>

                  {/* filter */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        filter
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">filter()</h4>
                        <p className="text-sm text-gray-600">Emit values that pass a test</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-white overflow-x-auto">
                            {`import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5, 6).pipe(
  filter(x => x % 2 === 0)
).subscribe(console.log);

// Output: 2, 4, 6`}
                          </pre>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Even numbers only:</div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs line-through">
                                1
                              </div>
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">
                                2
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs line-through">
                                3
                              </div>
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">
                                4
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* take */}
                  <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        take
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          take() / takeWhile() / takeUntil()
                        </h4>
                        <p className="text-sm text-gray-600">
                          Take specific number or condition-based values
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2 text-sm">take(n)</h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`of(1,2,3,4,5).pipe(
  take(3)
).subscribe(console.log);
// Output: 1, 2, 3`}
                        </pre>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2 text-sm">takeWhile()</h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`of(1,2,3,4,5).pipe(
  takeWhile(x => x < 4)
).subscribe(console.log);
// Output: 1, 2, 3`}
                        </pre>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2 text-sm">takeUntil()</h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`source$.pipe(
  takeUntil(stopSignal$)
).subscribe(console.log);
// Stops when stopSignal$ emits`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* debounceTime */}
                  <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        debounce
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">debounceTime()</h4>
                        <p className="text-sm text-gray-600">Emit only after silence period</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

// Search input with 300ms debounce
fromEvent(searchInput, 'input').pipe(
  map(event => event.target.value),
  debounceTime(300)
).subscribe(searchTerm => {
  // Only fires 300ms after user stops typing
  performSearch(searchTerm);
});`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-cyan-100 rounded-lg p-3">
                      <p className="text-sm text-cyan-800">
                        <strong>Perfect for:</strong> Search inputs, button click protection, resize
                        events
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'combination' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Combination Operators</h3>
                    <p className="text-gray-600">Combine multiple Observables into one</p>
                  </div>

                  {/* merge */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        merge
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">merge()</h4>
                        <p className="text-sm text-gray-600">
                          Combine multiple Observables concurrently
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { merge, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const fast$ = interval(500).pipe(map(x => \`Fast: \${x}\`), take(5));
const slow$ = interval(1000).pipe(map(x => \`Slow: \${x}\`), take(3));

merge(fast$, slow$).subscribe(console.log);

// Output: Fast: 0, Slow: 0, Fast: 1, Fast: 2, Slow: 1, ...`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-purple-100 rounded-lg p-3">
                      <p className="text-sm text-purple-800">
                        <strong>Use case:</strong> Multiple event sources, parallel API calls
                      </p>
                    </div>
                  </div>

                  {/* combineLatest */}
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        combine
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">combineLatest()</h4>
                        <p className="text-sm text-gray-600">
                          Combine latest values when any Observable emits
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { combineLatest, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const name$ = of('John', 'Jane').pipe(delay(100));
const age$ = of(25, 30).pipe(delay(200));

combineLatest([name$, age$]).subscribe(([name, age]) => {
  console.log(\`\${name} is \${age} years old\`);
});

// Output: Jane is 30 years old`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-indigo-100 rounded-lg p-3">
                      <p className="text-sm text-indigo-800">
                        <strong>Use case:</strong> Form validation, dependent data, reactive
                        calculations
                      </p>
                    </div>
                  </div>

                  {/* zip */}
                  <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        zip
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">zip()</h4>
                        <p className="text-sm text-gray-600">
                          Wait for all Observables to emit, then combine
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { zip, of, interval } from 'rxjs';
import { take } from 'rxjs/operators';

const letters$ = of('A', 'B', 'C');
const numbers$ = interval(1000).pipe(take(3));

zip(letters$, numbers$).subscribe(([letter, number]) => {
  console.log(\`\${letter}\${number}\`);
});

// Output: A0, B1, C2 (with 1s delays)`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-pink-100 rounded-lg p-3">
                      <p className="text-sm text-pink-800">
                        <strong>Use case:</strong> Pairing corresponding values, synchronized
                        sequences
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'utility' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Utility Operators</h3>
                    <p className="text-gray-600">
                      Helpful operators for debugging, side effects, and flow control
                    </p>
                  </div>

                  {/* tap */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        tap
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">tap()</h4>
                        <p className="text-sm text-gray-600">
                          Perform side effects without affecting the stream
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

of(1, 2, 3, 4).pipe(
  tap(x => console.log('Before:', x)),    // Side effect
  map(x => x * 2),
  tap(x => console.log('After:', x)),     // Side effect
  filter(x => x > 4)
).subscribe(result => console.log('Final:', result));

// Output:
// Before: 1, After: 2
// Before: 2, After: 4
// Before: 3, After: 6, Final: 6
// Before: 4, After: 8, Final: 8`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-orange-100 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        <strong>Perfect for:</strong> Debugging, logging, analytics, cache updates
                      </p>
                    </div>
                  </div>

                  {/* delay */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        delay
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">delay() / delayWhen()</h4>
                        <p className="text-sm text-gray-600">
                          Delay emissions by time or condition
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2 text-sm">delay(ms)</h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`of(1, 2, 3).pipe(
  delay(1000)
).subscribe(console.log);
// All values delayed by 1s`}
                        </pre>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2 text-sm">delayWhen()</h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {`source$.pipe(
  delayWhen(x => timer(x * 100))
).subscribe(console.log);
// Dynamic delay based on value`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* share */}
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        share
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">share() / shareReplay()</h4>
                        <p className="text-sm text-gray-600">
                          Make cold Observable hot, share execution
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { interval } from 'rxjs';
import { share, shareReplay, take } from 'rxjs/operators';

// Without share - each subscription gets its own stream
const cold$ = interval(1000).pipe(take(3));

// With share - all subscriptions share the same stream
const hot$ = cold$.pipe(share());

// With shareReplay - late subscribers get replayed values
const replay$ = cold$.pipe(shareReplay(1));

hot$.subscribe(x => console.log('A:', x));
setTimeout(() => {
  hot$.subscribe(x => console.log('B:', x)); // Misses earlier values
}, 1500);

replay$.subscribe(x => console.log('C:', x));
setTimeout(() => {
  replay$.subscribe(x => console.log('D:', x)); // Gets last value immediately
}, 1500);`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'conditional' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Conditional Operators</h3>
                    <p className="text-gray-600">Control flow based on conditions and state</p>
                  </div>

                  {/* distinctUntilChanged */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        distinct
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">distinctUntilChanged()</h4>
                        <p className="text-sm text-gray-600">Emit only when value changes</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

of(1, 1, 2, 2, 2, 3, 1).pipe(
  distinctUntilChanged()
).subscribe(console.log);

// Output: 1, 2, 3, 1 (consecutive duplicates removed)

// With custom comparison
of({id: 1}, {id: 1}, {id: 2}).pipe(
  distinctUntilChanged((a, b) => a.id === b.id)
).subscribe(console.log);`}
                      </pre>
                    </div>
                    <div className="mt-4 bg-red-100 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Use case:</strong> Form inputs, state changes, preventing duplicate
                        API calls
                      </p>
                    </div>
                  </div>

                  {/* defaultIfEmpty */}
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        default
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">defaultIfEmpty()</h4>
                        <p className="text-sm text-gray-600">
                          Emit default value if source is empty
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { EMPTY } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

EMPTY.pipe(
  defaultIfEmpty('No data available')
).subscribe(console.log);

// Output: 'No data available'

// Practical example
searchResults$.pipe(
  defaultIfEmpty([]),
  map(results => results.length ? results : 'No results found')
).subscribe(console.log);`}
                      </pre>
                    </div>
                  </div>

                  {/* skipUntil */}
                  <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 text-xs">
                        skip
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          skipUntil() / skipWhile()
                        </h4>
                        <p className="text-sm text-gray-600">Skip values until condition is met</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-white overflow-x-auto">
                        {`import { interval, timer } from 'rxjs';
import { skipUntil, skipWhile } from 'rxjs/operators';

// Skip until another Observable emits
interval(1000).pipe(
  skipUntil(timer(3500)) // Skip first 3.5 seconds
).subscribe(console.log);
// Output: 3, 4, 5, 6...

// Skip while condition is true
of(1, 2, 3, 4, 5).pipe(
  skipWhile(x => x < 3)
).subscribe(console.log);
// Output: 3, 4, 5`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operator Chaining Best Practices */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Best Practices & Patterns
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Matters */}
            <div className="bg-white rounded-xl p-8 border border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Order Matters!
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Inefficient</h4>
                  <pre className="text-sm text-red-700 overflow-x-auto">
                    {`source$.pipe(
  map(x => x * 2),           // Transform all
  filter(x => x > 10),       // Then filter
  take(5)
)`}
                  </pre>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Efficient</h4>
                  <pre className="text-sm text-green-700 overflow-x-auto">
                    {`source$.pipe(
  filter(x => x > 5),        // Filter first
  take(5),                   // Limit early
  map(x => x * 2)            // Transform only needed
)`}
                  </pre>
                </div>
                <p className="text-sm text-gray-600">
                  Filter and limit early to reduce unnecessary operations on large streams.
                </p>
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
                  <h4 className="font-semibold text-gray-800 mb-2">Search with Debounce</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => searchAPI(term))
)`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Retry with Backoff</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`api$.pipe(
  retryWhen(errors => 
    errors.pipe(
      delay(1000),
      take(3)
    )
  )
)`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Loading States</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`request$.pipe(
  startWith({ loading: true }),
  map(data => ({ data, loading: false })),
  catchError(err => of({ error: err, loading: false }))
)`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Master the Operator Toolkit!</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            You now have a solid foundation in RxJS operators. Next, explore Subjects - the bridge
            between imperative and reactive programming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Subjects');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Learn Subjects</span>
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
                const encodedSection = encodeURIComponent('Advanced Operators');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-800 transition-colors inline-flex items-center justify-center space-x-2"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Operators;
