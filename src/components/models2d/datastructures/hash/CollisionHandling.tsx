import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import type { HashTableEntry } from '../../../../types/datastructures';

interface CollisionHandlingProps {
  strategy: 'chaining' | 'linear-probing' | 'quadratic-probing';
  onStrategyChange: (strategy: 'chaining' | 'linear-probing' | 'quadratic-probing') => void;
  className?: string;
}

const CollisionHandling: React.FC<CollisionHandlingProps> = ({
  strategy,
  onStrategyChange,
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState(strategy);
  const [showExplanation, setShowExplanation] = useState(false);
  const [demoTable, setDemoTable] = useState<(HashTableEntry | null)[]>([]);
  const [animationStep, setAnimationStep] = useState(0);

  // Demo data for collision scenarios
  const demoData = [
    { key: 'apple', value: '🍎' },
    { key: 'banana', value: '🍌' },
    { key: 'cherry', value: '🍒' }
  ];

  // Simple hash function for demo (all keys hash to index 2)
  const demoHash = (key: string) => key.length % 3; // Simple hash for demo

  useEffect(() => {
    setSelectedStrategy(strategy);
  }, [strategy]);

  useEffect(() => {
    // Initialize demo table
    const table = Array(7).fill(null);
    setDemoTable(table);
    setAnimationStep(0);
  }, [selectedStrategy]);

  const handleStrategyChange = (newStrategy: 'chaining' | 'linear-probing' | 'quadratic-probing') => {
    setSelectedStrategy(newStrategy);
    onStrategyChange(newStrategy);
  };

  const startDemo = () => {
    const table = Array(7).fill(null);
    setDemoTable(table);
    setAnimationStep(0);

    // Animate insertions
    demoData.forEach((item, index) => {
      setTimeout(() => {
        const newTable = [...table];
        const hash = demoHash(item.key);

        if (selectedStrategy === 'chaining') {
          // Chaining: add to the same slot
          if (newTable[hash]) {
            const existing = newTable[hash] as HashTableEntry;
            existing.collisionChain = existing.collisionChain || [];
            existing.collisionChain.push(`${item.key}-${Date.now()}`);
          } else {
            newTable[hash] = {
              id: `${item.key}-${Date.now()}`,
              key: item.key,
              value: item.value,
              bucket: hash,
              highlighted: true
            };
          }
        } else {
          // Open addressing
          let slot = hash;
          let probeCount = 0;

          while (newTable[slot] !== null && probeCount < 7) {
            probeCount++;
            if (selectedStrategy === 'linear-probing') {
              slot = (slot + 1) % 7;
            } else if (selectedStrategy === 'quadratic-probing') {
              slot = (hash + probeCount * probeCount) % 7;
            }
          }

          if (newTable[slot] === null) {
            newTable[slot] = {
              id: `${item.key}-${Date.now()}`,
              key: item.key,
              value: item.value,
              bucket: slot,
              highlighted: true
            };
          }
        }

        setDemoTable([...newTable]);
        setAnimationStep(index + 1);
      }, index * 1500);
    });
  };

  const getStrategyDescription = () => {
    switch (selectedStrategy) {
      case 'chaining':
        return {
          title: 'Separate Chaining',
          description: 'Each bucket contains a linked list of elements that hash to the same index.',
          pros: ['Simple to implement', 'Never fills up', 'Good performance with good hash function'],
          cons: ['Extra memory for pointers', 'Poor cache performance', 'Can degrade to O(n) in worst case'],
          complexity: 'Average: O(1), Worst: O(n)'
        };
      case 'linear-probing':
        return {
          title: 'Linear Probing',
          description: 'If a collision occurs, search linearly for the next empty slot.',
          pros: ['Good cache performance', 'No extra memory overhead', 'Simple implementation'],
          cons: ['Primary clustering', 'Table can fill up', 'Deletion is complex'],
          complexity: 'Average: O(1), Worst: O(n)'
        };
      case 'quadratic-probing':
        return {
          title: 'Quadratic Probing',
          description: 'If a collision occurs, probe at quadratic intervals (1², 2², 3², ...).',
          pros: ['Reduces primary clustering', 'Better than linear probing', 'Good cache performance'],
          cons: ['Secondary clustering', 'May not find empty slot if table > 50% full', 'Complex deletion'],
          complexity: 'Average: O(1), Worst: O(n)'
        };
    }
  };

  const strategyInfo = getStrategyDescription();

  return (
    <div className={`collision-handling ${className}`}>
      {/* Strategy Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Collision Resolution Strategies
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { key: 'chaining', label: 'Separate Chaining', color: 'blue' },
            { key: 'linear-probing', label: 'Linear Probing', color: 'green' },
            { key: 'quadratic-probing', label: 'Quadratic Probing', color: 'purple' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => handleStrategyChange(key as 'chaining' | 'linear-probing' | 'quadratic-probing')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStrategy === key
                  ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className={`text-sm font-medium ${
                selectedStrategy === key
                  ? `text-${color}-700 dark:text-${color}-300`
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* Strategy Explanation */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {strategyInfo.title}
            </h4>
            {showExplanation ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showExplanation && (
            <div className="mt-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {strategyInfo.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Advantages</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {strategyInfo.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Disadvantages</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {strategyInfo.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Time Complexity</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                  {strategyInfo.complexity}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Collision Demo: {strategyInfo.title}
          </h4>
          <button
            onClick={startDemo}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Start Demo</span>
          </button>
        </div>

        {/* Demo Table */}
        <div className="mb-4">
          <svg width="560" height="120" viewBox="0 0 560 120" className="w-full h-auto">
            {/* Table indices */}
            {Array.from({ length: 7 }, (_, i) => (
              <text
                key={`index-${i}`}
                x={50 + i * 80}
                y={20}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-600 dark:fill-gray-400"
              >
                [{i}]
              </text>
            ))}

            {/* Table slots */}
            {Array.from({ length: 7 }, (_, i) => (
              <g key={`slot-${i}`}>
                <rect
                  x={20 + i * 80}
                  y={30}
                  width={60}
                  height={40}
                  fill="transparent"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  rx={4}
                />
                
                {/* Entry display */}
                {demoTable[i] && (
                  <g>
                    <rect
                      x={22 + i * 80}
                      y={32}
                      width={56}
                      height={36}
                      fill={demoTable[i]!.highlighted ? '#dbeafe' : '#f3f4f6'}
                      stroke={demoTable[i]!.highlighted ? '#3b82f6' : '#9ca3af'}
                      strokeWidth={demoTable[i]!.highlighted ? 2 : 1}
                      rx={2}
                      className="transition-all duration-300"
                    />
                    <text
                      x={50 + i * 80}
                      y={45}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                    >
                      {demoTable[i]!.key}
                    </text>
                    <text
                      x={50 + i * 80}
                      y={58}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {demoTable[i]!.value}
                    </text>

                    {/* Collision chain indicator for chaining */}
                    {selectedStrategy === 'chaining' && demoTable[i]!.collisionChain?.length && (
                      <g>
                        <circle
                          cx={70 + i * 80}
                          cy={35}
                          r={8}
                          fill="#fbbf24"
                          stroke="#f59e0b"
                          strokeWidth={1}
                        />
                        <text
                          x={70 + i * 80}
                          y={39}
                          textAnchor="middle"
                          className="text-xs font-bold fill-white"
                        >
                          {demoTable[i]!.collisionChain!.length}
                        </text>
                      </g>
                    )}
                  </g>
                )}
              </g>
            ))}

            {/* Demo explanation */}
            <text
              x={280}
              y={100}
              textAnchor="middle"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              All demo keys hash to index 2 - watch how collisions are resolved!
            </text>
          </svg>
        </div>

        {/* Animation Progress */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Demo Progress
            </span>
            <span className="text-sm text-gray-500">
              {animationStep} / {demoData.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(animationStep / demoData.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollisionHandling;