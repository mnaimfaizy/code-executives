import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import BTreeVisualization from '../../components/models2d/datastructures/tree/BTreeVisualization';
import { Database, HardDrive, BookOpen, Zap, BarChart3, Settings } from 'lucide-react';

const BTrees: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <Database className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        B-Trees: Multi-Way Balanced Trees for Storage Systems
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        B-Trees are self-balancing multi-way search trees designed for storage systems that read and
        write large blocks of data. They minimize disk I/O operations by storing multiple keys per
        node and maintaining all leaves at the same level.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
          💾 Disk-Optimized
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Multi-Way Nodes
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 Database Standard
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ O(log n) Operations
        </span>
      </div>
    </div>
  );

  // Main content
  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">B-Tree Properties</h3>
              <p className="text-gray-700 mb-4">
                Essential characteristics that make B-Trees ideal for storage systems and databases.
              </p>
              <div className="bg-teal-50 p-4 rounded-lg mb-4">
                <div className="text-lg font-bold text-teal-900 mb-3 text-center">
                  B-Tree of Order M Rules
                </div>
                <div className="space-y-2 text-teal-800 text-sm">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      1
                    </span>
                    Every node has at most M children
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      2
                    </span>
                    Every non-leaf node has at least ceil(M/2) children
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      3
                    </span>
                    Root has at least 2 children (unless it's a leaf)
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      4
                    </span>
                    All leaves are at the same level
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      5
                    </span>
                    Non-leaf with k children has k-1 keys
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Key Insight:</strong> Higher branching factor means fewer levels,
                  reducing disk I/O operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive B-Tree</h3>
              <p className="text-gray-700 mb-4">
                Explore B-Tree operations and see how nodes split and merge to maintain balance.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BTreeVisualization className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Storage System Design</h3>
              <p className="text-gray-700 mb-4">
                Understanding why B-Trees are optimized for disk storage and database systems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🐌 Disk I/O Challenge</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Disk access ~10,000x slower than RAM</li>
                    <li>• Reading block costs same as single byte</li>
                    <li>• Minimize number of disk accesses</li>
                    <li>• Sequential reads much faster</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🚀 B-Tree Solution</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Wide nodes match disk block size</li>
                    <li>• Fewer levels = fewer disk accesses</li>
                    <li>• All leaves at same level</li>
                    <li>• Efficient range queries</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Performance Comparison</h4>
                <div className="text-sm text-blue-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Binary Tree (1M records):</strong>
                      <br />
                      Height: ~20, Disk I/O: ~20
                    </div>
                    <div>
                      <strong>B-Tree Order 100:</strong>
                      <br />
                      Height: ~3, Disk I/O: ~3
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">B-Tree Operations</h3>
              <p className="text-gray-700 mb-4">
                Core operations that maintain B-Tree properties through splits and merges.
              </p>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🔄 Insertion Process</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>1. Find leaf node for insertion</div>
                    <div>2. Insert key in sorted order</div>
                    <div>3. If node overflows (&gt; M-1 keys):</div>
                    <div className="ml-4">• Split node into two</div>
                    <div className="ml-4">• Promote middle key to parent</div>
                    <div className="ml-4">• Recursively handle parent overflow</div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🗑️ Deletion Process</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>1. Find and remove key</div>
                    <div>2. If leaf underflows (&lt; ceil(M/2)-1 keys):</div>
                    <div className="ml-4">• Try borrowing from sibling</div>
                    <div className="ml-4">• If sibling can't lend, merge nodes</div>
                    <div className="ml-4">• Recursively handle parent underflow</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">B-Tree Variants</h3>
              <p className="text-gray-700 mb-4">
                Specialized B-Tree implementations for different storage and access patterns.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🌿 B+ Trees</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• All data in leaf nodes</li>
                    <li>• Internal nodes only store keys</li>
                    <li>• Leaves linked for range queries</li>
                    <li>• Used in most database systems</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">⭐ B* Trees</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Higher minimum occupancy (2/3)</li>
                    <li>• Delay splits by redistribution</li>
                    <li>• Better space utilization</li>
                    <li>• More complex implementation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Applications</h3>
              <p className="text-gray-700 mb-4">
                B-Trees are the backbone of modern database and file system implementations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Database Systems</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• MySQL InnoDB storage engine</li>
                    <li>• PostgreSQL indexes</li>
                    <li>• SQLite database files</li>
                    <li>• Oracle Database indexes</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">File Systems</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• NTFS (Windows file system)</li>
                    <li>• HFS+ (macOS file system)</li>
                    <li>• XFS (Linux file system)</li>
                    <li>• Btrfs (Linux file system)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                <p className="text-teal-800 text-sm">
                  <strong>🏗️ Foundation Technology:</strong> B-Trees are so fundamental that they're
                  often implemented in hardware for SSD controllers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Characteristics</h3>
              <p className="text-gray-700 mb-4">
                Understanding B-Tree performance in different scenarios and optimizations.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900">Operation</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Time Complexity</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Disk I/O</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Search</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Insert</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Delete</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                      <td className="p-3 text-green-600">O(log_m n)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Range Query</td>
                      <td className="p-3 text-blue-600">O(log_m n + k)</td>
                      <td className="p-3 text-blue-600">O(log_m n + k/m)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Sequential Scan</td>
                      <td className="p-3 text-purple-600">O(n)</td>
                      <td className="p-3 text-purple-600">O(n/m)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Where m is the branching factor (order), n is number of keys, k is result size
              </div>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">B-Tree Order</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-teal-50 p-3 rounded-lg">
            <div className="font-semibold text-teal-900 mb-1">Order/Degree (M)</div>
            <div className="text-teal-700">
              Maximum number of children per node. Higher order means wider nodes, fewer levels.
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-900 mb-1">Typical Values</div>
            <div className="text-blue-700">
              • Memory: M = 100-1000
              <br />
              • Disk: M = 100-10000
              <br />• Depends on block size
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Related Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Binary Search Trees"
            description="Foundation concepts"
            icon={<Database className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="Red-Black Trees"
            description="Binary balanced trees"
            icon={<Database className="w-5 h-5" />}
            onClick={() => navigateToSection('Red-Black Trees')}
            colorScheme="red"
          />
          <NavigationCard
            title="Hash Tables"
            description="Alternative indexing"
            icon={<Settings className="w-5 h-5" />}
            onClick={() => navigateToSection('Hash Tables')}
            colorScheme="purple"
          />
        </div>
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
        title="Master Database Internals"
        description="Understand how B-Trees power modern database systems and storage engines."
        buttonText="Explore Hash Tables"
        onButtonClick={() => navigateToSection('Hash Tables')}
        colorScheme="teal"
      />
    </>
  );
};

export default BTrees;
