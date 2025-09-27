import React, { useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface C4Element {
  id: string;
  type: 'person' | 'system' | 'container' | 'component' | 'database';
  name: string;
  description: string;
  technology?: string;
  x: number;
  y: number;
  level: 'context' | 'container' | 'component' | 'code';
}

interface C4Relationship {
  id: string;
  from: string;
  to: string;
  description: string;
  technology?: string;
}

interface C4ModelBuilder2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const C4ModelBuilder2D: React.FC<C4ModelBuilder2DProps> = React.memo(({ className = '' }) => {
  const [elements, setElements] = useState<C4Element[]>([]);
  const [relationships, setRelationships] = useState<C4Relationship[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<
    'context' | 'container' | 'component' | 'code'
  >('context');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);

  const elementTypes = useMemo(
    () => ({
      person: { icon: '👤', color: 'blue', level: 'context' as const },
      system: { icon: '🏗️', color: 'green', level: 'context' as const },
      container: { icon: '📦', color: 'purple', level: 'container' as const },
      component: { icon: '⚙️', color: 'orange', level: 'component' as const },
      database: { icon: '🗄️', color: 'red', level: 'container' as const },
    }),
    []
  );

  const levelDescriptions = useMemo(
    () => ({
      context: 'System Context - Shows the system and its environment',
      container: 'Container - Shows high-level technology choices',
      component: 'Component - Shows components and their relationships',
      code: 'Code - Shows implementation details and classes',
    }),
    []
  );

  const addElement = useCallback(
    (type: C4Element['type']) => {
      const newElement: C4Element = {
        id: `element-${Date.now()}`,
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${elements.length + 1}`,
        description: `Description for ${type}`,
        technology:
          type === 'database' ? 'PostgreSQL' : type === 'container' ? 'Node.js' : undefined,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        level: elementTypes[type].level,
      };
      setElements((prev) => [...prev, newElement]);
    },
    [elements.length, elementTypes]
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setRelationships((prev) => prev.filter((rel) => rel.from !== id && rel.to !== id));
  }, []);

  const startConnection = useCallback((elementId: string) => {
    setConnectingFrom(elementId);
  }, []);

  const completeConnection = useCallback(
    (targetId: string) => {
      if (connectingFrom && connectingFrom !== targetId) {
        const newRelationship: C4Relationship = {
          id: `relationship-${Date.now()}`,
          from: connectingFrom,
          to: targetId,
          description: 'Uses',
          technology: 'HTTP',
        };
        setRelationships((prev) => [...prev, newRelationship]);
      }
      setConnectingFrom(null);
    },
    [connectingFrom]
  );

  const deleteRelationship = useCallback((id: string) => {
    setRelationships((prev) => prev.filter((rel) => rel.id !== id));
  }, []);

  const filteredElements = useMemo(
    () => elements.filter((el) => el.level === selectedLevel),
    [elements, selectedLevel]
  );

  const getElementById = useCallback(
    (id: string) => elements.find((el) => el.id === id),
    [elements]
  );

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 ${className}`}
      role="application"
      aria-label="C4 Model Builder Interactive Diagram Creator"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">C4 Model Builder</h3>
          <p className="text-gray-600 text-sm" id="c4-description">
            {levelDescriptions[selectedLevel]}
          </p>
        </div>

        {/* Level Selector */}
        <div className="flex space-x-2" role="tablist" aria-label="C4 model abstraction levels">
          {Object.entries(levelDescriptions).map(([level]) => (
            <button
              key={level}
              onClick={() =>
                setSelectedLevel(level as 'context' | 'container' | 'component' | 'code')
              }
              onKeyDown={(e) =>
                handleKeyDown(e, () =>
                  setSelectedLevel(level as 'context' | 'container' | 'component' | 'code')
                )
              }
              className={`px-3 py-1 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                selectedLevel === level
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              role="tab"
              aria-selected={selectedLevel === level}
              aria-controls={`level-${level}-panel`}
              aria-label={`Switch to ${level} level: ${levelDescriptions[level as keyof typeof levelDescriptions]}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {Object.entries(elementTypes).map(([type, config]) => (
            <button
              key={type}
              onClick={() => addElement(type as C4Element['type'])}
              onKeyDown={(e) => handleKeyDown(e, () => addElement(type as C4Element['type']))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                config.level === selectedLevel
                  ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={config.level !== selectedLevel}
              aria-label={`Add ${type} element to ${levelDescriptions[selectedLevel].toLowerCase()}`}
            >
              <span aria-hidden="true">{config.icon}</span>
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRelationships(!showRelationships)}
            onKeyDown={(e) => handleKeyDown(e, () => setShowRelationships(!showRelationships))}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showRelationships
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={`${showRelationships ? 'Hide' : 'Show'} relationships between elements`}
            aria-pressed={showRelationships}
          >
            {showRelationships ? (
              <Eye className="w-4 h-4" aria-hidden="true" />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Relationships</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative bg-white border-2 border-gray-200 rounded-lg h-80 overflow-hidden"
        role="img"
        aria-label={`C4 diagram canvas for ${selectedLevel} level`}
        id={`level-${selectedLevel}-panel`}
        aria-describedby="c4-description"
      >
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full cursor-crosshair"
          onClick={() => setConnectingFrom(null)}
          aria-hidden="true"
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Relationships */}
          {showRelationships &&
            relationships.map((relationship) => {
              const fromElement = getElementById(relationship.from);
              const toElement = getElementById(relationship.to);

              if (
                !fromElement ||
                !toElement ||
                fromElement.level !== selectedLevel ||
                toElement.level !== selectedLevel
              ) {
                return null;
              }

              const fromX = fromElement.x + 60;
              const fromY = fromElement.y + 30;
              const toX = toElement.x + 60;
              const toY = toElement.y + 30;

              return (
                <g key={relationship.id}>
                  {/* Line */}
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#6b7280"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>

                  {/* Label */}
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 font-medium"
                  >
                    {relationship.description}
                  </text>
                  {relationship.technology && (
                    <text
                      x={(fromX + toX) / 2}
                      y={(fromY + toY) / 2 + 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      [{relationship.technology}]
                    </text>
                  )}

                  {/* Delete button */}
                  <circle
                    cx={(fromX + toX) / 2}
                    cy={(fromY + toY) / 2}
                    r="8"
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth="1"
                    className="cursor-pointer hover:fill-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRelationship(relationship.id);
                    }}
                  />
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 + 3}
                    textAnchor="middle"
                    className="text-xs fill-red-600 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRelationship(relationship.id);
                    }}
                  >
                    ×
                  </text>
                </g>
              );
            })}

          {/* Connection line while dragging */}
          {connectingFrom && (
            <line
              x1={getElementById(connectingFrom)?.x ? getElementById(connectingFrom)!.x + 60 : 0}
              y1={getElementById(connectingFrom)?.y ? getElementById(connectingFrom)!.y + 30 : 0}
              x2={300} // Mouse position would be better, but simplified
              y2={200}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Elements */}
          {filteredElements.map((element) => {
            const config = elementTypes[element.type];
            const isConnecting = connectingFrom === element.id;

            return (
              <g key={element.id}>
                {/* Element box */}
                <rect
                  x={element.x}
                  y={element.y}
                  width="120"
                  height="60"
                  fill={isConnecting ? '#dbeafe' : 'white'}
                  stroke={isConnecting ? '#3b82f6' : '#d1d5db'}
                  strokeWidth="2"
                  rx="8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingFrom) {
                      completeConnection(element.id);
                    }
                  }}
                />

                {/* Element icon */}
                <text x={element.x + 10} y={element.y + 20} className="text-lg">
                  {config.icon}
                </text>

                {/* Element name */}
                <text
                  x={element.x + 35}
                  y={element.y + 18}
                  className="text-sm font-semibold fill-gray-900"
                >
                  {element.name}
                </text>

                {/* Element technology */}
                {element.technology && (
                  <text x={element.x + 35} y={element.y + 35} className="text-xs fill-gray-600">
                    [{element.technology}]
                  </text>
                )}

                {/* Action buttons */}
                <g>
                  {/* Connect button */}
                  <circle
                    cx={element.x + 100}
                    cy={element.y + 15}
                    r="8"
                    fill="#3b82f6"
                    className="cursor-pointer hover:fill-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(element.id);
                    }}
                  />
                  <text
                    x={element.x + 100}
                    y={element.y + 19}
                    textAnchor="middle"
                    className="text-xs fill-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(element.id);
                    }}
                  >
                    →
                  </text>

                  {/* Delete button */}
                  <circle
                    cx={element.x + 100}
                    cy={element.y + 45}
                    r="8"
                    fill="#ef4444"
                    className="cursor-pointer hover:fill-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                  />
                  <text
                    x={element.x + 100}
                    y={element.y + 49}
                    textAnchor="middle"
                    className="text-xs fill-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                  >
                    ×
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Instructions */}
      <div
        className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg"
        role="complementary"
        aria-label="Usage instructions"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <strong>Building C4 Diagrams:</strong>
            <ul className="mt-1 space-y-1" role="list">
              <li role="listitem">
                Add elements using the toolbar buttons (Tab to navigate, Enter/Space to select)
              </li>
              <li role="listitem">Click elements to select them for connections</li>
              <li role="listitem">Use the Relationships toggle to show/hide connections</li>
              <li role="listitem">Switch between C4 abstraction levels using the level tabs</li>
            </ul>
          </div>
          <div>
            <strong>C4 Levels:</strong>
            <ul className="mt-1 space-y-1" role="list">
              <li role="listitem">
                <strong>Context:</strong> System and external actors
              </li>
              <li role="listitem">
                <strong>Container:</strong> Applications and data stores
              </li>
              <li role="listitem">
                <strong>Component:</strong> Components within containers
              </li>
              <li role="listitem">
                <strong>Code:</strong> Classes and implementation details
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default C4ModelBuilder2D;
