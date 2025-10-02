import React, { useState } from 'react';
import MarbleDiagram2D from '../visualizations/2d/MarbleDiagram2D';

const MarbleDiagrams: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 rounded-2xl p-8 mb-8 border border-teal-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marble Diagrams</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Visual language for understanding RxJS streams - see time, values, and operations at a
            glance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* What are Marble Diagrams */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What are Marble Diagrams?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Definition */}
            <div className="bg-white rounded-xl p-8 border border-teal-200 shadow-sm">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visual Timeline</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Marble diagrams are the <strong>standard way</strong> to visualize Observable
                streams over time. They show when values are emitted, errors occur, and streams
                complete.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Horizontal Timeline:</strong> Time flows from left to right
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Marbles:</strong> Represent emitted values
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Symbols:</strong> Show completion, errors, and operations
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Syntax */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Basic Syntax</h3>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Timeline</h4>
                  <div className="font-mono text-sm bg-white rounded p-3 border">
                    <div className="text-gray-600">--a--b--c--d--|</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Stream emits a, b, c, d then completes
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Symbols</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-2 py-1 rounded border">-</code>
                      <span className="text-gray-600">Time passes (no emission)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-2 py-1 rounded border">a</code>
                      <span className="text-gray-600">Value emission (marble)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-2 py-1 rounded border">|</code>
                      <span className="text-gray-600">Stream completion</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-2 py-1 rounded border">X</code>
                      <span className="text-gray-600">Error occurrence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Marble Diagram Playground */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Marble Diagram Playground
          </h2>
          <MarbleDiagram2D />
        </div>

        {/* Reading Marble Diagrams */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Reading Marble Diagrams
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            {/* Example Navigation */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'basic', label: 'Basic Stream', icon: '📊' },
                { id: 'transform', label: 'Transformation', icon: '🔄' },
                { id: 'filter', label: 'Filtering', icon: '🔍' },
                { id: 'combine', label: 'Combination', icon: '🤝' },
                { id: 'error', label: 'Error Handling', icon: '⚠️' },
              ].map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeExample === example.id
                      ? 'border-teal-500 text-teal-600'
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
              {activeExample === 'basic' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Stream Patterns</h3>
                    <p className="text-gray-600">
                      Understanding fundamental marble diagram patterns
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Common Patterns</h4>
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Simple Emission</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border mb-2">
                            <div className="text-blue-600">--1--2--3--4--|</div>
                          </div>
                          <p className="text-xs text-gray-600">Emits 1, 2, 3, 4 then completes</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Rapid Emission</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border mb-2">
                            <div className="text-blue-600">-abc-def-ghi--|</div>
                          </div>
                          <p className="text-xs text-gray-600">Three bursts of rapid emissions</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Sparse Emission</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border mb-2">
                            <div className="text-blue-600">-----a--------b--------c--|</div>
                          </div>
                          <p className="text-xs text-gray-600">Long delays between emissions</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Never Completes</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border mb-2">
                            <div className="text-blue-600">--1--2--3--4--5--6--7---</div>
                          </div>
                          <p className="text-xs text-gray-600">Stream continues indefinitely</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Immediate Error</h5>
                          <div className="font-mono text-sm bg-white rounded p-3 border mb-2">
                            <div className="text-red-600">--1--2--X</div>
                          </div>
                          <p className="text-xs text-gray-600">Error occurs after two emissions</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Code Examples</h4>
                      <div className="space-y-6">
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-2">Simple Emission</div>
                          <pre className="text-sm text-white overflow-x-auto">
                            {`of(1, 2, 3, 4)
// --1--2--3--4--|`}
                          </pre>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-2">Timed Intervals</div>
                          <pre className="text-sm text-white overflow-x-auto">
                            {`interval(1000).pipe(take(4))
// --1--2--3--4--|`}
                          </pre>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-2">Custom Timing</div>
                          <pre className="text-sm text-white overflow-x-auto">
                            {`timer(500, 2000).pipe(take(3))
// -----a--------b--------c--|`}
                          </pre>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-2">Never Ending</div>
                          <pre className="text-sm text-white overflow-x-auto">
                            {`interval(1000)
// --1--2--3--4--5--6--7---`}
                          </pre>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-2">With Error</div>
                          <pre className="text-sm text-white overflow-x-auto">
                            {`of(1, 2).pipe(
  concatWith(throwError('error'))
)
// --1--2--X`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'transform' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Transformation Operators
                    </h3>
                    <p className="text-gray-600">
                      See how operators transform input streams to output streams
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Map Example */}
                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        map() - Transform Each Value
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1--2--3--4--|</div>
                              <div className="text-teal-600"> map(x =&gt; x * 2)</div>
                              <div className="text-blue-600">Output: --2--4--6--8--|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  map(x => x * 2)
)

// Each value is doubled
// 1 → 2, 2 → 4, 3 → 6, 4 → 8`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scan Example */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        scan() - Accumulate Over Time
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1--2--3--4--|</div>
                              <div className="text-blue-600"> scan((acc, x) =&gt; acc + x, 0)</div>
                              <div className="text-green-600">Output: --1--3--6--10-|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  scan((acc, x) => acc + x, 0)
)

