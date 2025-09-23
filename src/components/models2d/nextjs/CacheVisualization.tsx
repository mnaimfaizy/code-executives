import React, { useState, useEffect, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface CacheVisualizationProps extends BaseNextJSVisualizationProps {
  cacheType: 'memory' | 'isr' | 'static';
  showMetrics?: boolean;
}

interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
  ttl?: number;
  hits: number;
}

const CacheVisualization: React.FC<CacheVisualizationProps> = ({
  cacheType = 'memory',
  showMetrics = true,
  className = '',
}) => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [currentOperation, setCurrentOperation] = useState<
    'idle' | 'hit' | 'miss' | 'store' | 'evict'
  >('idle');
  const [operationKey, setOperationKey] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Simulate cache operations
  const simulateOperation = useCallback(
    (operation: 'hit' | 'miss' | 'store', key: string) => {
      setCurrentOperation(operation);
      setOperationKey(key);
      setIsAnimating(true);

      setTimeout(() => {
        const newCache = new Map(cache);

        switch (operation) {
          case 'store': {
            newCache.set(key, {
              key,
              value: `Data for ${key}`,
              timestamp: Date.now(),
              ttl: cacheType === 'memory' ? 30000 : cacheType === 'isr' ? 3600000 : undefined,
              hits: 0,
            });
            break;
          }
          case 'hit': {
            const entry = newCache.get(key);
            if (entry) {
              entry.hits += 1;
              entry.timestamp = Date.now(); // Update LRU
            }
            break;
          }
          case 'miss':
            // Cache miss - no change to cache
            break;
        }

        setCache(newCache);
        setIsAnimating(false);
        setCurrentOperation('idle');
      }, 1500);
    },
    [cache, cacheType]
  );

  // Auto-simulate some operations
  useEffect(() => {
    const operations = [
      () => simulateOperation('miss', '/api/users'),
      () => simulateOperation('store', '/api/users'),
      () => simulateOperation('hit', '/api/users'),
      () => simulateOperation('miss', '/api/posts'),
      () => simulateOperation('store', '/api/posts'),
      () => simulateOperation('hit', '/api/posts'),
      () => simulateOperation('hit', '/api/users'),
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < operations.length) {
        operations[index]();
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [simulateOperation]);

  // Check for expired entries
  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      const newCache = new Map(cache);

      for (const [key, entry] of newCache) {
        if (entry.ttl && now - entry.timestamp > entry.ttl) {
          newCache.delete(key);
          setCurrentOperation('evict');
          setOperationKey(key);
          setIsAnimating(true);
          setTimeout(() => {
            setIsAnimating(false);
            setCurrentOperation('idle');
          }, 1000);
        }
      }

      setCache(newCache);
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [cache]);

  const getCacheIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return '🧠';
      case 'isr':
        return '🔄';
      case 'static':
        return '📦';
      default:
        return '💾';
    }
  };

  const getCacheName = (type: string) => {
    switch (type) {
      case 'memory':
        return 'Memory Cache';
      case 'isr':
        return 'ISR Cache';
      case 'static':
        return 'Static Cache';
      default:
        return 'Cache';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'hit':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'miss':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'store':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'evict':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalHits = Array.from(cache.values()).reduce((sum, entry) => sum + entry.hits, 0);
  const hitRate =
    cache.size > 0
      ? Math.round((totalHits / (totalHits + Array.from(cache.values()).length)) * 100)
      : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cache Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getCacheIcon(cacheType)}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{getCacheName(cacheType)}</h3>
              <p className="text-sm text-gray-600">
                {cacheType === 'memory' && 'Request memoization during render'}
                {cacheType === 'isr' && 'Time-based revalidation with background refresh'}
                {cacheType === 'static' && 'Build-time generation, never expires'}
              </p>
            </div>
          </div>

          {/* Current Operation */}
          <div
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all duration-300 ${
              currentOperation === 'idle' ? 'opacity-0' : getOperationColor(currentOperation)
            }`}
          >
            {currentOperation !== 'idle' && (
              <>
                <span className="capitalize">{currentOperation}</span>
                {operationKey && <span className="ml-1 font-mono text-xs">({operationKey})</span>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cache Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Cache Contents</h4>
          <div className="text-sm text-gray-600">
            {cache.size === 0 ? 'Cache is empty' : `${cache.size} entries cached`}
          </div>
        </div>

        {/* Cache entries */}
        <div className="space-y-3 min-h-[200px]">
          {Array.from(cache.entries()).map(([key, entry]) => {
            const isCurrentOperation = operationKey === key && isAnimating;
            const isExpired = entry.ttl && Date.now() - entry.timestamp > entry.ttl;

            return (
              <div
                key={key}
                className={`p-4 border rounded-lg transition-all duration-300 ${
                  isCurrentOperation
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : isExpired
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <code className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {key}
                      </code>
                      <span className="text-sm text-gray-600 truncate max-w-xs">{entry.value}</span>
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Hits: {entry.hits}</span>
                      <span>Age: {Math.round((Date.now() - entry.timestamp) / 1000)}s</span>
                      {entry.ttl && <span>TTL: {Math.round(entry.ttl / 1000)}s</span>}
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center space-x-2">
                    {isExpired && (
                      <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Expired
                      </div>
                    )}
                    {isCurrentOperation && (
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar for TTL */}
                {entry.ttl && !isExpired && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max(0, 100 - ((Date.now() - entry.timestamp) / entry.ttl) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {cache.size === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <div>No cached entries</div>
              <div className="text-sm">Operations will populate the cache</div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{cache.size}</div>
            <div className="text-sm text-gray-600">Entries</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalHits}</div>
            <div className="text-sm text-gray-600">Total Hits</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{hitRate}%</div>
            <div className="text-sm text-gray-600">Hit Rate</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cacheType === 'memory' ? '30s' : cacheType === 'isr' ? '1h' : '∞'}
            </div>
            <div className="text-sm text-gray-600">TTL</div>
          </div>
        </div>
      )}

      {/* Cache Types Comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Cache Types Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg ${cacheType === 'memory' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Memory Cache</div>
            <div className="text-gray-600 mt-1">Request memoization during render pass</div>
            <div className="text-xs text-gray-500 mt-2">
              • Per-render deduplication
              <br />
              • No persistence
              <br />• Automatic cleanup
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${cacheType === 'isr' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">ISR Cache</div>
            <div className="text-gray-600 mt-1">
              Time-based revalidation with background refresh
            </div>
            <div className="text-xs text-gray-500 mt-2">
              • Configurable TTL
              <br />
              • Background regeneration
              <br />• Stale-while-revalidate
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${cacheType === 'static' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Static Cache</div>
            <div className="text-gray-600 mt-1">Build-time generation, CDN delivery</div>
            <div className="text-xs text-gray-500 mt-2">
              • Never expires
              <br />
              • Global CDN
              <br />• Rebuild required for updates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheVisualization;
