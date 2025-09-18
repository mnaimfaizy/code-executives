import React from 'react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/rxjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-violet-50 rounded-2xl p-8 mb-8 border border-purple-100 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Reactive Programming with RxJS
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master asynchronous data streams and the reactive programming paradigm
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">7M+</div>
              <div className="text-sm text-gray-600">weekly downloads on npm</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-violet-100 shadow-sm">
              <div className="text-3xl font-bold text-violet-600 mb-2">2010</div>
              <div className="text-sm text-gray-600">First introduced as Rx.NET</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-2">Streams</div>
              <div className="text-sm text-gray-600">Everything is a data stream</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What is RxJS */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">Rx</span>
              </div>
              What is RxJS?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                RxJS (Reactive Extensions for JavaScript) is a{' '}
                <strong>powerful library for reactive programming</strong>
                using Observables, making it easier to compose asynchronous or callback-based code.
              </p>
              <p>
                Think of RxJS as <strong>lodash for events</strong> - any event, whether it's user
                input, an HTTP request, or a timer, can be treated as a continuous stream of data
                that you can query, transform, and manipulate.
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="text-purple-800">
                  <strong>Core Philosophy:</strong> Everything can be modeled as a stream - from
                  user clicks and HTTP responses to complex data transformations and real-time
                  updates.
                </p>
              </div>
            </div>
          </div>

          {/* Reactive Paradigm */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">The Reactive Paradigm</h3>
            <p className="text-gray-700 mb-4">
              RxJS enables a declarative programming style where you describe what should happen
              when data changes, rather than imperatively managing state and callbacks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Traditional Approach</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Callback hell and nested promises</li>
                  <li>• Manual state management</li>
                  <li>• Imperative control flow</li>
                  <li>• Difficult error handling</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Reactive Approach</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Declarative stream composition</li>
                  <li>• Automated state updates</li>
                  <li>• Functional programming patterns</li>
                  <li>• Built-in error propagation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Common Use Cases</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Type-ahead Search</h4>
                  <p className="text-gray-600 text-sm">
                    Debounce user input, cancel previous requests, and handle search results
                    reactively.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Real-time Data Updates</h4>
                  <p className="text-gray-600 text-sm">
                    Handle WebSocket connections, live data feeds, and push notifications
                    seamlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Form Validation</h4>
                  <p className="text-gray-600 text-sm">
                    Async validation, dependent fields, and complex form state management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation & Quick Links */}
        <div className="space-y-6">
          {/* Exploration Navigation */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Explore RxJS Concepts</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigateToSection('Reactive Manifesto')}
                className="w-full text-left p-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-800 group-hover:text-purple-900">
                      Reactive Manifesto
                    </h4>
                    <p className="text-xs text-purple-600 mt-1">
                      The paradigm shift to reactive programming
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Core Components')}
                className="w-full text-left p-4 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-violet-800 group-hover:text-violet-900">
                      Core Components
                    </h4>
                    <p className="text-xs text-violet-600 mt-1">
                      Observables, Observers, and Subscriptions
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-violet-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-violet-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Observables')}
                className="w-full text-left p-4 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-indigo-800 group-hover:text-indigo-900">
                      Observables
                    </h4>
                    <p className="text-xs text-indigo-600 mt-1">
                      The foundation of reactive streams
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Operators')}
                className="w-full text-left p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800 group-hover:text-blue-900">
                      Operators
                    </h4>
                    <p className="text-xs text-blue-600 mt-1">Transform and compose data streams</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Marble Diagrams')}
                className="w-full text-left p-4 rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-cyan-800 group-hover:text-cyan-900">
                      Marble Diagrams
                    </h4>
                    <p className="text-xs text-cyan-600 mt-1">Visualize streams over time</p>
                  </div>
                  <div className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Concepts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Observable Streams</p>
                  <p className="text-xs text-gray-600">
                    Lazy collections that emit values over time
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Functional Composition</p>
                  <p className="text-xs text-gray-600">
                    Chain operators to transform data declaratively
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Error Handling</p>
                  <p className="text-xs text-gray-600">
                    Built-in error propagation and recovery patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Backpressure</p>
                  <p className="text-xs text-gray-600">
                    Handle fast producers and slow consumers gracefully
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Think Reactively?</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Dive into interactive visualizations that will transform how you think about
            asynchronous programming and data flow in your applications.
          </p>
          <button
            onClick={() => navigateToSection('Core Components')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Learning</span>
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
    </section>
  );
};

export default Introduction;
