import React, { useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  label: string;
  color: string;
  cluster: string;
}

type AlgorithmType = 'brute' | 'hnsw' | 'ivf';

const POINTS: Point[] = [
  // Cluster: Animals
  { x: 120, y: 80, label: 'cat', color: '#3B82F6', cluster: 'Animals' },
  { x: 150, y: 100, label: 'dog', color: '#3B82F6', cluster: 'Animals' },
  { x: 100, y: 120, label: 'fish', color: '#3B82F6', cluster: 'Animals' },
  { x: 140, y: 60, label: 'bird', color: '#3B82F6', cluster: 'Animals' },
  { x: 170, y: 90, label: 'horse', color: '#3B82F6', cluster: 'Animals' },
  // Cluster: Vehicles
  { x: 380, y: 280, label: 'car', color: '#10B981', cluster: 'Vehicles' },
  { x: 410, y: 300, label: 'truck', color: '#10B981', cluster: 'Vehicles' },
  { x: 350, y: 260, label: 'bus', color: '#10B981', cluster: 'Vehicles' },
  { x: 420, y: 250, label: 'bike', color: '#10B981', cluster: 'Vehicles' },
  { x: 390, y: 310, label: 'plane', color: '#10B981', cluster: 'Vehicles' },
  // Cluster: Food
  { x: 440, y: 80, label: 'apple', color: '#F59E0B', cluster: 'Food' },
  { x: 470, y: 100, label: 'pizza', color: '#F59E0B', cluster: 'Food' },
  { x: 420, y: 60, label: 'bread', color: '#F59E0B', cluster: 'Food' },
  { x: 460, y: 120, label: 'cake', color: '#F59E0B', cluster: 'Food' },
  // Cluster: Tech
  { x: 150, y: 280, label: 'laptop', color: '#8B5CF6', cluster: 'Tech' },
  { x: 120, y: 300, label: 'phone', color: '#8B5CF6', cluster: 'Tech' },
  { x: 180, y: 260, label: 'tablet', color: '#8B5CF6', cluster: 'Tech' },
  { x: 140, y: 310, label: 'mouse', color: '#8B5CF6', cluster: 'Tech' },
];

