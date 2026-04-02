import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import RuntimeComparisonViz from '../visualizations/2d/RuntimeComparisonViz';
import { Lightbulb } from 'lucide-react';

const RuntimeWars: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        ⚔️ Runtime Wars: Node.js vs Deno vs Bun
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Node.js ruled server-side JavaScript since 2009, but two challengers have emerged. Deno (by
        Node&apos;s creator) prioritizes security and web standards. Bun prioritizes raw speed with
        an all-in-one toolkit. Each reimagines what a runtime should be.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Vehicle analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Vehicle Analogy 🚗</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Node.js</strong> is a trusted sedan — it has been around the longest, has the
              most dealerships (npm packages), and everyone knows how to drive it.{' '}
              <strong>Deno</strong> is an electric vehicle — cleaner design, built-in safety
              features, but fewer charging stations (ecosystem). <strong>Bun</strong> is a sports
              car — blazingly fast and thrilling, but still being road-tested for reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Runtime Comparison</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Click each runtime to explore its engine, architecture, strengths, weaknesses, and
          benchmark performance.
        </p>
        <RuntimeComparisonViz />
      </ThemeCard>

      {/* Origins */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📜 The Origin Stories</h2>
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-2">🟢 Node.js (2009) — Ryan Dahl</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              Born from frustration with Apache&apos;s threading model. Ryan Dahl chose V8 + libuv
              to create an event-driven, non-blocking I/O runtime. It spawned a revolution: npm,
              Express, full-stack JavaScript, and 2M+ packages.
            </p>
            <p className="text-sm text-green-700 font-medium">
              Engine: V8 (C++) · Async: libuv (C) · Maintained by OpenJS Foundation
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🦕 Deno (2018) — Ryan Dahl</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              In his famous <em>&quot;10 Things I Regret About Node.js&quot;</em> talk, Dahl
              announced Deno — a complete rewrite addressing Node&apos;s design mistakes: no
              package.json, secure by default, browser-compatible APIs, and first-class TypeScript
              support.
            </p>
            <p className="text-sm text-blue-700 font-medium">
              Engine: V8 (Rust wrapper) · Async: Tokio (Rust) · Maintained by Deno Land Inc.
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-2">🧁 Bun (2022) — Jarred Sumner</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              Built from scratch in Zig using JavaScriptCore (Safari&apos;s engine) instead of V8.
              Designed to be an all-in-one toolkit: runtime + bundler + transpiler + package manager
              + test runner. Claims 3-4× speed over Node.js in many benchmarks.
            </p>
            <p className="text-sm text-amber-700 font-medium">
              Engine: JavaScriptCore (Zig wrapper) · Async: io_uring (Linux) · Maintained by Oven
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Key Differences */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔑 Key Differences</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 text-gray-800">Aspect</th>
                <th className="text-left py-3 px-3 text-green-700">Node.js</th>
                <th className="text-left py-3 px-3 text-blue-700">Deno</th>
                <th className="text-left py-3 px-3 text-amber-700">Bun</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  aspect: 'TypeScript',
                  node: 'Via transpiler',
                  deno: 'Native support',
                  bun: 'Native support',
                },
                {
                  aspect: 'Security',
                  node: 'Open by default',
                  deno: 'Sandboxed (--allow-*)',
                  bun: 'Open by default',
                },
                {
                  aspect: 'Package Manager',
                  node: 'npm / yarn / pnpm',
                  deno: 'URL imports + deno.json',
                  bun: 'bun install (npm-compatible)',
                },
                {
                  aspect: 'Config Files',
                  node: 'package.json + tsconfig + ...',
                  deno: 'deno.json (optional)',
                  bun: 'package.json + bunfig.toml',
                },
                {
                  aspect: 'Web APIs',
                  node: 'Partial (fetch in v18+)',
                  deno: 'Full browser-compatible',
                  bun: 'Full browser-compatible',
                },
                {
                  aspect: 'npm Compat',
                  node: '100%',
                  deno: 'npm: specifier',
                  bun: '~95%+ compatible',
                },
                {
                  aspect: 'Test Runner',
                  node: 'node:test (v18+)',
                  deno: 'deno test (built-in)',
                  bun: 'bun test (built-in, Jest-compatible)',
                },
                { aspect: 'Maturity', node: '15+ years', deno: '6+ years', bun: '2+ years' },
              ].map((row, i) => (
                <tr key={row.aspect} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-3 font-medium text-gray-800">{row.aspect}</td>
                  <td className="py-3 px-3 text-gray-700">{row.node}</td>
                  <td className="py-3 px-3 text-gray-700">{row.deno}</td>
                  <td className="py-3 px-3 text-gray-700">{row.bun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* When to Choose */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 When to Choose Each</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-bold text-green-800 mb-3">✅ Choose Node.js When</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>You need maximum ecosystem breadth
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>Your team has Node.js experience
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You need battle-tested production stability
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You depend on native C++ addons
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>Enterprise support is required
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">✅ Choose Deno When</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>Security is a top priority
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You want zero-config TypeScript
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You prefer web-standard APIs
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>Edge/serverless deployment (Deno Deploy)
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>Greenfield project with no legacy deps
              </li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-3">✅ Choose Bun When</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>Raw speed is critical
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You want an all-in-one toolkit
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You need fast npm installs
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>You&apos;re building with React/Next.js
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>Experimenting with cutting-edge tooling
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Future */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-900 mb-3">
          🔮 The Future of Server-Side JavaScript
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Competition is driving rapid innovation. Node.js is adopting web standards and adding
          native TypeScript. Deno achieved npm compatibility. Bun is forcing everyone to optimize.
          The winner? <strong>Developers</strong> — all three runtimes are getting better, faster.
        </p>
        <p className="text-gray-700 leading-relaxed">
          The WinterCG (Web-interoperable Runtimes Community Group) is working to standardize APIs
          across runtimes, so your code increasingly runs <em>anywhere</em>.
        </p>
      </div>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Back to Introduction"
        description="Review the full Node.js Ecosystem overview and explore other sections."
        buttonText="← Back to Introduction"
        onButtonClick={() => {
          window.location.href = '/nodejs?section=Introduction';
        }}
        colorScheme="green"
      />
    </>
  );
};

export default RuntimeWars;
