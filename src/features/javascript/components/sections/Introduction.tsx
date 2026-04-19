import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Cpu,
  RefreshCw,
  Database,
  Globe,
  Server,
  Smartphone,
  Zap,
  Code2,
  Terminal,
  List,
  Layers,
  GitBranch,
  Shield,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    // Use React Router navigation instead of window.location
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/javascript?section=${encodedSection}`);
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        {/* JS Identity badge */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 ring-4 ring-yellow-100">
              <span className="text-black font-black text-3xl tracking-tight">JS</span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">The Inner Workings of JavaScript</h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Explore the sophisticated execution model that powers the web's most ubiquitous
          programming language
        </p>
      </div>
      <StatsGrid
        stats={[
          {
            value: '90%+',
            label: 'of websites use JavaScript',
            icon: <Globe className="w-5 h-5" />,
          },
          { value: '1995', label: 'Created in just 10 days', icon: <Clock className="w-5 h-5" /> },
          { value: 'Multi', label: 'paradigm language', icon: <Layers className="w-5 h-5" /> },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is JavaScript */}
      <ThemeCard>
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center mr-3 shadow-sm shadow-yellow-200">
            <span className="text-black font-black text-base">JS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is JavaScript?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            JavaScript is a <strong>powerful, multi-paradigm programming language</strong> and a
            foundational technology of the World Wide Web, operating in concert with HTML and CSS to
            create rich, interactive user experiences.
          </p>
          <p>
            While HTML provides the structure and CSS the style, JavaScript supplies the
            <strong> dynamic functionality and behavior</strong> that modern web users expect, such
            as animated image carousels, responsive menus, and dynamic content changes.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg flex gap-3">
            <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-indigo-800 text-sm">
              <strong>Modern Reality:</strong> Contemporary engines employ Just-in-Time (JIT)
              compilation, combining the speed of interpretation with performance optimizations to
              execute code with remarkable efficiency.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Multi-Paradigm Nature */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Paradigm Flexibility</h3>
        <p className="text-gray-600 text-sm mb-5">
          JavaScript supports multiple programming paradigms, allowing developers to choose the
          style best suited for their task or combine them within a single application.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              name: 'Event-Driven',
              icon: <Zap className="w-4 h-4" />,
              color: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
            },
            {
              name: 'Functional',
              icon: <Code2 className="w-4 h-4" />,
              color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
            },
            {
              name: 'Imperative',
              icon: <Terminal className="w-4 h-4" />,
              color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
            },
            {
              name: 'Procedural',
              icon: <List className="w-4 h-4" />,
              color: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
            },
            {
              name: 'Object-Oriented',
              icon: <Layers className="w-4 h-4" />,
              color: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
            },
            {
              name: 'Prototype-Based',
              icon: <GitBranch className="w-4 h-4" />,
              color: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
            },
          ].map((paradigm) => (
            <div
              key={paradigm.name}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-default ${paradigm.color}`}
            >
              {paradigm.icon}
              {paradigm.name}
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Ecosystem Evolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-5">From Browser to Everywhere</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Client-Side Origins</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Historically, JavaScript ran exclusively within web browsers to make static webpages
                dynamic, responding to user events in real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center shadow-sm shadow-green-200">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Server-Side Revolution</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                With Node.js (2009), JavaScript expanded beyond browsers, enabling server-side
                development and desktop applications.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-11 h-11 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm shadow-purple-200">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Mobile &amp; IoT</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                React Native and frameworks like Capacitor extended JavaScript to mobile apps and
                even IoT device programming at scale.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Explore JavaScript's Inner Workings
        </h3>
        <div className="space-y-3">
          <NavigationCard
            title="JavaScript History"
            description="From 10-day creation to global dominance"
            colorScheme="indigo"
            icon={<Clock className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigateToSection('JavaScript History')}
          />
          <NavigationCard
            title="Execution Model"
            description="Single-threaded with concurrency magic"
            colorScheme="indigo"
            icon={<Cpu className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigateToSection('Execution Model')}
          />
          <NavigationCard
            title="Engine & Runtime"
            description="V8, Call Stack, Memory Heap & more"
            colorScheme="indigo"
            icon={<BookOpen className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigateToSection('Engine & Runtime')}
          />
          <NavigationCard
            title="Event Loop"
            description="The master orchestrator of async behavior"
            colorScheme="indigo"
            icon={<RefreshCw className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigateToSection('Event Loop')}
          />
          <NavigationCard
            title="Memory Management"
            description="Garbage collection and memory optimization"
            colorScheme="indigo"
            icon={<Database className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigateToSection('Memory Management')}
          />
        </div>
      </ThemeCard>

      {/* Key Facts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Facts</h3>
        <div className="space-y-3">
          {[
            {
              icon: <Shield className="w-4 h-4 text-yellow-600" />,
              bg: 'bg-yellow-50',
              title: 'ECMAScript Standard',
              desc: 'Standardized by ECMA in 1997 to unify implementations',
            },
            {
              icon: <Zap className="w-4 h-4 text-blue-600" />,
              bg: 'bg-blue-50',
              title: 'JIT Compilation',
              desc: 'Modern engines use Just-in-Time compilation for performance',
            },
            {
              icon: <Cpu className="w-4 h-4 text-green-600" />,
              bg: 'bg-green-50',
              title: 'Runtime Environment',
              desc: 'Engine + APIs + Event Loop = Complete execution environment',
            },
            {
              icon: <ArrowRight className="w-4 h-4 text-purple-600" />,
              bg: 'bg-purple-50',
              title: 'Single-Threaded',
              desc: 'One Call Stack, but non-blocking through async operations',
            },
          ].map((fact) => (
            <div key={fact.title} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 ${fact.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                {fact.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{fact.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fact.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="javascript"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Dive Deeper?"
        description="Explore interactive visualizations of JavaScript's execution model, from the Call Stack to the Event Loop, and understand how your code really runs under the hood."
        buttonText="Start Exploring"
        onButtonClick={() => navigateToSection('Execution Model')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Introduction;
