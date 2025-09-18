import React, { useEffect, useState } from 'react';

interface MemoryManagement2DProps {
  activeStep: number;
  onAnimationStateChange: (isAnimating: boolean) => void;
}

interface MemoryObject {
  id: string;
  type: 'object' | 'array' | 'function';
  size: number;
  generation: 'young' | 'old' | 'large';
  marked: boolean;
  reachable: boolean;
  x: number;
  y: number;
  age: number;
}

const MemoryManagement2D: React.FC<MemoryManagement2DProps> = ({
  activeStep,
  onAnimationStateChange,
}) => {
  const [objects, setObjects] = useState<MemoryObject[]>([]);
  const [gcRoots] = useState<string[]>(['global', 'stack1', 'stack2']);
  const [currentPhase, setCurrentPhase] = useState<
    'idle' | 'allocating' | 'scavenging' | 'marking' | 'sweeping' | 'compacting'
  >('idle');

  // Initialize objects based on step
  useEffect(() => {
    onAnimationStateChange(true);

    const timer = setTimeout(() => {
      switch (activeStep) {
        case 0: // Memory Allocation
          initializeObjects();
          setCurrentPhase('allocating');
          break;
        case 1: // Young Generation Collection
          performScavenging();
          setCurrentPhase('scavenging');
          break;
        case 2: // Promotion to Old Generation
          promoteObjects();
          setCurrentPhase('idle');
          break;
        case 3: // Mark Phase
          performMarking();
          setCurrentPhase('marking');
          break;
        case 4: // Sweep Phase
          performSweeping();
          setCurrentPhase('sweeping');
          break;
        case 5: // Compaction
          performCompaction();
          setCurrentPhase('compacting');
          break;
        default:
          initializeObjects();
      }

      setTimeout(() => {
        onAnimationStateChange(false);
      }, 1000);
    }, 200);

    return () => clearTimeout(timer);
  }, [activeStep, onAnimationStateChange]);

  const initializeObjects = () => {
    const newObjects: MemoryObject[] = [
      // Young generation objects
      {
        id: 'obj1',
        type: 'object',
        size: 24,
        generation: 'young',
        marked: false,
        reachable: true,
        x: 50,
        y: 100,
        age: 0,
      },
      {
        id: 'obj2',
        type: 'array',
        size: 40,
        generation: 'young',
        marked: false,
        reachable: true,
        x: 120,
        y: 100,
        age: 0,
      },
      {
        id: 'obj3',
        type: 'function',
        size: 16,
        generation: 'young',
        marked: false,
        reachable: true,
        x: 190,
        y: 100,
        age: 0,
      },
      {
        id: 'obj4',
        type: 'object',
        size: 32,
        generation: 'young',
        marked: false,
        reachable: false,
        x: 260,
        y: 100,
        age: 0,
      },
      {
        id: 'obj5',
        type: 'array',
        size: 20,
        generation: 'young',
        marked: false,
        reachable: false,
        x: 330,
        y: 100,
        age: 0,
      },

      // Old generation objects
      {
        id: 'obj6',
        type: 'object',
        size: 48,
        generation: 'old',
        marked: false,
        reachable: true,
        x: 50,
        y: 300,
        age: 5,
      },
      {
        id: 'obj7',
        type: 'function',
        size: 28,
        generation: 'old',
        marked: false,
        reachable: true,
        x: 150,
        y: 300,
        age: 3,
      },
      {
        id: 'obj8',
        type: 'object',
        size: 36,
        generation: 'old',
        marked: false,
        reachable: false,
        x: 250,
        y: 300,
        age: 2,
      },

      // Large object
      {
        id: 'obj9',
        type: 'array',
        size: 120,
        generation: 'large',
        marked: false,
        reachable: true,
        x: 400,
        y: 200,
        age: 1,
      },
    ];
    setObjects(newObjects);
  };

  const performScavenging = () => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.generation === 'young') {
          if (obj.reachable) {
            // Move to survivor space (slightly down)
            return { ...obj, y: obj.y + 50, age: obj.age + 1 };
          } else {
            // Mark for removal (fade out)
            return { ...obj, marked: true };
          }
        }
        return obj;
      })
    );
  };

  const promoteObjects = () => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.generation === 'young' && obj.age > 1 && obj.reachable) {
          // Promote to old generation
          return {
            ...obj,
            generation: 'old',
            y: 300,
            x: Math.min(obj.x, 300),
            age: obj.age + 1,
          };
        }
        return obj;
      })
    );
  };

  const performMarking = () => {
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        marked: obj.reachable,
      }))
    );
  };

  const performSweeping = () => {
    setObjects((prev) => prev.filter((obj) => obj.marked || obj.reachable));
  };

  const performCompaction = () => {
    setObjects((prev) => {
      const youngObjects = prev
        .filter((obj) => obj.generation === 'young')
        .map((obj, index) => ({
          ...obj,
          x: 50 + index * 60,
          y: 100,
        }));

      const oldObjects = prev
        .filter((obj) => obj.generation === 'old')
        .map((obj, index) => ({
          ...obj,
          x: 50 + index * 80,
          y: 300,
        }));

      const largeObjects = prev
        .filter((obj) => obj.generation === 'large')
        .map((obj, index) => ({
          ...obj,
          x: 400 + index * 140,
          y: 200,
        }));

      return [...youngObjects, ...oldObjects, ...largeObjects];
    });
  };

  const getObjectColor = (obj: MemoryObject) => {
    if (currentPhase === 'marking' && obj.marked) return '#10B981'; // green
    if (currentPhase === 'sweeping' && !obj.marked && !obj.reachable) return '#EF4444'; // red
    if (obj.generation === 'young') return '#3B82F6'; // blue
    if (obj.generation === 'old') return '#8B5CF6'; // purple
    if (obj.generation === 'large') return '#F59E0B'; // amber
    return '#6B7280'; // gray
  };

  const getObjectOpacity = (obj: MemoryObject) => {
    if (currentPhase === 'sweeping' && !obj.marked && !obj.reachable) return 0.3;
    return 1;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Memory Heap Visualization */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <svg
          viewBox="0 0 600 450"
          className="w-full h-96 border-2 border-gray-200 rounded-lg bg-white"
        >
          {/* Memory Regions */}
          <defs>
            <pattern id="youngGen" patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill="#EBF8FF" />
              <rect width="5" height="5" fill="#DBEAFE" />
            </pattern>
            <pattern id="oldGen" patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill="#F3E8FF" />
              <rect width="5" height="5" fill="#E9D5FF" />
            </pattern>
            <pattern id="largeObj" patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill="#FEF3C7" />
              <rect width="5" height="5" fill="#FDE68A" />
            </pattern>
          </defs>

          {/* Young Generation Area */}
          <rect
            x="20"
            y="60"
            width="360"
            height="120"
            fill="url(#youngGen)"
            stroke="#3B82F6"
            strokeWidth="2"
            rx="8"
          />
          <text x="25" y="50" className="text-sm font-semibold" fill="#1E40AF">
            Young Generation (Eden + Survivor)
          </text>

          {/* Old Generation Area */}
          <rect
            x="20"
            y="260"
            width="360"
            height="120"
            fill="url(#oldGen)"
            stroke="#8B5CF6"
            strokeWidth="2"
            rx="8"
          />
          <text x="25" y="250" className="text-sm font-semibold" fill="#6B21A8">
            Old Generation
          </text>

          {/* Large Object Space */}
          <rect
            x="400"
            y="160"
            width="180"
            height="120"
            fill="url(#largeObj)"
            stroke="#F59E0B"
            strokeWidth="2"
            rx="8"
          />
          <text x="405" y="150" className="text-sm font-semibold" fill="#92400E">
            Large Object Space
          </text>

          {/* GC Roots */}
          <g>
            <rect
              x="20"
              y="10"
              width="60"
              height="30"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="2"
              rx="4"
            />
            <text x="25" y="30" className="text-xs font-semibold" fill="white">
              GC Roots
            </text>
            {gcRoots.map((root, index) => (
              <g key={root}>
                <circle cx={30 + index * 20} cy={45} r="3" fill="#DC2626" />
                <text x={20 + index * 20} y={58} className="text-xs" fill="#DC2626">
                  {root}
                </text>
              </g>
            ))}
          </g>

          {/* Memory Objects */}
          {objects.map((obj) => (
            <g key={obj.id} style={{ transition: 'all 0.8s ease-in-out' }}>
              <rect
                x={obj.x}
                y={obj.y}
                width={Math.max(obj.size, 30)}
                height="30"
                fill={getObjectColor(obj)}
                stroke={obj.marked ? '#10B981' : '#374151'}
                strokeWidth={obj.marked ? '3' : '1'}
                rx="4"
                opacity={getObjectOpacity(obj)}
                style={{ transition: 'all 0.8s ease-in-out' }}
              />
              <text
                x={obj.x + Math.max(obj.size, 30) / 2}
                y={obj.y + 20}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill="white"
                opacity={getObjectOpacity(obj)}
              >
                {obj.type}
              </text>

              {/* Reference lines for reachable objects */}
              {obj.reachable && currentPhase === 'marking' && (
                <line
                  x1={30}
                  y1={45}
                  x2={obj.x + Math.max(obj.size, 30) / 2}
                  y2={obj.y}
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              )}

              {/* Age indicator */}
              {obj.age > 0 && (
                <circle
                  cx={obj.x + Math.max(obj.size, 30) - 8}
                  cy={obj.y + 8}
                  r="6"
                  fill="#F59E0B"
                  stroke="white"
                  strokeWidth="1"
                />
              )}
              {obj.age > 0 && (
                <text
                  x={obj.x + Math.max(obj.size, 30) - 8}
                  y={obj.y + 12}
                  textAnchor="middle"
                  className="text-xs font-bold"
                  fill="white"
                >
                  {obj.age}
                </text>
              )}
            </g>
          ))}

          {/* Current Phase Indicator */}
          <rect
            x="450"
            y="10"
            width="130"
            height="40"
            fill="#1F2937"
            stroke="#4B5563"
            strokeWidth="2"
            rx="6"
          />
          <text x="515" y="25" textAnchor="middle" className="text-sm font-semibold" fill="white">
            Current Phase:
          </text>
          <text x="515" y="40" textAnchor="middle" className="text-sm font-bold" fill="#10B981">
            {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </text>
        </svg>
      </div>

      {/* Memory Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600">Young Generation</h3>
          <div className="text-2xl font-bold text-blue-600">
            {objects.filter((obj) => obj.generation === 'young').length}
          </div>
          <p className="text-xs text-gray-500">Objects</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600">Old Generation</h3>
          <div className="text-2xl font-bold text-purple-600">
            {objects.filter((obj) => obj.generation === 'old').length}
          </div>
          <p className="text-xs text-gray-500">Objects</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-amber-500">
          <h3 className="text-sm font-semibold text-gray-600">Large Objects</h3>
          <div className="text-2xl font-bold text-amber-600">
            {objects.filter((obj) => obj.generation === 'large').length}
          </div>
          <p className="text-xs text-gray-500">Objects</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600">Reachable</h3>
          <div className="text-2xl font-bold text-green-600">
            {objects.filter((obj) => obj.reachable).length}
          </div>
          <p className="text-xs text-gray-500">Objects</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Young Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Old Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm">Large Objects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-sm">Marked (Reachable)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded opacity-50"></div>
            <span className="text-sm">Garbage (Unreachable)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm">GC Roots</span>
          </div>
        </div>
      </div>

      {/* Algorithm Details */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Algorithm Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Scavenger (Young Generation)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Semi-space copying collector</li>
              <li>• Fast allocation in Eden space</li>
              <li>• Copies live objects to survivor space</li>
              <li>• Promotes long-lived objects to old generation</li>
              <li>• Runs frequently with low pause times</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Mark-and-Sweep (Old Generation)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Tri-color marking algorithm</li>
              <li>• Marks reachable objects from GC roots</li>
              <li>• Sweeps unmarked objects</li>
              <li>• Optional compaction to reduce fragmentation</li>
              <li>• Runs less frequently with longer pause times</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Generational Hypothesis</h4>
          <p className="text-sm text-blue-700">
            "Most objects die young" - This fundamental principle drives the generational design. By
            segregating objects by age, the garbage collector can optimize for the common case where
            short-lived objects become garbage quickly, while long-lived objects remain stable in
            the old generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement2D;
