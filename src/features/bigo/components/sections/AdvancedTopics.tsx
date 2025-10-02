// src/sections/bigo/AdvancedTopics.tsx
// Advanced topics in algorithmic complexity analysis

import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

interface AmortizedOperation {
  operation: string;
  cost: number;
  description: string;
}

interface ComplexityClass {
  name: string;
  description: string;
  examples: string[];
  hardness: 'easy' | 'hard' | 'unknown';
  color: string;
}

const AdvancedTopics: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('amortized');
  const [arraySize, setArraySize] = useState<number>(4);
  const [operations, setOperations] = useState<AmortizedOperation[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [amortizedCost, setAmortizedCost] = useState<number>(0);

  const complexityClasses: ComplexityClass[] = [
    {
      name: 'P',
      description: 'Problems solvable in polynomial time',
      examples: ['Sorting', 'Shortest Path', 'Linear Programming'],
      hardness: 'easy',
      color: 'green',
    },
    {
      name: 'NP',
      description: 'Problems verifiable in polynomial time',
      examples: ['Traveling Salesman', 'Graph Coloring', 'Knapsack'],
      hardness: 'hard',
      color: 'yellow',
    },
    {
      name: 'NP-Complete',
      description: 'Hardest problems in NP - if one is easy, all are easy',
      examples: ['Boolean Satisfiability', 'Clique Problem', 'Hamiltonian Path'],
      hardness: 'hard',
      color: 'red',
    },
    {
      name: 'NP-Hard',
      description: 'At least as hard as NP problems, not necessarily in NP',
      examples: ['Haltng Problem', 'Optimal Code Generation'],
      hardness: 'hard',
      color: 'purple',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Topics in Complexity</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master amortized analysis, computational complexity classes, and advanced optimization
          techniques that separate expert algorithm designers from novices.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl">⚖️</div>
            <div className="text-sm text-gray-600">Amortized</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🧩</div>
            <div className="text-sm text-gray-600">Complexity Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🌐</div>
            <div className="text-sm text-gray-600">Distributed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🔬</div>
            <div className="text-sm text-gray-600">Optimization</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Complexity Classes', value: '4', icon: '🧩' },
          { label: 'Amortized Techniques', value: '3', icon: '⚖️' },
          { label: 'Distributed Patterns', value: '5', icon: '🌐' },
          { label: 'Optimization Methods', value: '∞', icon: '🔬' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderTopicSelector = () => (
    <ThemeCard className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Advanced Topics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            id: 'amortized',
            label: 'Amortized Analysis',
            icon: '⚖️',
            desc: 'Average-case analysis over sequences',
          },
          {
            id: 'complexity-classes',
            label: 'Complexity Classes',
            icon: '🧩',
            desc: 'P, NP, NP-Complete, NP-Hard',
          },
          {
            id: 'distributed',
            label: 'Distributed Systems',
            icon: '🌐',
            desc: 'Complexity in multi-machine scenarios',
          },
          {
            id: 'optimization',
            label: 'Advanced Optimization',
            icon: '🔬',
            desc: 'Complex algorithm optimization',
          },
        ].map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedTopic === topic.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{topic.icon}</div>
              <div className="text-sm font-bold mb-1">{topic.label}</div>
              <div className="text-xs text-gray-600">{topic.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </ThemeCard>
  );

  const simulateArrayOperation = (operation: string) => {
    const newOperations = [...operations];
    let cost = 0;
    let description = '';

    if (operation === 'append') {
      if (arraySize === newOperations.filter((op) => op.operation === 'resize').length * 2 + 4) {
        // Need to resize
        cost = arraySize; // Copy all elements
        description = `Resize array from ${arraySize} to ${arraySize * 2} capacity`;
        newOperations.push({
          operation: 'resize',
          cost,
          description,
        });
        setArraySize(arraySize * 2);
      } else {
        cost = 1; // Just append
        description = 'Append element to array';
        newOperations.push({
          operation: 'append',
          cost,
          description,
        });
      }
    }

    setOperations(newOperations);
    setTotalCost(totalCost + cost);
    setAmortizedCost(totalCost / newOperations.length);
  };

  const resetAmortizedDemo = () => {
    setOperations([]);
    setTotalCost(0);
    setAmortizedCost(0);
    setArraySize(4);
  };

  const renderAmortizedAnalysis = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Amortized Analysis: Dynamic Arrays
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Dynamic Array Operations
            </h4>
            <p className="text-gray-700 mb-4">
              Dynamic arrays double in size when full. While individual operations can be expensive,
              the amortized cost over many operations is O(1).
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">How It Works:</h5>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Start with capacity 4</li>
                <li>• Double capacity when full (4→8→16→32...)</li>
                <li>• Copy all elements during resize</li>
                <li>• Most appends are O(1), some are O(n)</li>
                <li>
                  • <strong>Amortized cost: O(1)</strong>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => simulateArrayOperation('append')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium"
              >
                Append Element
              </button>
              <button
                onClick={resetAmortizedDemo}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
              >
                Reset Demo
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Cost Analysis</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-emerald-800 font-mono text-sm">Total Cost</div>
                <div className="text-emerald-600 font-bold text-lg">{totalCost}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 font-mono text-sm">Amortized Cost</div>
                <div className="text-blue-600 font-bold text-lg">
                  {operations.length > 0 ? amortizedCost.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">Array State:</h5>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">Capacity:</span>
                <span className="font-mono font-bold text-emerald-600">{arraySize}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Elements:</span>
                <span className="font-mono font-bold text-blue-600">
                  {operations.filter((op) => op.operation === 'append').length}
                </span>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4 max-h-48 overflow-y-auto">
              <h5 className="font-semibold text-gray-900 mb-2">Operation History:</h5>
              {operations.length === 0 ? (
                <p className="text-gray-500 text-sm">No operations yet</p>
              ) : (
                <div className="space-y-1">
                  {operations.map((op, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span
                        className={`font-mono ${
                          op.operation === 'resize' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {op.operation}
                      </span>
                      <span className="text-gray-600">{op.cost} cost</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Other Amortized Analysis Techniques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🔄 Aggregate Analysis</h4>
            <p className="text-purple-700 text-sm mb-2">
              Sum all operations and divide by total operations to get amortized cost.
            </p>
            <div className="bg-white rounded p-2 font-mono text-xs text-purple-800">
              Total Cost / Total Operations = Amortized Cost
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-2">🏦 Accounting Method</h4>
            <p className="text-indigo-700 text-sm mb-2">
              Charge more for cheap operations, save credits for expensive ones.
            </p>
            <div className="bg-white rounded p-2 font-mono text-xs text-indigo-800">
              Overcharge cheap ops → Pay for expensive ops
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-semibold text-pink-800 mb-2">🔮 Potential Method</h4>
            <p className="text-pink-700 text-sm mb-2">
              Track potential energy that can be released during expensive operations.
            </p>
            <div className="bg-white rounded p-2 font-mono text-xs text-pink-800">
              Φ(D₀) - Φ(D₁) ≤ cᵢ
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-semibold text-teal-800 mb-2">📚 Real-World Examples</h4>
            <ul className="text-teal-700 text-sm space-y-1">
              <li>• Hash table resizing</li>
              <li>• Splay tree operations</li>
              <li>• Union-find with path compression</li>
            </ul>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const renderComplexityClasses = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Computational Complexity Classes
        </h3>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {complexityClasses.map((cls) => (
                <div key={cls.name} className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                      cls.color === 'green'
                        ? 'bg-green-500'
                        : cls.color === 'yellow'
                          ? 'bg-yellow-500'
                          : cls.color === 'red'
                            ? 'bg-red-500'
                            : 'bg-purple-500'
                    } text-white font-bold text-lg`}
                  >
                    {cls.name}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                      cls.hardness === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : cls.hardness === 'hard'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cls.hardness}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complexityClasses.map((cls) => (
            <div
              key={cls.name}
              className={`border-2 rounded-lg p-4 ${
                cls.color === 'green'
                  ? 'border-green-200 bg-green-50'
                  : cls.color === 'yellow'
                    ? 'border-yellow-200 bg-yellow-50'
                    : cls.color === 'red'
                      ? 'border-red-200 bg-red-50'
                      : 'border-purple-200 bg-purple-50'
              }`}
            >
              <h4
                className={`font-bold text-lg mb-2 ${
                  cls.color === 'green'
                    ? 'text-green-800'
                    : cls.color === 'yellow'
                      ? 'text-yellow-800'
                      : cls.color === 'red'
                        ? 'text-red-800'
                        : 'text-purple-800'
                }`}
              >
                {cls.name} Class
              </h4>
              <p
                className={`text-sm mb-3 ${
                  cls.color === 'green'
                    ? 'text-green-700'
                    : cls.color === 'yellow'
                      ? 'text-yellow-700'
                      : cls.color === 'red'
                        ? 'text-red-700'
                        : 'text-purple-700'
                }`}
              >
                {cls.description}
              </p>
              <div className="bg-white rounded p-3">
                <h5 className="font-semibold text-gray-900 mb-2 text-sm">Examples:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  {cls.examples.map((example, i) => (
                    <li key={i}>• {example}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The P vs NP Question</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              🤔 The Million Dollar Question
            </h4>
            <p className="text-gray-700 mb-4">
              Is P equal to NP? This is one of the most important unsolved problems in computer
              science, with a $1 million prize from the Clay Mathematics Institute.
            </p>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-800 text-sm">P = NP would mean:</div>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• Every problem with easy verification has an easy solution</li>
                  <li>• Cryptography as we know it would be broken</li>
                  <li>• Many optimization problems become tractable</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="font-semibold text-orange-800 text-sm">P ≠ NP would mean:</div>
                <ul className="text-orange-700 text-sm mt-1 space-y-1">
                  <li>• Some problems are fundamentally harder to solve than verify</li>
                  <li>• Current cryptographic systems remain secure</li>
                  <li>• We need different approaches for hard problems</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🔗 Class Relationships</h4>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                    P
                  </div>
                  <div className="text-xs text-gray-600">Easy to solve</div>
                </div>

                <div className="mx-4 text-2xl text-gray-400">⊆</div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                    NP
                  </div>
                  <div className="text-xs text-gray-600">Easy to verify</div>
                </div>

                <div className="mx-4 text-2xl text-gray-400">⊆</div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                    NP-C
                  </div>
                  <div className="text-xs text-gray-600">Hardest in NP</div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 mt-4">
                If P = NP, then all these classes collapse into one
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const renderDistributedSystems = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Complexity in Distributed Systems
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Distributed Computing Challenges
            </h4>
            <p className="text-gray-700 mb-4">
              Distributed systems introduce new complexity factors beyond single-machine algorithms.
            </p>

            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-semibold text-red-800 text-sm">Network Communication</h5>
                <p className="text-red-700 text-xs">Messages can be lost, delayed, or reordered</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h5 className="font-semibold text-orange-800 text-sm">Partial Failures</h5>
                <p className="text-orange-700 text-xs">
                  Some components fail while others continue working
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-semibold text-yellow-800 text-sm">Concurrency</h5>
                <p className="text-yellow-700 text-xs">
                  Multiple processes executing simultaneously
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-semibold text-blue-800 text-sm">Clock Synchronization</h5>
                <p className="text-blue-700 text-xs">No global clock - time is relative</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Distributed Complexity Classes
            </h4>

            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="font-semibold text-emerald-800 text-sm mb-1">
                  SYNC (Synchronous)
                </div>
                <p className="text-emerald-700 text-xs">
                  All processors run in lockstep with global clock
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-800 text-sm mb-1">ASYNC (Asynchronous)</div>
                <p className="text-blue-700 text-xs">
                  No timing assumptions, messages can be delayed
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="font-semibold text-purple-800 text-sm mb-1">WAIT-FREE</div>
                <p className="text-purple-700 text-xs">
                  Progress guaranteed even if some processors fail
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="font-semibold text-indigo-800 text-sm mb-1">FAULT-TOLERANT</div>
                <p className="text-indigo-700 text-xs">
                  System continues working despite component failures
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Consensus Problem Complexity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">✅</div>
              <h4 className="font-bold text-green-800">Synchronous Systems</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              With reliable timing, consensus is possible
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-2 rounded">Paxos algorithm</div>
              <div className="bg-green-50 p-2 rounded">Raft consensus</div>
              <div className="bg-green-50 p-2 rounded">FLP impossibility doesn't apply</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-red-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">❌</div>
              <h4 className="font-bold text-red-800">Asynchronous Systems</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              FLP impossibility: No deterministic consensus
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-red-50 p-2 rounded">FLP result (1985)</div>
              <div className="bg-red-50 p-2 rounded">Randomization helps</div>
              <div className="bg-red-50 p-2 rounded">Partial synchrony models</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h4 className="font-bold text-yellow-800">With Failures</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Fault tolerance requires careful design</p>
            <div className="space-y-2 text-sm">
              <div className="bg-yellow-50 p-2 rounded">Byzantine generals</div>
              <div className="bg-yellow-50 p-2 rounded">Crash failures</div>
              <div className="bg-yellow-50 p-2 rounded">Network partitions</div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const renderOptimizationWorkshop = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Advanced Optimization Techniques
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Optimization Strategies</h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h5 className="font-semibold text-emerald-800 mb-2">Preprocessing</h5>
                <p className="text-emerald-700 text-sm mb-2">
                  Do expensive work once, reuse results for multiple queries.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-emerald-800">
                  O(n) preprocessing → O(1) queries
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">Caching & Memoization</h5>
                <p className="text-blue-700 text-sm mb-2">
                  Store results of expensive computations for reuse.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-blue-800">
                  Fibonacci: O(2^n) → O(n) with memoization
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-2">Approximation Algorithms</h5>
                <p className="text-purple-700 text-sm mb-2">
                  Find near-optimal solutions when exact solutions are too slow.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-purple-800">
                  NP-Hard → Polynomial approximation
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Advanced Data Structures
            </h4>

            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h5 className="font-semibold text-indigo-800 mb-2">Union-Find (Disjoint Sets)</h5>
                <p className="text-indigo-700 text-sm mb-2">
                  Nearly constant-time connectivity queries with path compression.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-indigo-800">
                  Amortized O(α(n)) ≈ O(1)
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h5 className="font-semibold text-pink-800 mb-2">Segment Trees & Fenwick Trees</h5>
                <p className="text-pink-700 text-sm mb-2">
                  Efficient range queries and updates on arrays.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-pink-800">
                  O(log n) range queries & updates
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h5 className="font-semibold text-teal-800 mb-2">Bloom Filters</h5>
                <p className="text-teal-700 text-sm mb-2">
                  Space-efficient probabilistic set membership testing.
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs text-teal-800">
                  O(k) time, minimal space
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Optimization Case Studies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-3">🔍 String Searching Optimization</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-2 rounded">
                <strong>Problem:</strong> Find substring in large text
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Naive:</strong> O(n×m) - check every position
              </div>
              <div className="bg-white p-2 rounded">
                <strong>KMP Algorithm:</strong> O(n+m) preprocessing + O(n) search
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Boyer-Moore:</strong> O(n/m) average case - skips characters
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-800 mb-3">🗺️ Shortest Path Optimization</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-2 rounded">
                <strong>Problem:</strong> Find shortest path in weighted graph
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Dijkstra:</strong> O((V+E) log V) with binary heap
              </div>
              <div className="bg-white p-2 rounded">
                <strong>A* Search:</strong> O(b^d) with good heuristic
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Floyd-Warshall:</strong> O(V³) for all-pairs
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-bold text-purple-800 mb-3">🧬 Dynamic Programming Optimization</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-2 rounded">
                <strong>Problem:</strong> Optimize recursive solutions
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Memoization:</strong> Top-down with caching
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Tabulation:</strong> Bottom-up iterative approach
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Space Optimization:</strong> Reduce memory usage
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-bold text-orange-800 mb-3">🔢 Number Theory Optimization</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-2 rounded">
                <strong>Problem:</strong> Primality testing, factorization
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Trial Division:</strong> O(√n) for small n
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Miller-Rabin:</strong> O(k log³ n) probabilistic
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Pollard Rho:</strong> O(n^¼) for factorization
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Topic Selector */}
      {renderTopicSelector()}

      {/* Topic Content */}
      {selectedTopic === 'amortized' && renderAmortizedAnalysis()}
      {selectedTopic === 'complexity-classes' && renderComplexityClasses()}
      {selectedTopic === 'distributed' && renderDistributedSystems()}
      {selectedTopic === 'optimization' && renderOptimizationWorkshop()}

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Real-World Applications"
            description="See Big-O applied to sorting, searching, data structures, and optimization problems."
            colorScheme="emerald"
            onClick={() => (window.location.href = '/bigo?section=real-world-applications')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Test your advanced Big-O knowledge with complex coding challenges and optimization problems."
            colorScheme="blue"
            onClick={() => (window.location.href = '/bigo?section=practice-challenges')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Gamification Hub"
            description="Earn achievements and compete with other developers in complexity analysis challenges."
            colorScheme="purple"
            onClick={() => (window.location.href = '/bigo?section=gamification-hub')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Advanced Topics Overview</h3>
        <div className="space-y-3 text-sm">
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedTopic === 'amortized'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedTopic('amortized')}
          >
            ⚖️ Amortized Analysis
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedTopic === 'complexity-classes'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedTopic('complexity-classes')}
          >
            🧩 Complexity Classes
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedTopic === 'distributed'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedTopic('distributed')}
          >
            🌐 Distributed Systems
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedTopic === 'optimization'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedTopic('optimization')}
          >
            🔬 Advanced Optimization
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Key Advanced Concepts</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            ⚖️ <strong>Amortized Analysis:</strong> Average over sequences
          </p>
          <p>
            🧩 <strong>P vs NP:</strong> Million dollar question
          </p>
          <p>
            🌐 <strong>FLP Impossibility:</strong> Consensus limits
          </p>
          <p>
            🔄 <strong>Approximation:</strong> Near-optimal solutions
          </p>
          <p>
            💾 <strong>Memoization:</strong> Caching subproblems
          </p>
          <p>
            🎯 <strong>Preprocessing:</strong> Invest upfront for speed
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Research Frontiers</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🔬 <strong>Quantum Computing:</strong> New complexity classes
          </p>
          <p>
            🤖 <strong>Machine Learning:</strong> Optimization landscapes
          </p>
          <p>
            🔐 <strong>Cryptography:</strong> Post-quantum security
          </p>
          <p>
            🌐 <strong>Blockchain:</strong> Consensus algorithms
          </p>
          <p>
            🧬 <strong>Bioinformatics:</strong> Sequence alignment
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Skills</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Algorithm Design:</strong> Choose optimal approaches
          </p>
          <p>
            🔍 <strong>Complexity Analysis:</strong> Prove algorithm bounds
          </p>
          <p>
            ⚡ <strong>Optimization:</strong> Improve performance bottlenecks
          </p>
          <p>
            📊 <strong>Trade-off Analysis:</strong> Time vs space decisions
          </p>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="bigo"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready for Practice Challenges?"
        description="Test your advanced Big-O knowledge with interactive coding problems and optimization challenges."
        buttonText="Start Challenges"
        onButtonClick={() => (window.location.href = '/bigo?section=practice-challenges')}
        colorScheme="emerald"
      />
    </>
  );
};

export default AdvancedTopics;
