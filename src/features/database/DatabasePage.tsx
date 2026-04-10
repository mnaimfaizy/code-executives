import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { LoadingFallback } from '../../shared/components/feedback/LoadingFallback';
import { SEO } from '../../shared/components/SEO/SEO';
import ModuleQuizSection from '../../shared/components/quiz/ModuleQuizSection';

// Lazy load section components for better performance
import Introduction from './components/sections/Introduction';
const DatabaseModels = React.lazy(() => import('./components/sections/DatabaseModels'));
const DBMSArchitecture = React.lazy(() => import('./components/sections/DBMSArchitecture'));
const QueryProcessor = React.lazy(() => import('./components/sections/QueryProcessor'));
const StorageEngine = React.lazy(() => import('./components/sections/StorageEngine'));
const SQLFundamentals = React.lazy(() => import('./components/sections/SQLFundamentals'));
const IndexingOptimization = React.lazy(() => import('./components/sections/IndexingOptimization'));
const TransactionsACID = React.lazy(() => import('./components/sections/TransactionsACID'));
const OracleVsPostgreSQL = React.lazy(() => import('./components/sections/OracleVsPostgreSQL'));
const SQLvsNoSQLvsVector = React.lazy(() => import('./components/sections/SQLvsNoSQLvsVector'));
const Visualization = React.lazy(() => import('./components/sections/Visualization'));
const Quiz = () => <ModuleQuizSection moduleId="database" />;

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Database Models': DatabaseModels,
  'DBMS Architecture': DBMSArchitecture,
  'Query Processor': QueryProcessor,
  'Storage Engine': StorageEngine,
  'SQL Fundamentals': SQLFundamentals,
  'Indexing & Optimization': IndexingOptimization,
  'Transactions & ACID': TransactionsACID,
  'Oracle vs PostgreSQL': OracleVsPostgreSQL,
  'SQL vs NoSQL vs Vector': SQLvsNoSQLvsVector,
  Visualization,
  Quiz,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const DatabasePage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <>
      <SEO
        title="Database & DBMS - Code Executives"
        description="Master database internals, DBMS architecture, SQL optimization, B-Tree indexing, ACID transactions, and the comparative engines of Oracle vs PostgreSQL through interactive visualizations."
        keywords={[
          'database',
          'DBMS',
          'SQL',
          'NoSQL',
          'B-Tree',
          'indexing',
          'ACID',
          'transactions',
          'MVCC',
          'PostgreSQL',
          'Oracle',
          'query optimization',
        ]}
        canonicalUrl="https://code-executives.com/database"
      />
      <div className="p-4 sm:p-6">
        <ErrorBoundary level="feature">
          <Suspense fallback={<LoadingFallback variant="skeleton-page" />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default DatabasePage;
