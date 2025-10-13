import React from 'react';
import {
  Code,
  GitBranch,
  Database,
  Zap,
  ArrowRight,
  BookOpen,
  Target,
  Rocket,
  Brain,
  Gauge,
  Play,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Terminal,
  Layers,
  MonitorPlay,
  Box,
  FileCode,
  Package,
  Cpu,
  Network,
} from 'lucide-react';
import ThemeCard from '../components/shared/ThemeCard';
import { SEO } from '../shared/components/SEO/SEO';

const Home: React.FC = () => {
  const navigateToSection = (path: string) => {
    window.location.href = path;
  };

  const allModules = [
    {
      icon: <Code className="w-12 h-12" />,
      title: 'JavaScript Engine',
      description:
        'Understand V8 internals, memory management, and how async execution really works',
      path: '/javascript',
      color: 'indigo',
      gradient: 'from-indigo-600 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      topics: ['V8 Runtime', 'Call Stack', 'Memory Heap', 'Event Loop'],
      level: 'Deep Dive',
      duration: '2-3 hours',
    },
    {
      icon: <GitBranch className="w-12 h-12" />,
      title: 'Git Internals',
      description: 'Understand Git three-tree architecture and how version control actually works',
      path: '/git',
      color: 'orange',
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      topics: ['Object Model', '3-Tree Architecture', 'Branching Strategies', 'Internals'],
      level: 'Deep Dive',
      duration: '1-2 hours',
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: 'Data Structures',
      description:
        'Master performance trade-offs and when to use each data structure in production',
      path: '/datastructures',
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      topics: ['Performance Analysis', 'Trees', 'Graphs', 'Hash Tables'],
      level: 'Deep Dive',
      duration: '3-4 hours',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'RxJS Internals',
      description:
        'Understand reactive streams, operators, and how observables work under the hood',
      path: '/rxjs',
      color: 'purple',
      gradient: 'from-purple-600 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      topics: ['Observable Internals', 'Operators', 'Schedulers', 'Hot vs Cold'],
      level: 'Advanced',
      duration: '2-3 hours',
    },
    {
      icon: <Layers className="w-12 h-12" />,
      title: 'React Internals',
      description: 'Learn how React reconciliation, fiber architecture, and hooks actually work',
      path: '/react',
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      topics: ['Fiber Architecture', 'Reconciliation', 'Hooks Internals', 'Performance'],
      level: 'Advanced',
      duration: '3-4 hours',
    },
    {
      icon: <MonitorPlay className="w-12 h-12" />,
      title: 'Next.js Architecture',
      description: 'Master App Router, SSR/SSG internals, and server component architecture',
      path: '/nextjs',
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      topics: ['App Router', 'RSC Architecture', 'Rendering Pipeline', 'Caching'],
      level: 'Advanced',
      duration: '4-5 hours',
    },
    {
      icon: <Gauge className="w-12 h-12" />,
      title: 'Algorithm Complexity',
      description: 'Analyze time/space complexity and optimize algorithms for production code',
      path: '/bigo',
      color: 'emerald',
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      topics: ['Complexity Analysis', 'Trade-offs', 'Optimization', 'Profiling'],
      level: 'Deep Dive',
      duration: '2-3 hours',
    },
    {
      icon: <Terminal className="w-12 h-12" />,
      title: 'Python Internals',
      description: 'Understand CPython VM, memory management, GIL, and execution model',
      path: '/python',
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      topics: ['CPython VM', 'Memory Model', 'GIL', 'Bytecode'],
      level: 'Advanced',
      duration: '3-4 hours',
    },
    {
      icon: <Network className="w-12 h-12" />,
      title: 'System Design',
      description: 'Master distributed systems, scalability patterns, and architectural trade-offs',
      path: '/systemdesign',
      color: 'blue',
      gradient: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      topics: ['Distributed Systems', 'Scalability', 'CAP Theorem', 'Trade-offs'],
      level: 'Advanced',
      duration: '4-5 hours',
    },
    {
      icon: <FileCode className="w-12 h-12" />,
      title: 'TypeScript Advanced',
      description: 'Master type system internals, advanced patterns, and compiler behavior',
      path: '/typescript',
      color: 'indigo',
      gradient: 'from-indigo-600 to-blue-600',
      bgGradient: 'from-indigo-50 to-blue-50',
      topics: ['Type System', 'Compiler', 'Advanced Patterns', 'Performance'],
      level: 'Advanced',
      duration: '3-4 hours',
    },
  ];

  const stats = [
    { value: '10+', label: 'Interactive Modules', icon: <Package className="w-5 h-5" /> },
    { value: '70+', label: 'Visualizations', icon: <MonitorPlay className="w-5 h-5" /> },
    { value: '1000+', label: 'Code Examples', icon: <FileCode className="w-5 h-5" /> },
    { value: '24/7', label: 'Available Learning', icon: <Cpu className="w-5 h-5" /> },
  ];

  const learningPath = [
    {
      phase: 'Understand the Foundations',
      modules: [allModules[1], allModules[0]], // Git, JavaScript
      icon: <Target className="w-6 h-6" />,
      color: 'indigo',
      description: 'Master how Git and JavaScript engines actually work under the hood',
    },
    {
      phase: 'Performance & Algorithms',
      modules: [allModules[2], allModules[6]], // Data Structures, Big-O
      icon: <Brain className="w-6 h-6" />,
      color: 'blue',
      description: 'Analyze performance trade-offs and optimize production code',
    },
    {
      phase: 'Framework Internals',
      modules: [allModules[4], allModules[5], allModules[3]], // React, Next.js, RxJS
      icon: <Rocket className="w-6 h-6" />,
      color: 'purple',
      description: 'Deep dive into React, Next.js, and RxJS internal architectures',
    },
    {
      phase: 'Architecture & Systems',
      modules: [allModules[7], allModules[8], allModules[9]], // Python, System Design, TypeScript
      icon: <Award className="w-6 h-6" />,
      color: 'emerald',
      description: 'Master system design patterns and multi-language architectures',
    },
  ];

  // Commented out until we have real reviews
  // const testimonials = [
  //   {
  //     text: 'Finally understood how the JavaScript Event Loop actually works. Changed how I write async code.',
  //     author: 'Sarah Chen',
  //     role: 'Senior Frontend Developer',
  //     avatar: '👩‍💻',
  //   },
  //   {
  //     text: 'The Git internals visualization helped me fix complex merge conflicts I could never understand before.',
  //     author: 'Mike Johnson',
  //     role: 'Staff DevOps Engineer',
  //     avatar: '👨‍💻',
  //   },
  //   {
  //     text: 'Understanding Big-O complexity visually made me write much more efficient algorithms in production.',
  //     author: 'Priya Patel',
  //     role: 'Senior Software Engineer',
  //     avatar: '👩‍🔬',
  //   },
  // ];

  const features = [
    {
      icon: <MonitorPlay className="w-8 h-8 text-indigo-600" />,
      title: '70+ Interactive Visualizations',
      description: 'See how engines, compilers, and frameworks work internally',
    },
    {
      icon: <Play className="w-8 h-8 text-purple-600" />,
      title: 'Hands-on Deep Dives',
      description: 'Explore internals with interactive demos and debugging',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Production-Ready Knowledge',
      description: 'Apply internal knowledge to write better production code',
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: 'Self-Paced Mastery',
      description: 'Deep dive at your own pace, reference anytime',
    },
  ];

  return (
    <>
      <SEO
        title="Code Executives - Master Programming Internals"
        description="Deep dive into JavaScript engines, Git internals, framework architectures, and system design. 70+ interactive visualizations for developers who want to understand how things really work under the hood."
        keywords={[
          'programming internals',
          'javascript engine internals',
          'git internals',
          'react fiber architecture',
          'nextjs internals',
          'data structure performance',
          'algorithm complexity',
          'system design patterns',
          'advanced programming',
          'senior developer learning',
        ]}
        canonicalUrl="https://code-executives.com/"
      />
      <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Go Beyond the Basics.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Master the Internals.
              </span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Deep dive into how things{' '}
              <span className="font-semibold text-indigo-600">actually work</span> under the hood.
              For developers who want to understand JavaScript engines, Git internals, data
              structure performance, and framework architectures through{' '}
              <span className="font-semibold text-purple-600">70+ interactive visualizations</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigateToSection('/javascript')}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Brain className="w-5 h-5" />
                <span>Explore Deep Dives</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const roadmapEl = document.getElementById('learning-roadmap');
                  roadmapEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>See What's Inside</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center mb-2 text-indigo-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Modules - Rotating Showcase */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Deep Dive Modules</h2>
              <p className="text-xl text-gray-600">
                Go beyond syntax and APIs — understand how things really work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {allModules.slice(0, 6).map((module, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${module.bgGradient} rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1`}
                  onClick={() => navigateToSection(module.path)}
                  onMouseEnter={() => {
                    /* Show hover effect */
                  }}
                  onMouseLeave={() => {
                    /* Remove hover effect */
                  }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-xl mb-6 text-white shadow-lg`}
                  >
                    {module.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{module.description}</p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {module.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/80 rounded-lg text-xs font-medium text-gray-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center space-x-1">
                      <Circle className="w-3 h-3" />
                      <span>{module.level}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Box className="w-3 h-3" />
                      <span>{module.duration}</span>
                    </span>
                  </div>

                  <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Modules Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  const allModulesEl = document.getElementById('all-modules');
                  allModulesEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                <span>View All 10 Modules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Go Deeper?</h2>
              <p className="text-xl text-gray-600">
                Understanding internals makes you a better developer
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <ThemeCard key={index} hover>
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">{feature.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </ThemeCard>
              ))}
            </div>
          </div>

          {/* Interactive Learning Roadmap */}
          <div id="learning-roadmap" className="mb-20 scroll-mt-20">
            <div className="text-center mb-12">
              <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Deep Dive Journey</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A structured path to mastering how your tools actually work. Each module builds
                internal knowledge through interactive visualizations and hands-on exploration.
              </p>
            </div>

            <div className="space-y-12">
              {learningPath.map((path, pathIndex) => (
                <div key={pathIndex} className="relative">
                  {/* Connection Line to Next Phase */}
                  {pathIndex < learningPath.length - 1 && (
                    <div className="absolute left-1/2 top-full w-1 h-12 bg-gradient-to-b from-indigo-200 to-transparent transform -translate-x-1/2 z-0"></div>
                  )}

                  <div className="relative z-10">
                    {/* Phase Header */}
                    <div className="text-center mb-8">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-${path.color}-600 to-${path.color === 'indigo' ? 'purple' : path.color === 'blue' ? 'indigo' : path.color === 'purple' ? 'violet' : 'teal'}-600 rounded-2xl mb-4 text-white shadow-lg`}
                      >
                        {path.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Phase {pathIndex + 1}: {path.phase}
                      </h3>
                      <p className="text-gray-600">{path.description}</p>
                    </div>

                    {/* Modules in this Phase */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {path.modules.map((module, moduleIndex) => (
                        <div
                          key={moduleIndex}
                          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          onClick={() => navigateToSection(module.path)}
                        >
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl mb-4 text-white`}
                          >
                            <div className="w-6 h-6">{module.icon}</div>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {module.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{module.level}</span>
                            </span>
                            <span>{module.duration}</span>
                          </div>

                          <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:text-indigo-700">
                            <span>Begin Module</span>
                            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 text-center border border-indigo-100">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h3 className="text-2xl font-bold text-gray-900">Master the Internals</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Complete each module to understand how your favorite tools work under the hood.
                Apply this knowledge to write better, more performant production code.
              </p>
              <button
                onClick={() => navigateToSection('/javascript')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
              >
                <Rocket className="w-5 h-5" />
                <span>Begin Deep Dive</span>
              </button>
            </div>
          </div>

          {/* All Modules Section */}
          <div id="all-modules" className="mb-20 scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Deep Dive Library</h2>
              <p className="text-xl text-gray-600">
                Master internals across your entire tech stack
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allModules.map((module, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigateToSection(module.path)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center text-white shadow-md`}
                    >
                      <div className="w-7 h-7">{module.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {module.topics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700"
                          >
                            {topic}
                          </span>
                        ))}
                        {module.topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                            +{module.topics.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Circle className="w-3 h-3" />
                            <span>{module.level}</span>
                          </span>
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:text-indigo-700">
                          <span>Start</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials - Hidden until we have real reviews */}
          {/* <div className="mb-20">
            <div className="text-center mb-12">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by Senior Developers
              </h2>
              <p className="text-xl text-gray-600">
                Engineers who wanted to understand what they were really building with
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ThemeCard key={index}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{testimonial.avatar}</div>
                    <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </ThemeCard>
              ))}
            </div>
          </div> */}

          {/* Final CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-12 text-white shadow-2xl">
              <Sparkles className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Ready to Go Beyond the Surface?</h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Understand how your tools really work. Free access to all deep dives. No credit card
                required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigateToSection('/javascript')}
                  className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Play className="w-6 h-6" />
                  <span>Start Exploring</span>
                </button>
                <button
                  onClick={() => navigateToSection('/about')}
                  className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
