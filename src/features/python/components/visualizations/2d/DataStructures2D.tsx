import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface DataStructureItem {
  key?: string;
  value: string;
  color: string;
  highlight?: boolean;
}

interface DataStructureStep {
  title: string;
  description: string;
  structureType: 'list' | 'dict' | 'set' | 'tuple';
  items: DataStructureItem[];
  operation: string;
  codeSnippet: string;
  explanation: string[];
}

const DataStructures2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'list' | 'dict' | 'set' | 'tuple'>('list');

  const listSteps = useMemo<DataStructureStep[]>(
    () => [
      {
        title: 'List Creation',
        description: 'Lists are ordered, mutable sequences',
        structureType: 'list',
        items: [
          { value: '"apple"', color: '#3b82f6' },
          { value: '"banana"', color: '#8b5cf6' },
          { value: '"cherry"', color: '#ef4444' },
        ],
        operation: 'Create',
        codeSnippet: 'fruits = ["apple", "banana", "cherry"]',
        explanation: [
          'Lists preserve insertion order',
          'Elements are accessed by index (0-based)',
          'Lists can contain mixed types',
        ],
      },
      {
        title: 'List Append',
        description: 'Adding an element to the end – O(1)',
        structureType: 'list',
        items: [
          { value: '"apple"', color: '#3b82f6' },
          { value: '"banana"', color: '#8b5cf6' },
          { value: '"cherry"', color: '#ef4444' },
          { value: '"date"', color: '#10b981', highlight: true },
        ],
        operation: 'append()',
        codeSnippet: 'fruits.append("date")  # O(1) amortized',
        explanation: [
          'append() adds to the end in O(1) amortized time',
          'The list may resize its internal array',
          'Much faster than insert at beginning',
        ],
      },
      {
        title: 'List Insert',
        description: 'Inserting at index 1 – O(n) due to shifting',
        structureType: 'list',
        items: [
          { value: '"apple"', color: '#3b82f6' },
          { value: '"grape"', color: '#f59e0b', highlight: true },
          { value: '"banana"', color: '#8b5cf6' },
          { value: '"cherry"', color: '#ef4444' },
          { value: '"date"', color: '#10b981' },
        ],
        operation: 'insert(1, x)',
        codeSnippet: 'fruits.insert(1, "grape")  # O(n)',
        explanation: [
          'insert() shifts all elements after index',
          'This is O(n) where n is list length',
          'For frequent insertions, consider deque',
        ],
      },
      {
        title: 'List Slice',
        description: 'Extracting a sub-list with slicing',
        structureType: 'list',
        items: [
          { value: '"apple"', color: '#3b82f6' },
          { value: '"grape"', color: '#f59e0b', highlight: true },
          { value: '"banana"', color: '#8b5cf6', highlight: true },
          { value: '"cherry"', color: '#ef4444' },
          { value: '"date"', color: '#10b981' },
        ],
        operation: 'slice [1:3]',
        codeSnippet: 'sub = fruits[1:3]  # ["grape", "banana"]',
        explanation: [
          'Slicing creates a new list (shallow copy)',
          'Syntax: list[start:stop:step]',
          'Negative indices count from the end',
        ],
      },
      {
        title: 'List Comprehension',
        description: 'Creating a new list with a concise expression',
        structureType: 'list',
        items: [
          { value: '0', color: '#3b82f6', highlight: true },
          { value: '1', color: '#8b5cf6', highlight: true },
          { value: '4', color: '#ef4444', highlight: true },
          { value: '9', color: '#10b981', highlight: true },
          { value: '16', color: '#f59e0b', highlight: true },
        ],
        operation: 'comprehension',
        codeSnippet: 'squares = [x**2 for x in range(5)]',
        explanation: [
          'List comprehensions are Pythonic and concise',
          'Faster than equivalent for-loop + append',
          'Can include conditions: [x for x in lst if x > 0]',
        ],
      },
    ],
    []
  );

  const dictSteps = useMemo<DataStructureStep[]>(
    () => [
      {
        title: 'Dictionary Creation',
        description: 'Key-value pairs with O(1) average lookup',
        structureType: 'dict',
        items: [
          { key: '"name"', value: '"Alice"', color: '#3b82f6' },
          { key: '"age"', value: '30', color: '#8b5cf6' },
          { key: '"city"', value: '"NYC"', color: '#ef4444' },
        ],
        operation: 'Create',
        codeSnippet: 'person = {"name": "Alice", "age": 30, "city": "NYC"}',
        explanation: [
          'Dicts use hash tables for O(1) average lookup',
          'Keys must be immutable (str, int, tuple)',
          'Preserves insertion order (Python 3.7+)',
        ],
      },
      {
        title: 'Dictionary Access',
        description: 'Accessing values by key',
        structureType: 'dict',
        items: [
          { key: '"name"', value: '"Alice"', color: '#3b82f6', highlight: true },
          { key: '"age"', value: '30', color: '#8b5cf6' },
          { key: '"city"', value: '"NYC"', color: '#ef4444' },
        ],
        operation: 'get(key)',
        codeSnippet:
          'name = person["name"]      # "Alice"\nsafe = person.get("email")  # None (no KeyError)',
        explanation: [
          '[] raises KeyError if key missing',
          '.get() returns None (or default) if missing',
          'Hash collision resolution: open addressing',
        ],
      },
      {
        title: 'Dictionary Update',
        description: 'Adding and updating entries',
        structureType: 'dict',
        items: [
          { key: '"name"', value: '"Alice"', color: '#3b82f6' },
          { key: '"age"', value: '31', color: '#8b5cf6', highlight: true },
          { key: '"city"', value: '"NYC"', color: '#ef4444' },
          { key: '"email"', value: '"a@b.c"', color: '#10b981', highlight: true },
        ],
        operation: 'update',
        codeSnippet:
          'person["age"] = 31          # update existing\nperson["email"] = "a@b.c"  # add new key',
        explanation: [
          'Assignment creates or updates a key',
          'update() merges another dict',
          'Dict comprehension: {k: v for k, v in items}',
        ],
      },
      {
        title: 'Dictionary Iteration',
        description: 'Iterating over keys, values, and items',
        structureType: 'dict',
        items: [
          { key: '"name"', value: '"Alice"', color: '#3b82f6', highlight: true },
          { key: '"age"', value: '31', color: '#8b5cf6', highlight: true },
          { key: '"city"', value: '"NYC"', color: '#ef4444', highlight: true },
          { key: '"email"', value: '"a@b.c"', color: '#10b981', highlight: true },
        ],
        operation: 'iterate',
        codeSnippet: 'for key, value in person.items():\n    print(f"{key}: {value}")',
        explanation: [
          '.keys() → view of keys',
          '.values() → view of values',
          '.items() → view of (key, value) tuples',
        ],
      },
    ],
    []
  );

  const setSteps = useMemo<DataStructureStep[]>(
    () => [
      {
        title: 'Set Creation',
        description: 'Unordered collection of unique elements',
        structureType: 'set',
        items: [
          { value: '1', color: '#3b82f6' },
          { value: '2', color: '#8b5cf6' },
          { value: '3', color: '#ef4444' },
          { value: '5', color: '#10b981' },
        ],
        operation: 'Create',
        codeSnippet: 'nums = {1, 2, 3, 5}\n# duplicates removed: {1, 1, 2} → {1, 2}',
        explanation: [
          'Sets automatically remove duplicates',
          'Elements must be hashable (immutable)',
          'Unordered – no index access',
        ],
      },
      {
        title: 'Set Operations',
        description: 'Union, intersection, difference',
        structureType: 'set',
        items: [
          { value: '1', color: '#3b82f6' },
          { value: '2', color: '#8b5cf6', highlight: true },
          { value: '3', color: '#ef4444', highlight: true },
          { value: '5', color: '#10b981' },
        ],
        operation: 'intersection',
        codeSnippet:
          'a = {1, 2, 3, 5}\nb = {2, 3, 4, 6}\nprint(a & b)   # {2, 3}  intersection\nprint(a | b)   # {1,2,3,4,5,6} union\nprint(a - b)   # {1, 5}  difference',
        explanation: [
          '& or .intersection() → common elements',
          '| or .union() → all elements',
          '- or .difference() → elements in first only',
        ],
      },
      {
        title: 'Set Membership',
        description: 'Fast O(1) membership testing',
        structureType: 'set',
        items: [
          { value: '1', color: '#3b82f6' },
          { value: '2', color: '#8b5cf6' },
          { value: '3', color: '#ef4444', highlight: true },
          { value: '5', color: '#10b981' },
        ],
        operation: 'in',
        codeSnippet:
          '3 in nums     # True  – O(1)\n10 in nums    # False – O(1)\n# vs list: 3 in [1,2,3,5] → O(n)',
        explanation: [
          '"in" operator is O(1) for sets (hash-based)',
          '"in" operator is O(n) for lists (linear scan)',
          'Use sets when you need fast membership tests',
        ],
      },
    ],
    []
  );

  const tupleSteps = useMemo<DataStructureStep[]>(
    () => [
      {
        title: 'Tuple Creation',
        description: 'Immutable ordered sequences',
        structureType: 'tuple',
        items: [
          { value: '"Alice"', color: '#3b82f6' },
          { value: '30', color: '#8b5cf6' },
          { value: '"NYC"', color: '#ef4444' },
        ],
        operation: 'Create',
        codeSnippet:
          'person = ("Alice", 30, "NYC")\nsingleton = (42,)  # trailing comma for single element',
        explanation: [
          'Tuples are immutable – cannot be modified',
          'Slightly faster than lists for iteration',
          'Can be used as dict keys (hashable)',
        ],
      },
      {
        title: 'Tuple Unpacking',
        description: 'Destructuring into variables',
        structureType: 'tuple',
        items: [
          { value: '"Alice"', color: '#3b82f6', highlight: true },
          { value: '30', color: '#8b5cf6', highlight: true },
          { value: '"NYC"', color: '#ef4444', highlight: true },
        ],
        operation: 'unpack',
        codeSnippet:
          'name, age, city = person\nprint(name)  # "Alice"\n\n# Extended unpacking\nfirst, *rest = (1, 2, 3, 4)  # rest = [2, 3, 4]',
        explanation: [
          'Unpack into matching number of variables',
          '* operator collects remaining elements',
          'Works with any iterable (lists, generators, etc.)',
        ],
      },
      {
        title: 'Named Tuples',
        description: 'Tuples with named fields',
        structureType: 'tuple',
        items: [
          { key: 'name', value: '"Alice"', color: '#3b82f6' },
          { key: 'age', value: '30', color: '#8b5cf6' },
          { key: 'city', value: '"NYC"', color: '#ef4444' },
        ],
        operation: 'namedtuple',
        codeSnippet:
          'from collections import namedtuple\nPoint = namedtuple("Point", ["x", "y"])\np = Point(3, 4)\nprint(p.x, p.y)  # 3 4',
        explanation: [
          'Named tuples add readable field names',
          'Still immutable like regular tuples',
          'Consider dataclasses for mutable alternative',
        ],
      },
    ],
    []
  );

  const allSteps: Record<string, DataStructureStep[]> = useMemo(
    () => ({
      list: listSteps,
      dict: dictSteps,
      set: setSteps,
      tuple: tupleSteps,
    }),
    [listSteps, dictSteps, setSteps, tupleSteps]
  );

  const steps = allSteps[activeTab];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  const handleStepBack = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const handleStepForward = useCallback(
    () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1)),
    [steps.length]
  );
  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const interval = window.setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 3000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const renderListOrTuple = (
    items: DataStructureItem[],
    type: 'list' | 'tuple'
  ): React.ReactNode => {
    const bracket = type === 'list' ? ['[', ']'] : ['(', ')'];
    return (
      <svg viewBox="0 0 700 200" className="w-full" style={{ maxHeight: '200px' }}>
        {/* Container bracket */}
        <text x="20" y="100" fontSize="40" fill="#9ca3af" fontFamily="monospace">
          {bracket[0]}
        </text>
        <text
          x={50 + items.length * 110}
          y="100"
          fontSize="40"
          fill="#9ca3af"
          fontFamily="monospace"
        >
          {bracket[1]}
        </text>

        {items.map((item, i) => (
          <g key={i}>
            {/* Index label */}
            <text
              x={65 + i * 110}
              y="30"
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
              fontFamily="monospace"
            >
              [{i}]
            </text>
            {/* Box */}
            <rect
              x={20 + i * 110}
              y="45"
              width="90"
              height="50"
              rx="8"
              fill={item.highlight ? `${item.color}30` : `${item.color}15`}
              stroke={item.color}
              strokeWidth={item.highlight ? 3 : 1.5}
              className="transition-all duration-500"
            />
            {/* Value */}
            <text
              x={65 + i * 110}
              y="76"
              fontSize="14"
              fill={item.color}
              textAnchor="middle"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {item.value}
            </text>
            {/* Arrow to next */}
            {i < items.length - 1 && (
              <line
                x1={110 + i * 110}
                y1="70"
                x2={120 + i * 110}
                y2="70"
                stroke="#d1d5db"
                strokeWidth="1"
                markerEnd="url(#arrow)"
              />
            )}
          </g>
        ))}

        {/* Memory info */}
        <text x="20" y="130" fontSize="11" fill="#6b7280">
          Type: {type} | Length: {items.length} | {type === 'list' ? 'Mutable' : 'Immutable'}
        </text>

        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#d1d5db" />
          </marker>
        </defs>
      </svg>
    );
  };

  const renderDict = (items: DataStructureItem[]): React.ReactNode => {
    return (
      <svg viewBox="0 0 700 250" className="w-full" style={{ maxHeight: '250px' }}>
        {/* Hash table header */}
        <text x="20" y="25" fontSize="13" fill="#6b7280" fontFamily="monospace">
          Hash Table (dict)
        </text>
        <line x1="20" y1="35" x2="680" y2="35" stroke="#e5e7eb" strokeWidth="1" />

        {items.map((item, i) => {
          const y = 55 + i * 45;
          return (
            <g key={i}>
              {/* Hash bucket */}
              <rect
                x="20"
                y={y}
                width="40"
                height="32"
                rx="4"
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth="1"
              />
              <text
                x="40"
                y={y + 21}
                fontSize="11"
                fill="#9ca3af"
                textAnchor="middle"
                fontFamily="monospace"
              >
                #{i}
              </text>

              {/* Arrow */}
              <line
                x1="60"
                y1={y + 16}
                x2="90"
                y2={y + 16}
                stroke="#d1d5db"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />

              {/* Key box */}
              <rect
                x="95"
                y={y}
                width="130"
                height="32"
                rx="6"
                fill={item.highlight ? '#dbeafe' : '#f0f9ff'}
                stroke={item.highlight ? '#3b82f6' : '#bfdbfe'}
                strokeWidth={item.highlight ? 2 : 1}
                className="transition-all duration-500"
              />
              <text
                x="160"
                y={y + 21}
                fontSize="13"
                fill="#1e40af"
                textAnchor="middle"
                fontWeight="600"
                fontFamily="monospace"
              >
                {item.key}
              </text>

              {/* Colon */}
              <text x="238" y={y + 21} fontSize="16" fill="#9ca3af" fontWeight="bold">
                :
              </text>

              {/* Value box */}
              <rect
                x="255"
                y={y}
                width="130"
                height="32"
                rx="6"
                fill={item.highlight ? `${item.color}20` : `${item.color}10`}
                stroke={item.color}
                strokeWidth={item.highlight ? 2 : 1}
                className="transition-all duration-500"
              />
              <text
                x="320"
                y={y + 21}
                fontSize="13"
                fill={item.color}
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderSet = (items: DataStructureItem[]): React.ReactNode => {
    const cx = 350;
    const cy = 110;
    const radius = 85;
    return (
      <svg viewBox="0 0 700 220" className="w-full" style={{ maxHeight: '220px' }}>
        {/* Set circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="#f5f3ff"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="6,3"
        />
        <text x={cx} y={30} fontSize="13" fill="#6b7280" textAnchor="middle" fontFamily="monospace">
          set {'{'} unordered, unique {'}'}
        </text>

        {items.map((item, i) => {
          const angle = (2 * Math.PI * i) / items.length - Math.PI / 2;
          const x = cx + (radius - 35) * Math.cos(angle);
          const y = cy + (radius - 35) * Math.sin(angle);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="25"
                fill={item.highlight ? `${item.color}30` : `${item.color}15`}
                stroke={item.color}
                strokeWidth={item.highlight ? 3 : 1.5}
                className="transition-all duration-500"
              />
              <text
                x={x}
                y={y + 5}
                fontSize="14"
                fill={item.color}
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderVisualization = (): React.ReactNode => {
    switch (step.structureType) {
      case 'list':
        return renderListOrTuple(step.items, 'list');
      case 'tuple':
        return renderListOrTuple(step.items, 'tuple');
      case 'dict':
        return renderDict(step.items);
      case 'set':
        return renderSet(step.items);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Data structure tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['list', 'dict', 'set', 'tuple'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Step info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-mono">
          {step.operation}
        </div>
      </div>

      {/* SVG Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">{renderVisualization()}</div>

      {/* Code snippet */}
      <div className="bg-[#1e1e2e] rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto">
        <pre className="whitespace-pre-wrap">{step.codeSnippet}</pre>
      </div>

      {/* Explanation */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h5 className="font-semibold text-amber-800 mb-2">💡 Key Points</h5>
        <ul className="space-y-1">
          {step.explanation.map((point, i) => (
            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Controls */}
      <VisualizationControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
};

export default React.memo(DataStructures2D);
