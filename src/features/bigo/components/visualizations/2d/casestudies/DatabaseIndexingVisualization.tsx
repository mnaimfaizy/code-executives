// src/components/models2d/bigo/casestudies/DatabaseIndexingVisualization.tsx
// Interactive visualization of database indexing and query performance

import React, { useState, useEffect } from 'react';

interface DatabaseIndexingVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface QueryResult {
  algorithm: string;
  time: number;
  comparisons: number;
  description: string;
}

const DatabaseIndexingVisualization: React.FC<DatabaseIndexingVisualizationProps> = ({
  className = '',
}) => {
  const [dataSize, setDataSize] = useState(1000);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  // Simulate database operations
  const simulateQuery = (algorithm: string, size: number): QueryResult => {
    switch (algorithm) {
      case 'table-scan':
        // O(n) - scan entire table
        return {
          algorithm: 'Table Scan',
          time: size * 10, // 10ms per record
          comparisons: size,
          description: 'Scans every record in the table',
        };
      case 'binary-search':
        // O(log n) - binary search on sorted data
        return {
          algorithm: 'Binary Search',
          time: Math.log2(size) * 5, // 5ms per comparison
          comparisons: Math.log2(size),
          description: 'Binary search on sorted column',
        };
      case 'btree-index':
        // O(log n) - B-tree index lookup
        return {
          algorithm: 'B-Tree Index',
          time: Math.log2(size) * 2, // 2ms per level (faster than binary search)
          comparisons: Math.log2(size),
          description: 'B-tree index with multiple keys per node',
        };
      case 'hash-index':
        // O(1) - hash table lookup
        return {
          algorithm: 'Hash Index',
          time: 1, // Constant time lookup
          comparisons: 1,
          description: 'Hash table for exact match queries',
        };
      default:
        return { algorithm: '', time: 0, comparisons: 0, description: '' };
    }
  };

  const runQueries = async () => {
    setIsRunning(true);
    const algorithms = ['table-scan', 'binary-search', 'btree-index', 'hash-index'];
    const results: QueryResult[] = [];

    for (const algorithm of algorithms) {
      const result = simulateQuery(algorithm, dataSize);
      results.push(result);
      setQueryResults([...results]);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Animation delay
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Reset results when data size changes
    setQueryResults([]);
  }, [dataSize]);

  const getBarHeight = (time: number) => {
    const maxTime = Math.max(...queryResults.map((r) => r.time));
    return (time / maxTime) * 200; // Max height of 200px
  };

  const getTimeColor = (time: number) => {
    const maxTime = Math.max(...queryResults.map((r) => r.time));
    const ratio = time / maxTime;
    if (ratio < 0.25) return '#10b981'; // green
    if (ratio < 0.5) return '#3b82f6'; // blue
    if (ratio < 0.75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Database Query Performance</h3>
        <p className="text-sm text-gray-600">
          How indexing transforms O(n) table scans into O(1) lookups
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Data Size:</label>
          <select
            value={dataSize}
            onChange={(e) => setDataSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            disabled={isRunning}
          >
            <option value={100}>100 records</option>
            <option value={1000}>1,000 records</option>
            <option value={10000}>10,000 records</option>
            <option value={100000}>100,000 records</option>
            <option value={1000000}>1M records</option>
          </select>
        </div>
        <button
          onClick={runQueries}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isRunning ? 'Running...' : 'Run Queries'}
        </button>
      </div>

      {/* Performance Visualization */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Query Performance Comparison:</div>
        <div className="flex items-end justify-center space-x-4 h-48">
          {queryResults.map((result, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-12 bg-gradient-to-t rounded-t cursor-pointer transition-all hover:opacity-80"
                style={{
                  height: `${getBarHeight(result.time)}px`,
                  backgroundColor:
                    getBarHeight(result.time) > 0 ? getTimeColor(result.time) : '#e5e7eb',
                }}
                onClick={() => setSelectedAlgorithm(result.algorithm)}
                title={`${result.algorithm}: ${result.time.toFixed(1)}ms, ${result.comparisons} comparisons`}
              />
              <div className="text-xs text-gray-600 mt-2 text-center max-w-16 truncate">
                {result.algorithm}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-2 text-xs text-gray-500">
          <span>Time (ms)</span>
        </div>
      </div>

      {/* Algorithm Details */}
      {selectedAlgorithm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">{selectedAlgorithm}</h4>
          {queryResults.find((r) => r.algorithm === selectedAlgorithm) && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="font-mono ml-1">
                  {queryResults.find((r) => r.algorithm === selectedAlgorithm)?.time.toFixed(1)}ms
                </span>
              </div>
              <div>
                <span className="text-gray-600">Comparisons:</span>
                <span className="font-mono ml-1">
                  {queryResults.find((r) => r.algorithm === selectedAlgorithm)?.comparisons}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-gray-600">Description:</span>
                <span className="ml-1">
                  {queryResults.find((r) => r.algorithm === selectedAlgorithm)?.description}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <strong className="text-green-600">Hash Index (O(1)):</strong> Perfect for exact matches,
          used in primary key lookups and unique constraints.
        </div>
        <div>
          <strong className="text-blue-600">B-Tree Index (O(log n)):</strong> Excellent for range
          queries, sorting, and partial matches. Most common index type.
        </div>
      </div>

      {/* Real-World Impact */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>Real-World Impact:</strong> A query that takes 10 seconds with a table scan
          completes in 0.001 seconds with proper indexing - that's a 10,000x performance
          improvement!
        </div>
      </div>
    </div>
  );
};

export default DatabaseIndexingVisualization;
