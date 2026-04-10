import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import {
  HardDrive,
  Database,
  Search,
  Shield,
  Zap,
  Layers,
  GitBranch,
  CheckCircle,
} from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/database?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '7+',
      label: 'Interactive Visualizations',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      value: '5',
      label: 'Database Paradigms',
      icon: <Database className="w-5 h-5" />,
    },
    {
      value: '2',
      label: 'DBMS Engines Compared',
      icon: <HardDrive className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <HardDrive className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Database & DBMS: The Engine Behind Every Application
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Every application — from global financial networks to mobile social platforms — relies on
        the rapid, secure, and reliable storage and retrieval of data. Understand how databases
        organize information, how DBMS engines process queries, and why choosing the right data
        model is one of the most critical architectural decisions you will ever make.
      </p>
      <StatsGrid stats={stats} colorScheme="teal" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
          🗄️ SQL & NoSQL Models
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚙️ DBMS Architecture
        </span>
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          🌳 B-Tree Indexing
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔒 ACID Transactions
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          What Are Databases & Why Do They Matter?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              From Filing Cabinets to Distributed Systems
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The concept of a <strong>database</strong> predates digital computing — originating in
              physical filing cabinets for health records, tax documents, and demographic data. But
              the exponential growth of information demanded a technological evolution.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              In the 1960s, data was stored on punch cards and flat files — suffering from massive
              duplication, sequential-only access, and zero ability to establish relationships. In
              1970, Edgar F. Codd published his revolutionary <strong>Relational Model</strong>,
              organizing data into structured tables with mathematical relationships. This became
              the backbone of the internet.
            </p>
            <p className="text-gray-700 leading-relaxed">
              As the internet expanded in the 2000s, relational databases faced scaling challenges
              with massive unstructured data. This spurred <strong>NoSQL databases</strong> — and
              most recently, <strong>Vector databases</strong> powering AI and machine learning.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Data vs. Database vs. DBMS</h3>
            <div className="space-y-4">
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-teal-200 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-teal-700" />
                  </div>
                  <h4 className="font-semibold text-teal-800">Data</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Raw, unprocessed facts or values — a number, text, or image. &quot;Cat&quot;,
                  &quot;25&quot;, &quot;Black&quot; are data. When correlated: &quot;My cat is 25
                  years old and black&quot; becomes <em>information</em>.
                </p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-cyan-700" />
                  </div>
                  <h4 className="font-semibold text-cyan-800">Database</h4>
                </div>
                <p className="text-sm text-gray-700">
                  An organized, structured collection of data stored electronically. A passive
                  repository — like a warehouse full of goods — with no innate ability to enforce
                  security, manage concurrency, or recover from failures.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h4 className="font-semibold text-emerald-800">DBMS</h4>
                </div>
                <p className="text-sm text-gray-700">
                  The sophisticated <strong>software layer</strong> that bridges users and the raw
                  database. It performs CRUD operations, enforces security, handles backup/recovery,
                  and processes complex SQL queries — making concurrent access safe and reliable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why this matters */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Why Every Developer Needs to Understand Databases
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Query Performance</h4>
              <p className="text-sm text-gray-600">
                Understanding indexing and query plans turns a 30-second query into a 3ms one
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Data Integrity</h4>
              <p className="text-sm text-gray-600">
                ACID transactions prevent data corruption and inconsistency in production systems
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <GitBranch className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Architecture Decisions</h4>
              <p className="text-sm text-gray-600">
                Choosing SQL vs NoSQL vs Vector determines your system&apos;s scalability ceiling
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Journey */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Database Learning Journey</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          This module takes you from understanding fundamental database models to mastering DBMS
          engine internals, query optimization, and transactional architecture. Each section builds
          upon the previous, with interactive visualizations to solidify every concept.
        </p>

        <div className="space-y-4">
          {[
            {
              name: 'Database Models',
              description: 'Relational, Document, Key-Value, Graph, and Vector databases compared',
              completed: false,
              current: true,
            },
            {
              name: 'DBMS Architecture',
              description: 'Query Processor, Storage Engine, Buffer Manager, Lock Manager',
              completed: false,
              current: false,
            },
            {
              name: 'SQL Fundamentals',
              description: 'CRUD operations, JOINs, subqueries, and set operations',
              completed: false,
              current: false,
            },
            {
              name: 'Indexing & Optimization',
              description: 'B-Trees, Hash indexes, execution plans, and query tuning',
              completed: false,
              current: false,
            },
            {
              name: 'Transactions & ACID',
              description: 'Atomicity, Consistency, Isolation, Durability, and MVCC',
              completed: false,
              current: false,
            },
            {
              name: 'Oracle vs PostgreSQL',
              description: 'Comparative architecture: SGA vs shared buffers, Undo/Redo vs WAL/MVCC',
              completed: false,
              current: false,
            },
            {
              name: 'Visualization',
              description: 'All interactive database visualizations in one place',
              completed: false,
              current: false,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => navigateToSection(step.name)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  step.current
                    ? 'bg-teal-500 text-white shadow-md'
                    : step.completed
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold transition-colors duration-200 ${
                    step.current
                      ? 'text-teal-800'
                      : step.completed
                        ? 'text-green-800'
                        : 'text-gray-700'
                  }`}
                >
                  {step.name}
                  {step.current && <span className="ml-2 text-teal-600">(Start Here)</span>}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Module Sections</h3>
        <div className="space-y-2">
          <NavigationCard
            title="Database Models"
            description="SQL, NoSQL, and Vector paradigms"
            colorScheme="teal"
            icon={<Database className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('Database Models')}
          />
          <NavigationCard
            title="DBMS Architecture"
            description="Inside the query processor & storage engine"
            colorScheme="teal"
            icon={<HardDrive className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('DBMS Architecture')}
          />
          <NavigationCard
            title="SQL Fundamentals"
            description="CRUD, JOINs, subqueries"
            colorScheme="teal"
            icon={<Search className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('SQL Fundamentals')}
          />
          <NavigationCard
            title="Indexing & Optimization"
            description="B-Trees, hash indexes, execution plans"
            colorScheme="teal"
            icon={<Zap className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('Indexing & Optimization')}
          />
          <NavigationCard
            title="Transactions & ACID"
            description="Atomicity, isolation, MVCC"
            colorScheme="teal"
            icon={<Shield className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('Transactions & ACID')}
          />
          <NavigationCard
            title="Oracle vs PostgreSQL"
            description="Comparative engine architecture"
            colorScheme="teal"
            icon={<Layers className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('Oracle vs PostgreSQL')}
          />
          <NavigationCard
            title="Visualizations"
            description="All interactive visualizations"
            colorScheme="teal"
            icon={<Layers className="w-4 h-4 text-teal-600" />}
            onClick={() => navigateToSection('Visualization')}
          />
        </div>
      </ThemeCard>
    </>
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
        title="Ready to Explore Database Internals?"
        description="Start with understanding the different database paradigms and when to use each one in your architecture."
        buttonText="Explore Database Models"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Database Models')}
      />
    </>
  );
};

export default Introduction;
