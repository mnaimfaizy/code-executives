import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import PackageManagerViz from '../visualizations/2d/PackageManagerViz';
import { Lightbulb } from 'lucide-react';

const PackageManagers: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        📦 Package Managers: npm vs Yarn vs pnpm
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Package managers install, update, and manage your project dependencies. Each one has a
        fundamentally different architecture — from npm&apos;s flat node_modules to pnpm&apos;s
        content-addressable store. The choice matters for speed, disk usage, and reliability.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Warehouse analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Warehouse Analogy 🏭</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>npm</strong> is like a warehouse that delivers a separate copy of every tool
              to every construction site. 10 sites using the same hammer? 10 hammers shipped.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>pnpm</strong> is like a central tool library with addresses. Every site gets a
              label that points to the single hammer in storage. 10 sites, 1 hammer.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Yarn PnP</strong> skips the warehouse entirely — it gives you a catalog (a
              .pnp.cjs file) that tells you exactly where each tool is, no unpacking needed.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive Package Manager Architecture
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Switch between npm, Yarn, and pnpm to see how each stores packages, resolves dependencies,
          and uses disk space differently.
        </p>
        <PackageManagerViz />
      </ThemeCard>

      {/* Detailed Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Detailed Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 text-gray-800">Feature</th>
                <th className="text-left py-3 px-3 text-red-700">npm</th>
                <th className="text-left py-3 px-3 text-blue-700">Yarn</th>
                <th className="text-left py-3 px-3 text-orange-700">pnpm</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Storage',
                  npm: 'Flat node_modules',
                  yarn: '.pnp.cjs (PnP) or node_modules',
                  pnpm: 'Global store + symlinks',
                },
                {
                  feature: 'Disk Usage',
                  npm: 'High (duplicates)',
                  yarn: 'Low (PnP) / Med',
                  pnpm: 'Lowest (shared store)',
                },
                { feature: 'Install Speed', npm: '~42s', yarn: '~18s (PnP)', pnpm: '~8s' },
                {
                  feature: 'Lockfile',
                  npm: 'package-lock.json',
                  yarn: 'yarn.lock',
                  pnpm: 'pnpm-lock.yaml',
                },
                {
                  feature: 'Workspaces',
                  npm: 'v7+ (basic)',
                  yarn: 'Excellent (native)',
                  pnpm: 'Excellent (native)',
                },
                {
                  feature: 'Security',
                  npm: 'npm audit',
                  yarn: 'yarn audit',
                  pnpm: 'Strict by default',
                },
                {
                  feature: 'Phantom Deps',
                  npm: 'Possible ⚠️',
                  yarn: 'Prevented (PnP) ✅',
                  pnpm: 'Prevented ✅',
                },
              ].map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-3 font-medium text-gray-800">{row.feature}</td>
                  <td className="py-3 px-3 text-gray-700">{row.npm}</td>
                  <td className="py-3 px-3 text-gray-700">{row.yarn}</td>
                  <td className="py-3 px-3 text-gray-700">{row.pnpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Phantom Dependencies */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">👻 What Are Phantom Dependencies?</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In npm&apos;s flat node_modules, your code can accidentally import packages you
          didn&apos;t list in package.json — because a dependency&apos;s dependency gets hoisted to
          the top level. These are <strong>phantom dependencies</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3">❌ npm: Phantom deps possible</h4>
            <div className="bg-gray-900 rounded-lg p-3">
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{`// package.json only has "express"
// But this works because semver
// is hoisted from express deps!
const semver = require('semver');
// 💣 Breaks if express drops semver`}</pre>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">✅ pnpm: Strict isolation</h4>
            <div className="bg-gray-900 rounded-lg p-3">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{`// pnpm only links YOUR dependencies
// into node_modules/.pnpm
const semver = require('semver');
// ❌ Error: Cannot find module
// You MUST add it to package.json`}</pre>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Corepack */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🧰 Corepack: The Package Manager Manager
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Node.js 16.9+ includes <strong>Corepack</strong> — a tool that lets you specify which
          package manager (and version) your project uses. It transparently installs the right
          version when needed.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`# Enable Corepack (ships with Node)
corepack enable

# package.json — lock to pnpm 9
{
  "packageManager": "pnpm@9.0.0"
}

# Now team members automatically get pnpm 9
# Even if they never installed pnpm!`}</pre>
        </div>
      </ThemeCard>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Which One Should You Use?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">🟢 npm</p>
            <p className="text-sm text-gray-600">
              Default choice. Zero setup. Best for beginners and simple projects.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">🔵 Yarn (PnP)</p>
            <p className="text-sm text-gray-600">
              Best for monorepos. Zero-install capability. Strong workspace support.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-200 ring-2 ring-orange-200">
            <p className="font-semibold text-orange-800 mb-1">⭐ pnpm</p>
            <p className="text-sm text-gray-600">
              Best overall. Fastest, least disk usage, strictest correctness. Growing fast.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Server Frameworks"
        description="Compare Express, Fastify, NestJS, Koa, and Hono — the most popular Node.js frameworks."
        buttonText="Continue to Frameworks →"
        onButtonClick={() => navigateToSection('Frameworks')}
        colorScheme="green"
      />
    </>
  );
};

export default PackageManagers;