const QUERY_POINT = { x: 160, y: 270, label: 'keyboard' };

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const VectorDatabase2D: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('brute');
  const [showSearch, setShowSearch] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const handleSearch = useCallback((): void => {
    setShowSearch(true);
  }, []);

  const handleReset = useCallback((): void => {
    setShowSearch(false);
  }, []);

  // Sort points by distance to query
  const sortedByDistance = [...POINTS]
    .map((p) => ({ ...p, dist: distance(p, QUERY_POINT) }))
    .sort((a, b) => a.dist - b.dist);

  const topK = sortedByDistance.slice(0, 4);
  const topKLabels = new Set(topK.map((p) => p.label));

  // IVF clusters centroids
  const clusters = [
    { name: 'Animals', cx: 136, cy: 90, r: 60, color: '#DBEAFE' },
    { name: 'Vehicles', cx: 390, cy: 280, r: 55, color: '#D1FAE5' },
    { name: 'Food', cx: 448, cy: 90, r: 50, color: '#FEF3C7' },
    { name: 'Tech', cx: 148, cy: 288, r: 55, color: '#EDE9FE' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 text-center">
        Vector Similarity Search Visualization
      </h3>
      <p className="text-sm text-gray-600 text-center">
        Words are embedded as vectors in 2D space. Similar concepts cluster together. Search finds
        the nearest neighbors to a query vector.
      </p>

      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {(
          [
            { key: 'brute', label: 'Brute Force', desc: 'O(N) — compare all vectors' },
            { key: 'hnsw', label: 'HNSW', desc: 'O(log N) — navigable small world graph' },
            { key: 'ivf', label: 'IVF', desc: 'O(N/k) — inverted file index with clusters' },
          ] as const
        ).map((algo) => (
          <button
            key={algo.key}
            onClick={() => {
              setAlgorithm(algo.key);
              setShowSearch(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              algorithm === algo.key
                ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            title={algo.desc}
          >
            {algo.label}
          </button>
        ))}

        <button
          onClick={showSearch ? handleReset : handleSearch}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showSearch
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {showSearch ? 'Reset' : 'Search "keyboard"'}
        </button>
      </div>

      {/* SVG visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 overflow-hidden">
        <svg viewBox="0 0 580 380" className="w-full" style={{ maxHeight: 380 }}>
          {/* IVF cluster regions */}
          {algorithm === 'ivf' &&
            clusters.map((c) => (
              <g key={c.name}>
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={c.r}
                  fill={c.color}
                  stroke="#D1D5DB"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  opacity={0.6}
                />
                <text x={c.cx} y={c.cy - c.r - 5} textAnchor="middle" fill="#6B7280" fontSize="9">
                  {c.name}
                </text>
              </g>
            ))}

          {/* HNSW graph edges */}
          {algorithm === 'hnsw' && (
            <g opacity={0.15}>
              {POINTS.map((p, i) =>
                POINTS.slice(i + 1)
                  .filter((q) => distance(p, q) < 120)
                  .map((q, j) => (
                    <line
                      key={`${i}-${j}`}
                      x1={p.x}
                      y1={p.y}
                      x2={q.x}
                      y2={q.y}
                      stroke="#A78BFA"
                      strokeWidth="0.8"
                    />
                  ))
              )}
            </g>
          )}

          {/* Brute force: show distance lines to query when searching */}
          {showSearch && algorithm === 'brute' && (
            <g opacity={0.15}>
              {POINTS.map((p, i) => (
                <line
                  key={i}
                  x1={QUERY_POINT.x}
                  y1={QUERY_POINT.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="#EF4444"
                  strokeWidth="0.5"
                  strokeDasharray="3 2"
                />
              ))}
            </g>
          )}

          {/* Search result highlights */}
          {showSearch &&
            topK.map((p, i) => (
              <g key={`result-${i}`}>
                <line
                  x1={QUERY_POINT.x}
                  y1={QUERY_POINT.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  opacity={0.5}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="16"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  opacity={0.6}
                />
              </g>
            ))}

          {/* Data points */}
          {POINTS.map((p, i) => {
            const isResult = showSearch && topKLabels.has(p.label);
            const isHovered = hoveredPoint === p.label;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredPoint(p.label)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 10 : 7}
                  fill={isResult ? '#EF4444' : p.color}
                  stroke="white"
                  strokeWidth="2"
                  opacity={showSearch && !isResult ? 0.3 : 1}
                  className="transition-all duration-200"
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fill={isResult ? '#DC2626' : '#374151'}
                  fontSize="9"
                  fontWeight={isResult || isHovered ? 'bold' : 'normal'}
                  opacity={showSearch && !isResult && !isHovered ? 0.3 : 1}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Query point */}
          <g>
            <circle
              cx={QUERY_POINT.x}
              cy={QUERY_POINT.y}
              r="10"
              fill="#EF4444"
              stroke="white"
              strokeWidth="2.5"
            />
            <text
              x={QUERY_POINT.x + 16}
              y={QUERY_POINT.y + 4}
              fill="#DC2626"
              fontSize="10"
              fontWeight="bold"
            >
              ? {QUERY_POINT.label}
            </text>
            {showSearch && (
              <circle
                cx={QUERY_POINT.x}
                cy={QUERY_POINT.y}
                r={distance(QUERY_POINT, topK[topK.length - 1]) + 5}
                fill="none"
                stroke="#EF4444"
                strokeWidth="1"
                strokeDasharray="5 3"
                opacity={0.3}
              />
            )}
          </g>

          {/* Legend */}
          <g transform="translate(430, 330)">
            <rect x="0" y="0" width="140" height="45" rx="4" fill="white" stroke="#E5E7EB" />
            <circle cx="15" cy="15" r="4" fill="#EF4444" />
            <text x="25" y="18" fill="#374151" fontSize="9">
              Query vector
            </text>
            <circle cx="15" cy="33" r="4" fill="#3B82F6" />
            <text x="25" y="36" fill="#374151" fontSize="9">
              Data vectors (k-NN results circled)
            </text>
          </g>
        </svg>
      </div>

      {/* Algorithm explanation */}
      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200 text-sm text-gray-700">
        {algorithm === 'brute' && (
          <p>
            <strong>Brute Force (Flat Index):</strong> Compares the query vector against every
            single vector in the database. <strong>100% accurate</strong> but O(N) — impractical for
            millions of vectors. Used as a baseline for measuring recall of approximate methods.
          </p>
        )}
        {algorithm === 'hnsw' && (
          <p>
            <strong>HNSW (Hierarchical Navigable Small World):</strong> Builds a multi-layer graph
            where each node connects to nearby neighbors. Search starts at the top layer (few nodes,
            long-range links) and narrows down to the bottom layer (all nodes, short-range links).{' '}
            <strong>O(log N)</strong> search time. Used by Pinecone, pgvector, Qdrant, Weaviate.
          </p>
        )}
        {algorithm === 'ivf' && (
          <p>
            <strong>IVF (Inverted File Index):</strong> K-means clusters the vectors into
            partitions. At query time, only the <strong>nprobe</strong> nearest cluster centroids
            are searched — reducing comparisons by orders of magnitude. <strong>O(N/k)</strong> per
            query. Used by FAISS (Facebook AI Similarity Search).
          </p>
        )}
      </div>
    </div>
  );
};

export default VectorDatabase2D;
