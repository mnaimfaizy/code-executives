import React, { useState } from 'react';

type DbCategory = 'sql' | 'document' | 'keyvalue' | 'graph' | 'widecolumn';

interface DbTypeInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  examples: string[];
  dataModel: string;
  queryLang: string;
  scaling: string;
  consistency: string;
  bestFor: string;
}

const DB_TYPES: Record<DbCategory, DbTypeInfo> = {
  sql: {
    label: 'Relational (SQL)',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    examples: ['PostgreSQL', 'Oracle', 'MySQL', 'SQL Server'],
    dataModel: 'Tables with rows & columns, strict schema, foreign keys',
    queryLang: 'SQL (declarative)',
    scaling: 'Vertical (scale-up); read replicas for horizontal reads',
    consistency: 'Strong (ACID transactions)',
    bestFor: 'Structured data, complex joins, financial systems, ERP',
  },
  document: {
    label: 'Document Store',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    examples: ['MongoDB', 'CouchDB', 'Amazon DocumentDB', 'Firestore'],
    dataModel: 'JSON/BSON documents, flexible schema, nested objects',
    queryLang: 'MongoDB Query Language, N1QL (Couchbase)',
    scaling: 'Horizontal (auto-sharding across nodes)',
    consistency: 'Tunable (eventual → strong per operation)',
    bestFor: 'Content management, user profiles, catalogs, real-time apps',
  },
  keyvalue: {
    label: 'Key-Value Store',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    examples: ['Redis', 'Amazon DynamoDB', 'Memcached', 'etcd'],
    dataModel: 'Simple key → value pairs (value is opaque blob)',
    queryLang: 'GET/SET/DELETE API (no query language)',
    scaling: 'Horizontal (hash-based partitioning)',
    consistency: 'Eventual (DynamoDB: tunable)',
    bestFor: 'Caching, sessions, shopping carts, leaderboards',
  },
  graph: {
    label: 'Graph Database',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    examples: ['Neo4j', 'Amazon Neptune', 'JanusGraph', 'ArangoDB'],
    dataModel: 'Nodes + Edges + Properties (index-free adjacency)',
    queryLang: 'Cypher (Neo4j), Gremlin, SPARQL',
    scaling: 'Challenging for writes; good for read-heavy traversals',
    consistency: 'Strong (ACID in Neo4j)',
    bestFor: 'Social networks, fraud detection, knowledge graphs, recommendations',
  },
  widecolumn: {
    label: 'Wide-Column Store',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    examples: ['Cassandra', 'HBase', 'ScyllaDB', 'Google Bigtable'],
    dataModel: 'Row key → column families → columns (sparse, wide rows)',
    queryLang: 'CQL (Cassandra), HBase API',
    scaling: 'Massive horizontal (petabyte-scale)',
    consistency: 'Tunable (Cassandra: ANY → ALL)',
    bestFor: 'Time-series, IoT, event logging, messaging at massive scale',
  },
};

const categories: DbCategory[] = ['sql', 'document', 'keyvalue', 'graph', 'widecolumn'];

