import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { Database, Server, Cpu, Brain, Search, Layers } from 'lucide-react';
import DatabaseTaxonomy2D from '../visualizations/2d/DatabaseTaxonomy2D';

interface DatabaseModel {
  name: string;
  type: string;
  structure: string;
  useCase: string;
  scaling: string;
  examples: string;
  color: string;
  icon: React.ReactNode;
}

const models: DatabaseModel[] = [
  {
    name: 'Relational (SQL)',
    type: 'Structured',
    structure:
      'Tables with predefined schemas, rows and columns, strict relationships via foreign keys',
    useCase: 'Financial systems, inventory, transactions requiring strict ACID compliance',
    scaling: 'Vertical scaling (adding power to a single server)',
    examples: 'PostgreSQL, Oracle, MySQL, SQL Server',
    color: 'blue',
    icon: <Database className="w-6 h-6 text-blue-600" />,
  },
  {
    name: 'Document (NoSQL)',
    type: 'Semi-structured',
    structure: 'JSON/BSON objects with flexible, schema-less design',
    useCase: 'Content-heavy apps, e-commerce catalogs, rapid prototyping',
    scaling: 'Horizontal scaling (distributing across cluster nodes)',
    examples: 'MongoDB, CouchDB, Firestore',
    color: 'orange',
    icon: <Server className="w-6 h-6 text-orange-600" />,
  },
  {
    name: 'Key-Value (NoSQL)',
    type: 'Simple pairs',
    structure: 'Unique identifiers (keys) paired with arbitrary values',
    useCase: 'High-speed caching, session management, real-time processing',
    scaling: 'Horizontal scaling across distributed systems',
    examples: 'Redis, Amazon DynamoDB, Memcached',
    color: 'green',
    icon: <Cpu className="w-6 h-6 text-green-600" />,
  },
  {
    name: 'Graph (NoSQL)',
    type: 'Nodes & Edges',
    structure: 'Nodes (entities) connected by edges (relationships)',
    useCase: 'Social networks, recommendation engines, fraud detection',
    scaling: 'Horizontal + Vertical hybrid',
    examples: 'Neo4j, Amazon Neptune, ArangoDB',
    color: 'purple',
    icon: <Layers className="w-6 h-6 text-purple-600" />,
  },
  {
    name: 'Vector',
    type: 'High-dimensional arrays',
    structure: 'Mathematical vectors representing semantic meaning',
    useCase: 'AI/ML, semantic search, RAG pipelines, recommendation',
    scaling: 'Horizontal scaling',
    examples: 'Pinecone, Milvus, Weaviate, pgVector',
    color: 'rose',
    icon: <Brain className="w-6 h-6 text-rose-600" />,
  },
];

const DatabaseModels: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<number>(0);

  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <Database className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">The Taxonomy of Database Models</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        As data volumes expanded and applications diversified, the rigid structure of early
        relational databases proved insufficient for every use case. Explore the five major
        paradigms and understand when to choose each one.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Taxonomy Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Paradigm Comparison</h2>
        <p className="text-gray-600 mb-6">
          Click on each database type to explore its architecture and ideal use cases.
        </p>
        <DatabaseTaxonomy2D />
      </ThemeCard>

      {/* Detailed Model Cards */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Models Deep Dive</h2>
        <div className="space-y-6">
          {models.map((model, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer ${
                selectedModel === index
                  ? `border-${model.color}-400 bg-${model.color}-50 shadow-lg`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedModel(index)}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 bg-${model.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  {model.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{model.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Structure
                      </p>
                      <p className="text-gray-700 text-sm">{model.structure}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Best For
                      </p>
                      <p className="text-gray-700 text-sm">{model.useCase}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Scaling
                      </p>
                      <p className="text-gray-700 text-sm">{model.scaling}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Examples
                      </p>
                      <p className="text-gray-700 text-sm font-mono">{model.examples}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* MongoDB Architecture Deep Dive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Deep Dive: MongoDB Architecture</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          MongoDB abandons the relational table in favor of <strong>Collections</strong> containing
          BSON (Binary JSON) documents. Its core strength lies in native distribution mechanisms:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">Replica Sets</h4>
            <p className="text-sm text-gray-700">
              A group of MongoDB servers maintaining the exact same dataset. A Primary node handles
              all writes; Secondary nodes replicate data and handle reads. Automatic failover
              ensures high availability.
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">Sharding</h4>
            <p className="text-sm text-gray-700">
              Horizontal scaling by splitting massive datasets into smaller chunks (shards)
              distributed across multiple servers based on a &quot;Shard Key&quot;.
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">Mongos Router</h4>
            <p className="text-sm text-gray-700">
              Client apps connect to a mongos query router, which consults Config Servers to
              determine which shard holds the requested data, seamlessly routing the query.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Vector Database Section */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Rise of Vector Databases</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In the era of AI, machines need to &quot;understand&quot; data based on{' '}
          <strong>semantic meaning</strong> rather than exact keyword matches. Vector databases
          convert text, images, and audio into high-dimensional numerical vectors, allowing the
          system to find data points that are mathematically &quot;close&quot; to one another.
        </p>
        <div className="bg-gradient-to-r from-rose-50 to-violet-50 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-rose-800 mb-2">How It Works</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Data (text, images) is converted to vectors via embedding models</li>
                <li>Vectors are stored in high-dimensional index structures (HNSW, IVF)</li>
                <li>Queries are embedded the same way and compared via cosine similarity</li>
                <li>The nearest neighbors are returned as semantically similar results</li>
              </ol>
            </div>
            <div>
              <h4 className="font-bold text-violet-800 mb-2">Key Use Cases</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span>Retrieval-Augmented Generation (RAG) for LLMs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span>Semantic search across documents and images</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span>Recommendation engines and personalization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span>Anomaly detection and fraud prevention</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h3>
      <div className="space-y-2">
        <NavigationCard
          title="DBMS Architecture"
          description="Query Processor & Storage Engine"
          colorScheme="teal"
          onClick={() => navigateToSection('DBMS Architecture')}
        />
        <NavigationCard
          title="Indexing & Optimization"
          description="B-Trees, Hash indexes, execution plans"
          colorScheme="teal"
          onClick={() => navigateToSection('Indexing & Optimization')}
        />
        <NavigationCard
          title="Transactions & ACID"
          description="MVCC, WAL, and durability"
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
        title="Dive Into the Engine"
        description="Understand how the DBMS processes your queries — from parsing SQL to executing against the storage engine."
        buttonText="Explore DBMS Architecture"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('DBMS Architecture')}
      />
    </>
  );
};

export default DatabaseModels;
