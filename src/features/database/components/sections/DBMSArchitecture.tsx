import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { Cpu, Database, HardDrive, Lock, RefreshCw, Shield } from 'lucide-react';
import QueryProcessor2D from '../visualizations/2d/QueryProcessor2D';

const DBMSArchitecture: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <Cpu className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Inside the DBMS: Core Architecture</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Most modern DBMS operate on a client-server architecture. The database cluster stores,
        processes, and protects data, while applications send SQL queries over a network. Beneath
        the surface, the DBMS is a highly coordinated assembly of specialized components.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Query Flow Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SQL Query Lifecycle</h2>
        <p className="text-gray-600 mb-4">
          Watch how a SQL query travels through the DBMS — from parsing to optimization to
          execution. Click Play to animate the flow.
        </p>
        <QueryProcessor2D />
      </ThemeCard>

      {/* Two Main Components */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Two Pillars of a DBMS</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Query Processor */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-teal-200 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-xl font-bold text-teal-800">Query Processor</h3>
            </div>
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              The &quot;brain&quot; of the DBMS — translates human-readable SQL into executable
              machine actions.
            </p>
            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3">
                <h4 className="font-semibold text-gray-800 text-sm">1. Parser</h4>
                <p className="text-xs text-gray-600">
                  Checks SQL syntax validity and validates against the database schema
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <h4 className="font-semibold text-gray-800 text-sm">2. Query Optimizer</h4>
                <p className="text-xs text-gray-600">
                  Analyzes multiple execution paths and calculates the most efficient route
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <h4 className="font-semibold text-gray-800 text-sm">3. Execution Engine</h4>
                <p className="text-xs text-gray-600">
                  Takes the optimal plan and executes it step-by-step against storage
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateToSection('Query Processor')}
              className="mt-4 text-sm text-teal-600 font-semibold hover:text-teal-700"
            >
              Deep Dive →
            </button>
          </div>

          {/* Storage Engine */}
          <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-xl p-6 border border-cyan-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-cyan-200 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-cyan-700" />
              </div>
              <h3 className="text-xl font-bold text-cyan-800">Storage Engine</h3>
            </div>
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              The physical workhorse where actual data manipulation occurs on disk and in memory.
            </p>
            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <RefreshCw className="w-3 h-3 text-cyan-600" />
                  <h4 className="font-semibold text-gray-800 text-sm">Buffer Manager</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Caches frequently accessed data pages in RAM, reducing slow disk reads
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Lock className="w-3 h-3 text-cyan-600" />
                  <h4 className="font-semibold text-gray-800 text-sm">Lock Manager</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Applies locks to prevent concurrent writes from corrupting data
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-3 h-3 text-cyan-600" />
                  <h4 className="font-semibold text-gray-800 text-sm">Recovery Manager</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Uses Write-Ahead Log (WAL) to rebuild state after crashes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateToSection('Storage Engine')}
              className="mt-4 text-sm text-cyan-600 font-semibold hover:text-cyan-700"
            >
              Deep Dive →
            </button>
          </div>
        </div>
      </ThemeCard>

      {/* Background Processes Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Background Processes: The Invisible Machinery
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          To maintain database health and ensure durability without blocking active queries, both
          Oracle and PostgreSQL deploy autonomous background processes:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-teal-50">
                <th className="text-left p-3 font-semibold text-teal-800 border-b border-teal-200">
                  Function
                </th>
                <th className="text-left p-3 font-semibold text-teal-800 border-b border-teal-200">
                  Oracle
                </th>
                <th className="text-left p-3 font-semibold text-teal-800 border-b border-teal-200">
                  PostgreSQL
                </th>
                <th className="text-left p-3 font-semibold text-teal-800 border-b border-teal-200">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  fn: 'Disk Writing',
                  oracle: 'DBWn',
                  pg: 'BGWriter',
                  desc: 'Flushes dirty memory pages to physical disk',
                },
                {
                  fn: 'Transaction Log',
                  oracle: 'LGWR',
                  pg: 'WAL Writer',
                  desc: 'Writes transaction logs before data, ensuring durability',
                },
                {
                  fn: 'Checkpoint',
                  oracle: 'CKPT',
                  pg: 'Checkpointer',
                  desc: 'Forces all dirty buffers to disk, limiting crash recovery time',
                },
                {
                  fn: 'Process Cleanup',
                  oracle: 'PMON',
                  pg: 'Postmaster',
                  desc: 'Cleans up failed user processes and their held resources',
                },
                {
                  fn: 'Maintenance',
                  oracle: 'SMON',
                  pg: 'Autovacuum',
                  desc: 'Instance recovery (Oracle) / dead tuple cleanup (PostgreSQL)',
                },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium text-gray-800 border-b border-gray-100">
                    {row.fn}
                  </td>
                  <td className="p-3 font-mono text-blue-700 border-b border-gray-100">
                    {row.oracle}
                  </td>
                  <td className="p-3 font-mono text-emerald-700 border-b border-gray-100">
                    {row.pg}
                  </td>
                  <td className="p-3 text-gray-600 border-b border-gray-100">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Architecture Components</h3>
      <div className="space-y-2">
        <NavigationCard
          title="Query Processor"
          description="Parser, Optimizer, Execution Engine"
          colorScheme="teal"
          onClick={() => navigateToSection('Query Processor')}
        />
        <NavigationCard
          title="Storage Engine"
          description="Buffer Manager, Lock Manager, WAL"
          colorScheme="teal"
          onClick={() => navigateToSection('Storage Engine')}
        />
        <NavigationCard
          title="Oracle vs PostgreSQL"
          description="Compare engine architectures"
          colorScheme="teal"
          onClick={() => navigateToSection('Oracle vs PostgreSQL')}
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
        title="Understand Query Optimization"
        description="See how the query optimizer acts as a GPS for your data — choosing the fastest route to retrieve results."
        buttonText="Explore Indexing & Optimization"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Indexing & Optimization')}
      />
    </>
  );
};

export default DBMSArchitecture;
