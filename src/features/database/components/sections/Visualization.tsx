import React, { Suspense, useState } from 'react';
import CTASection from '../../../../components/shared/CTASection';
import {
  Eye,
  Network,
  Search,
  HardDrive,
  RefreshCw,
  GitCompare,
  Layers,
  PenTool,
  FileJson,
  Brain,
} from 'lucide-react';

const DatabaseTaxonomy2D = React.lazy(() => import('../visualizations/2d/DatabaseTaxonomy2D'));
const QueryProcessor2D = React.lazy(() => import('../visualizations/2d/QueryProcessor2D'));
const BTreeIndex2D = React.lazy(() => import('../visualizations/2d/BTreeIndex2D'));
const BufferManager2D = React.lazy(() => import('../visualizations/2d/BufferManager2D'));
const TransactionACID2D = React.lazy(() => import('../visualizations/2d/TransactionACID2D'));
const MVCCComparison2D = React.lazy(() => import('../visualizations/2d/MVCCComparison2D'));
const ERDiagramBuilder2D = React.lazy(() => import('../visualizations/2d/ERDiagramBuilder2D'));
const SQLvsNoSQL2D = React.lazy(() => import('../visualizations/2d/SQLvsNoSQL2D'));
const VectorDatabase2D = React.lazy(() => import('../visualizations/2d/VectorDatabase2D'));

const vizTabs = [
  { key: 'taxonomy', label: 'Database Taxonomy', icon: Network },
  { key: 'query', label: 'Query Lifecycle', icon: Search },
  { key: 'btree', label: 'B-Tree Index', icon: Layers },
  { key: 'buffer', label: 'Buffer Manager', icon: HardDrive },
  { key: 'acid', label: 'ACID Transactions', icon: RefreshCw },
  { key: 'mvcc', label: 'MVCC Comparison', icon: GitCompare },
  { key: 'erd', label: 'ER Diagram Builder', icon: PenTool },
  { key: 'sqlnosql', label: 'SQL vs NoSQL', icon: FileJson },
  { key: 'vector', label: 'Vector Search', icon: Brain },
] as const;

type VizTab = (typeof vizTabs)[number]['key'];

const fallback = (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
  </div>
);

const Visualization: React.FC = () => {
  const [active, setActive] = useState<VizTab>('taxonomy');

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 rounded-2xl p-8 border border-teal-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-8 h-8 text-teal-600" />
          <h1 className="text-4xl font-bold text-gray-900">Interactive Visualizations</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          Database internals are notoriously abstract — invisible data pages, lock queues, and query
          plans. These 9 interactive visualizations make the invisible visible. Choose a topic below
          and explore at your own pace.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {vizTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                active === tab.key
                  ? 'bg-teal-700 text-white border-transparent shadow-lg scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:shadow-md'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Visualization */}
      <Suspense fallback={fallback}>
        {active === 'taxonomy' && <DatabaseTaxonomy2D />}
        {active === 'query' && <QueryProcessor2D />}
        {active === 'btree' && <BTreeIndex2D />}
        {active === 'buffer' && <BufferManager2D />}
        {active === 'acid' && <TransactionACID2D />}
        {active === 'mvcc' && <MVCCComparison2D />}
        {active === 'erd' && <ERDiagramBuilder2D />}
        {active === 'sqlnosql' && <SQLvsNoSQL2D />}
        {active === 'vector' && <VectorDatabase2D />}
      </Suspense>

      {/* CTA */}
      <CTASection
        title="Start Your Database Journey"
        description="Begin with the Introduction to understand the big picture, then dive into any section that interests you."
        buttonText="Start from the Beginning"
        onButtonClick={() => {
          window.location.href = '/database?section=Introduction';
        }}
        colorScheme="teal"
      />
    </div>
  );
};

export default Visualization;
