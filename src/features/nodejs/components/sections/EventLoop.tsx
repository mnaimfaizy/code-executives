import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import EventLoopViz from '../visualizations/2d/EventLoopViz';
import { Lightbulb } from 'lucide-react';

const EventLoop: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">🔄 The Node.js Event Loop</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The event loop is the beating heart of Node.js. It&apos;s a continuous cycle that processes
        callbacks, I/O events, and timers — all on a single thread. Understanding it is the key to
        writing performant, non-blocking code.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Restaurant Analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Restaurant Analogy 🍽️</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine a restaurant with <strong>one waiter</strong> (the event loop) and a{' '}
              <strong>kitchen team</strong> (the libuv thread pool). The waiter never stands idle
              waiting for food — instead, they take orders from every table, hand them to the
              kitchen, and keep serving. When a dish is ready, the kitchen rings a bell and the
              waiter delivers it.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If the waiter tried to <em>cook every meal themselves</em> (synchronous blocking),
              every table would wait forever. But by delegating and responding to bells (callbacks),
              one waiter can serve a packed restaurant efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive Event Loop Visualization
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Watch the event loop cycle through its 6 phases. Click play to see how callbacks are
          processed, microtasks get VIP priority, and the libuv thread pool handles I/O operations.
        </p>
        <EventLoopViz />
      </ThemeCard>

      {/* 6 Phases Explained */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The 6 Phases of the Event Loop</h2>
        <div className="space-y-4">
          {[
            {
              phase: '1. Timers',
              desc: 'Executes callbacks from setTimeout() and setInterval() whose thresholds have elapsed.',
              detail:
                'A timer specifies the minimum delay, not the exact time. If the event loop is busy with other callbacks, the timer fires later.',
              color: 'indigo',
            },
            {
              phase: '2. Pending Callbacks',
              desc: 'Executes I/O callbacks deferred to the next loop iteration (e.g., TCP errors).',
              detail:
                'Some system operations like ECONNREFUSED report errors asynchronously. These get queued here.',
              color: 'cyan',
            },
            {
              phase: '3. Idle / Prepare',
              desc: 'Internal housekeeping phase used by Node.js internals only.',
              detail:
                'This phase is used internally by libuv. You never interact with it directly.',
              color: 'emerald',
            },
            {
              phase: '4. Poll',
              desc: 'Retrieves new I/O events. Executes I/O-related callbacks (almost everything except timers, close, and setImmediate).',
              detail:
                'This is where Node spends most of its time. It calculates how long to block and poll for I/O, then processes events in the poll queue.',
              color: 'amber',
            },
            {
              phase: '5. Check',
              desc: 'setImmediate() callbacks are executed here, right after the poll phase.',
              detail:
                'setImmediate() is designed to run after the poll phase completes. This makes it execute before any timers in the next loop iteration.',
              color: 'pink',
            },
            {
              phase: '6. Close Callbacks',
              desc: 'Close event callbacks (e.g., socket.on("close", ...)). ',
              detail:
                'If a socket or handle is closed abruptly, the close event is emitted here, allowing cleanup.',
              color: 'red',
            },
          ].map((item) => (
            <div
              key={item.phase}
              className={`bg-gradient-to-r from-${item.color}-50 to-white rounded-xl p-5 border border-${item.color}-200`}
            >
              <h3 className={`text-lg font-semibold text-${item.color}-800 mb-2`}>{item.phase}</h3>
              <p className="text-gray-700 mb-2">{item.desc}</p>
              <p className="text-sm text-gray-600 italic">{item.detail}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Microtasks & process.nextTick */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Microtasks: The VIP Queue</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
            <h3 className="text-lg font-semibold text-violet-800 mb-3">process.nextTick()</h3>
            <p className="text-gray-700 mb-3 text-sm leading-relaxed">
              Fires <strong>immediately</strong> after the current operation completes, before the
              event loop continues. Has the highest priority of all callbacks.
            </p>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{`process.nextTick(() => {
  console.log('I run FIRST!');
});

Promise.resolve().then(() => {
  console.log('I run second');
});

setTimeout(() => {
  console.log('I run last');
}, 0);`}</pre>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Promise Microtasks</h3>
            <p className="text-gray-700 mb-3 text-sm leading-relaxed">
              Promise .then() and .catch() callbacks run in the microtask queue. They execute after
              nextTick but <strong>before</strong> the event loop moves to the next phase.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-2">Execution Order:</p>
              <ol className="text-sm text-gray-700 space-y-1">
                <li>1️⃣ Synchronous code (call stack)</li>
                <li>2️⃣ process.nextTick() queue</li>
                <li>3️⃣ Promise microtask queue</li>
                <li>4️⃣ Event loop phase callbacks</li>
              </ol>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* libuv thread pool */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 libuv: The C++ Backbone</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Node.js delegates I/O operations to <strong>libuv</strong>, a C library that provides the
          event loop, async I/O, and a thread pool. By default, libuv creates a thread pool of{' '}
          <strong>4 threads</strong> (configurable via UV_THREADPOOL_SIZE up to 1024).
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Operations Using Thread Pool:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>📁 File system operations (fs.readFile)</li>
              <li>🔐 Crypto operations (crypto.pbkdf2)</li>
              <li>🗜️ Compression (zlib.deflate)</li>
              <li>🔍 DNS lookups (dns.lookup)</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Operations Using OS Kernel:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>🌐 Network I/O (TCP, UDP, HTTP)</li>
              <li>🔌 Pipes and Unix domain sockets</li>
              <li>📡 DNS resolution (dns.resolve)</li>
              <li>⏱️ Timers (setTimeout, setInterval)</li>
            </ul>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Async Programming Patterns"
        description="Learn how callbacks, Promises, and async/await evolved to tame the event loop."
        buttonText="Continue to Async Programming →"
        onButtonClick={() => navigateToSection('Async Programming')}
        colorScheme="green"
      />
    </>
  );
};

export default EventLoop;
