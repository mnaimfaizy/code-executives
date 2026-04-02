import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import V8MemoryViz from '../visualizations/2d/V8MemoryViz';
import { Lightbulb } from 'lucide-react';

const MemoryManagement: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        🧠 V8 Memory Management &amp; Garbage Collection
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        V8 manages memory with a generational garbage collector that separates short-lived objects
        from long-lived ones. Understanding this system is crucial for preventing memory leaks and
        building production-ready Node.js applications.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* City analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The City Analogy 🏙️</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Think of V8&apos;s heap as a city. <strong>New Space</strong> is a bustling shopping
              district — lots of temporary visitors come and go quickly. <strong>Old Space</strong>{' '}
              is the residential area — only people (objects) who&apos;ve been around long enough
              get permanent housing.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The <strong>garbage collector</strong> is like city sanitation. The shopping district
              (New Space) gets cleaned frequently and quickly (<em>Scavenge</em>). The residential
              area (Old Space) gets a thorough but slower cleaning (<em>Mark-Sweep-Compact</em>)
              only when needed.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive V8 Heap Visualization</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Watch objects get allocated, survive garbage collection cycles, and get promoted from New
          Space to Old Space. Trigger Minor GC (Scavenge) and Major GC (Mark-Sweep) to see how each
          works.
        </p>
        <V8MemoryViz />
      </ThemeCard>

      {/* V8 Heap Structure */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏗️ V8 Heap Structure</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200">
            <h3 className="text-lg font-semibold text-cyan-800 mb-3">
              New Space (Young Generation)
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                📏 <strong>Size:</strong> 1-8 MB (small by design)
              </li>
              <li>
                ⚡ <strong>GC Type:</strong> Scavenge (Minor GC)
              </li>
              <li>
                🏃 <strong>Speed:</strong> ~1-2ms pause time
              </li>
              <li>
                📊 <strong>Algorithm:</strong> Semi-space (copy alive objects to &quot;To&quot;
                space)
              </li>
              <li>
                🎯 <strong>Hypothesis:</strong> Most objects die young
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">
              Old Space (Old Generation)
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                📏 <strong>Size:</strong> Up to ~1.5 GB (default, configurable)
              </li>
              <li>
                🔍 <strong>GC Type:</strong> Mark-Sweep-Compact (Major GC)
              </li>
              <li>
                🐢 <strong>Speed:</strong> 50-200ms+ pause time
              </li>
              <li>
                📊 <strong>Algorithm:</strong> Mark reachable → Sweep unreachable → Compact
              </li>
              <li>
                🏠 <strong>Contains:</strong> Objects that survived 2+ Minor GCs
              </li>
            </ul>
          </div>
        </div>

        {/* GC algorithms */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">GC Algorithm Deep Dive</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-cyan-100 text-cyan-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                S
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Scavenge (Minor GC)</h4>
                <p className="text-sm text-gray-700">
                  New Space has two halves: &quot;From&quot; and &quot;To&quot;. Objects are
                  allocated in &quot;From&quot;. When it fills up, living objects are copied to
                  &quot;To&quot;, and &quot;From&quot; is wiped clean. Then the spaces swap. Objects
                  that survive two scavenges get promoted to Old Space.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                M
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Mark-Sweep-Compact (Major GC)</h4>
                <p className="text-sm text-gray-700">
                  <strong>Mark:</strong> Walk all references from root (global, stack) and mark
                  reachable objects. <strong>Sweep:</strong> Free memory of unmarked (unreachable)
                  objects. <strong>Compact:</strong> Move surviving objects together to reduce
                  fragmentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Memory Leaks */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🐛 Common Memory Leaks &amp; Prevention
        </h2>
        <div className="space-y-4">
          {[
            {
              title: 'Global Variables',
              bad: 'function process(data) {\n  results = data; // no let/const!\n  // Accidental global\n}',
              good: 'function process(data) {\n  const results = data;\n  return results;\n}',
              tip: 'Always declare variables with const/let. Use "use strict" mode.',
            },
            {
              title: 'Forgotten Event Listeners',
              bad: 'setInterval(() => {\n  emitter.on("data", handler);\n  // Adds new listener every tick!\n}, 1000);',
              good: 'const handler = (data) => {...};\nemitter.on("data", handler);\n// Later:\nemitter.off("data", handler);',
              tip: 'Always remove listeners when done. Watch for emitter.setMaxListeners warnings.',
            },
            {
              title: 'Closures Holding References',
              bad: 'function createLeak() {\n  const hugeData = loadGBFile();\n  return () => hugeData[0];\n  // hugeData stays in memory!\n}',
              good: "function noLeak() {\n  const hugeData = loadGBFile();\n  const first = hugeData[0];\n  return () => first;\n  // hugeData can be GC'd\n}",
              tip: 'Extract only the data you need from closures.',
            },
          ].map((leak) => (
            <div key={leak.title} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">⚠️ {leak.title}</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1">❌ Leaky</p>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                      {leak.bad}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1">✅ Safe</p>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {leak.good}
                    </pre>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic">💡 {leak.tip}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Debugging Memory */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Debugging Memory Issues</h2>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`# Check heap usage programmatically
console.log(process.memoryUsage());
// { rss, heapTotal, heapUsed, external, arrayBuffers }

# Increase heap limit (default ~1.5GB)
node --max-old-space-size=4096 app.js

# Generate heap snapshot
node --heapsnapshot-signal=SIGUSR2 app.js
kill -USR2 <pid>

# Chrome DevTools (attach inspector)
node --inspect app.js`}</pre>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Module System"
        description="Learn the difference between CommonJS require() and ES Modules import."
        buttonText="Continue to Module System →"
        onButtonClick={() => navigateToSection('Module System')}
        colorScheme="green"
      />
    </>
  );
};

export default MemoryManagement;
