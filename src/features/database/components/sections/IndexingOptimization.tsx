import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { Search, Zap, GitBranch } from 'lucide-react';
import BTreeIndex2D from '../visualizations/2d/BTreeIndex2D';

const IndexingOptimization: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <Search className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Indexing & Query Optimization</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        How can a database query a table with <strong>billions</strong> of records and return a
        result in milliseconds? The answer is <strong>indexing</strong> — mathematical structures
        that transform brute-force searches into logarithmic lookups.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Textbook Index Analogy */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Textbook Index Analogy</h2>
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-red-700 mb-2">❌ Without an Index (Full Table Scan)</h3>
              <p className="text-sm text-gray-700">
                Finding &quot;Transaction Isolation&quot; in a 1,000-page textbook by reading every
                page line-by-line. This is catastrophically slow — the #1 cause of poor database
                performance.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-green-700 mb-2">✅ With an Index</h3>
              <p className="text-sm text-gray-700">
                Consulting the alphabetical index at the back, finding the exact page number, and
                jumping directly to it. Instantaneous. This is how B-Tree indexes work.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive B-Tree Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive B-Tree Index</h2>
        <p className="text-gray-600 mb-4">
          Insert values and watch the B-Tree self-balance. Search for values to see the logarithmic
          lookup path highlighted.
        </p>
        <BTreeIndex2D />
      </ThemeCard>

      {/* B-Tree vs Hash */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">B-Tree vs Hash Index</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">B-Tree Index</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              A self-balancing hierarchical tree. All leaf nodes exist at the same depth, ensuring
              predictable $O(\log n)$ search times.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Range queries (BETWEEN, &gt;, &lt;)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">
                  Prefix string searches (LIKE &apos;Pat%&apos;)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">ORDER BY without sorting</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Equality lookups</span>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-3 text-xs font-mono text-blue-700">
              Search: $O(\log n)$ — e.g., 1 billion rows → ~30 comparisons
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-bold text-amber-800">Hash Index</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              A deterministic hash function maps keys to bucket locations. Unparalleled for exact
              match queries with near-constant time.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Exact match (WHERE id = 1054)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span className="text-gray-700">Range queries (destroys sort order)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span className="text-gray-700">Prefix/wildcard searches</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span className="text-gray-700">ORDER BY optimization</span>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-3 text-xs font-mono text-amber-700">
              Search: $O(1)$ average — near-instant for exact lookups
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Query Optimizer */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Query Optimizer as GPS</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          When you write SQL, you tell the database <em>what</em> data you want — not <em>how</em>
          to get it. The Query Optimizer bridges this gap by acting as a GPS routing algorithm:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-teal-50 rounded-xl p-4 text-center border border-teal-100">
            <div className="text-3xl mb-2">🗺️</div>
            <h4 className="font-bold text-teal-800 mb-1">Generate Plans</h4>
            <p className="text-xs text-gray-600">
              Consider all possible routes: full scan, index scan, nested loop join, hash join,
              merge join
            </p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-bold text-cyan-800 mb-1">Estimate Costs</h4>
            <p className="text-xs text-gray-600">
              Calculate I/O cost, CPU cost, memory cost, and network transfer for each plan using
              table statistics
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="font-bold text-emerald-800 mb-1">Choose Fastest</h4>
            <p className="text-xs text-gray-600">
              Select the execution plan with the lowest total estimated cost and execute it
            </p>
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
          title="DBMS Architecture"
          description="See the full query pipeline"
          colorScheme="teal"
          onClick={() => navigateToSection('DBMS Architecture')}
        />
        <NavigationCard
          title="Transactions & ACID"
          description="How updates are made durable"
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
        title="Master Transaction Safety"
        description="Learn how ACID properties and MVCC ensure your data remains consistent even under massive concurrent access."
        buttonText="Explore Transactions & ACID"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Transactions & ACID')}
      />
    </>
  );
};

export default IndexingOptimization;
