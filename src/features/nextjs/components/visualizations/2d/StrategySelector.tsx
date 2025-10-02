import React from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface StrategySelectorProps extends BaseNextJSVisualizationProps {
  selectedStrategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  onStrategyChange: (strategy: 'ssr' | 'ssg' | 'csr' | 'isr') => void;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onStrategyChange,
  className = '',
}) => {
  const strategies = [
    {
      id: 'csr' as const,
      name: 'Client-Side Rendering',
      shortName: 'CSR',
      description: 'Traditional React approach',
      icon: '🌐',
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      pros: ['Real-time updates', 'Rich interactions'],
      cons: ['Slow initial load', 'Poor SEO'],
      useCase: 'Dashboards, SPAs',
    },
    {
      id: 'ssr' as const,
      name: 'Server-Side Rendering',
      shortName: 'SSR',
      description: 'Fresh content per request',
      icon: '🏭',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      pros: ['SEO friendly', 'Fresh data'],
      cons: ['Server load', 'Slower TTFB'],
      useCase: 'E-commerce, News',
    },
    {
      id: 'ssg' as const,
      name: 'Static Site Generation',
      shortName: 'SSG',
      description: 'Pre-built at build time',
      icon: '📦',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      pros: ['Fastest loading', 'Great SEO'],
      cons: ['Static content', 'Rebuild required'],
      useCase: 'Blogs, Marketing',
    },
    {
      id: 'isr' as const,
      name: 'Incremental Static Regeneration',
      shortName: 'ISR',
      description: 'Static with smart updates',
      icon: '🔄',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      pros: ['Fast + Fresh', 'Auto-updates'],
      cons: ['Complex setup', 'Cache management'],
      useCase: 'Catalogs, Feeds',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => onStrategyChange(strategy.id)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-10 h-10 ${strategy.color} rounded-lg flex items-center justify-center`}
              >
                <span className="text-white text-lg">{strategy.icon}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{strategy.shortName}</div>
                <div className="text-xs text-gray-600">{strategy.description}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-green-700 mb-1">Pros:</div>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {strategy.pros.map((pro, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-red-700 mb-1">Cons:</div>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {strategy.cons.map((con, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs font-medium text-blue-700 mb-1">Best for:</div>
                <div className="text-xs text-gray-600">{strategy.useCase}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Strategy Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`w-12 h-12 ${strategies.find((s) => s.id === selectedStrategy)?.color} rounded-lg flex items-center justify-center`}
          >
            <span className="text-white text-xl">
              {strategies.find((s) => s.id === selectedStrategy)?.icon}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {strategies.find((s) => s.id === selectedStrategy)?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {strategies.find((s) => s.id === selectedStrategy)?.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">First Load:</span>
                <span
                  className={`font-medium ${
                    selectedStrategy === 'ssg' || selectedStrategy === 'isr'
                      ? 'text-green-600'
                      : selectedStrategy === 'ssr'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {selectedStrategy === 'ssg' || selectedStrategy === 'isr'
                    ? 'Fast'
                    : selectedStrategy === 'ssr'
                      ? 'Medium'
                      : 'Slow'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SEO:</span>
                <span
                  className={`font-medium ${
                    selectedStrategy === 'csr' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {selectedStrategy === 'csr' ? 'Poor' : 'Excellent'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Data Freshness</h4>
            <div className="text-sm text-gray-600">
              {selectedStrategy === 'csr' || selectedStrategy === 'ssr'
                ? 'Real-time'
                : selectedStrategy === 'isr'
                  ? 'Periodic updates'
                  : 'Static (build-time)'}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {selectedStrategy === 'csr' || selectedStrategy === 'ssr'
                ? 'Content updates immediately'
                : selectedStrategy === 'isr'
                  ? 'Background regeneration'
                  : 'Requires rebuild for changes'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Server Load</h4>
            <div className="text-sm text-gray-600">
              {selectedStrategy === 'ssg'
                ? 'Very Low'
                : selectedStrategy === 'csr'
                  ? 'Low'
                  : selectedStrategy === 'isr'
                    ? 'Medium'
                    : 'High'}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {selectedStrategy === 'ssg'
                ? 'Pre-built static files'
                : selectedStrategy === 'csr'
                  ? 'Client handles rendering'
                  : selectedStrategy === 'isr'
                    ? 'On-demand regeneration'
                    : 'Per-request rendering'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySelector;
