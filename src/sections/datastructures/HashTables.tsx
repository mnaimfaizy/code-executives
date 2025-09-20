import React, { useState } from 'react';
import { Hash, Search, Zap, Users } from 'lucide-react';
import HashTableVisualization from '../../components/models2d/datastructures/hash/HashTableVisualization';
import CollisionHandling from '../../components/models2d/datastructures/hash/CollisionHandling';
import { getSectionTheme } from '../../utils/theme';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';

const HashTables: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'collision'>('basic');
  const [hashFunction, setHashFunction] = useState<'simple' | 'djb2' | 'fnv1a'>('simple');
  const [collisionStrategy, setCollisionStrategy] = useState<
    'chaining' | 'linear-probing' | 'quadratic-probing'
  >('chaining');
  const theme = getSectionTheme('datastructures');

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-${theme.primary}-600 to-${theme.secondary}-600 rounded-2xl mb-6 shadow-lg`}>
          <Hash className="w-10 h-10 text-white" />
        </div>
        <h1 className={`text-5xl font-bold bg-gradient-to-r from-${theme.primary}-600 via-${theme.secondary}-600 to-${theme.accent}-600 bg-clip-text text-transparent mb-6`}>
          Hash Tables
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Hash tables provide average O(1) time complexity for insertions, deletions, and lookups
          by using hash functions to map keys directly to array indices.
        </p>
      </div>
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* Demo Selection */}
      <ThemeCard>
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-blue-200 rounded-xl p-2 shadow-sm">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveDemo('basic')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  activeDemo === 'basic'
                    ? `bg-${theme.primary}-600 text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Operations
              </button>
              <button
                onClick={() => setActiveDemo('collision')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  activeDemo === 'collision'
                    ? `bg-${theme.primary}-600 text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Collision Resolution
              </button>
            </div>
          </div>
        </div>

        {/* Hash Function & Strategy Controls */}
        {activeDemo === 'basic' && (
          <div className="bg-white border border-blue-200 rounded-xl p-8 mb-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-800 mb-3">Hash Function</label>
                <select
                  value={hashFunction}
                  onChange={(e) => setHashFunction(e.target.value as 'simple' | 'djb2' | 'fnv1a')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Simple (ASCII Sum)</option>
                  <option value="djb2">DJB2 Hash</option>
                  <option value="fnv1a">FNV-1a Hash</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-800 mb-3">Collision Strategy</label>
                <select
                  value={collisionStrategy}
                  onChange={(e) =>
                    setCollisionStrategy(
                      e.target.value as 'chaining' | 'linear-probing' | 'quadratic-probing'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="chaining">Separate Chaining</option>
                  <option value="linear-probing">Linear Probing</option>
                  <option value="quadratic-probing">Quadratic Probing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Visualization */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Interactive Hash Table Demo</h3>
          <p className="text-gray-600 mb-6">
            Explore how hash functions map keys to indices and handle collisions.
          </p>

          {activeDemo === 'basic' ? (
            <HashTableVisualization
              hashFunction={hashFunction}
              collisionStrategy={collisionStrategy}
              showHashCalculation={true}
              tableSize={7}
              className="w-full"
            />
          ) : (
            <CollisionHandling
              strategy={collisionStrategy}
              onStrategyChange={setCollisionStrategy}
              className="w-full"
            />
          )}
        </div>

        {/* Core Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hash Functions */}
          <div className="bg-white border border-blue-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Hash Functions</h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">Deterministic</h4>
                  <p className="text-gray-600">Same input always produces the same hash value.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Uniform Distribution</h4>
                  <p className="text-gray-600">Distributes keys evenly across the hash table.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Fast Computation</h4>
                  <p className="text-gray-600">Quick to calculate to maintain O(1) performance.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Avalanche Effect</h4>
                  <p className="text-gray-600">Small input changes create large hash changes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Load Factor */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Performance Factors
            </h3>

            <div className="space-y-4">
              <div
                className={`flex justify-between items-center p-3 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-lg`}
              >
                <span className="font-medium text-gray-900 dark:text-white">Insert</span>
                <span
                  className={`text-${theme.primary}-600 dark:text-${theme.primary}-400 font-mono font-semibold`}
                >
                  O(1) avg
                </span>
              </div>

              <div
                className={`flex justify-between items-center p-3 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-lg`}
              >
                <span className="font-medium text-gray-900 dark:text-white">Delete</span>
                <span
                  className={`text-${theme.primary}-600 dark:text-${theme.primary}-400 font-mono font-semibold`}
                >
                  O(1) avg
                </span>
              </div>

              <div
                className={`flex justify-between items-center p-3 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-lg`}
              >
                <span className="font-medium text-gray-900 dark:text-white">Search</span>
                <span
                  className={`text-${theme.primary}-600 dark:text-${theme.primary}-400 font-mono font-semibold`}
                >
                  O(1) avg
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Worst Case</span>
                <span className="text-red-600 dark:text-red-400 font-mono font-semibold">O(n)</span>
              </div>
            </div>

            <div
              className={`mt-6 p-4 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-lg`}
            >
              <h4
                className={`font-semibold text-${theme.primary}-700 dark:text-${theme.primary}-300 mb-2`}
              >
                Load Factor Impact
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Load Factor = n / m (entries / buckets)
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li>• &lt; 0.7: Excellent performance</li>
                <li>• 0.7-0.8: Good performance</li>
                <li>• &gt; 0.8: Consider resizing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hash Function Types */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Popular Hash Functions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`bg-gradient-to-br from-${theme.primary}-50 to-${theme.secondary}-50 dark:from-${theme.primary}-900/20 dark:to-${theme.secondary}-900/20 rounded-lg p-6`}
            >
              <h4
                className={`font-semibold text-${theme.primary}-700 dark:text-${theme.primary}-300 mb-3`}
              >
                Simple Hash
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Sum of ASCII values modulo table size. Easy to understand but poor distribution.
              </p>
              <div
                className={`text-xs text-${theme.primary}-600 dark:text-${theme.primary}-400 font-mono bg-white dark:bg-gray-800 p-2 rounded`}
              >
                hash = (sum of chars) % size
              </div>
            </div>

            <div
              className={`bg-gradient-to-br from-${theme.secondary}-50 to-${theme.accent}-50 dark:from-${theme.secondary}-900/20 dark:to-${theme.accent}-900/20 rounded-lg p-6`}
            >
              <h4
                className={`font-semibold text-${theme.secondary}-700 dark:text-${theme.secondary}-300 mb-3`}
              >
                DJB2 Hash
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Good distribution with simple bit operations. Popular in practice.
              </p>
              <div
                className={`text-xs text-${theme.secondary}-600 dark:text-${theme.secondary}-400 font-mono bg-white dark:bg-gray-800 p-2 rounded`}
              >
                hash = hash * 33 + char
              </div>
            </div>

            <div
              className={`bg-gradient-to-br from-${theme.accent}-50 to-${theme.primary}-50 dark:from-${theme.accent}-900/20 dark:to-${theme.primary}-900/20 rounded-lg p-6`}
            >
              <h4
                className={`font-semibold text-${theme.accent}-700 dark:text-${theme.accent}-300 mb-3`}
              >
                FNV-1a Hash
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Fast and well-distributed. Good avalanche properties.
              </p>
              <div
                className={`text-xs text-${theme.accent}-600 dark:text-${theme.accent}-400 font-mono bg-white dark:bg-gray-800 p-2 rounded`}
              >
                hash = (hash ^ char) * prime
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Applications */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Real-World Applications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div
                className={`w-12 h-12 bg-${theme.primary}-100 dark:bg-${theme.primary}-900/20 rounded-lg flex items-center justify-center mx-auto mb-4`}
              >
                <Search
                  className={`w-6 h-6 text-${theme.primary}-600 dark:text-${theme.primary}-400`}
                />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Database Indexing
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Fast record lookup and query optimization
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-12 h-12 bg-${theme.secondary}-100 dark:bg-${theme.secondary}-900/20 rounded-lg flex items-center justify-center mx-auto mb-4`}
              >
                <Zap
                  className={`w-6 h-6 text-${theme.secondary}-600 dark:text-${theme.secondary}-400`}
                />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Caching Systems</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Redis, Memcached for fast data retrieval
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-12 h-12 bg-${theme.accent}-100 dark:bg-${theme.accent}-900/20 rounded-lg flex items-center justify-center mx-auto mb-4`}
              >
                <Users
                  className={`w-6 h-6 text-${theme.accent}-600 dark:text-${theme.accent}-400`}
                />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User Sessions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Web application session management
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Hash className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Symbol Tables</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Compiler variable and function lookup
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Examples */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Language Implementations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className={`bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-lg p-4`}
            >
              <h4
                className={`font-semibold text-${theme.primary}-700 dark:text-${theme.primary}-300 mb-3`}
              >
                JavaScript
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">Map</code>{' '}
                  and <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">Set</code>{' '}
                  objects
                </li>
                <li>• Object property lookup</li>
                <li>• V8 hidden classes</li>
              </ul>
            </div>

            <div
              className={`bg-${theme.secondary}-50 dark:bg-${theme.secondary}-900/20 rounded-lg p-4`}
            >
              <h4
                className={`font-semibold text-${theme.secondary}-700 dark:text-${theme.secondary}-300 mb-3`}
              >
                Python
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">dict</code>{' '}
                  built-in type
                </li>
                <li>
                  • <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">set</code>{' '}
                  collections
                </li>
                <li>• Module namespace lookup</li>
              </ul>
            </div>

            <div className={`bg-${theme.accent}-50 dark:bg-${theme.accent}-900/20 rounded-lg p-4`}>
              <h4
                className={`font-semibold text-${theme.accent}-700 dark:text-${theme.accent}-300 mb-3`}
              >
                Java
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  •{' '}
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">HashMap</code>{' '}
                  and{' '}
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">HashSet</code>
                </li>
                <li>
                  •{' '}
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                    ConcurrentHashMap
                  </code>
                </li>
                <li>• String interning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* When to Use Hash Tables */}
        <div
          className={`bg-gradient-to-r from-${theme.primary}-50 to-${theme.secondary}-50 dark:from-${theme.primary}-900/20 dark:to-${theme.secondary}-900/20 rounded-xl p-8 mb-8`}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            When to Use Hash Tables
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-4">
                ✅ Great For
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  Fast lookups, insertions, and deletions
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  Implementing caches and memoization
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  Counting frequencies and duplicates
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  Building indices for fast search
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  Implementing associative arrays
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-4">
                ❌ Consider Alternatives
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  When you need ordered data (use BST)
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  Small datasets (&lt; 100 items)
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  When memory is severely constrained
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  Need guaranteed O(1) worst-case
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  Frequent iteration over all elements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Previous: Queues"
          description="Learn about FIFO data structures and their implementations"
          colorScheme="primary"
          onClick={() => window.history.back()}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Next: Tree Structures"
          description="Explore hierarchical data structures and tree algorithms"
          colorScheme="primary"
          onClick={() => window.location.href = '/data-structures?section=tree-structures'}
        />
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="datastructures"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Explore More Data Structures?"
        description="Continue your journey through data structures and algorithms with tree structures and graph algorithms."
        buttonText="Explore Tree Structures"
        onButtonClick={() => window.location.href = '/data-structures?section=tree-structures'}
        colorScheme="primary"
      />
    </>
  );
};

export default HashTables;
