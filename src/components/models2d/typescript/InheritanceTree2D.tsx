import React, { useState, useCallback, useMemo } from 'react';

export interface InheritanceNode {
  name: string;
  properties: Array<{ name: string; type: string; inherited?: boolean }>;
  methods: Array<{ name: string; signature: string; inherited?: boolean; overridden?: boolean }>;
  level: number;
  parent?: string;
}

export interface InheritanceTree2DProps {
  rootClass: InheritanceNode;
  width?: number;
  height?: number;
  animationSpeed?: number;
}

export interface InheritanceTree2DHandle {
  animateInheritance(): void;
  highlightProperty(className: string, propertyName: string): void;
  highlightMethod(className: string, methodName: string): void;
  reset(): void;
}

const InheritanceTree2D = React.forwardRef<InheritanceTree2DHandle, InheritanceTree2DProps>(
  ({ rootClass, width = 800, height = 600, animationSpeed = 1000 }, ref) => {
    const [animationStep, setAnimationStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<{
      type: 'property' | 'method';
      className: string;
      name: string;
    } | null>(null);
    const [animating, setAnimating] = useState(false);

    // Build the complete inheritance tree
    const inheritanceTree = useMemo(() => {
      const buildTree = (node: InheritanceNode, level = 0): InheritanceNode[] => {
        const result = [{ ...node, level }];

        // Add inherited properties and methods to child classes
        if (level > 0) {
          // Mark inherited properties
          node.properties = node.properties.map((prop) => ({
            ...prop,
            inherited: !prop.inherited,
          }));

          // Mark inherited methods (not overridden)
          node.methods = node.methods.map((method) => ({
            ...method,
            inherited: !method.inherited && !method.overridden,
          }));
        }

        return result;
      };

      return buildTree(rootClass);
    }, [rootClass]);

    // Calculate positions for tree layout
    const positions = useMemo(() => {
      const pos = new Map<string, { x: number; y: number }>();
      const levelNodes = new Map<number, InheritanceNode[]>();

      // Group nodes by level
      inheritanceTree.forEach((node) => {
        if (!levelNodes.has(node.level)) {
          levelNodes.set(node.level, []);
        }
        levelNodes.get(node.level)!.push(node);
      });

      // Position nodes
      levelNodes.forEach((nodes, level) => {
        const levelY = 100 + level * 200;
        const spacing = width / (nodes.length + 1);

        nodes.forEach((node, index) => {
          const x = (index + 1) * spacing;
          pos.set(node.name, { x, y: levelY });
        });
      });

      return pos;
    }, [inheritanceTree, width]);

    const animateInheritance = useCallback(() => {
      if (animating) return;

      setAnimating(true);
      setAnimationStep(0);

      const steps = inheritanceTree.length * 2; // Properties + methods for each class
      let currentStep = 0;

      const animate = () => {
        setAnimationStep(currentStep);
        currentStep++;

        if (currentStep <= steps) {
          setTimeout(animate, animationSpeed / steps);
        } else {
          setAnimating(false);
        }
      };

      animate();
    }, [inheritanceTree, animationSpeed, animating]);

    const highlightElement = useCallback(
      (type: 'property' | 'method', className: string, name: string) => {
        setHighlightedElement({ type, className, name });
        setTimeout(() => setHighlightedElement(null), 2000);
      },
      []
    );

    React.useImperativeHandle(ref, () => ({
      animateInheritance,
      highlightProperty: (className: string, propertyName: string) =>
        highlightElement('property', className, propertyName),
      highlightMethod: (className: string, methodName: string) =>
        highlightElement('method', className, methodName),
      reset: () => {
        setAnimationStep(0);
        setHighlightedElement(null);
        setAnimating(false);
      },
    }));

    const renderInheritanceArrow = (fromNode: InheritanceNode, toNode: InheritanceNode) => {
      const fromPos = positions.get(fromNode.name);
      const toPos = positions.get(toNode.name);
      if (!fromPos || !toPos) return null;

      const isAnimating = animationStep > inheritanceTree.indexOf(fromNode) * 2;

      return (
        <g key={`arrow-${fromNode.name}-${toNode.name}`}>
          {/* Arrow shadow */}
          <line
            x1={fromPos.x}
            y1={fromPos.y + 60}
            x2={toPos.x}
            y2={toPos.y - 20}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="3"
            markerEnd="url(#inheritance-arrowhead-shadow)"
          />

          {/* Main arrow */}
          <line
            x1={fromPos.x}
            y1={fromPos.y + 60}
            x2={toPos.x}
            y2={toPos.y - 20}
            stroke={isAnimating ? '#10B981' : '#6366F1'}
            strokeWidth="2"
            markerEnd="url(#inheritance-arrowhead)"
            style={{
              strokeDasharray: isAnimating ? 'none' : '5,5',
              animation: isAnimating ? 'none' : 'dash 2s infinite',
            }}
          />

          {/* Inheritance label */}
          <text
            x={(fromPos.x + toPos.x) / 2}
            y={(fromPos.y + toPos.y) / 2}
            textAnchor="middle"
            fill={isAnimating ? '#10B981' : '#6366F1'}
            fontSize="12"
            fontWeight="bold"
            opacity={isAnimating ? 1 : 0.7}
          >
            extends
          </text>
        </g>
      );
    };

    const renderClassNode = (node: InheritanceNode) => {
      const position = positions.get(node.name);
      if (!position) return null;

      const nodeIndex = inheritanceTree.indexOf(node);
      const isAnimating = animationStep > nodeIndex * 2;
      const isPropertiesAnimating = animationStep > nodeIndex * 2;
      const isMethodsAnimating = animationStep > nodeIndex * 2 + 1;

      const nodeWidth = 220;
      const nodeHeight = 120 + Math.max(node.properties.length, node.methods.length) * 20;

      return (
        <g key={node.name} transform={`translate(${position.x - nodeWidth / 2}, ${position.y})`}>
          {/* Node shadow */}
          <rect x="4" y="4" width={nodeWidth} height={nodeHeight} rx="12" fill="rgba(0,0,0,0.1)" />

          {/* Main node */}
          <rect
            x="0"
            y="0"
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            fill="white"
            stroke={isAnimating ? '#10B981' : '#E5E7EB'}
            strokeWidth={isAnimating ? '3' : '2'}
            style={{
              filter: isAnimating ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : 'none',
            }}
          />

          {/* Class header */}
          <rect x="0" y="0" width={nodeWidth} height="40" rx="12" fill="#6366F1" />
          <text
            x={nodeWidth / 2}
            y="25"
            textAnchor="middle"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            {node.name}
          </text>

          {/* Properties section */}
          <text x="15" y="55" fill="#374151" fontSize="12" fontWeight="bold">
            Properties:
          </text>
          {node.properties.map((prop, index) => {
            const y = 75 + index * 18;
            const isHighlighted =
              highlightedElement?.type === 'property' &&
              highlightedElement.className === node.name &&
              highlightedElement.name === prop.name;

            return (
              <g key={prop.name}>
                <circle
                  cx="25"
                  cy={y - 3}
                  r="3"
                  fill={prop.inherited ? '#F59E0B' : '#3B82F6'}
                  opacity={isPropertiesAnimating ? 1 : 0.3}
                  style={{
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                />
                <text
                  x="35"
                  y={y}
                  fill="#374151"
                  fontSize="11"
                  style={{
                    cursor: 'pointer',
                    opacity: isPropertiesAnimating ? 1 : 0.3,
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                  onClick={() => highlightElement('property', node.name, prop.name)}
                >
                  {prop.name}: {prop.type}
                  {prop.inherited && (
                    <tspan fill="#F59E0B" fontSize="9">
                      {' '}
                      (inherited)
                    </tspan>
                  )}
                </text>
                {isHighlighted && (
                  <rect
                    x="30"
                    y={y - 12}
                    width={nodeWidth - 60}
                    height="16"
                    rx="4"
                    fill="#FEF3C7"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* Methods section */}
          <text
            x="15"
            y={85 + node.properties.length * 18}
            fill="#374151"
            fontSize="12"
            fontWeight="bold"
          >
            Methods:
          </text>
          {node.methods.map((method, index) => {
            const y = 105 + node.properties.length * 18 + index * 18;
            const isHighlighted =
              highlightedElement?.type === 'method' &&
              highlightedElement.className === node.name &&
              highlightedElement.name === method.name;

            return (
              <g key={method.name}>
                <rect
                  x="20"
                  y={y - 8}
                  width="8"
                  height="8"
                  rx="2"
                  fill={method.overridden ? '#EF4444' : method.inherited ? '#F59E0B' : '#10B981'}
                  opacity={isMethodsAnimating ? 1 : 0.3}
                  style={{
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                />
                <text
                  x="35"
                  y={y}
                  fill="#374151"
                  fontSize="11"
                  style={{
                    cursor: 'pointer',
                    opacity: isMethodsAnimating ? 1 : 0.3,
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                  onClick={() => highlightElement('method', node.name, method.name)}
                >
                  {method.name}
                  {method.overridden && (
                    <tspan fill="#EF4444" fontSize="9">
                      {' '}
                      (overridden)
                    </tspan>
                  )}
                  {method.inherited && !method.overridden && (
                    <tspan fill="#F59E0B" fontSize="9">
                      {' '}
                      (inherited)
                    </tspan>
                  )}
                </text>
                {isHighlighted && (
                  <rect
                    x="30"
                    y={y - 12}
                    width={nodeWidth - 60}
                    height="16"
                    rx="4"
                    fill="#FEF3C7"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}
        </g>
      );
    };

    // Build inheritance relationships
    const inheritanceRelationships = useMemo(() => {
      const relationships: Array<{ from: InheritanceNode; to: InheritanceNode }> = [];

      inheritanceTree.forEach((node) => {
        if (node.level > 0) {
          // Find parent (this is simplified - in real implementation you'd track parent relationships)
          const parentLevel = node.level - 1;
          const parentCandidates = inheritanceTree.filter((n) => n.level === parentLevel);
          if (parentCandidates.length > 0) {
            relationships.push({ from: parentCandidates[0], to: node });
          }
        }
      });

      return relationships;
    }, [inheritanceTree]);

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          🌳 Inheritance Flow
        </div>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6',
              }}
            ></div>
            <span>Own Property</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
              }}
            ></div>
            <span>Inherited</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '2px',
                backgroundColor: '#10B981',
              }}
            ></div>
            <span>Own Method</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '2px',
                backgroundColor: '#EF4444',
              }}
            ></div>
            <span>Overridden</span>
          </div>
        </div>

        {/* Control buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <button
            onClick={animateInheritance}
            disabled={animating}
            style={{
              padding: '8px 16px',
              backgroundColor: animating ? '#9CA3AF' : '#6366F1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: animating ? 'not-allowed' : 'pointer',
            }}
          >
            {animating ? '🔄 Animating...' : '▶️ Animate Inheritance'}
          </button>
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrow markers */}
            <marker
              id="inheritance-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
            <marker
              id="inheritance-arrowhead-shadow"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0,0,0,0.1)" />
            </marker>

            {/* Animation keyframes */}
            <style>
              {`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -10;
                  }
                }
              `}
            </style>
          </defs>

          {/* Render inheritance arrows */}
          {inheritanceRelationships.map((rel) => renderInheritanceArrow(rel.from, rel.to))}

          {/* Render class nodes */}
          {inheritanceTree.map(renderClassNode)}
        </svg>
      </div>
    );
  }
);

export default InheritanceTree2D;
