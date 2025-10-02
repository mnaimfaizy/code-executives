import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface CodeBundle {
  name: string;
  type: 'server' | 'client' | 'shared';
  size: number;
  modules: CodeModule[];
  color: string;
}

interface CodeModule {
  name: string;
  size: number;
  dependencies: string[];
  type: 'server' | 'client' | 'shared';
  code: string;
}

interface CodeSplitterProps extends BaseNextJSVisualizationProps {
  bundles?: CodeBundle[];
  showDetails?: boolean;
}

const CodeSplitter: React.FC<CodeSplitterProps> = ({
  bundles: initialBundles,
  showDetails = true,
  className = '',
}) => {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Generate sample code bundles
  const generateSampleBundles = (): CodeBundle[] => [
    {
      name: 'Server Bundle',
      type: 'server',
      size: 245,
      color: '#10b981',
      modules: [
        {
          name: 'Page Component',
          size: 45,
          type: 'server',
          dependencies: ['React', 'Database'],
          code: `export default function Page() {\n  const data = await fetchData();\n  return <Layout>{data}</Layout>;\n}`,
        },
        {
          name: 'Layout Component',
          size: 32,
          type: 'server',
          dependencies: ['React'],
          code: `export function Layout({ children }) {\n  return (\n    <div className="layout">\n      <Header />\n      {children}\n    </div>\n  );\n}`,
        },
        {
          name: 'Database Utils',
          size: 89,
          type: 'server',
          dependencies: ['Prisma', 'Database'],
          code: `export async function fetchData() {\n  return await prisma.user.findMany();\n}`,
        },
        {
          name: 'API Routes',
          size: 79,
          type: 'server',
          dependencies: ['Next.js'],
          code: `export async function GET() {\n  const data = await db.query();\n  return Response.json(data);\n}`,
        },
      ],
    },
    {
      name: 'Client Bundle',
      type: 'client',
      size: 156,
      color: '#3b82f6',
      modules: [
        {
          name: 'Interactive Components',
          size: 67,
          type: 'client',
          dependencies: ['React', 'useState', 'useEffect'],
          code: `'use client';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={...}>{count}</button>;\n}`,
        },
        {
          name: 'Event Handlers',
          size: 34,
          type: 'client',
          dependencies: ['React'],
          code: `function handleClick() {\n  setState(prev => prev + 1);\n}`,
        },
        {
          name: 'Browser APIs',
          size: 55,
          type: 'client',
          dependencies: ['window', 'document', 'localStorage'],
          code: `useEffect(() => {\n  const theme = localStorage.getItem('theme');\n  document.body.className = theme;\n}, []);`,
        },
      ],
    },
    {
      name: 'Shared Bundle',
      type: 'shared',
      size: 98,
      color: '#8b5cf6',
      modules: [
        {
          name: 'UI Components',
          size: 45,
          type: 'shared',
          dependencies: ['React', 'Tailwind'],
          code: `export function Button({ children }) {\n  return <button className="btn">{children}</button>;\n}`,
        },
        {
          name: 'Utilities',
          size: 28,
          type: 'shared',
          dependencies: ['Lodash'],
          code: `export const formatDate = (date) => {\n  return date.toLocaleDateString();\n};`,
        },
        {
          name: 'Constants',
          size: 25,
          type: 'shared',
          dependencies: [],
          code: `export const API_ENDPOINTS = {\n  users: '/api/users',\n  posts: '/api/posts'\n};`,
        },
      ],
    },
  ];

  const bundles = initialBundles || generateSampleBundles();
  const selectedBundleData = bundles.find((b) => b.name === selectedBundle);

  // Calculate bundle sizes for visualization
  const totalSize = bundles.reduce((acc, bundle) => acc + bundle.size, 0);
  const bundleSizes = bundles.map((bundle) => ({
    ...bundle,
    percentage: (bundle.size / totalSize) * 100,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Code Splitting Visualization</h3>
        <p className="text-gray-600">See how Next.js separates server and client code bundles</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Detailed View
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Bundle Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {bundleSizes.map((bundle) => (
              <div
                key={bundle.name}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg"
                onClick={() =>
                  setSelectedBundle(selectedBundle === bundle.name ? null : bundle.name)
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{bundle.name}</h4>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: bundle.color }}
                  >
                    {bundle.type}
                  </span>
                </div>

                {/* Size Visualization */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Size</span>
                    <span>
                      {bundle.size} KB ({bundle.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${bundle.percentage}%`,
                        backgroundColor: bundle.color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Module Count */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{bundle.modules.length}</span> modules
                </div>

                {/* Expand Indicator */}
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500">
                    {selectedBundle === bundle.name ? '▼' : '▶'} Click to explore
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle Details */}
          {selectedBundleData && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: selectedBundleData.color }}
                  ></div>
                  <span>{selectedBundleData.name} Details</span>
                </h4>
                <button
                  onClick={() => setSelectedBundle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-3">
                {selectedBundleData.modules.map((module) => (
                  <div
                    key={module.name}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setSelectedModule(selectedModule === module.name ? null : module.name)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{module.name}</h5>
                      <span className="text-sm text-gray-600">{module.size} KB</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {module.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>

                    {selectedModule === module.name && showDetails && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                          {module.code}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Detailed Dependency View */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Dependency Graph</h4>

          {/* Simple Dependency Visualization */}
          <div className="space-y-6">
            {bundles.map((bundle) => (
              <div key={bundle.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: bundle.color }}></div>
                  <h5 className="font-medium text-gray-900">{bundle.name}</h5>
                  <span className="text-sm text-gray-600">({bundle.size} KB)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bundle.modules.map((module) => (
                    <div key={module.name} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">{module.name}</div>

                      {module.dependencies.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-1">Dependencies:</div>
                          <div className="flex flex-wrap gap-1">
                            {module.dependencies.map((dep) => (
                              <span
                                key={dep}
                                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Code
                        </summary>
                        <pre className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap">
                          {module.code}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bundle Size Comparison */}
          <div className="mt-8">
            <h5 className="font-medium text-gray-900 mb-4">Bundle Size Comparison</h5>
            <div className="space-y-3">
              {bundleSizes.map((bundle) => (
                <div key={bundle.name} className="flex items-center space-x-3">
                  <div className="w-24 text-sm text-gray-600">{bundle.name}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${bundle.percentage}%`,
                            backgroundColor: bundle.color,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {bundle.size} KB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Splitting Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">Code Splitting Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-blue-900 mb-2">Server Bundle</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Runs on server during build/request time</li>
              <li>• Can access databases and APIs directly</li>
              <li>• Reduces client bundle size</li>
              <li>• Enables faster initial page loads</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-900 mb-2">Client Bundle</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Contains only interactive code</li>
              <li>• Hydrates server-rendered HTML</li>
              <li>• Enables rich user interactions</li>
              <li>• Can use browser APIs and hooks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {bundles.find((b) => b.type === 'server')?.size || 0} KB
          </div>
          <div className="text-sm text-gray-600">Server Bundle</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {bundles.find((b) => b.type === 'client')?.size || 0} KB
          </div>
          <div className="text-sm text-gray-600">Client Bundle</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {bundles.find((b) => b.type === 'shared')?.size || 0} KB
          </div>
          <div className="text-sm text-gray-600">Shared Bundle</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{totalSize} KB</div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
      </div>
    </div>
  );
};

export default CodeSplitter;
