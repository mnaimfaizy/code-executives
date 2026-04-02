import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import { Lightbulb } from 'lucide-react';

const AsyncProgramming: React.FC = () => {
  const [activePattern, setActivePattern] = useState<'callbacks' | 'promises' | 'asyncawait'>(
    'callbacks'
  );

  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">⚡ Async Programming Patterns</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Node.js is fundamentally asynchronous. Over the years, three major patterns emerged to
        handle async operations: Callbacks, Promises, and async/await. Each solved problems the
        previous one created.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Pattern Selector */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { key: 'callbacks' as const, label: '📞 Callbacks (2009)', color: 'red' },
          { key: 'promises' as const, label: '🤝 Promises (2015)', color: 'blue' },
          { key: 'asyncawait' as const, label: '✨ Async/Await (2017)', color: 'green' },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePattern(p.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
              activePattern === p.key
                ? `bg-${p.color}-100 text-${p.color}-800 border-${p.color}-300`
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Callbacks Section */}
      {activePattern === 'callbacks' && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📞 Callbacks: The Original Pattern
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            The original async pattern in Node.js. Every async function takes a callback as its last
            argument, following the <strong>error-first convention</strong>: the first parameter is
            always an error (or null).
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">✅ Simple Callback</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`const fs = require('fs');

fs.readFile('data.txt', 'utf8',
  (err, data) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log(data);
  }
);`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-3">❌ Callback Hell</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-red-700/30">
                <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">{`fs.readFile('a.txt', (err, a) => {
  fs.readFile('b.txt', (err, b) => {
    fs.readFile('c.txt', (err, c) => {
      fs.readFile('d.txt', (err, d) => {
        // Pyramid of doom 😱
        // Error handling nightmare
        // Impossible to debug
      });
    });
  });
});`}</pre>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Problems with Callbacks</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>
                🔺 <strong>Pyramid of Doom:</strong> Nested callbacks create deeply indented,
                unreadable code
              </li>
              <li>
                ❌ <strong>Error Handling:</strong> Must check errors manually in every callback
              </li>
              <li>
                🔀 <strong>Control Flow:</strong> Running async operations in parallel or sequence
                is painful
              </li>
              <li>
                🐛 <strong>Inversion of Control:</strong> You hand your function to someone else to
                call — trust issues
              </li>
            </ul>
          </div>
        </ThemeCard>
      )}

      {/* Promises Section */}
      {activePattern === 'promises' && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🤝 Promises: Chain of Trust</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            ES2015 introduced Promises — objects that represent a future value. Instead of passing
            callbacks, you chain <code>.then()</code> and <code>.catch()</code> methods. A Promise
            is always in one of three states: <strong>pending</strong>, <strong>fulfilled</strong>,
            or <strong>rejected</strong>.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Promise Chaining</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-blue-700/30">
                <pre className="text-sm text-blue-400 font-mono whitespace-pre-wrap">{`const fsPromises = require('fs').promises;

fsPromises.readFile('a.txt', 'utf8')
  .then(a => fsPromises.readFile('b.txt'))
  .then(b => fsPromises.readFile('c.txt'))
  .then(c => {
    console.log('All files read!');
  })
  .catch(err => {
    // ONE catch handles ALL errors 🎯
    console.error(err);
  });`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Parallel Execution</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-blue-700/30">
                <pre className="text-sm text-blue-400 font-mono whitespace-pre-wrap">{`// Run all at once — fastest!
const results = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments'),
]);

// First to resolve wins
const fastest = await Promise.race([
  fetch(server1),
  fetch(server2),
]);`}</pre>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">What Promises Fixed</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>
                ✅ <strong>Flat Chains:</strong> No more nesting — flat .then() chains
              </li>
              <li>
                ✅ <strong>Centralized Errors:</strong> One .catch() handles all errors
              </li>
              <li>
                ✅ <strong>Composition:</strong> Promise.all, Promise.race, Promise.allSettled
              </li>
              <li>
                ⚠️ <strong>Still verbose:</strong> .then() chains can still get long
              </li>
            </ul>
          </div>
        </ThemeCard>
      )}

      {/* Async/Await Section */}
      {activePattern === 'asyncawait' && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Async/Await: The Modern Way</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Introduced in ES2017 (Node 7.6+), async/await is <strong>syntactic sugar</strong> over
            Promises. It lets you write asynchronous code that <em>reads</em> like synchronous code
            — the most readable and maintainable pattern.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Clean Async Code</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-green-700/30">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`async function loadAllData() {
  try {
    const a = await fs.readFile('a.txt');
    const b = await fs.readFile('b.txt'); 
    const c = await fs.readFile('c.txt');
    
    console.log('All done!', a, b, c);
  } catch (err) {
    // Clean error handling
    console.error('Failed:', err);
  }
}`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">Parallel with Await</h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-green-700/30">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`// ❌ Sequential (slow)
const a = await fetch('/a');
const b = await fetch('/b');

// ✅ Parallel (fast!)
const [a, b] = await Promise.all([
  fetch('/a'),
  fetch('/b'),
]);

// ✅ Top-level await (ESM)
const config = await loadConfig();`}</pre>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Best Practices</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>
                ✅ <strong>Always use try/catch:</strong> Unhandled rejections crash Node in newer
                versions
              </li>
              <li>
                ✅ <strong>Parallelize when possible:</strong> Use Promise.all() for independent
                operations
              </li>
              <li>
                ✅ <strong>Avoid mixing patterns:</strong> Don&apos;t mix callbacks with async/await
              </li>
              <li>
                ✅ <strong>Use util.promisify():</strong> Convert callback APIs to Promises
              </li>
            </ul>
          </div>
        </ThemeCard>
      )}

      {/* Evolution summary */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Evolution 📈</h3>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
              {[
                { label: 'Callbacks', sub: '2009', color: 'bg-red-100 text-red-800' },
                { label: '→', sub: '', color: 'text-gray-400' },
                { label: 'Promises', sub: '2015', color: 'bg-blue-100 text-blue-800' },
                { label: '→', sub: '', color: 'text-gray-400' },
                { label: 'Async/Await', sub: '2017', color: 'bg-green-100 text-green-800' },
              ].map((item, i) =>
                item.sub === '' ? (
                  <span key={i} className="text-xl font-bold text-gray-400 hidden sm:block">
                    →
                  </span>
                ) : (
                  <div key={i} className={`${item.color} rounded-lg px-4 py-2 text-sm font-medium`}>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs opacity-70">{item.sub}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Buffers & Streams"
        description="Learn how Node.js processes gigabytes of data with only megabytes of memory."
        buttonText="Continue to Buffers & Streams →"
        onButtonClick={() => navigateToSection('Buffers & Streams')}
        colorScheme="green"
      />
    </>
  );
};

export default AsyncProgramming;
