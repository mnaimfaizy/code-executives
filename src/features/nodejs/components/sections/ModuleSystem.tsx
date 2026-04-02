import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import ModuleSystemViz from '../visualizations/2d/ModuleSystemViz';
import { Lightbulb } from 'lucide-react';

const ModuleSystem: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        📦 Module Systems: CommonJS vs ES Modules
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Node.js has two module systems: the original CommonJS (require/module.exports) and the
        modern ES Modules (import/export). Understanding both is essential — and knowing when to use
        which can save you from confusing bugs.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Library analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Library Analogy 📚</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>CommonJS</strong> is like going to a bookshelf and pulling out an entire book
              right when you need it — one book at a time, blocking everything until you&apos;ve got
              it. You get a <em>photocopy</em> of the book (exported copy).
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>ES Modules</strong> is like a librarian who scans the catalog first, sets up
              bookmarks to all the books you&apos;ll need, and then fetches them in parallel. You
              get a <em>live reference</em> — if the original updates, yours updates too.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive Module Loading Visualization
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Step through CommonJS synchronous loading vs ES Modules&apos; three-phase async loading.
          See how ESM enables tree-shaking while CJS cannot.
        </p>
        <ModuleSystemViz />
      </ThemeCard>

      {/* Side-by-side comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Syntax Comparison</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-amber-700 mb-3">CommonJS (CJS)</h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-amber-700/30 space-y-3">
              <div>
                <p className="text-xs text-amber-400 mb-1">// Exporting</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`module.exports = { add, subtract };
// or
exports.add = (a, b) => a + b;`}</pre>
              </div>
              <div>
                <p className="text-xs text-amber-400 mb-1">// Importing</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`const { add } = require('./math');
const fs = require('fs');`}</pre>
              </div>
              <div>
                <p className="text-xs text-amber-400 mb-1">// Dynamic (conditional)</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`if (needsModule) {
  const mod = require('./optional');
}`}</pre>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">ES Modules (ESM)</h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-indigo-700/30 space-y-3">
              <div>
                <p className="text-xs text-indigo-400 mb-1">// Exporting</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`export function add(a, b) { return a + b; }
export default class Calculator { }`}</pre>
              </div>
              <div>
                <p className="text-xs text-indigo-400 mb-1">// Importing</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`import { add } from './math.mjs';
import fs from 'fs';`}</pre>
              </div>
              <div>
                <p className="text-xs text-indigo-400 mb-1">// Dynamic import</p>
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`if (needsModule) {
  const mod = await import('./optional.mjs');
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* How to Enable ESM */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔧 How to Enable ES Modules in Node.js
        </h2>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">Option 1: File Extension</h3>
            <p className="text-sm text-gray-700 mb-2">
              Use <code>.mjs</code> extension for ES modules, <code>.cjs</code> for CommonJS.
            </p>
            <div className="bg-gray-900 rounded-lg p-3">
              <pre className="text-xs text-indigo-400 font-mono">{`app.mjs  → ES Module
app.cjs  → CommonJS
app.js   → Depends on package.json "type"`}</pre>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">Option 2: package.json</h3>
            <p className="text-sm text-gray-700 mb-2">
              Set <code>&quot;type&quot;: &quot;module&quot;</code> to make all .js files ESM by
              default.
            </p>
            <div className="bg-gray-900 rounded-lg p-3">
              <pre className="text-xs text-green-400 font-mono">{`{
  "name": "my-app",
  "type": "module",  // ← all .js = ESM
  "main": "index.js"
}`}</pre>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Key Differences */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Key Differences That Matter</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Exports: Copies vs Live Bindings',
              cjs: "require() returns a COPY of the exported value. Changes to the original don't affect the copy.",
              esm: 'import creates a LIVE BINDING (reference). If the exporting module changes the value, the import sees it.',
              color: 'purple',
            },
            {
              title: 'Loading: Sync vs Async',
              cjs: 'require() is synchronous — blocks execution until the module is fully loaded and evaluated.',
              esm: 'import is asynchronous — parsed, instantiated, and evaluated in three separate phases.',
              color: 'blue',
            },
            {
              title: 'Tree Shaking',
              cjs: "Cannot tree-shake (dynamic requires make it impossible to know what's used at build time).",
              esm: 'Fully tree-shakeable — bundlers can statically analyze imports and remove unused exports.',
              color: 'green',
            },
            {
              title: 'Top-Level Await',
              cjs: 'Not supported — top-level await causes a SyntaxError.',
              esm: 'Supported since Node 14.8+ — await at the module top level pauses module evaluation.',
              color: 'amber',
            },
          ].map((diff) => (
            <div key={diff.title} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className={`text-lg font-semibold text-${diff.color}-800 mb-3`}>{diff.title}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 mb-1">CommonJS:</p>
                  <p className="text-sm text-gray-700">{diff.cjs}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">ES Modules:</p>
                  <p className="text-sm text-gray-700">{diff.esm}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Package Managers"
        description="Learn how npm, Yarn, and pnpm manage your dependencies differently."
        buttonText="Continue to Package Managers →"
        onButtonClick={() => navigateToSection('Package Managers')}
        colorScheme="green"
      />
    </>
  );
};

export default ModuleSystem;