// Running sum
// 1 → 1, 2 → 3, 3 → 6, 4 → 10`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buffer Example */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        buffer() - Collect Values
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Source: --1--2--3--4--5--6--|</div>
                              <div className="text-gray-600">Notifier: -----a-----b-----c--|</div>
                              <div className="text-purple-600"> buffer(notifier$)</div>
                              <div className="text-green-600">
                                Output: -----[1,2]--[3,4]--[5,6]|
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  buffer(notifier$)
)

// Collects values into arrays
// When notifier emits, buffer is released`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'filter' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Filtering Operators</h3>
                    <p className="text-gray-600">Control which values pass through the stream</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Filter Example */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        filter() - Conditional Filtering
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1--2--3--4--5--6--|</div>
                              <div className="text-green-600"> filter(x =&gt; x % 2 === 0)</div>
                              <div className="text-blue-600">Output: -----2-----4-----6--|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  filter(x => x % 2 === 0)
)

// Only even numbers pass through
// 1,3,5 are filtered out`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Take Example */}
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">take() - Limit Count</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1--2--3--4--5--6--7--</div>
                              <div className="text-yellow-600"> take(3)</div>
                              <div className="text-blue-600">Output: --1--2--3|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  take(3)
)

// Takes first 3 values then completes
// Automatically unsubscribes`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DistinctUntilChanged Example */}
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        distinctUntilChanged() - Eliminate Duplicates
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1--1--2--2--2--3--1--|</div>
                              <div className="text-indigo-600"> distinctUntilChanged()</div>
                              <div className="text-blue-600">Output: --1-----2--------3--1--|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  distinctUntilChanged()
)

// Only emits when value changes
// Perfect for avoiding duplicate API calls`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Debounce Example */}
                    <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        debounceTime() - Rate Limiting
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Input: --1-23-4---5-6----7----|</div>
                              <div className="text-pink-600"> debounceTime(20ms)</div>
                              <div className="text-blue-600">Output: -------4------6----7---|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  debounceTime(300)
)

// Only emits after silence period
// Great for search-as-you-type`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'combine' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Combination Operators</h3>
                    <p className="text-gray-600">Combine multiple streams into one</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Merge Example */}
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        merge() - Interleave Streams
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Stream A: --1-----3-----5--|</div>
                              <div className="text-gray-600">Stream B: ----2-----4-----6|</div>
                              <div className="text-orange-600"> merge(streamA, streamB)</div>
                              <div className="text-blue-600">Output: --1-2---3-4---5-6|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`merge(streamA$, streamB$)

// Values from both streams
// Emitted in chronological order
// Completes when all streams complete`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CombineLatest Example */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        combineLatest() - Latest Values
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Stream A: --1-----3-----5--|</div>
                              <div className="text-gray-600">Stream B: ----2-----4-----6|</div>
                              <div className="text-purple-600"> combineLatest([A, B])</div>
                              <div className="text-blue-600">
                                Output: ----[1,2]-[3,2][3,4]-[5,4][5,6]|
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`combineLatest([streamA$, streamB$])

// Emits array of latest values
// Only after both streams emit at least once
// Perfect for form validation`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Zip Example */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">zip() - Pair Values</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Stream A: --1-----3-----5--|</div>
                              <div className="text-gray-600">Stream B: ----2-----4-----6----|</div>
                              <div className="text-green-600"> zip(streamA, streamB)</div>
                              <div className="text-blue-600">Output: ----[1,2]--[3,4]--[5,6]|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`zip(streamA$, streamB$)

// Pairs values by emission order
// Waits for corresponding values
// Like a zipper - pairs up in order`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WithLatestFrom Example */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        withLatestFrom() - Sample Other Stream
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Source: --a-----b-----c--|</div>
                              <div className="text-gray-600">Other: -1-2-3-4-5-6-7-8-|</div>
                              <div className="text-blue-600"> withLatestFrom(other$)</div>
                              <div className="text-green-600">Output: --[a,3]--[b,6]--[c,8]|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  withLatestFrom(other$)
)

// Samples other stream when source emits
// Only emits when source emits
// Great for including additional context`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeExample === 'error' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Handling</h3>
                    <p className="text-gray-600">
                      Visualize error propagation and recovery strategies
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Basic Error */}
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Error Propagation</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Source: --1--2--3--X</div>
                              <div className="text-red-600"> (error occurs)</div>
                              <div className="text-red-600">Output: --1--2--3--X</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.subscribe({
  next: value => console.log(value),
  error: error => console.error(error),
  complete: () => console.log('Done')
})

// Error terminates the stream
// No more values after error`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CatchError Example */}
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        catchError() - Error Recovery
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Source: --1--2--3--X</div>
                              <div className="text-yellow-600">
                                {' '}
                                catchError(() =&gt; of('error'))
                              </div>
                              <div className="text-blue-600">Output: --1--2--3--error|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  catchError(error => {
    console.error('Caught:', error);
    return of('fallback value');
  })
)

