import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface ClassBox {
  name: string;
  attributes: string[];
  methods: string[];
  x: number;
  y: number;
  color: string;
  highlight?: boolean;
}

interface OOPStep {
  title: string;
  description: string;
  classes: ClassBox[];
  arrows: { from: string; to: string; label: string }[];
  codeSnippet: string;
  explanation: string[];
}

const OOPVisualization2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo<OOPStep[]>(
    () => [
      {
        title: 'Class Definition',
        description: 'A class is a blueprint for creating objects',
        classes: [
          {
            name: 'Animal',
            attributes: ['name: str', 'sound: str'],
            methods: ['__init__()', 'speak()', '__repr__()'],
            x: 250,
            y: 30,
            color: '#3b82f6',
            highlight: true,
          },
        ],
        arrows: [],
        codeSnippet: `class Animal:\n    def __init__(self, name, sound):\n        self.name = name\n        self.sound = sound\n\n    def speak(self):\n        return f"{self.name} says {self.sound}!"`,
        explanation: [
          '__init__ is the constructor (called on instantiation)',
          'self refers to the current instance',
          'Attributes are instance variables stored on self',
          'Methods are functions defined inside the class',
        ],
      },
      {
        title: 'Inheritance',
        description: 'Child classes inherit from parent classes',
        classes: [
          {
            name: 'Animal',
            attributes: ['name: str', 'sound: str'],
            methods: ['__init__()', 'speak()'],
            x: 250,
            y: 10,
            color: '#3b82f6',
          },
          {
            name: 'Dog',
            attributes: ['breed: str'],
            methods: ['fetch()'],
            x: 100,
            y: 200,
            color: '#10b981',
            highlight: true,
          },
          {
            name: 'Cat',
            attributes: ['indoor: bool'],
            methods: ['purr()'],
            x: 400,
            y: 200,
            color: '#f59e0b',
            highlight: true,
          },
        ],
        arrows: [
          { from: 'Dog', to: 'Animal', label: 'inherits' },
          { from: 'Cat', to: 'Animal', label: 'inherits' },
        ],
        codeSnippet: `class Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name, "Woof")\n        self.breed = breed\n\n    def fetch(self):\n        return f"{self.name} fetches the ball!"\n\nclass Cat(Animal):\n    def __init__(self, name, indoor=True):\n        super().__init__(name, "Meow")\n        self.indoor = indoor`,
        explanation: [
          'Dog and Cat inherit name, sound, speak() from Animal',
          'super().__init__() calls the parent constructor',
          'Child classes can add new attributes and methods',
          'isinstance(Dog("Rex","Lab"), Animal) → True',
        ],
      },
      {
        title: 'Method Resolution Order (MRO)',
        description: 'Python uses C3 linearization for multiple inheritance',
        classes: [
          {
            name: 'A',
            attributes: [],
            methods: ['method()'],
            x: 280,
            y: 10,
            color: '#3b82f6',
          },
          {
            name: 'B',
            attributes: [],
            methods: ['method()'],
            x: 130,
            y: 120,
            color: '#8b5cf6',
            highlight: true,
          },
          {
            name: 'C',
            attributes: [],
            methods: ['method()'],
            x: 430,
            y: 120,
            color: '#ef4444',
            highlight: true,
          },
          {
            name: 'D',
            attributes: [],
            methods: [],
            x: 280,
            y: 230,
            color: '#10b981',
            highlight: true,
          },
        ],
        arrows: [
          { from: 'B', to: 'A', label: '' },
          { from: 'C', to: 'A', label: '' },
          { from: 'D', to: 'B', label: '' },
          { from: 'D', to: 'C', label: '' },
        ],
        codeSnippet: `class A:\n    def method(self): return "A"\n\nclass B(A):\n    def method(self): return "B"\n\nclass C(A):\n    def method(self): return "C"\n\nclass D(B, C):\n    pass\n\n# MRO: D → B → C → A → object\nprint(D().method())  # "B"\nprint(D.__mro__)`,
        explanation: [
          'MRO determines method lookup order',
          'Python uses C3 linearization algorithm',
          'D.method() → checks D, then B, then C, then A',
          'Use ClassName.__mro__ to inspect the order',
        ],
      },
      {
        title: 'Magic Methods (Dunder)',
        description: 'Special methods that customize class behavior',
        classes: [
          {
            name: 'Vector',
            attributes: ['x: float', 'y: float'],
            methods: [
              '__init__()',
              '__repr__()',
              '__add__()',
              '__len__()',
              '__eq__()',
              '__iter__()',
            ],
            x: 220,
            y: 20,
            color: '#8b5cf6',
            highlight: true,
          },
        ],
        arrows: [],
        codeSnippet: `class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __repr__(self):\n        return f"Vector({self.x}, {self.y})"\n\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __eq__(self, other):\n        return self.x == other.x and self.y == other.y\n\n    def __abs__(self):\n        return (self.x**2 + self.y**2) ** 0.5\n\nv1 = Vector(1, 2)\nv2 = Vector(3, 4)\nprint(v1 + v2)   # Vector(4, 6)\nprint(abs(v2))   # 5.0`,
        explanation: [
          '__repr__: string representation (repr/print)',
          '__add__: enables + operator between objects',
          '__eq__: enables == comparison',
          '__abs__: enables abs() built-in function',
        ],
      },
      {
        title: 'Dataclasses & Properties',
        description: 'Modern Python OOP with less boilerplate',
        classes: [
          {
            name: '@dataclass\nUser',
            attributes: ['name: str', 'age: int', 'email: str'],
            methods: ['(auto __init__)', '(auto __repr__)', '(auto __eq__)', '@property email'],
            x: 220,
            y: 20,
            color: '#10b981',
            highlight: true,
          },
        ],
        arrows: [],
        codeSnippet: `from dataclasses import dataclass, field\n\n@dataclass\nclass User:\n    name: str\n    age: int\n    email: str = ""\n    tags: list[str] = field(default_factory=list)\n\n    @property\n    def is_adult(self) -> bool:\n        return self.age >= 18\n\n    def __post_init__(self):\n        if self.age < 0:\n            raise ValueError("Age cannot be negative")\n\nalice = User("Alice", 30, "alice@example.com")\nprint(alice)           # User(name='Alice', age=30, ...)\nprint(alice.is_adult)  # True\nprint(alice == User("Alice", 30, "alice@example.com"))  # True`,
        explanation: [
          '@dataclass auto-generates __init__, __repr__, __eq__',
          '@property creates computed attributes (no parentheses)',
          '__post_init__ runs after __init__ for validation',
          'field(default_factory=list) for mutable defaults',
        ],
      },
    ],
    []
  );

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
    }, 4000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const getClassCenter = (cls: ClassBox): { cx: number; cy: number } => {
    const height = 40 + cls.attributes.length * 20 + cls.methods.length * 20;
    return { cx: cls.x + 80, cy: cls.y + height / 2 };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Step info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
        <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
      </div>

      {/* UML-style class diagram */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <svg viewBox="0 0 650 340" className="w-full" style={{ maxHeight: '340px' }}>
          <defs>
            <marker
              id="oopArrow"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
            <marker
              id="inheritArrow"
              markerWidth="12"
              markerHeight="8"
              refX="0"
              refY="4"
              orient="auto"
            >
              <polygon points="12 0, 0 4, 12 8" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            </marker>
          </defs>

          {/* Arrows */}
          {step.arrows.map((arrow, i) => {
            const fromCls = step.classes.find((c) => c.name === arrow.from);
            const toCls = step.classes.find((c) => c.name === arrow.to);
            if (!fromCls || !toCls) return null;
            const from = getClassCenter(fromCls);
            const to = getClassCenter(toCls);
            return (
              <g key={i}>
                <line
                  x1={from.cx}
                  y1={fromCls.y}
                  x2={to.cx}
                  y2={toCls.y + 40 + toCls.attributes.length * 20 + toCls.methods.length * 20}
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="6,3"
                  markerEnd="url(#inheritArrow)"
                />
                {arrow.label && (
                  <text
                    x={(from.cx + to.cx) / 2 + 10}
                    y={(fromCls.y + toCls.y + 40) / 2}
                    fontSize="10"
                    fill="#6b7280"
                    fontStyle="italic"
                  >
                    {arrow.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Class boxes */}
          {step.classes.map((cls, i) => {
            const boxWidth = 160;
            const nameHeight = 32;
            const attrHeight = Math.max(cls.attributes.length * 20, 10);
            const methHeight = Math.max(cls.methods.length * 20, 10);
            const totalHeight = nameHeight + attrHeight + methHeight + 12;

            return (
              <g key={i}>
                {/* Shadow */}
                <rect
                  x={cls.x + 2}
                  y={cls.y + 2}
                  width={boxWidth}
                  height={totalHeight}
                  rx="6"
                  fill="#00000010"
                />
                {/* Main box */}
                <rect
                  x={cls.x}
                  y={cls.y}
                  width={boxWidth}
                  height={totalHeight}
                  rx="6"
                  fill="white"
                  stroke={cls.color}
                  strokeWidth={cls.highlight ? 2.5 : 1.5}
                  className="transition-all duration-500"
                />
                {/* Class name header */}
                <rect
                  x={cls.x}
                  y={cls.y}
                  width={boxWidth}
                  height={nameHeight}
                  rx="6"
                  fill={`${cls.color}15`}
                />
                <rect
                  x={cls.x}
                  y={cls.y + nameHeight - 6}
                  width={boxWidth}
                  height="6"
                  fill={`${cls.color}15`}
                />
                <text
                  x={cls.x + boxWidth / 2}
                  y={cls.y + 21}
                  fontSize="13"
                  fill={cls.color}
                  textAnchor="middle"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {cls.name.includes('\n') ? cls.name.split('\n')[1] : cls.name}
                </text>
                {cls.name.includes('@') && (
                  <text
                    x={cls.x + boxWidth / 2}
                    y={cls.y + 10}
                    fontSize="9"
                    fill="#10b981"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cls.name.split('\n')[0]}
                  </text>
                )}

                {/* Divider */}
                <line
                  x1={cls.x + 5}
                  y1={cls.y + nameHeight}
                  x2={cls.x + boxWidth - 5}
                  y2={cls.y + nameHeight}
                  stroke={`${cls.color}40`}
                  strokeWidth="1"
                />

                {/* Attributes */}
                {cls.attributes.map((attr, j) => (
                  <text
                    key={`attr-${j}`}
                    x={cls.x + 10}
                    y={cls.y + nameHeight + 16 + j * 20}
                    fontSize="11"
                    fill="#4b5563"
                    fontFamily="monospace"
                  >
                    {attr}
                  </text>
                ))}

                {/* Divider */}
                <line
                  x1={cls.x + 5}
                  y1={cls.y + nameHeight + attrHeight + 2}
                  x2={cls.x + boxWidth - 5}
                  y2={cls.y + nameHeight + attrHeight + 2}
                  stroke={`${cls.color}40`}
                  strokeWidth="1"
                />

                {/* Methods */}
                {cls.methods.map((meth, j) => (
                  <text
                    key={`meth-${j}`}
                    x={cls.x + 10}
                    y={cls.y + nameHeight + attrHeight + 18 + j * 20}
                    fontSize="11"
                    fill="#7c3aed"
                    fontFamily="monospace"
                  >
                    {meth}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Code */}
      <div className="bg-[#1e1e2e] rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto">
        <pre className="whitespace-pre-wrap">{step.codeSnippet}</pre>
      </div>

      {/* Explanation */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h5 className="font-semibold text-purple-800 mb-2">💡 Key Points</h5>
        <ul className="space-y-1">
          {step.explanation.map((point, i) => (
            <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
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

export default React.memo(OOPVisualization2D);
