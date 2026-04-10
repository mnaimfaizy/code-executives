import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import {
  GitCompare,
  Database,
  FileJson,
  Network,
  Key,
  Columns,
  Compass,
  Scale,
  Zap,
  Search,
  Brain,
  BarChart3,
} from 'lucide-react';
import SQLvsNoSQL2D from '../visualizations/2d/SQLvsNoSQL2D';
import VectorDatabase2D from '../visualizations/2d/VectorDatabase2D';

const SQLvsNoSQLvsVector: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <GitCompare className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">SQL vs NoSQL vs Vector Databases</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        The database landscape has exploded beyond relational tables. Document stores, graph
        databases, key-value caches, wide-column stores, and vector databases each solve
        fundamentally different problems. Understanding <em>when</em> to choose which paradigm is
        now a core engineering skill.
      </p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <Database className="w-8 h-8 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-blue-700">SQL / Relational</p>
          <p className="text-xs text-blue-600">Structured data + ACID</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <FileJson className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-emerald-700">NoSQL</p>
          <p className="text-xs text-emerald-600">Flexible schemas + scale</p>
        </div>
        <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
          <Brain className="w-8 h-8 text-violet-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-violet-700">Vector</p>
          <p className="text-xs text-violet-600">Similarity search + AI</p>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Database Type Explorer */}
      <ThemeCard>
        <SQLvsNoSQL2D />
      </ThemeCard>

      {/* SQL / Relational Deep Dive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Database className="w-6 h-6 text-blue-600" />
          <span>SQL / Relational Databases</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Born from E.F. Codd&apos;s 1970 relational model, SQL databases organize data into{' '}
          <strong>tables</strong> with predefined schemas, enforced constraints, and powerful
          declarative query capabilities. They remain the foundation of most business-critical
          systems.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-2">Core Strengths</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>✅ ACID transactions (atomicity, consistency, isolation, durability)</li>
              <li>✅ Complex JOIN operations across normalized tables</li>
              <li>✅ Declarative SQL — optimizer finds the best execution plan</li>
              <li>✅ Schema enforcement prevents data corruption</li>
              <li>✅ Mature ecosystem: 50+ years of optimization, tooling, expertise</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-2">Trade-offs</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>⚠️ Rigid schema — ALTER TABLE can be expensive on large tables</li>
              <li>⚠️ Vertical scaling limit — single-node write bottleneck</li>
              <li>⚠️ Object-relational impedance mismatch (ORM complexity)</li>
              <li>⚠️ Horizontal sharding requires application-level logic</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-2">Major Players</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                <strong>PostgreSQL</strong> — extensible, JSONB, GIS, 170/177 SQL:2023 features
              </li>
              <li>
                <strong>Oracle</strong> — enterprise RAC, In-Memory, Exadata
              </li>
              <li>
                <strong>MySQL</strong> — web scale, InnoDB, ubiquitous hosting
              </li>
              <li>
                <strong>SQL Server</strong> — .NET ecosystem, columnstore indexes
              </li>
              <li>
                <strong>SQLite</strong> — embedded, serverless, 1 trillion+ deployments
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* NoSQL Categories */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <FileJson className="w-6 h-6 text-emerald-600" />
          <span>NoSQL Database Categories</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          &ldquo;NoSQL&rdquo; (Not Only SQL) emerged from the need to handle massive write volumes,
          flexible schemas, and horizontal scaling that traditional RDBMS struggled with. The term
          covers <strong>four distinct families</strong>, each with different data models:
        </p>

        <div className="space-y-4">
          {/* Document */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-3">
              <FileJson className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-emerald-800">Document Stores</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  Store data as <strong>JSON/BSON documents</strong> — self-describing, schema-free
                  objects that can be nested arbitrarily deep. Each document can have different
                  fields.
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Examples:</strong> MongoDB (~35% market share of NoSQL), CouchDB, Amazon
                  DocumentDB, Firestore, Couchbase
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="text-gray-500">// MongoDB document</div>
                <div className="text-emerald-700">{'{'}</div>
                <div className="text-emerald-700 ml-2">
                  &quot;_id&quot;: ObjectId(&quot;...&quot;),
                </div>
                <div className="text-emerald-700 ml-2">&quot;name&quot;: &quot;Alice&quot;,</div>
                <div className="text-emerald-700 ml-2">
                  &quot;skills&quot;: [&quot;React&quot;, &quot;TS&quot;],
                </div>
                <div className="text-emerald-700 ml-2">
                  &quot;address&quot;: {'{'} &quot;city&quot;: &quot;SF&quot; {'}'}
                </div>
                <div className="text-emerald-700">{'}'}</div>
              </div>
            </div>
          </div>

          {/* Key-Value */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center space-x-2 mb-3">
              <Key className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-800">Key-Value Stores</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  The simplest NoSQL model: a <strong>hash map at scale</strong>. Every entry is a
                  key-value pair. The database treats the value as an opaque blob — no schema, no
                  querying inside values.
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Examples:</strong> Redis (6M+ instances), Amazon DynamoDB, Memcached,
                  etcd, Riak
                </p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Performance characteristics:</p>
                <ul className="text-xs space-y-1">
                  <li>
                    • <strong>Redis:</strong> ~100K ops/sec single-thread; sub-millisecond latency
                  </li>
                  <li>
                    • <strong>DynamoDB:</strong> single-digit ms consistency with auto-scaling
                  </li>
                  <li>• Ideal for caching (TTL expiry), session stores, rate limiting</li>
                  <li>• No joins, no aggregations — pure key-based access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <div className="flex items-center space-x-2 mb-3">
              <Network className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-orange-800">Graph Databases</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  Model data as <strong>nodes, edges, and properties</strong>. Use{' '}
                  <strong>index-free adjacency</strong> — each node directly references its
                  neighbors, making traversals O(1) per hop regardless of total graph size.
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Examples:</strong> Neo4j (#1 graph DB), Amazon Neptune, JanusGraph,
                  ArangoDB, TigerGraph
                </p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Power of graph queries:</p>
                <div className="bg-white rounded p-2 font-mono text-xs">
                  <div className="text-orange-700">// Cypher: Find friends-of-friends</div>
                  <div className="text-gray-700">MATCH (a:Person)-[:FRIENDS]-&gt;</div>
                  <div className="text-gray-700 ml-6">(b:Person)-[:FRIENDS]-&gt;(c:Person)</div>
                  <div className="text-gray-700">WHERE a.name = &apos;Alice&apos;</div>
                  <div className="text-gray-700">RETURN c.name</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This 2-hop traversal in SQL would require 2 self-joins — exponentially slower as
                  depth increases.
                </p>
              </div>
            </div>
          </div>

          {/* Wide-Column */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <div className="flex items-center space-x-2 mb-3">
              <Columns className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-teal-800">Wide-Column Stores</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  Inspired by Google&apos;s Bigtable paper (2006). Data organized into{' '}
                  <strong>row keys → column families → columns</strong>. Each row can have different
                  columns (sparse). Designed for <strong>petabyte-scale write throughput</strong>.
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Examples:</strong> Apache Cassandra, HBase, ScyllaDB, Google Cloud
                  Bigtable
                </p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Scale numbers (Cassandra):</p>
                <ul className="text-xs space-y-1">
                  <li>• Apple: 75,000 Cassandra nodes, 10 PB+ data</li>
                  <li>• Netflix: thousands of nodes for personalization</li>
                  <li>• Linear write scaling: add nodes = add throughput</li>
                  <li>• Tunable consistency: ONE → QUORUM → ALL per query</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* CAP Theorem */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Scale className="w-6 h-6 text-teal-600" />
          <span>CAP Theorem &amp; Consistency Models</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In a distributed system, you can only guarantee <strong>two out of three</strong>:
          Consistency, Availability, and Partition tolerance. Since network partitions are
          inevitable, the real choice is between <strong>CP</strong> (consistency over availability)
          and <strong>AP</strong> (availability over consistency).
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
            <h4 className="font-bold text-blue-800 mb-2">CP Systems</h4>
            <p className="text-xs text-gray-700 mb-2">
              Sacrifice availability during partitions to maintain consistency.
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {['PostgreSQL', 'MongoDB', 'HBase', 'Redis Cluster', 'etcd'].map((db) => (
                <span
                  key={db}
                  className="bg-white px-2 py-0.5 rounded text-xs border border-blue-200"
                >
                  {db}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
            <h4 className="font-bold text-emerald-800 mb-2">AP Systems</h4>
            <p className="text-xs text-gray-700 mb-2">
              Sacrifice consistency during partitions to remain available.
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {['Cassandra', 'DynamoDB', 'CouchDB', 'Riak', 'Voldemort'].map((db) => (
                <span
                  key={db}
                  className="bg-white px-2 py-0.5 rounded text-xs border border-emerald-200"
                >
                  {db}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
            <h4 className="font-bold text-amber-800 mb-2">Tunable</h4>
            <p className="text-xs text-gray-700 mb-2">
              Let you choose consistency level per operation.
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {['Cassandra (CL)', 'DynamoDB', 'Cosmos DB', 'YugabyteDB'].map((db) => (
                <span
                  key={db}
                  className="bg-white px-2 py-0.5 rounded text-xs border border-amber-200"
                >
                  {db}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Vector Databases */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-violet-600" />
          <span>Vector Databases — The AI Era</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Vector databases store and efficiently search{' '}
          <strong>high-dimensional embedding vectors</strong> (typically 256–2048 dimensions)
          produced by AI models. Instead of exact matching (WHERE name = &apos;Alice&apos;), they
          find the <strong>most similar</strong> items using distance metrics like cosine
          similarity, Euclidean distance, or dot product.
        </p>

        {/* Interactive Vector Visualization */}
        <VectorDatabase2D />
      </ThemeCard>

      {/* Vector DB Architecture */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Compass className="w-6 h-6 text-violet-600" />
          <span>Vector Database Architecture</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="font-bold text-gray-800 mb-3">ANN Search Algorithms</h3>
            <div className="space-y-3">
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="font-semibold text-violet-800 text-sm">
                  HNSW (Hierarchical Navigable Small World)
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Multi-layer graph structure. Top layers have few nodes with long-range links (for
                  fast navigation); bottom layers have all nodes with short-range links (for
                  precision). <strong>O(log N)</strong> query time. Memory-intensive but highest
                  recall/speed trade-off. Used by: Pinecone, pgvector, Qdrant, Weaviate.
                </p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="font-semibold text-violet-800 text-sm">IVF (Inverted File Index)</p>
                <p className="text-xs text-gray-700 mt-1">
                  K-means clustering of vectors into partitions (Voronoi cells). At query time,
                  search only the nearest <em>nprobe</em> partitions instead of all vectors.
                  <strong> O(N/k)</strong> per query. Used by: FAISS, Milvus.
                </p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="font-semibold text-violet-800 text-sm">Product Quantization (PQ)</p>
                <p className="text-xs text-gray-700 mt-1">
                  Compresses vectors by splitting them into sub-vectors and quantizing each to a
                  codebook entry. Reduces memory 10–100× with ~5% recall loss. Often combined with
                  IVF as IVF-PQ — the workhorse of billion-scale systems.
                </p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                <p className="font-semibold text-violet-800 text-sm">
                  LSH (Locality-Sensitive Hashing)
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Random projections that hash similar vectors into the same bucket with high
                  probability. Sub-linear query time. Loss of accuracy for high-dimensional data.
                  Used for deduplication and near-duplicate detection.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Similarity Measures</h3>
            <div className="space-y-3 mb-6">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">Cosine Similarity</p>
                <p className="text-xs text-gray-700">
                  Measures the angle between vectors (direction, not magnitude). Range: [-1, 1].
                  Most popular for text embeddings.{' '}
                  <code className="bg-gray-100 px-1 rounded">cos(A, B) = A·B / (|A|×|B|)</code>
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">Euclidean Distance (L2)</p>
                <p className="text-xs text-gray-700">
                  Straight-line distance in vector space. Sensitive to magnitude. Best for image
                  embeddings where scale matters.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">Dot Product (Inner Product)</p>
                <p className="text-xs text-gray-700">
                  Measures both direction and magnitude. Efficient to compute. Used when vectors are
                  normalized (equivalent to cosine similarity on unit vectors).
                </p>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-3">Major Vector Databases</h3>
            <div className="space-y-2">
              {[
                {
                  name: 'Pinecone',
                  desc: 'Fully managed serverless; auto-scales; metadata filtering',
                },
                { name: 'pgvector', desc: 'PostgreSQL extension — vector search + SQL in one DB' },
                { name: 'Weaviate', desc: 'Open-source; built-in ML models for auto-embedding' },
                { name: 'Qdrant', desc: 'Rust-based; high performance; rich filtering' },
                { name: 'Milvus', desc: 'Open-source; FAISS/HNSW; billion-scale; GPU support' },
                { name: 'Chroma', desc: 'Lightweight; designed for LLM app prototyping' },
              ].map((db) => (
                <div
                  key={db.name}
                  className="bg-violet-50 rounded-lg px-3 py-2 border border-violet-100"
                >
                  <p className="text-xs">
                    <strong className="text-violet-800">{db.name}</strong>
                    <span className="text-gray-600"> — {db.desc}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* RAG Architecture */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Search className="w-6 h-6 text-violet-600" />
          <span>RAG: Vector DBs + LLMs</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          <strong>Retrieval-Augmented Generation (RAG)</strong> is the primary use case driving
          vector database adoption. Instead of fine-tuning an LLM on your data, you store your
          documents as embeddings and retrieve relevant context at query time:
        </p>

        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-5 border border-violet-200">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center">
            {[
              { step: '1', label: 'User Query', desc: '"How does MVCC work?"', color: 'violet' },
              { step: '2', label: 'Embed Query', desc: 'text → 1536-dim vector', color: 'blue' },
              { step: '3', label: 'Vector Search', desc: 'k-NN in vector DB', color: 'teal' },
              {
                step: '4',
                label: 'Retrieve Docs',
                desc: 'Top-K relevant chunks',
                color: 'emerald',
              },
              {
                step: '5',
                label: 'LLM + Context',
                desc: 'Generate grounded answer',
                color: 'amber',
              },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-400 text-xl hidden md:block">→</span>}
                <div
                  className={`bg-${s.color}-100 rounded-lg p-3 border border-${s.color}-200 flex-1 min-w-0`}
                >
                  <div className={`text-${s.color}-700 font-bold text-xs mb-1`}>Step {s.step}</div>
                  <div className="text-sm font-semibold text-gray-800">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.desc}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* Comprehensive Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          <span>Head-to-Head Comparison</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-teal-50">
              <tr>
                <th className="border border-teal-200 px-3 py-2 text-left text-teal-800">
                  Feature
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-blue-700">
                  SQL (RDBMS)
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-emerald-700">
                  Document
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-purple-700">
                  Key-Value
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-orange-700">
                  Graph
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-teal-700">
                  Wide-Column
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-violet-700">
                  Vector
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                [
                  'Data Model',
                  'Tables (rows/cols)',
                  'JSON documents',
                  'Key→Value',
                  'Nodes + Edges',
                  'Sparse columns',
                  'High-dim vectors',
                ],
                [
                  'Schema',
                  'Strict (enforced)',
                  'Flexible',
                  'Schema-free',
                  'Flexible',
                  'Column families',
                  'Fixed dimensions',
                ],
                [
                  'Query Language',
                  'SQL',
                  'MQL / N1QL',
                  'GET/SET API',
                  'Cypher/Gremlin',
                  'CQL',
                  'ANN + filters',
                ],
                [
                  'Primary Op',
                  'Complex JOIN',
                  'Doc CRUD',
                  'Key lookup',
                  'Traversal',
                  'Range scan',
                  'Similarity search',
                ],
                [
                  'Consistency',
                  'Strong (ACID)',
                  'Tunable',
                  'Eventual',
                  'Strong',
                  'Tunable',
                  'Eventual',
                ],
                [
                  'Scaling',
                  'Vertical + replicas',
                  'Horizontal',
                  'Horizontal',
                  'Vertical++',
                  'Massive horizontal',
                  'Horizontal',
                ],
                ['Latency', '1–100ms', '1–10ms', '<1ms', '1–50ms', '1–10ms', '5–100ms'],
                [
                  'Best Workload',
                  'OLTP / OLAP',
                  'Content mgmt',
                  'Caching',
                  'Relationships',
                  'Time-series/IoT',
                  'AI/ML search',
                ],
              ].map(([feature, ...values], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-3 py-2 font-medium">{feature}</td>
                  {values.map((val, vi) => (
                    <td key={vi} className="border border-gray-200 px-3 py-1.5 text-center">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Decision Framework */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-teal-600" />
          <span>Decision Framework</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Most production systems use <strong>polyglot persistence</strong> — multiple databases for
          different needs. Here&apos;s how to choose:
        </p>

        <div className="space-y-3">
          {[
            {
              question: 'Need ACID transactions with complex joins?',
              answer: 'SQL (PostgreSQL, Oracle, MySQL)',
              color: 'blue',
            },
            {
              question: 'Flexible schemas with nested objects & rapid iteration?',
              answer: 'Document Store (MongoDB, Firestore)',
              color: 'emerald',
            },
            {
              question: 'Sub-millisecond key lookups at massive scale?',
              answer: 'Key-Value (Redis, DynamoDB)',
              color: 'purple',
            },
            {
              question: 'Relationship traversals (friends-of-friends, recommendations)?',
              answer: 'Graph DB (Neo4j, Neptune)',
              color: 'orange',
            },
            {
              question: 'Massive write throughput for time-series or events?',
              answer: 'Wide-Column (Cassandra, ScyllaDB)',
              color: 'teal',
            },
            {
              question: 'Semantic search, RAG, or AI-powered recommendations?',
              answer: 'Vector DB (Pinecone, pgvector, Weaviate)',
              color: 'violet',
            },
            {
              question: 'Need SQL + vector search in one database?',
              answer: 'PostgreSQL + pgvector (converged approach)',
              color: 'indigo',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-${item.color}-50 rounded-lg p-4 border border-${item.color}-200 flex items-start space-x-3`}
            >
              <span className={`text-${item.color}-600 font-bold text-lg leading-none`}>?</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.question}</p>
                <p className={`text-xs text-${item.color}-700 font-semibold mt-1`}>
                  → {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Related Sections</h3>
      <div className="space-y-2">
        <NavigationCard
          title="Database Models"
          description="Relational, hierarchical, network, object models"
          colorScheme="teal"
          onClick={() => navigateToSection('Database Models')}
        />
        <NavigationCard
          title="Oracle vs PostgreSQL"
          description="Deep dive into two RDBMS giants"
          colorScheme="teal"
          onClick={() => navigateToSection('Oracle vs PostgreSQL')}
        />
        <NavigationCard
          title="Indexing & Optimization"
          description="B-Trees, hash indexes, query tuning"
          colorScheme="teal"
          onClick={() => navigateToSection('Indexing & Optimization')}
        />
        <NavigationCard
          title="Transactions & ACID"
          description="Consistency guarantees across systems"
          colorScheme="teal"
          onClick={() => navigateToSection('Transactions & ACID')}
        />
      </div>
    </ThemeCard>
  );

  return (
    <>
      <SectionLayout
        section="database"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore Interactive Visualizations"
        description="See these database paradigms come alive with animated models and interactive comparisons."
        buttonText="Visualization Hub"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Visualization')}
      />
    </>
  );
};

export default SQLvsNoSQLvsVector;
