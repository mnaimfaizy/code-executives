import React from 'react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/javascript?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-8 mb-8 border border-indigo-100 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              The Inner Workings of JavaScript
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore the sophisticated execution model that powers the web's most ubiquitous programming language
            </p>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-2">90%+</div>
              <div className="text-sm text-gray-600">of websites use JavaScript</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-purple-100 shadow-sm">  
              <div className="text-3xl font-bold text-purple-600 mb-2">1995</div>
              <div className="text-sm text-gray-600">Created in just 10 days</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">Multi</div>
              <div className="text-sm text-gray-600">paradigm language</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* What is JavaScript */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                <span className="text-black font-bold text-sm">JS</span>
              </div>
              What is JavaScript?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                JavaScript is a <strong>powerful, multi-paradigm programming language</strong> and a foundational 
                technology of the World Wide Web, operating in concert with HTML and CSS to create rich, 
                interactive user experiences.
              </p>
              <p>
                While HTML provides the structure and CSS the style, JavaScript supplies the 
                <strong> dynamic functionality and behavior</strong> that modern web users expect, such as 
                animated image carousels, responsive menus, and dynamic content changes.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-800">
                  <strong>Modern Reality:</strong> Contemporary engines employ Just-in-Time (JIT) compilation, 
                  combining the speed of interpretation with performance optimizations to execute code with 
                  remarkable efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Paradigm Nature */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Paradigm Flexibility</h3>
            <p className="text-gray-700 mb-4">
              JavaScript supports multiple programming paradigms, allowing developers to choose the style 
              best suited for their task or combine them within a single application.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Event-Driven', color: 'bg-green-100 text-green-800 border-green-200' },
                { name: 'Functional', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                { name: 'Imperative', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                { name: 'Procedural', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                { name: 'Object-Oriented', color: 'bg-red-100 text-red-800 border-red-200' },
                { name: 'Prototype-Based', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
              ].map((paradigm) => (
                <div 
                  key={paradigm.name}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium text-center ${paradigm.color}`}
                >
                  {paradigm.name}
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Evolution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">From Browser to Everywhere</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Client-Side Origins</h4>
                  <p className="text-gray-600 text-sm">
                    Historically, JavaScript ran exclusively within web browsers to make static webpages dynamic, 
                    responding to user events and modifying webpage structure in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Server-Side Revolution</h4>
                  <p className="text-gray-600 text-sm">
                    With Node.js (2009), JavaScript expanded beyond browsers, enabling server-side development, 
                    desktop applications, mobile apps, and even IoT device programming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation & Quick Links */}
        <div className="space-y-6">
          {/* Exploration Navigation */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Explore JavaScript's Inner Workings</h3>
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-amber-800">JavaScript History</h4>
                    <p className="text-xs text-amber-600 mt-1">From 10-day creation to global dominance</p>
                    <p className="text-xs text-amber-500 mt-1 italic">Coming Soon</p>
                  </div>
                  <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 6.5a5.5 5.5 0 00-11 0 5.5 5.5 0 006.5 5.4v6.1a.5.5 0 001 0v-6.1A5.5 5.5 0 0012 6.5zM6.5 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateToSection('Execution Model')}
                className="w-full text-left p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800 group-hover:text-blue-900">Execution Model</h4>
                    <p className="text-xs text-blue-600 mt-1">Single-threaded with concurrency magic</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Engine & Runtime')}
                className="w-full text-left p-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-800 group-hover:text-purple-900">Engine & Runtime</h4>
                    <p className="text-xs text-purple-600 mt-1">V8, Call Stack, Memory Heap & more</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Event Loop')}
                className="w-full text-left p-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800 group-hover:text-green-900">Event Loop</h4>
                    <p className="text-xs text-green-600 mt-1">The master orchestrator of async behavior</p>
                  </div>
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('Memory Management')}
                className="w-full text-left p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-800 group-hover:text-red-900">Memory Management</h4>
                    <p className="text-xs text-red-600 mt-1">Garbage collection and memory optimization</p>
                  </div>
                  <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Key Facts */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Facts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">ECMAScript Standard</p>
                  <p className="text-xs text-gray-600">Standardized by ECMA in 1997 to unify implementations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">JIT Compilation</p>
                  <p className="text-xs text-gray-600">Modern engines use Just-in-Time compilation for performance</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Runtime Environment</p>
                  <p className="text-xs text-gray-600">Engine + APIs + Event Loop = Complete execution environment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Single-Threaded</p>
                  <p className="text-xs text-gray-600">One Call Stack, but non-blocking through async operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Dive Deeper?</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Explore interactive visualizations of JavaScript's execution model, from the Call Stack 
            to the Event Loop, and understand how your code really runs under the hood.
          </p>
          <button
            onClick={() => navigateToSection('Execution Model')}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Exploring</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