const SQLvsNoSQL2D: React.FC = () => {
  const [selected, setSelected] = useState<DbCategory>('sql');
  const info = DB_TYPES[selected];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 text-center">
        Interactive Database Type Explorer
      </h3>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => {
          const t = DB_TYPES[cat];
          const isActive = cat === selected;
          return (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? `${t.bgColor} ${t.borderColor} ${t.color} shadow-md ring-2 ring-offset-1 ring-current`
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div
        className={`${info.bgColor} rounded-xl p-5 border ${info.borderColor} transition-all duration-300`}
      >
        <h4 className={`text-xl font-bold ${info.color} mb-3`}>{info.label}</h4>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Data Model</p>
              <p className="text-xs">{info.dataModel}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Query Language</p>
              <p className="text-xs">{info.queryLang}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Scaling</p>
              <p className="text-xs">{info.scaling}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Consistency Model</p>
              <p className="text-xs">{info.consistency}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Best For</p>
              <p className="text-xs">{info.bestFor}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Examples</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {info.examples.map((ex) => (
                  <span
                    key={ex}
                    className="bg-white px-2 py-0.5 rounded text-xs font-medium border border-gray-200"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Model Visualizations */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 text-sm mb-3 text-center">
          Data Model Visualization — {info.label}
        </h4>
        <svg viewBox="0 0 600 200" className="w-full h-48">
          {selected === 'sql' && (
            <g>
              {/* Table visualization */}
              <rect
                x="100"
                y="10"
                width="400"
                height="180"
                rx="6"
                fill="#EFF6FF"
                stroke="#93C5FD"
                strokeWidth="1.5"
              />
              <text
                x="300"
                y="32"
                textAnchor="middle"
                className="text-xs"
                fill="#1E40AF"
                fontWeight="bold"
              >
                employees
              </text>
              <line x1="100" y1="40" x2="500" y2="40" stroke="#93C5FD" strokeWidth="1" />
              {/* Header row */}
              {['id', 'name', 'department', 'salary'].map((col, i) => (
                <text
                  key={col}
                  x={140 + i * 100}
                  y="58"
                  textAnchor="middle"
                  fill="#1E40AF"
                  fontSize="11"
                  fontWeight="600"
                >
                  {col}
                </text>
              ))}
              <line x1="100" y1="65" x2="500" y2="65" stroke="#BFDBFE" strokeWidth="1" />
              {/* Data rows */}
              {[
                ['1', 'Alice', 'Engineering', '$120k'],
                ['2', 'Bob', 'Marketing', '$95k'],
                ['3', 'Carol', 'Engineering', '$115k'],
                ['4', 'Dave', 'Sales', '$88k'],
              ].map((row, ri) =>
                row.map((val, ci) => (
                  <text
                    key={`${ri}-${ci}`}
                    x={140 + ci * 100}
                    y={85 + ri * 25}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="10"
                  >
                    {val}
                  </text>
                ))
              )}
            </g>
          )}
          {selected === 'document' && (
            <g>
              <rect
                x="50"
                y="10"
                width="240"
                height="170"
                rx="6"
                fill="#ECFDF5"
                stroke="#6EE7B7"
                strokeWidth="1.5"
              />
              <text
                x="170"
                y="30"
                textAnchor="middle"
                fill="#047857"
                fontSize="10"
                fontWeight="bold"
              >
                Document 1
              </text>
              <text x="70" y="52" fill="#374151" fontSize="10" fontFamily="monospace">
                {'{'}
              </text>
              <text x="85" y="68" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;name&quot;: &quot;Alice&quot;,
              </text>
              <text x="85" y="84" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;dept&quot;: &quot;Engineering&quot;,
              </text>
              <text x="85" y="100" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;skills&quot;: [&quot;React&quot;,
              </text>
              <text x="120" y="116" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;TypeScript&quot;],
              </text>
              <text x="85" y="132" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;address&quot;: {'{'} ... {'}'}
              </text>
              <text x="70" y="152" fill="#374151" fontSize="10" fontFamily="monospace">
                {'}'}
              </text>

              <rect
                x="320"
                y="10"
                width="240"
                height="130"
                rx="6"
                fill="#ECFDF5"
                stroke="#6EE7B7"
                strokeWidth="1.5"
              />
              <text
                x="440"
                y="30"
                textAnchor="middle"
                fill="#047857"
                fontSize="10"
                fontWeight="bold"
              >
                Document 2
              </text>
              <text x="340" y="52" fill="#374151" fontSize="10" fontFamily="monospace">
                {'{'}
              </text>
              <text x="355" y="68" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;name&quot;: &quot;Bob&quot;,
              </text>
              <text x="355" y="84" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;dept&quot;: &quot;Marketing&quot;,
              </text>
              <text x="355" y="100" fill="#1E40AF" fontSize="10" fontFamily="monospace">
                &quot;phone&quot;: &quot;555-1234&quot;
              </text>
              <text x="340" y="120" fill="#374151" fontSize="10" fontFamily="monospace">
                {'}'}
              </text>
              <text
                x="440"
                y="160"
                textAnchor="middle"
                fill="#6B7280"
                fontSize="9"
                fontStyle="italic"
              >
                ← Different fields OK!
              </text>
            </g>
          )}
          {selected === 'keyvalue' && (
            <g>
              {[
                { key: 'user:1001', val: '{"name":"Alice","cart":[...]}', y: 20 },
                { key: 'session:abc', val: '{"token":"jwt...","exp":1720000}', y: 65 },
                { key: 'cache:home', val: '<html>...rendered page...</html>', y: 110 },
                { key: 'counter:views', val: '1847293', y: 155 },
              ].map((item, i) => (
                <g key={i}>
                  <rect
                    x="50"
                    y={item.y}
                    width="140"
                    height="32"
                    rx="4"
                    fill="#F3E8FF"
                    stroke="#C084FC"
                    strokeWidth="1.5"
                  />
                  <text
                    x="120"
                    y={item.y + 20}
                    textAnchor="middle"
                    fill="#6B21A8"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {item.key}
                  </text>
                  <text x="210" y={item.y + 20} fill="#9CA3AF" fontSize="14">
                    →
                  </text>
                  <rect
                    x="230"
                    y={item.y}
                    width="320"
                    height="32"
                    rx="4"
                    fill="#FAF5FF"
                    stroke="#E9D5FF"
                    strokeWidth="1"
                  />
                  <text x="240" y={item.y + 20} fill="#374151" fontSize="9" fontFamily="monospace">
                    {item.val}
                  </text>
                </g>
              ))}
            </g>
          )}
          {selected === 'graph' && (
            <g>
              {/* Nodes */}
              <circle cx="150" cy="60" r="28" fill="#FFF7ED" stroke="#FB923C" strokeWidth="2" />
              <text
                x="150"
                y="57"
                textAnchor="middle"
                fill="#9A3412"
                fontSize="10"
                fontWeight="bold"
              >
                Alice
              </text>
              <text x="150" y="69" textAnchor="middle" fill="#9A3412" fontSize="8">
                :Person
              </text>

              <circle cx="400" cy="60" r="28" fill="#FFF7ED" stroke="#FB923C" strokeWidth="2" />
              <text
                x="400"
                y="57"
                textAnchor="middle"
                fill="#9A3412"
                fontSize="10"
                fontWeight="bold"
              >
                Bob
              </text>
              <text x="400" y="69" textAnchor="middle" fill="#9A3412" fontSize="8">
                :Person
              </text>

              <circle cx="275" cy="150" r="28" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="2" />
              <text
                x="275"
                y="147"
                textAnchor="middle"
                fill="#1E40AF"
                fontSize="10"
                fontWeight="bold"
              >
                React
              </text>
              <text x="275" y="159" textAnchor="middle" fill="#1E40AF" fontSize="8">
                :Skill
              </text>

              {/* Edges */}
              <line
                x1="178"
                y1="60"
                x2="372"
                y2="60"
                stroke="#F97316"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text x="275" y="52" textAnchor="middle" fill="#EA580C" fontSize="9" fontWeight="500">
                FRIENDS_WITH
              </text>

              <line
                x1="158"
                y1="86"
                x2="252"
                y2="130"
                stroke="#60A5FA"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text
                x="190"
                y="115"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="9"
                fontWeight="500"
              >
                KNOWS
              </text>

              <line
                x1="392"
                y1="86"
                x2="298"
                y2="130"
                stroke="#60A5FA"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text
                x="360"
                y="115"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="9"
                fontWeight="500"
              >
                KNOWS
              </text>

              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
                </marker>
              </defs>
            </g>
          )}
          {selected === 'widecolumn' && (
            <g>
              <text
                x="300"
                y="18"
                textAnchor="middle"
                fill="#0F766E"
                fontSize="11"
                fontWeight="bold"
              >
                Column Family: user_activity
              </text>
              {/* Row 1 */}
              <rect
                x="30"
                y="30"
                width="80"
                height="70"
                rx="4"
                fill="#CCFBF1"
                stroke="#5EEAD4"
                strokeWidth="1.5"
              />
              <text x="70" y="50" textAnchor="middle" fill="#0F766E" fontSize="9" fontWeight="bold">
                Row Key
              </text>
              <text x="70" y="68" textAnchor="middle" fill="#134E4A" fontSize="9">
                user:1001
              </text>
              <text x="70" y="88" textAnchor="middle" fill="#134E4A" fontSize="9">
                user:1002
              </text>

              {['login_ts', 'page_view', 'click_target', 'duration_ms', 'device'].map((col, i) => (
                <g key={col}>
                  <rect
                    x={130 + i * 90}
                    y="30"
                    width="80"
                    height="70"
                    rx="4"
                    fill={i < 3 ? '#F0FDFA' : '#F8FAFC'}
                    stroke={i < 3 ? '#99F6E4' : '#E2E8F0'}
                    strokeWidth="1"
                  />
                  <text
                    x={170 + i * 90}
                    y="50"
                    textAnchor="middle"
                    fill="#0F766E"
                    fontSize="8"
                    fontWeight="600"
                  >
                    {col}
                  </text>
                  <text x={170 + i * 90} y="68" textAnchor="middle" fill="#374151" fontSize="8">
                    {i < 3 ? '✓' : i === 3 ? '✓' : ''}
                  </text>
                  <text x={170 + i * 90} y="88" textAnchor="middle" fill="#374151" fontSize="8">
                    {i < 2 ? '✓' : ''}
                  </text>
                </g>
              ))}

              <text
                x="300"
                y="125"
                textAnchor="middle"
                fill="#6B7280"
                fontSize="10"
                fontStyle="italic"
              >
                Each row can have different columns → sparse storage
              </text>
              <text x="300" y="145" textAnchor="middle" fill="#6B7280" fontSize="9">
                Columns grouped into Column Families stored together on disk
              </text>
              <text x="300" y="165" textAnchor="middle" fill="#6B7280" fontSize="9">
                Rows sorted by Row Key for efficient range scans (time-series)
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default SQLvsNoSQL2D;
