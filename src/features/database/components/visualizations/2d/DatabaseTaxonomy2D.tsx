import React, { useState, useCallback, useMemo } from 'react';
import { Database, FileText, Key, Share2, Cpu, ChevronRight } from 'lucide-react';

interface DatabaseType {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  strengths: string[];
  examples: string[];
  dataModel: string;
}

interface DatabaseTaxonomy2DProps {
  selectedModel?: string;
  onModelSelect?: (model: string) => void;
  className?: string;
}

const DatabaseTaxonomy2D: React.FC<DatabaseTaxonomy2DProps> = React.memo(
  ({ selectedModel: controlledModel, onModelSelect, className = '' }) => {
    const [internalSelected, setInternalSelected] = useState<string>('relational');
    const selected = controlledModel ?? internalSelected;

    const handleSelect = useCallback(
      (id: string) => {
        if (onModelSelect) {
          onModelSelect(id);
        } else {
          setInternalSelected(id);
        }
      },
      [onModelSelect]
    );

    const types: DatabaseType[] = useMemo(
      () => [
        {
          id: 'relational',
          label: 'Relational',
          icon: <Database className="w-5 h-5" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          description:
            'Stores data in tables with fixed schemas. Rows have the same columns. Relationships via foreign keys. ACID-compliant by default.',
          strengths: [
            'Strong consistency & ACID transactions',
            'Complex JOINs and aggregations',
            'Mature tooling and SQL standard',
            'Best for structured, relational data',
          ],
          examples: ['PostgreSQL', 'Oracle', 'MySQL', 'SQL Server'],
          dataModel: 'Tables → Rows → Columns',
        },
        {
          id: 'document',
          label: 'Document',
          icon: <FileText className="w-5 h-5" />,
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          description:
            'Stores data as flexible JSON/BSON documents. Each document can have a different structure. Great for rapidly evolving schemas.',
          strengths: [
            'Flexible, schema-less design',
            'Nested objects stored inline',
            'Horizontal scaling via sharding',
            'Natural fit for APIs and web apps',
          ],
          examples: ['MongoDB', 'CouchDB', 'Firestore', 'DynamoDB'],
          dataModel: 'Collections → Documents → Fields',
        },
        {
          id: 'keyvalue',
          label: 'Key-Value',
          icon: <Key className="w-5 h-5" />,
          color: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          description:
            "Simplest model: every item is a key-value pair. Blazing fast lookups by key. No complex queries — you get the value or you don't.",
          strengths: [
            'Sub-millisecond O(1) lookups',
            'Perfect for caching and sessions',
            'Extremely scalable horizontally',
            'Simple mental model',
          ],
          examples: ['Redis', 'Memcached', 'Riak', 'DynamoDB'],
          dataModel: 'Key → Value (blob)',
        },
        {
          id: 'graph',
          label: 'Graph',
          icon: <Share2 className="w-5 h-5" />,
          color: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-300',
          description:
            'Data modeled as nodes and edges (relationships). Traversing relationships is a first-class operation — no expensive JOINs.',
          strengths: [
            'Relationship-first queries',
            'Social networks and recommendations',
            'Pattern matching and pathfinding',
            'Dynamic, evolving schemas',
          ],
          examples: ['Neo4j', 'Amazon Neptune', 'ArangoDB', 'TigerGraph'],
          dataModel: 'Nodes → Edges → Properties',
        },
        {
          id: 'vector',
          label: 'Vector',
          icon: <Cpu className="w-5 h-5" />,
          color: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-300',
          description:
            'Stores high-dimensional vectors (embeddings). Enables similarity search — "find the 10 most similar items". Powers AI/ML applications.',
          strengths: [
            'Semantic similarity search',
            'AI embedding storage',
            'Image/text/audio retrieval',
            'RAG (Retrieval-Augmented Generation)',
          ],
          examples: ['Pinecone', 'Weaviate', 'Milvus', 'pgvector'],
          dataModel: 'Vectors → Indexes (HNSW/IVF)',
        },
      ],
      []
    );

    const activeType = useMemo(
      () => types.find((t) => t.id === selected) ?? types[0],
      [types, selected]
    );

    return (
      <div className={`space-y-6 ${className}`}>
        {/* SVG Taxonomy Tree */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
          <svg
            viewBox="0 0 800 280"
            className="w-full h-auto"
            role="img"
            aria-label="Database taxonomy showing 5 paradigms branching from a central database node"
          >
            {/* Central Node */}
            <rect x="310" y="10" width="180" height="44" rx="12" fill="#0d9488" />
            <text x="400" y="38" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">
              Database Paradigms
            </text>

            {/* Branch Lines */}
            {types.map((t, i) => {
              const cx = 80 + i * 165;
              const cy = 180;
              const isActive = t.id === selected;
              return (
                <g key={t.id}>
                  {/* Connecting line */}
                  <line
                    x1="400"
                    y1="54"
                    x2={cx}
                    y2={cy - 40}
                    stroke={isActive ? '#0d9488' : '#d1d5db'}
                    strokeWidth={isActive ? 3 : 1.5}
                    strokeDasharray={isActive ? undefined : '4 4'}
                  />

                  {/* Node */}
                  <g
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`Select ${t.label} database type`}
                    onClick={() => handleSelect(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(t.id);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={cx - 60}
                      y={cy - 40}
                      width="120"
                      height="80"
                      rx="12"
                      fill={isActive ? '#f0fdfa' : '#f9fafb'}
                      stroke={isActive ? '#0d9488' : '#d1d5db'}
                      strokeWidth={isActive ? 2.5 : 1}
                    />
                    {/* Icon circle */}
                    <circle cx={cx} cy={cy - 14} r="16" fill={isActive ? '#ccfbf1' : '#e5e7eb'} />
                    {/* Small icon placeholder */}
                    <text
                      x={cx}
                      y={cy - 9}
                      textAnchor="middle"
                      fontSize="14"
                      fill={isActive ? '#0d9488' : '#6b7280'}
                    >
                      {t.id === 'relational'
                        ? '⊞'
                        : t.id === 'document'
                          ? '{ }'
                          : t.id === 'keyvalue'
                            ? 'K:V'
                            : t.id === 'graph'
                              ? '◉─◉'
                              : '↗'}
                    </text>
                    {/* Label */}
                    <text
                      x={cx}
                      y={cy + 16}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight={isActive ? 'bold' : 'normal'}
                      fill={isActive ? '#0f766e' : '#374151'}
                    >
                      {t.label}
                    </text>
                    {/* Examples */}
                    <text x={cx} y={cy + 32} textAnchor="middle" fontSize="9" fill="#9ca3af">
                      {t.examples.slice(0, 2).join(', ')}
                    </text>
                  </g>

                  {/* Pulsing indicator for selected */}
                  {isActive && (
                    <circle
                      cx={cx}
                      cy={cy - 14}
                      r="20"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                    >
                      <animate
                        attributeName="r"
                        values="20;26;20"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail Card */}
        <div
          className={`rounded-xl border-2 p-6 transition-all duration-300 ${activeType.bgColor} ${activeType.borderColor}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${activeType.bgColor} border ${activeType.borderColor}`}
            >
              <span className={activeType.color}>{activeType.icon}</span>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${activeType.color}`}>
                {activeType.label} Database
              </h3>
              <p className="text-xs text-gray-500">{activeType.dataModel}</p>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 leading-relaxed">{activeType.description}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Strengths
              </h4>
              <ul className="space-y-1">
                {activeType.strengths.map((s, i) => (
                  <li key={i} className="flex items-start space-x-1.5 text-sm text-gray-700">
                    <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0 text-teal-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Popular Examples
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeType.examples.map((ex) => (
                  <span
                    key={ex}
                    className="px-3 py-1 rounded-full bg-white/80 text-xs font-medium text-gray-700 border border-gray-200"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DatabaseTaxonomy2D.displayName = 'DatabaseTaxonomy2D';

export default DatabaseTaxonomy2D;
