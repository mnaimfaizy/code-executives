import React, { useEffect, useState } from 'react';

interface MemoryLeaks2DProps {
  activeExample: number;
  onAnimationStateChange: (isAnimating: boolean) => void;
}

interface LeakObject {
  id: string;
  type: 'event-listener' | 'dom-node' | 'timer' | 'closure' | 'global-var' | 'circular-ref';
  name: string;
  size: number;
  x: number;
  y: number;
  leaked: boolean;
  connected: boolean;
  references: string[];
  age: number;
}

const MemoryLeaks2D: React.FC<MemoryLeaks2DProps> = ({ activeExample, onAnimationStateChange }) => {
  const [objects, setObjects] = useState<LeakObject[]>([]);
  const [memoryUsage, setMemoryUsage] = useState({ current: 0, max: 100 });
  const [currentPhase, setCurrentPhase] = useState<
    'initial' | 'leaking' | 'growing' | 'critical' | 'fixed'
  >('initial');
  const [leakCount, setLeakCount] = useState(0);

  // Initialize example based on activeExample
  useEffect(() => {
    onAnimationStateChange(true);

    const timer = setTimeout(() => {
      switch (activeExample) {
        case 0: // Event Listener Leak
          setupEventListenerLeak();
          break;
        case 1: // Circular Reference Leak
          setupCircularReferenceLeak();
          break;
        case 2: // Global Variable Leak
          setupGlobalVariableLeak();
          break;
        case 3: // Detached DOM Nodes
          setupDetachedDOMNodesLeak();
          break;
        case 4: // Timer Leak
          setupTimerLeak();
          break;
        default:
          setupEventListenerLeak();
      }

      setTimeout(() => {
        onAnimationStateChange(false);
      }, 1000);
    }, 200);

    return () => clearTimeout(timer);
  }, [activeExample, onAnimationStateChange]);

  // Simulate memory leak progression
  useEffect(() => {
    if (currentPhase === 'leaking') {
      const interval = setInterval(() => {
        setObjects((prev) => {
          const newObjects = [...prev];
          // Increase size of leaked objects
          newObjects.forEach((obj) => {
            if (obj.leaked) {
              obj.size = Math.min(obj.size + 2, 60);
              obj.age += 1;
            }
          });
          return newObjects;
        });

        setMemoryUsage((prev) => ({
          ...prev,
          current: Math.min(prev.current + 5, prev.max),
        }));

        setLeakCount((prev) => prev + 1);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [currentPhase]);

  const setupEventListenerLeak = () => {
    const newObjects: LeakObject[] = [
      // DOM Elements
      {
        id: 'btn1',
        type: 'dom-node',
        name: 'Button 1',
        size: 25,
        x: 60,
        y: 80,
        leaked: false,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'btn2',
        type: 'dom-node',
        name: 'Button 2',
        size: 25,
        x: 160,
        y: 80,
        leaked: false,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'btn3',
        type: 'dom-node',
        name: 'Button 3',
        size: 25,
        x: 260,
        y: 80,
        leaked: false,
        connected: false,
        references: [],
        age: 0,
      },

      // Event Listeners
      {
        id: 'listener1',
        type: 'event-listener',
        name: 'Click Handler 1',
        size: 20,
        x: 60,
        y: 140,
        leaked: true,
        connected: true,
        references: ['btn1'],
        age: 0,
      },
      {
        id: 'listener2',
        type: 'event-listener',
        name: 'Click Handler 2',
        size: 20,
        x: 160,
        y: 140,
        leaked: true,
        connected: true,
        references: ['btn2'],
        age: 0,
      },
      {
        id: 'listener3',
        type: 'event-listener',
        name: 'Click Handler 3',
        size: 20,
        x: 260,
        y: 140,
        leaked: true,
        connected: true,
        references: ['btn3'],
        age: 0,
      },

      // Closures keeping references
      {
        id: 'closure1',
        type: 'closure',
        name: 'Handler Closure 1',
        size: 30,
        x: 60,
        y: 200,
        leaked: true,
        connected: true,
        references: ['listener1'],
        age: 0,
      },
      {
        id: 'closure2',
        type: 'closure',
        name: 'Handler Closure 2',
        size: 30,
        x: 160,
        y: 200,
        leaked: true,
        connected: true,
        references: ['listener2'],
        age: 0,
      },
      {
        id: 'closure3',
        type: 'closure',
        name: 'Handler Closure 3',
        size: 30,
        x: 260,
        y: 200,
        leaked: true,
        connected: true,
        references: ['listener3'],
        age: 0,
      },
    ];

    setObjects(newObjects);
    setMemoryUsage({ current: 45, max: 100 });
    setCurrentPhase('leaking');
    setLeakCount(0);
  };

  const setupCircularReferenceLeak = () => {
    const newObjects: LeakObject[] = [
      // Parent objects
      {
        id: 'parent1',
        type: 'dom-node',
        name: 'Parent 1',
        size: 35,
        x: 80,
        y: 100,
        leaked: true,
        connected: true,
        references: ['child1'],
        age: 0,
      },
      {
        id: 'parent2',
        type: 'dom-node',
        name: 'Parent 2',
        size: 35,
        x: 200,
        y: 100,
        leaked: true,
        connected: true,
        references: ['child2'],
        age: 0,
      },
      {
        id: 'parent3',
        type: 'dom-node',
        name: 'Parent 3',
        size: 35,
        x: 320,
        y: 100,
        leaked: true,
        connected: true,
        references: ['child3'],
        age: 0,
      },

      // Child objects creating circular references
      {
        id: 'child1',
        type: 'circular-ref',
        name: 'Child 1',
        size: 30,
        x: 80,
        y: 200,
        leaked: true,
        connected: true,
        references: ['parent1'],
        age: 0,
      },
      {
        id: 'child2',
        type: 'circular-ref',
        name: 'Child 2',
        size: 30,
        x: 200,
        y: 200,
        leaked: true,
        connected: true,
        references: ['parent2'],
        age: 0,
      },
      {
        id: 'child3',
        type: 'circular-ref',
        name: 'Child 3',
        size: 30,
        x: 320,
        y: 200,
        leaked: true,
        connected: true,
        references: ['parent3'],
        age: 0,
      },
    ];

    setObjects(newObjects);
    setMemoryUsage({ current: 40, max: 100 });
    setCurrentPhase('leaking');
    setLeakCount(0);
  };

  const setupGlobalVariableLeak = () => {
    const newObjects: LeakObject[] = [
      // Accidental global variables
      {
        id: 'global1',
        type: 'global-var',
        name: 'largeDataArray',
        size: 45,
        x: 100,
        y: 80,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'global2',
        type: 'global-var',
        name: 'cache',
        size: 35,
        x: 250,
        y: 80,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'global3',
        type: 'global-var',
        name: 'tempData',
        size: 40,
        x: 400,
        y: 80,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },

      // Functions creating globals
      {
        id: 'func1',
        type: 'closure',
        name: 'processData()',
        size: 25,
        x: 100,
        y: 180,
        leaked: false,
        connected: true,
        references: ['global1'],
        age: 0,
      },
      {
        id: 'func2',
        type: 'closure',
        name: 'cacheResults()',
        size: 25,
        x: 250,
        y: 180,
        leaked: false,
        connected: true,
        references: ['global2'],
        age: 0,
      },
      {
        id: 'func3',
        type: 'closure',
        name: 'handleData()',
        size: 25,
        x: 400,
        y: 180,
        leaked: false,
        connected: true,
        references: ['global3'],
        age: 0,
      },
    ];

    setObjects(newObjects);
    setMemoryUsage({ current: 50, max: 100 });
    setCurrentPhase('leaking');
    setLeakCount(0);
  };

  const setupDetachedDOMNodesLeak = () => {
    const newObjects: LeakObject[] = [
      // Detached DOM nodes
      {
        id: 'detached1',
        type: 'dom-node',
        name: 'Detached Div 1',
        size: 40,
        x: 80,
        y: 100,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'detached2',
        type: 'dom-node',
        name: 'Detached Div 2',
        size: 35,
        x: 200,
        y: 100,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'detached3',
        type: 'dom-node',
        name: 'Detached Div 3',
        size: 38,
        x: 320,
        y: 100,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },

      // Cache holding references
      {
        id: 'cache1',
        type: 'closure',
        name: 'DOM Cache 1',
        size: 30,
        x: 80,
        y: 200,
        leaked: true,
        connected: true,
        references: ['detached1'],
        age: 0,
      },
      {
        id: 'cache2',
        type: 'closure',
        name: 'DOM Cache 2',
        size: 30,
        x: 200,
        y: 200,
        leaked: true,
        connected: true,
        references: ['detached2'],
        age: 0,
      },
      {
        id: 'cache3',
        type: 'closure',
        name: 'DOM Cache 3',
        size: 30,
        x: 320,
        y: 200,
        leaked: true,
        connected: true,
        references: ['detached3'],
        age: 0,
      },
    ];

    setObjects(newObjects);
    setMemoryUsage({ current: 42, max: 100 });
    setCurrentPhase('leaking');
    setLeakCount(0);
  };

  const setupTimerLeak = () => {
    const newObjects: LeakObject[] = [
      // Timers
      {
        id: 'timer1',
        type: 'timer',
        name: 'setInterval #1',
        size: 25,
        x: 100,
        y: 80,
        leaked: true,
        connected: true,
        references: ['closure1'],
        age: 0,
      },
      {
        id: 'timer2',
        type: 'timer',
        name: 'setTimeout #1',
        size: 20,
        x: 250,
        y: 80,
        leaked: true,
        connected: true,
        references: ['closure2'],
        age: 0,
      },
      {
        id: 'timer3',
        type: 'timer',
        name: 'setInterval #2',
        size: 25,
        x: 400,
        y: 80,
        leaked: true,
        connected: true,
        references: ['closure3'],
        age: 0,
      },

      // Closures keeping data alive
      {
        id: 'closure1',
        type: 'closure',
        name: 'Timer Closure 1',
        size: 35,
        x: 100,
        y: 160,
        leaked: true,
        connected: true,
        references: ['data1'],
        age: 0,
      },
      {
        id: 'closure2',
        type: 'closure',
        name: 'Timer Closure 2',
        size: 30,
        x: 250,
        y: 160,
        leaked: true,
        connected: true,
        references: ['data2'],
        age: 0,
      },
      {
        id: 'closure3',
        type: 'closure',
        name: 'Timer Closure 3',
        size: 35,
        x: 400,
        y: 160,
        leaked: true,
        connected: true,
        references: ['data3'],
        age: 0,
      },

      // Large data kept alive by closures
      {
        id: 'data1',
        type: 'global-var',
        name: 'Large Dataset 1',
        size: 50,
        x: 100,
        y: 240,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'data2',
        type: 'global-var',
        name: 'Large Dataset 2',
        size: 45,
        x: 250,
        y: 240,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
      {
        id: 'data3',
        type: 'global-var',
        name: 'Large Dataset 3',
        size: 48,
        x: 400,
        y: 240,
        leaked: true,
        connected: false,
        references: [],
        age: 0,
      },
    ];

    setObjects(newObjects);
    setMemoryUsage({ current: 55, max: 100 });
    setCurrentPhase('leaking');
    setLeakCount(0);
  };

  const getObjectColor = (obj: LeakObject) => {
    if (obj.leaked) {
      switch (obj.type) {
        case 'event-listener':
          return '#EF4444'; // red
        case 'dom-node':
          return '#F97316'; // orange
        case 'timer':
          return '#DC2626'; // dark red
        case 'closure':
          return '#B91C1C'; // darker red
        case 'global-var':
          return '#991B1B'; // darkest red
        case 'circular-ref':
          return '#F59E0B'; // amber
        default:
          return '#6B7280'; // gray
      }
    }
    return '#10B981'; // green for non-leaked
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'event-listener':
        return '👆';
      case 'dom-node':
        return '🏠';
      case 'timer':
        return '⏰';
      case 'closure':
        return '🔒';
      case 'global-var':
        return '🌍';
      case 'circular-ref':
        return '🔄';
      default:
        return '📦';
    }
  };

  const getExampleTitle = () => {
    const titles = [
      'Event Listener Memory Leak',
      'Circular Reference Memory Leak',
      'Global Variable Accumulation',
      'Detached DOM Nodes',
      'Timer and Interval Leaks',
    ];
    return titles[activeExample] || 'Memory Leak Example';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Memory Leak Visualization */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{getExampleTitle()}</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Phase: </span>
              <span className="font-semibold text-red-600 capitalize">{currentPhase}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Leak Count: </span>
              <span className="font-semibold text-red-600">{leakCount}</span>
            </div>
          </div>
        </div>

        <svg
          viewBox="0 0 500 320"
          className="w-full h-80 border-2 border-gray-200 rounded-lg bg-white"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Memory Usage Bar */}
          <rect
            x="20"
            y="20"
            width="200"
            height="20"
            fill="#E5E7EB"
            stroke="#9CA3AF"
            strokeWidth="1"
            rx="10"
          />
          <rect
            x="20"
            y="20"
            width={Math.max((memoryUsage.current / memoryUsage.max) * 200, 0)}
            height="20"
            fill={
              memoryUsage.current > 80
                ? '#DC2626'
                : memoryUsage.current > 60
                  ? '#F59E0B'
                  : '#10B981'
            }
            rx="10"
            style={{ transition: 'width 0.5s ease-in-out' }}
          />
          <text x="25" y="35" className="text-xs font-semibold" fill="white">
            Memory: {memoryUsage.current}% / {memoryUsage.max}%
          </text>

          {/* Leak Objects */}
          {objects.map((obj) => (
            <g key={obj.id} style={{ transition: 'all 0.8s ease-in-out' }}>
              {/* Object Rectangle */}
              <rect
                x={obj.x}
                y={obj.y}
                width={obj.size}
                height="30"
                fill={getObjectColor(obj)}
                stroke={obj.leaked ? '#DC2626' : '#10B981'}
                strokeWidth={obj.leaked ? '2' : '1'}
                rx="6"
                opacity={obj.leaked ? 0.8 : 1}
                style={{ transition: 'all 0.8s ease-in-out' }}
              />

              {/* Object Icon */}
              <text x={obj.x + 8} y={obj.y + 20} className="text-sm">
                {getObjectIcon(obj.type)}
              </text>

              {/* Object Name */}
              <text
                x={obj.x + obj.size / 2}
                y={obj.y + 45}
                textAnchor="middle"
                className="text-xs font-medium"
                fill="#374151"
              >
                {obj.name}
              </text>

              {/* Age indicator for growing leaks */}
              {obj.age > 0 && (
                <circle
                  cx={obj.x + obj.size - 8}
                  cy={obj.y + 8}
                  r="6"
                  fill="#DC2626"
                  stroke="white"
                  strokeWidth="1"
                />
              )}
              {obj.age > 0 && (
                <text
                  x={obj.x + obj.size - 8}
                  y={obj.y + 12}
                  textAnchor="middle"
                  className="text-xs font-bold"
                  fill="white"
                >
                  {obj.age}
                </text>
              )}

              {/* Reference lines */}
              {obj.references.map((refId) => {
                const refObj = objects.find((o) => o.id === refId);
                if (refObj && obj.connected) {
                  return (
                    <line
                      key={`${obj.id}-${refId}`}
                      x1={obj.x + obj.size / 2}
                      y1={obj.y}
                      x2={refObj.x + refObj.size / 2}
                      y2={refObj.y + 30}
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                }
                return null;
              })}
            </g>
          ))}

          {/* Arrow marker for reference lines */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#DC2626" opacity="0.7" />
            </marker>
          </defs>

          {/* Warning indicators */}
          {memoryUsage.current > 70 && (
            <g>
              <circle cx="450" cy="50" r="20" fill="#DC2626" opacity="0.8" />
              <text x="450" y="57" textAnchor="middle" className="text-lg" fill="white">
                ⚠️
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Memory Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <h3 className="text-sm font-semibold text-gray-600">Leaked Objects</h3>
          <div className="text-2xl font-bold text-red-600">
            {objects.filter((obj) => obj.leaked).length}
          </div>
          <p className="text-xs text-gray-500">Objects</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <h3 className="text-sm font-semibold text-gray-600">Memory Usage</h3>
          <div className="text-2xl font-bold text-orange-600">{memoryUsage.current}%</div>
          <p className="text-xs text-gray-500">Of Available</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <h3 className="text-sm font-semibold text-gray-600">References</h3>
          <div className="text-2xl font-bold text-yellow-600">
            {objects.reduce((acc, obj) => acc + obj.references.length, 0)}
          </div>
          <p className="text-xs text-gray-500">Active</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600">Leak Age</h3>
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...objects.map((obj) => obj.age), 0)}
          </div>
          <p className="text-xs text-gray-500">Cycles</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">👆 Event Listeners</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">🏠 DOM Nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm">⏰ Timers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-700 rounded"></div>
            <span className="text-sm">🔒 Closures</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-800 rounded"></div>
            <span className="text-sm">🌍 Global Variables</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm">🔄 Circular References</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Visualization Key:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-700">
            <div>• Dotted lines show memory references</div>
            <div>• Object size grows with memory usage</div>
            <div>• Age numbers show leak duration</div>
            <div>• Red objects indicate memory leaks</div>
          </div>
        </div>
      </div>

      {/* Current Example Analysis */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Example Analysis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-700 mb-2">What's Happening:</h4>
            <p className="text-gray-700 text-sm mb-3">
              {activeExample === 0 &&
                'Event listeners are attached but never removed, keeping DOM elements and callback functions in memory.'}
              {activeExample === 1 &&
                'Parent and child objects reference each other, creating cycles that prevent garbage collection.'}
              {activeExample === 2 &&
                'Variables are accidentally created in global scope and accumulate over time.'}
              {activeExample === 3 &&
                'DOM elements are removed from the document but JavaScript still holds references to them.'}
              {activeExample === 4 &&
                'Timers are created but never cleared, keeping their callback closures and referenced data alive.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Memory Impact:</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>
                • Memory usage:{' '}
                <span className="font-semibold text-red-600">{memoryUsage.current}%</span>
              </li>
              <li>
                • Leaked objects:{' '}
                <span className="font-semibold text-red-600">
                  {objects.filter((obj) => obj.leaked).length}
                </span>
              </li>
              <li>
                • Active references:{' '}
                <span className="font-semibold text-red-600">
                  {objects.reduce((acc, obj) => acc + obj.references.length, 0)}
                </span>
              </li>
              <li>
                • Growth rate:{' '}
                <span className="font-semibold text-red-600">Increasing over time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryLeaks2D;
