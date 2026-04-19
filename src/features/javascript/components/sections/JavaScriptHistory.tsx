import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Tag,
  BookOpen,
  Rocket,
  Globe,
  Clock,
  Shield,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Swords,
  ArrowRight,
} from 'lucide-react';

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  significance: string;
  details: string[];
  category: 'creation' | 'naming' | 'standardization' | 'performance' | 'expansion';
  icon: React.ReactNode;
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
        icon: <Zap className="w-5 h-5" />,
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
        icon: <Tag className="w-5 h-5" />,
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
        icon: <BookOpen className="w-5 h-5" />,
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
        icon: <Rocket className="w-5 h-5" />,
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
        icon: <Globe className="w-5 h-5" />,
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

  const getCategoryNodeColor = (category: TimelineEvent['category']) => {
    const colors = {
      creation: 'bg-orange-500 text-white',
      naming: 'bg-indigo-500 text-white',
      standardization: 'bg-emerald-500 text-white',
      performance: 'bg-violet-500 text-white',
      expansion: 'bg-pink-500 text-white',
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
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <Swords className="w-4 h-4 text-red-600" />
        </div>
        The Browser Wars Era (1995–1997)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-red-200">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-red-600" />
          </div>
          <h4 className="font-semibold text-red-800 text-sm">Netscape Navigator</h4>
          <p className="text-xs text-red-500">Original JavaScript</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-blue-200">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-blue-800 text-sm">Internet Explorer</h4>
          <p className="text-xs text-blue-500">JScript (incompatible)</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </div>
          <h4 className="font-semibold text-gray-800 text-sm">Other Browsers</h4>
          <p className="text-xs text-gray-500">Various implementations</p>
        </div>
      </div>
      <div className="flex gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
        </div>
        <p className="text-yellow-800 text-sm leading-relaxed">
          <strong>Developer Nightmare:</strong> Each browser had its own incompatible version,
          making cross-browser development extremely challenging. This chaos drove the need for
          standardization.
        </p>
      </div>
    </div>
  );

  const StandardizationJourney = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-green-600" />
        </div>
        The Path to Standardization
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300"></div>
        <div className="space-y-5">
          {[
            {
              num: '1',
              color: 'bg-red-500',
              icon: <XCircle className="w-3.5 h-3.5 text-white" />,
              title: 'Fragmentation Crisis',
              desc: 'Multiple incompatible implementations causing developer headaches',
            },
            {
              num: '2',
              color: 'bg-yellow-500',
              icon: <ArrowRight className="w-3.5 h-3.5 text-white" />,
              title: 'ECMA Submission',
              desc: 'JavaScript submitted to European Computer Manufacturers Association',
            },
            {
              num: '3',
              color: 'bg-green-500',
              icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
              title: 'ECMAScript Born',
              desc: 'Unified specification ensuring consistent behavior across browsers',
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div
                className={`w-8 h-8 ${step.color} rounded-full flex items-center justify-center flex-shrink-0 relative z-10`}
              >
                {step.icon}
              </div>
              <div className="pt-1">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ModernEvolution = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Rocket className="w-4 h-4 text-purple-600" />
        </div>
        The Modern Era (2008–Present)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-purple-200">
          <div className="flex items-center mb-4 gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-700 font-black text-sm">V8</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Performance Revolution</h4>
              <p className="text-xs text-gray-500">JIT compilation changes everything</p>
            </div>
          </div>
          <ul className="space-y-2">
            {[
              '10–100x performance improvements',
              'Real-time compilation optimizations',
              'Complex applications become feasible',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-blue-200">
          <div className="flex items-center mb-4 gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">JS</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Universal Language</h4>
              <p className="text-xs text-gray-500">From browsers to everywhere</p>
            </div>
          </div>
          <ul className="space-y-2">
            {['Server-side with Node.js', 'Mobile app development', 'Desktop applications'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {item}
                </li>
              )
            )}
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
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 ring-4 ring-yellow-100">
              <Clock className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            JavaScript History: The Incredible Journey
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            From a 10-day prototype to the world's most ubiquitous programming language
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                value: '10 Days',
                label: 'Initial Creation',
                icon: <Zap className="w-4 h-4" />,
                color: 'text-amber-600',
                border: 'border-amber-200',
              },
              {
                value: '3 Names',
                label: 'Mocha → LiveScript → JavaScript',
                icon: <Tag className="w-4 h-4" />,
                color: 'text-blue-600',
                border: 'border-blue-200',
              },
              {
                value: '1997',
                label: 'ECMAScript Standard',
                icon: <Shield className="w-4 h-4" />,
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                value: '90%+',
                label: 'Websites Today',
                icon: <Globe className="w-4 h-4" />,
                color: 'text-purple-600',
                border: 'border-purple-200',
              },
            ].map((stat) => (
              <div
                key={stat.value}
                className={`bg-white rounded-xl p-4 border ${stat.border} shadow-sm`}
              >
                <div
                  className={`flex items-center justify-center gap-1.5 text-2xl font-bold ${stat.color} mb-1`}
                >
                  {stat.icon}
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 leading-snug">{stat.label}</div>
              </div>
            ))}
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
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10 ring-4 ring-white ${getCategoryNodeColor(event.category)}`}
                >
                  {event.icon}
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
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryNodeColor(event.category)}`}
                      >
                        {event.icon}
                      </div>
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
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Details:</h4>
                        <ul className="space-y-2">
                          {event.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{detail}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 text-right">
                      <button className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                        {activeEvent === index ? (
                          <>
                            Hide Details <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Learn More <ChevronDown className="w-3 h-3" />
                          </>
                        )}
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
          <p className="text-indigo-100 mb-8 leading-relaxed">
            What began as a rushed 10-day project to add interactivity to web pages has evolved into
            the backbone of modern software development. JavaScript's journey from browser chaos to
            universal standardization demonstrates how a simple idea, when nurtured by a global
            community, can transform the entire digital landscape.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="w-7 h-7 text-indigo-200" />,
                bg: 'bg-white/10',
                title: 'Universal Adoption',
                desc: 'Powers 90%+ of websites',
              },
              {
                icon: <Zap className="w-7 h-7 text-yellow-300" />,
                bg: 'bg-white/10',
                title: 'Performance Revolution',
                desc: 'From interpreted to JIT compiled',
              },
              {
                icon: <RefreshCw className="w-7 h-7 text-green-300" />,
                bg: 'bg-white/10',
                title: 'Continuous Evolution',
                desc: 'Annual ECMAScript updates',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`${item.bg} rounded-xl p-5 flex flex-col items-center gap-3`}
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-indigo-200">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JavaScriptHistory;
