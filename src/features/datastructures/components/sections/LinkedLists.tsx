import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import SectionPractice from '../../../../shared/components/practice/SectionPractice';
import LinkedListVisualization from '../visualizations/2d/linear/LinkedListVisualization';
import { ArrowRight, Database, Zap, Code } from 'lucide-react';

/** The list of the "Detecting a Cycle" diagram: the next of the last node refers to node 3. */
const CYCLE_NODES = [1, 2, 3, 4, 5];
const CYCLE_ENTRY_INDEX = 2;
const CYCLE_NODE_X0 = 20;
const CYCLE_NODE_STEP = 130;

/** The node `slow` and `fast` hold at the start and after each turn, until both hold the same. */
function cycleTurns(): { slow: number; fast: number }[] {
  const next = (index: number): number =>
    index === CYCLE_NODES.length - 1 ? CYCLE_ENTRY_INDEX : index + 1;
  let slow = 0;
  let fast = 0;
  const turns = [{ slow: CYCLE_NODES[slow], fast: CYCLE_NODES[fast] }];
  do {
    slow = next(slow);
    fast = next(next(fast));
    turns.push({ slow: CYCLE_NODES[slow], fast: CYCLE_NODES[fast] });
  } while (slow !== fast);
  return turns;
}

const LinkedLists: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6 animate-bounce">
        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 sm:p-6 rounded-2xl shadow-lg">
          <ArrowRight className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        Linked Lists: Dynamic Data Structures
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed px-4">
        Linked lists are dynamic data structures where elements are connected through pointers,
        enabling efficient insertion and deletion operations with flexible memory usage.
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
        <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          🔗 Pointer-Based
        </span>
        <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          📈 Dynamic Size
        </span>
        <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          💾 Memory Efficient
        </span>
        <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          ⚡ Sequential Access
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <div className="space-y-6 sm:space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard>
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-md">
              <Code className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            Interactive Linked List Demo
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-1">
            Observe how nodes are connected through pointers, enabling dynamic insertion and
            deletion. Drag nodes to rearrange them and see the connections update in real-time!
          </p>
          <LinkedListVisualization isActive={true} className="w-full" />
        </div>
      </ThemeCard>

      {/* Key Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Properties */}
        <ThemeCard>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
            Linked List Properties
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-green-700 mb-1 text-sm sm:text-base">Dynamic Size</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Can grow or shrink during runtime, limited only by available memory.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-blue-700 mb-1 text-sm sm:text-base">Pointer-Based</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Each node contains data and a reference to the next node.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-purple-700 mb-1 text-sm sm:text-base">
                  Memory Efficient
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Allocates memory only when needed, no wasted space.
                </p>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Time Complexity */}
        <ThemeCard>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
            Time Complexity
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Insert at Head
              </span>
              <span className="text-green-600 font-mono font-bold text-sm sm:text-base">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Delete at Head
              </span>
              <span className="text-green-600 font-mono font-bold text-sm sm:text-base">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">Search</span>
              <span className="text-yellow-600 font-mono font-bold text-sm sm:text-base">O(n)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Access by Index
              </span>
              <span className="text-yellow-600 font-mono font-bold text-sm sm:text-base">O(n)</span>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Types of Linked Lists */}
      <ThemeCard>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
          Types of Linked Lists
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 sm:p-4 border-2 border-green-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-green-700 mb-2 text-sm sm:text-base">
              Singly Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Each node points to the next node. Traversal is unidirectional.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 text-green-700">
              Node → Node → Node → NULL
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-3 sm:p-4 border-2 border-blue-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-blue-700 mb-2 text-sm sm:text-base">
              Doubly Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Each node has pointers to both next and previous nodes.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-blue-200 text-blue-700">
              NULL ← Node ↔ Node ↔ Node → NULL
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-3 sm:p-4 border-2 border-purple-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-purple-700 mb-2 text-sm sm:text-base">
              Circular Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Last node points back to the first node, forming a circle.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-purple-200 text-purple-700">
              Node → Node → Node → (back to first)
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Detecting a cycle */}
      <ThemeCard>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
          Detecting a Cycle
        </h3>
        <div className="space-y-3 text-sm sm:text-base text-gray-700">
          <p>
            A list has a <strong>cycle</strong> when the <code>next</code> of some node refers to a
            node that comes earlier in the list. Following <code>next</code> then never reaches{' '}
            <code>null</code>, so a loop that walks to the end of the list never stops. A circular
            linked list has such a cycle on purpose. In any other list it is a bug.
          </p>
          <p>
            One way to detect a cycle is to keep every node already passed in a set, and to stop
            when the walk reaches a node that is in the set. This takes O(n) time, but the set
            holds up to n nodes: O(n) extra memory.
          </p>
          <p>
            <strong>Floyd&apos;s cycle detection</strong> (commonly called &quot;tortoise and
            hare&quot;) needs no set. Two references start at the first node. On each turn{' '}
            <code>slow</code> moves one node and <code>fast</code> moves two. If the list ends,{' '}
            <code>fast</code> reaches <code>null</code> and there is no cycle. If there is a cycle,
            both references enter it and cannot leave. From then on the distance from{' '}
            <code>fast</code> forward to <code>slow</code> shrinks by exactly one node per turn, so{' '}
            <code>fast</code> cannot jump over <code>slow</code>: after some turn both refer to the
            same node.
          </p>
        </div>

        <figure className="mt-4 sm:mt-6">
          <div className="overflow-x-auto bg-white rounded-xl border-2 border-indigo-200 p-3">
            <svg
              viewBox="0 0 660 150"
              className="w-full min-w-[520px]"
              role="img"
              aria-label="A linked list of five nodes, 1 to 5. Each node's next refers to the following node, and the next of node 5 refers back to node 3."
            >
              <defs>
                <marker
                  id="cycle-next-arrow"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 10 4, 0 8" fill="#4F46E5" />
                </marker>
                <marker
                  id="cycle-back-arrow"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 10 4, 0 8" fill="#DC2626" />
                </marker>
              </defs>
              <text x="30" y="18" fontSize="12" fill="#4B5563">
                head
              </text>
              {CYCLE_NODES.map((value, index) => {
                const x = CYCLE_NODE_X0 + index * CYCLE_NODE_STEP;
                const inCycle = index >= CYCLE_ENTRY_INDEX;
                return (
                  <g key={value}>
                    <rect
                      x={x}
                      y={30}
                      width={56}
                      height={44}
                      fill={inCycle ? '#EEF2FF' : '#F9FAFB'}
                      stroke="#4F46E5"
                      strokeWidth="2"
                    />
                    <rect
                      x={x + 56}
                      y={30}
                      width={44}
                      height={44}
                      fill="#FFFFFF"
                      stroke="#4F46E5"
                      strokeWidth="2"
                    />
                    <text x={x + 28} y={58} textAnchor="middle" fontSize="18" fill="#111827">
                      {value}
                    </text>
                    <text x={x + 78} y={45} textAnchor="middle" fontSize="10" fill="#4B5563">
                      next
                    </text>
                    <circle cx={x + 78} cy={60} r={4} fill="#4F46E5" />
                    {index < CYCLE_NODES.length - 1 && (
                      <line
                        x1={x + 78}
                        y1={60}
                        x2={x + CYCLE_NODE_STEP - 2}
                        y2={60}
                        stroke="#4F46E5"
                        strokeWidth="2"
                        markerEnd="url(#cycle-next-arrow)"
                      />
                    )}
                  </g>
                );
              })}
              {/* The next of the last node refers back to the node where the cycle starts */}
              <path
                d={`M ${CYCLE_NODE_X0 + 4 * CYCLE_NODE_STEP + 78} 60 V 122 H ${
                  CYCLE_NODE_X0 + CYCLE_ENTRY_INDEX * CYCLE_NODE_STEP + 28
                } V 77`}
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                markerEnd="url(#cycle-back-arrow)"
              />
              <text x="440" y="140" textAnchor="middle" fontSize="12" fill="#B91C1C">
                5.next refers to node 3
              </text>
            </svg>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border border-gray-200">
              <caption className="sr-only">
                The node each reference holds after each turn on the list above
              </caption>
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Turn
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    slow (one node)
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    fast (two nodes)
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {cycleTurns().map((turn, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <th scope="row" className="px-3 py-2 font-normal">
                      {index === 0 ? 'Start' : index}
                    </th>
                    <td className="px-3 py-2 font-mono">node {turn.slow}</td>
                    <td className="px-3 py-2 font-mono">
                      node {turn.fast}
                      {index > 0 && turn.slow === turn.fast && (
                        <span className="ml-2 font-sans font-semibold text-red-700">
                          same node: there is a cycle
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="mt-2 text-xs sm:text-sm text-gray-600">
            On this list the two references hold the same node after three turns.
          </figcaption>
        </figure>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
            <span className="font-semibold text-gray-900 text-xs sm:text-base">Time</span>
            <span className="text-yellow-600 font-mono font-bold text-sm sm:text-base">O(n)</span>
          </div>
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
            <span className="font-semibold text-gray-900 text-xs sm:text-base">Extra memory</span>
            <span className="text-green-600 font-mono font-bold text-sm sm:text-base">O(1)</span>
          </div>
        </div>
        <p className="mt-3 text-sm sm:text-base text-gray-700">
          Without a cycle, <code>fast</code> reaches the end after about n / 2 turns. With a cycle,{' '}
          <code>slow</code> has not gone once around it when the two meet, so the number of turns
          is never more than n. The only memory used is the two references, whatever the length of
          the list.
        </p>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
          When to Use Linked Lists
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Dynamic Size</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When the number of elements varies significantly
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
              Frequent Insertions
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When you need to insert/delete elements frequently
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Memory Efficiency</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When memory usage should be optimized
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Unknown Size</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When the final size is not known in advance
            </p>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout section="datastructures" hero={heroContent} mainContent={mainContent} />
      <SectionPractice moduleId="datastructures" section="Linked Lists" />
      <CTASection
        title="Ready to Explore More Data Structures?"
        description="Continue your journey through fundamental data structures and algorithms."
        buttonText="Explore Tree Structures"
        onButtonClick={() => navigateToSection('TreeStructures')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default LinkedLists;
