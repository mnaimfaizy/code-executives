import React, { useState, useEffect, useMemo } from 'react';

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  significance: string;
  details: string[];
  category: 'creation' | 'naming' | 'standardization' | 'performance' | 'expansion';
  icon: string;
}

const JavaScriptHistory: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());

  const timelineEvents: TimelineEvent[] = useMemo(
    () => [
      {
        year: 1995,
        title: 'The 10-Day Wonder',
        description: 'Brendan Eich creates LiveScript in just 10 days at Netscape Communications',
        significance: 'The birth of the language that would revolutionize the web',
        details: [
          'Initially named Mocha, then LiveScript',
          'Created under extreme time pressure',
          'Designed to make static web pages interactive',
          'Combined influences from Java, Scheme, and Self',
        ],
        category: 'creation',
        icon: '⚡',
      },
      {
        year: 1996,
        title: 'The Great Rename',
        description: 'LiveScript becomes JavaScript - a strategic marketing decision',
        significance:
          "Capitalizing on Java's popularity, despite being fundamentally different languages",
        details: [
          "Name changed to leverage Java's market presence",
          'Created confusion that persists today',
          "Sparked the beginning of the 'browser wars'",
          'Microsoft develops JScript as a competing implementation',
        ],
        category: 'naming',
        icon: '🏷️',
      },
      {
        year: 1997,
        title: 'The Standardization Salvation',
        description: 'JavaScript submitted to ECMA for standardization as ECMAScript 1',
        significance: 'End of the fragmentation nightmare and beginning of a unified web',
        details: [
          'European Computer Manufacturers Association takes control',
          'ECMAScript specification created',
          'Solved compatibility issues across browsers',
          'Established foundation for modern JavaScript',
        ],
        category: 'standardization',
        icon: '📋',
      },
      {
        year: 2008,
        title: 'The V8 Revolution',
        description: 'Google releases the high-performance V8 JavaScript engine',
        significance:
          'Crucial turning point enabling sophisticated, performance-intensive applications',
        details: [
          'Just-in-Time (JIT) compilation introduced',
          'Dramatic performance improvements',
          'Open-source C++ implementation',
          'Foundation for modern JavaScript applications',
        ],
        category: 'performance',
        icon: '🚀',
      },
      {
        year: 2009,
        title: 'Breaking Free from Browsers',
        description: 'Ryan Dahl releases Node.js, built on the V8 engine',
        significance: 'JavaScript liberated from browser confines for server-side development',
        details: [
          'Server-side JavaScript becomes reality',
          'Full-stack development with one language',
          'Enables desktop and mobile applications',
          'Birth of the modern JavaScript ecosystem',
        ],
        category: 'expansion',
        icon: '🌐',
      },
    ],
    []
  );

  const getCategoryColor = (category: TimelineEvent['category']) => {
    const colors = {
      creation: 'from-yellow-400 to-orange-500',
      naming: 'from-blue-400 to-indigo-500',
      standardization: 'from-green-400 to-emerald-500',
      performance: 'from-purple-400 to-violet-500',
      expansion: 'from-red-400 to-pink-500',
    };
    return colors[category];
  };

  const getCategoryBorderColor = (category: TimelineEvent['category']) => {
    const colors = {
      creation: 'border-orange-200 bg-orange-50',
      naming: 'border-indigo-200 bg-indigo-50',
      standardization: 'border-emerald-200 bg-emerald-50',
      performance: 'border-violet-200 bg-violet-50',
      expansion: 'border-pink-200 bg-pink-50',
    };
    return colors[category];
  };

  useEffect(() => {
    // Animate timeline events on mount
    timelineEvents.forEach((_, index) => {
      setTimeout(() => {
        setVisibleEvents((prev) => new Set([...prev, index]));
      }, index * 300);
    });
  }, [timelineEvents]);

  const BrowserWarsVisualization = () => (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">⚔️</span>
        The Browser Wars Era (1995-1997)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-white rounded-lg border border-red-200">
          <div className="text-3xl mb-2">🌐</div>
          <h4 className="font-semibold text-red-800">Netscape Navigator</h4>
          <p className="text-sm text-red-600">Original JavaScript</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-3xl mb-2">💠</div>
          <h4 className="font-semibold text-blue-800">Internet Explorer</h4>
          <p className="text-sm text-blue-600">JScript (incompatible)</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-3xl mb-2">❓</div>
          <h4 className="font-semibold text-gray-800">Other Browsers</h4>
          <p className="text-sm text-gray-600">Various implementations</p>
        </div>
      </div>
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Developer Nightmare:</strong> Each browser had its own incompatible version,
          making cross-browser development extremely challenging. This chaos drove the need for
          standardization.
        </p>
      </div>
    </div>
  );

  const StandardizationJourney = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-2xl mr-2">🏛️</span>
        The Path to Standardization
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300"></div>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Fragmentation Crisis</h4>
              <p className="text-sm text-gray-600">
                Multiple incompatible implementations causing developer headaches
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">ECMA Submission</h4>
              <p className="text-sm text-gray-600">
                JavaScript submitted to European Computer Manufacturers Association
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">ECMAScript Born</h4>
              <p className="text-sm text-gray-600">
                Unified specification ensuring consistent behavior across browsers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ModernEvolution = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-2xl mr-2">🚀</span>
        The Modern Era (2008-Present)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">V8</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Performance Revolution</h4>
              <p className="text-xs text-gray-600">JIT compilation changes everything</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 10-100x performance improvements</li>
            <li>• Real-time compilation optimizations</li>
            <li>• Complex applications become feasible</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">JS</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Universal Language</h4>
              <p className="text-xs text-gray-600">From browsers to everywhere</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Server-side with Node.js</li>
            <li>• Mobile app development</li>
            <li>• Desktop applications</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-8 mb-8 border border-amber-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JavaScript History: The Incredible Journey
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            From a 10-day prototype to the world's most ubiquitous programming language
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
              <div className="text-2xl font-bold text-amber-600">10 Days</div>
              <div className="text-sm text-gray-600">Initial Creation</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">3 Names</div>
              <div className="text-sm text-gray-600">Mocha → LiveScript → JavaScript</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="text-2xl font-bold text-green-600">1997</div>
              <div className="text-sm text-gray-600">ECMAScript Standard</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">90%+</div>
              <div className="text-sm text-gray-600">Websites Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          The Timeline of JavaScript Evolution
        </h2>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-yellow-400 to-pink-500 h-full rounded-full"></div>

          {/* Timeline Events */}
          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <div
                key={event.year}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                } transition-all duration-500 ${
                  visibleEvents.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                  <span className="text-xl">{event.icon}</span>
                </div>

                {/* Event Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'mr-auto pr-8' : 'ml-auto pl-8'}`}>
                  <div
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${getCategoryBorderColor(
                      event.category
                    )} ${
                      activeEvent === index
                        ? 'ring-2 ring-offset-2 ring-blue-400 scale-105'
                        : 'hover:scale-102'
                    }`}
                    onClick={() => setActiveEvent(activeEvent === index ? null : index)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`text-2xl font-bold bg-gradient-to-r ${getCategoryColor(event.category)} bg-clip-text text-transparent`}
                      >
                        {event.year}
                      </div>
                      <div className="text-2xl">{event.icon}</div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                    <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-gray-800">
                        <strong>Significance:</strong> {event.significance}
                      </p>
                    </div>

                    {/* Expandable Details */}
                    {activeEvent === index && (
                      <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top duration-300">
                        <h4 className="font-semibold text-gray-900 mb-2">Key Details:</h4>
                        <ul className="space-y-2">
                          {event.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-600">{detail}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 text-right">
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        {activeEvent === index ? 'Hide Details' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contextual Sections */}
      <BrowserWarsVisualization />
      <StandardizationJourney />
      <ModernEvolution />

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">From Chaos to Universal Language</h3>
          <p className="text-indigo-100 mb-6 leading-relaxed">
            What began as a rushed 10-day project to add interactivity to web pages has evolved into
            the backbone of modern software development. JavaScript's journey from browser chaos to
            universal standardization demonstrates how a simple idea, when nurtured by a global
            community, can transform the entire digital landscape.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-semibold">Universal Adoption</div>
              <div className="text-sm text-indigo-200">Powers 90%+ of websites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold">Performance Revolution</div>
              <div className="text-sm text-indigo-200">From interpreted to JIT compiled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-semibold">Continuous Evolution</div>
              <div className="text-sm text-indigo-200">Annual ECMAScript updates</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JavaScriptHistory;
