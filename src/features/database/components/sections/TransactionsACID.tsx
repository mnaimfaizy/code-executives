import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { Shield, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import TransactionACID2D from '../visualizations/2d/TransactionACID2D';

const TransactionsACID: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <Shield className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Transactions & ACID Properties</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        A transaction is a combination of read/write operations that the DBMS treats as a single
        atomic unit. ACID properties provide strict engineering guarantees to prevent data loss,
        corruption, and inconsistency — even when thousands of users modify data simultaneously.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* ACID Properties */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Four ACID Guarantees</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-lg">A</span>
              </div>
              <h3 className="text-lg font-bold text-blue-800">Atomicity</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>All or Nothing.</strong> Either every operation in the transaction completes
              successfully, or none of them take effect. If a bank transfer debits $100 from Account
              A but crashes before crediting Account B, the entire transaction rolls back.
            </p>
            <div className="bg-white/80 rounded-lg p-2 text-xs font-mono text-blue-700">
              BEGIN → Debit A (-$100) → Credit B (+$100) → COMMIT ✓
              <br />
              BEGIN → Debit A (-$100) → ⚡ CRASH → ROLLBACK (A restored)
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center">
                <span className="text-teal-700 font-bold text-lg">C</span>
              </div>
              <h3 className="text-lg font-bold text-teal-800">Consistency</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Rules Always Hold.</strong> The database moves from one valid state to
              another. All constraints (primary keys, foreign keys, check constraints) are satisfied
              before and after every transaction.
            </p>
            <div className="bg-white/80 rounded-lg p-2 text-xs font-mono text-teal-700">
              Before: Total balance = $1000
              <br />
              Transfer $100: A=$400, B=$600
              <br />
              After: Total balance = $1000 ✓
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold text-lg">I</span>
              </div>
              <h3 className="text-lg font-bold text-purple-800">Isolation</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Transactions Don&apos;t Interfere.</strong> Concurrent transactions execute as
              if they were the only one running. The isolation level (Read Committed, Repeatable
              Read, Serializable) determines how strictly this is enforced.
            </p>
            <div className="bg-white/80 rounded-lg p-2 text-xs font-mono text-purple-700">
              Tx1: reads balance=$500
              <br />
              Tx2: updates balance=$400 (hidden from Tx1)
              <br />
              Tx1: still sees $500 until it commits
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">D</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-800">Durability</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Committed = Permanent.</strong> Once a transaction commits, the changes
              survive any subsequent failure — power outage, disk crash, or kernel panic. The
              Write-Ahead Log (WAL) guarantees this.
            </p>
            <div className="bg-white/80 rounded-lg p-2 text-xs font-mono text-emerald-700">
              COMMIT → WAL persisted to disk
              <br />
              ⚡ Power failure
              <br />
              Restart → Replay WAL → Data intact ✓
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Transaction Demo */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive: Concurrent Transactions
        </h2>
        <p className="text-gray-600 mb-4">
          Watch two transactions run concurrently. See how isolation prevents dirty reads and how
          atomicity handles crashes. Click the buttons to step through the scenario.
        </p>
        <TransactionACID2D />
      </ThemeCard>

      {/* MVCC */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Multi-Version Concurrency Control (MVCC)
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          MVCC is the key technology that allows <strong>readers to never block writers</strong> and
          vice versa. Instead of locking rows, the database keeps multiple versions of each row,
          allowing different transactions to see different snapshots.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Oracle: Undo/Redo Model</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Old row version moved to separate UNDO tablespace</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>New version written in-place in the data table</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Long queries reconstruct past state from UNDO</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Powers Oracle &quot;Flashback&quot; time-travel queries</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3 flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>PostgreSQL: Inline Versioning</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Old and new versions stored inline in the same table</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Old tuple marked as &quot;expired&quot; (dead tuple)</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>No separate UNDO storage needed</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Autovacuum continuously cleans dead tuples to reclaim space</span>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Related Sections</h3>
      <div className="space-y-2">
        <NavigationCard
          title="Oracle vs PostgreSQL"
          description="Full engine comparison"
          colorScheme="teal"
          onClick={() => navigateToSection('Oracle vs PostgreSQL')}
        />
        <NavigationCard
          title="Storage Engine"
          description="WAL, Buffer Manager, Lock Manager"
          colorScheme="teal"
          onClick={() => navigateToSection('Storage Engine')}
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
        title="Compare the Two Giants"
        description="See how Oracle and PostgreSQL implement these concepts differently — from SGA vs shared buffers to Undo/Redo vs dead tuples."
        buttonText="Oracle vs PostgreSQL"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Oracle vs PostgreSQL')}
      />
    </>
  );
};

export default TransactionsACID;