// Error is caught and replaced
// Stream continues with fallback`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Retry Example */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        retry() - Automatic Retry
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Attempt 1: --1--2--X</div>
                              <div className="text-gray-600">Attempt 2: --1--2--3--4--|</div>
                              <div className="text-green-600"> retry(1)</div>
                              <div className="text-blue-600">Output: --1--2----1--2--3--4--|</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  retry(2) // Retry up to 2 times
)

// Resubscribes to source on error
// Success on second attempt
// Perfect for network requests`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RetryWhen Example */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        retryWhen() - Conditional Retry
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-3">Marble Diagram</h5>
                            <div className="font-mono text-sm space-y-2">
                              <div className="text-gray-600">Source: --1--2--X</div>
                              <div className="text-gray-600">Delay: -------a (1s delay)</div>
                              <div className="text-purple-600">
                                {' '}
                                retryWhen(errors =&gt; errors.pipe(delay(1000)))
                              </div>
                              <div className="text-blue-600">
                                Output: --1--2--------1--2--3--4--|
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-white overflow-x-auto">
                              {`source$.pipe(
  retryWhen(errors => 
    errors.pipe(
      delay(1000), // Wait 1 second
      take(3)      // Max 3 retries
    )
  )
)

// Smart retry with delay
// Exponential backoff possible`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testing with Marble Diagrams */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Testing with Marble Diagrams
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Testing Setup */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                RxJS Testing Library
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-white overflow-x-auto">
                  {`import { TestScheduler } from 'rxjs/testing';

describe('Observable Tests', () => {
  let testScheduler: TestScheduler;
  
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  
  it('should map values correctly', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;
      
      const source$ = cold('--a--b--c--|', {
        a: 1, b: 2, c: 3
      });
      
      const expected = '    --x--y--z--|';
      const expectedValues = {
        x: 2, y: 4, z: 6
      };
      
      const result$ = source$.pipe(
        map(x => x * 2)
      );
      
      expectObservable(result$).toBe(expected, expectedValues);
    });
  });
});`}
                </pre>
              </div>
            </div>

            {/* Marble Testing Syntax */}
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
                Testing Syntax Guide
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Time Frame</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">-</code>
                      <span className="text-gray-600">1 time unit</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">a</code>
                      <span className="text-gray-600">Value emission</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">|</code>
                      <span className="text-gray-600">Completion</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">#</code>
                      <span className="text-gray-600">Error</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">^</code>
                      <span className="text-gray-600">Subscription point</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="bg-white px-2 py-1 rounded">!</code>
                      <span className="text-gray-600">Unsubscription point</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Example Test</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`const source = '--a--b--c--|';
const subs =   '^----------!';
const expected = '--x--y--z--|';`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Marble Editor */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Marble Editor
          </h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Create your own marble diagrams to visualize operator behavior
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
                <p className="text-yellow-800 text-sm">
                  🚧 <strong>Coming Soon:</strong> Interactive marble diagram editor with
                  drag-and-drop functionality, operator playground, and real-time visualization of
                  custom streams.
                </p>
              </div>
            </div>

            {/* Placeholder for Interactive Editor */}
            <div className="bg-gray-50 rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Interactive Marble Editor
              </h3>
              <p className="text-gray-500 mb-4">
                Visual editor for creating and testing marble diagrams
              </p>
              <div className="flex justify-center space-x-4">
                <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
                  <span className="text-sm text-gray-600">🎯 Drag & Drop Values</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
                  <span className="text-sm text-gray-600">⚡ Live Operator Testing</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
                  <span className="text-sm text-gray-600">📊 Real-time Visualization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Marble Diagram Best Practices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reading Tips */}
            <div className="bg-white rounded-xl p-8 border border-teal-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Reading Tips
              </h3>
              <div className="space-y-4">
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <h4 className="font-semibold text-teal-800 mb-2">✅ Do This</h4>
                  <ul className="space-y-1 text-sm text-teal-700">
                    <li>• Start with input streams at the top</li>
                    <li>• Place output stream at the bottom</li>
                    <li>• Align timing across all streams</li>
                    <li>• Use consistent spacing for time units</li>
                    <li>• Include operator description</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Avoid This</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Inconsistent time spacing</li>
                    <li>• Missing completion or error markers</li>
                    <li>• Unclear value representations</li>
                    <li>• Too many values in one diagram</li>
                    <li>• Missing context or explanation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Documentation Tips */}
            <div className="bg-white rounded-xl p-8 border border-blue-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Documentation
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Value Mapping</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-white overflow-x-auto">
                      {`// Always define value mappings
const values = {
  a: { id: 1, name: 'Alice' },
  b: { id: 2, name: 'Bob' },
  c: { id: 3, name: 'Charlie' }
};

// Clear marble diagram
source: --a--b--c--|`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Testing Integration</h4>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Use marble diagrams in your test descriptions and documentation. They make
                      complex stream behavior immediately understandable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Marble Diagrams Mastered! 📊</h2>
          <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
            You can now read, create, and use marble diagrams to visualize and test RxJS streams.
            Ready to explore error handling strategies and real-world patterns!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Error Handling');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Error Handling</span>
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
              className="bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Advanced Operators</span>
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

export default MarbleDiagrams;
