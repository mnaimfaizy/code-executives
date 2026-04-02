import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import {
  Server,
  Cpu,
  Database,
  Zap,
  GitBranch,
  Layers,
  Package,
  Globe,
  RefreshCw,
  Shield,
  Lightbulb,
  HardDrive,
} from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/nodejs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '9',
      label: 'Interactive Topics',
      icon: <Server className="w-5 h-5" />,
    },
    {
      value: '2M+',
      label: 'npm Packages',
      icon: <Package className="w-5 h-5" />,
    },
    {
      value: '7',
      label: 'Visual Explorations',
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <Server className="w-16 h-16 text-green-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Node.js Ecosystem: From Runtime to Production
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Ever wondered how JavaScript runs outside the browser, or how Netflix serves millions with a
        single-threaded runtime? This module breaks down Node.js internals, the event loop, streams,
        scaling strategies, and the entire ecosystem — visually and interactively.
      </p>
      <StatsGrid stats={stats} colorScheme="green" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Event Loop
        </span>
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          🌊 Streams &amp; Buffers
        </span>
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Clustering &amp; Workers
        </span>
        <span className="bg-lime-100 text-lime-800 px-4 py-2 rounded-full text-sm font-semibold">
          📦 npm &amp; Package Managers
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* ELI10 Explanation */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Explain Like I&apos;m 10 🧒</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine a really fast waiter at a restaurant. Instead of <strong>waiting</strong> at
              each table for the kitchen to finish cooking, this waiter takes every order, sends
              them all to the kitchen, and starts serving other tables. When a dish is ready, a bell
              rings and the waiter picks it up and delivers it.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>That&apos;s Node.js!</strong> It&apos;s a single waiter (single thread) that
              never waits around idly. It handles thousands of requests by delegating heavy work
              (file reading, database queries) to a team of kitchen helpers (libuv thread pool) and
              picks up results when they&apos;re ready. This is why Node.js can handle 100k+
              concurrent connections on a single server.
            </p>
          </div>
        </div>
      </div>

      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Node.js?</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              JavaScript Outside the Browser
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Node.js was created by <strong>Ryan Dahl in 2009</strong> to run JavaScript on
              servers. Before Node, JavaScript could only run inside web browsers. Node.js took
              Google Chrome&apos;s V8 engine, wrapped it with C++ bindings for file system,
              networking, and OS operations, and created a full server-side runtime.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 font-mono mb-2">
                <strong>Browser JS:</strong> DOM, Window, fetch
              </p>
              <p className="text-sm text-gray-700 font-mono">
                <strong>Node.js:</strong> fs, http, process, child_process, os
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              The Key Innovation: Non-Blocking I/O
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Traditional servers (like Apache) create a new thread for each connection. With 10,000
              connections, that&apos;s 10,000 threads — each consuming memory and CPU for context
              switching.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Node.js uses a single thread with an <strong>event loop</strong>, delegating I/O to
              the OS kernel and a thread pool. It can handle the same 10,000 connections with a
              fraction of the memory.
            </p>
          </div>
        </div>

        {/* Who uses Node.js */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🌍 Companies Running Node.js in Production
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Netflix',
                desc: 'Serves 200M+ subs, reduced startup by 70%',
                icon: <Globe className="w-5 h-5 text-red-600" />,
              },
              {
                name: 'PayPal',
                desc: 'Double requests/sec, 35% faster response',
                icon: <Shield className="w-5 h-5 text-blue-600" />,
              },
              {
                name: 'LinkedIn',
                desc: 'Went from 30 servers to 3 with Node',
                icon: <Cpu className="w-5 h-5 text-sky-600" />,
              },
              {
                name: 'Uber',
                desc: 'Handles millions of real-time ride requests',
                icon: <Zap className="w-5 h-5 text-gray-800" />,
              },
              {
                name: 'NASA',
                desc: 'Reduced data access times by 300%',
                icon: <Database className="w-5 h-5 text-indigo-600" />,
              },
              {
                name: 'Walmart',
                desc: 'Handles 500M page views on Black Friday',
                icon: <Server className="w-5 h-5 text-green-600" />,
              },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
              >
                <div className="mt-0.5">{company.icon}</div>
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{company.name}</span>
                  <p className="text-xs text-gray-600">{company.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You Will Master */}
        <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Core Concepts You Will Master
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Event Loop &amp; Async</h4>
              <p className="text-sm text-gray-600">
                How Node.js handles thousands of requests with a single thread
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <HardDrive className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Streams &amp; Memory</h4>
              <p className="text-sm text-gray-600">
                Processing gigabytes of data with minimal memory using streams
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Scaling &amp; Ecosystem</h4>
              <p className="text-sm text-gray-600">
                Clustering, worker threads, frameworks, and package managers
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Journey */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🗺️ Your Learning Journey (9 Sections)
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Each section builds on the previous one. We recommend going in order, but feel free to
          jump to any topic:
        </p>
        <div className="space-y-3">
          {[
            {
              num: 1,
              title: 'Event Loop',
              desc: 'The 6-phase event loop, microtasks, and libuv internals',
            },
            {
              num: 2,
              title: 'Async Programming',
              desc: 'From callbacks to Promises to async/await',
            },
            {
              num: 3,
              title: 'Buffers & Streams',
              desc: 'Processing large data efficiently with streams and backpressure',
            },
            { num: 4, title: 'Scaling', desc: 'Clustering vs Worker Threads — when to use each' },
            {
              num: 5,
              title: 'Memory Management',
              desc: 'V8 heap, garbage collection, and memory leak prevention',
            },
            {
              num: 6,
              title: 'Module System',
              desc: 'CommonJS require() vs ES Modules import — how they differ',
            },
            {
              num: 7,
              title: 'Package Managers',
              desc: 'npm vs Yarn vs pnpm — architecture and tradeoffs',
            },
            {
              num: 8,
              title: 'Frameworks',
              desc: 'Express, Fastify, NestJS, Koa, Hono — when to use which',
            },
            {
              num: 9,
              title: 'Runtime Wars',
              desc: 'Node.js vs Deno vs Bun — the next generation of JS runtimes',
            },
          ].map((item) => (
            <button
              key={item.num}
              onClick={() => navigateToSection(item.title)}
              className="w-full flex items-center gap-4 p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-200 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {item.num}
              </div>
              <div>
                <span className="font-semibold text-gray-800">{item.title}</span>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  const sidebar = (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Topics</h3>
      <NavigationCard
        title="Event Loop"
        description="The heart of Node.js — 6 phases, microtasks, libuv"
        colorScheme="green"
        icon={<RefreshCw className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Event Loop')}
      />
      <NavigationCard
        title="Async Programming"
        description="Callbacks → Promises → async/await evolution"
        colorScheme="green"
        icon={<Zap className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Async Programming')}
      />
      <NavigationCard
        title="Buffers & Streams"
        description="Process gigabytes with 12MB of memory"
        colorScheme="green"
        icon={<HardDrive className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Buffers & Streams')}
      />
      <NavigationCard
        title="Scaling"
        description="Cluster mode vs Worker Threads"
        colorScheme="green"
        icon={<Cpu className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Scaling')}
      />
      <NavigationCard
        title="Memory Management"
        description="V8 heap, GC, and memory leak prevention"
        colorScheme="green"
        icon={<Database className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Memory Management')}
      />
      <NavigationCard
        title="Module System"
        description="CommonJS vs ES Modules"
        colorScheme="green"
        icon={<GitBranch className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Module System')}
      />
      <NavigationCard
        title="Package Managers"
        description="npm vs Yarn vs pnpm architecture"
        colorScheme="green"
        icon={<Package className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Package Managers')}
      />
      <NavigationCard
        title="Frameworks"
        description="Express, Fastify, NestJS, Koa, Hono"
        colorScheme="green"
        icon={<Server className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Frameworks')}
      />
      <NavigationCard
        title="Runtime Wars"
        description="Node vs Deno vs Bun"
        colorScheme="green"
        icon={<Globe className="w-4 h-4 text-green-600" />}
        onClick={() => navigateToSection('Runtime Wars')}
      />
    </div>
  );

  return (
    <>
      <SectionLayout
        section="nodejs"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebar}
      />
      <CTASection
        title="Begin Your Node.js Journey"
        description="Start with the Event Loop to understand the fundamental mechanism that makes Node.js so powerful."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('Event Loop')}
        colorScheme="green"
      />
    </>
  );
};

export default Introduction;
