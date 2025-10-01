import React, { useState, useCallback, useMemo } from 'react';

export interface ClassMember {
  name: string;
  type: 'property' | 'method';
  visibility: 'public' | 'private' | 'protected';
  returnType?: string;
  parameters?: Array<{ name: string; type: string }>;
}

export interface ClassDefinition {
  name: string;
  extends?: string;
  members: ClassMember[];
  isAbstract?: boolean;
}

export interface ClassHierarchy2DProps {
  classes: ClassDefinition[];
  width?: number;
  height?: number;
  showVisibility?: boolean;
}

export interface ClassHierarchy2DHandle {
  expandClass(className: string): void;
  collapseClass(className: string): void;
  highlightMember(className: string, memberName: string): void;
  reset(): void;
}

const ClassHierarchy2D = React.forwardRef<ClassHierarchy2DHandle, ClassHierarchy2DProps>(
  ({ classes, width = 800, height = 600, showVisibility = true }, ref) => {
    const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
    const [highlightedMember, setHighlightedMember] = useState<{
      className: string;
      memberName: string;
    } | null>(null);

    // Color scheme for visibility
    const visibilityColors = {
      public: '#3B82F6', // Blue
      private: '#EF4444', // Red
      protected: '#F59E0B', // Orange
    };

    // Build inheritance hierarchy
    const hierarchy = useMemo(() => {
      const classMap = new Map(classes.map((cls) => [cls.name, cls]));
      const children = new Map<string, string[]>();

      // Build parent-child relationships
      classes.forEach((cls) => {
        if (cls.extends) {
          if (!children.has(cls.extends)) {
            children.set(cls.extends, []);
          }
          children.get(cls.extends)!.push(cls.name);
        }
      });

      // Find root classes (no parent)
      const roots = classes.filter((cls) => !cls.extends).map((cls) => cls.name);

      return { classMap, children, roots };
    }, [classes]);

    // Calculate positions for classes in hierarchy
    const positions = useMemo(() => {
      const pos = new Map<string, { x: number; y: number; level: number }>();
      const levelWidth = width / Math.max(hierarchy.roots.length, 1);
      let currentY = 80;

      const calculatePositions = (classNames: string[], level: number, startX: number) => {
        const spacing = width / (classNames.length + 1);
        classNames.forEach((className, index) => {
          const x = startX + (index + 1) * spacing - levelWidth / 2;
          pos.set(className, { x, y: currentY + level * 120, level });

          // Position children
          const children = hierarchy.children.get(className) || [];
          if (children.length > 0) {
            calculatePositions(children, level + 1, x - levelWidth / 2);
          }
        });
      };

      calculatePositions(hierarchy.roots, 0, 0);
      return pos;
    }, [hierarchy, width]);

    const toggleClassExpansion = useCallback((className: string) => {
      setExpandedClasses((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(className)) {
          newSet.delete(className);
        } else {
          newSet.add(className);
        }
        return newSet;
      });
    }, []);

    const highlightMember = useCallback((className: string, memberName: string) => {
      setHighlightedMember({ className, memberName });
      setTimeout(() => setHighlightedMember(null), 2000);
    }, []);

    React.useImperativeHandle(ref, () => ({
      expandClass: (className: string) => {
        setExpandedClasses((prev) => new Set([...prev, className]));
      },
      collapseClass: (className: string) => {
        setExpandedClasses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(className);
          return newSet;
        });
      },
      highlightMember,
      reset: () => {
        setExpandedClasses(new Set());
        setHighlightedMember(null);
      },
    }));

    const renderClassBox = (classDef: ClassDefinition) => {
      const position = positions.get(classDef.name);
      if (!position) return null;

      const isExpanded = expandedClasses.has(classDef.name);
      const classWidth = 200;
      const classHeight = isExpanded ? 150 + classDef.members.length * 25 : 60;

      return (
        <g
          key={classDef.name}
          transform={`translate(${position.x - classWidth / 2}, ${position.y})`}
        >
          {/* Class box shadow */}
          <rect x="4" y="4" width={classWidth} height={classHeight} rx="8" fill="rgba(0,0,0,0.1)" />

          {/* Main class box */}
          <rect
            x="0"
            y="0"
            width={classWidth}
            height={classHeight}
            rx="8"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleClassExpansion(classDef.name)}
          />

          {/* Class header */}
          <rect x="0" y="0" width={classWidth} height="40" rx="8" fill="#6366F1" />
          <text
            x={classWidth / 2}
            y="25"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {classDef.isAbstract ? `⟪abstract⟫ ${classDef.name}` : classDef.name}
          </text>

          {/* Expand/collapse indicator */}
          <text
            x={classWidth - 15}
            y="25"
            fill="white"
            fontSize="12"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleClassExpansion(classDef.name)}
          >
            {isExpanded ? '▼' : '▶'}
          </text>

          {/* Members */}
          {isExpanded &&
            classDef.members.map((member, index) => {
              const y = 50 + index * 25;
              const isHighlighted =
                highlightedMember?.className === classDef.name &&
                highlightedMember?.memberName === member.name;

              return (
                <g key={member.name}>
                  {/* Member background */}
                  <rect
                    x="8"
                    y={y - 15}
                    width={classWidth - 16}
                    height="20"
                    rx="4"
                    fill={isHighlighted ? '#FEF3C7' : 'transparent'}
                    stroke={isHighlighted ? visibilityColors[member.visibility] : 'transparent'}
                    strokeWidth="2"
                  />

                  {/* Visibility indicator */}
                  {showVisibility && (
                    <circle cx="18" cy={y - 5} r="4" fill={visibilityColors[member.visibility]} />
                  )}

                  {/* Member text */}
                  <text
                    x={showVisibility ? 30 : 18}
                    y={y - 2}
                    fill="#374151"
                    fontSize="12"
                    style={{ cursor: 'pointer' }}
                    onClick={() => highlightMember(classDef.name, member.name)}
                  >
                    {member.type === 'method' ? '📋' : '🔹'} {member.name}
                    {member.type === 'method' && member.parameters && (
                      <tspan fontSize="10" fill="#6B7280">
                        ({member.parameters.map((p) => `${p.name}: ${p.type}`).join(', ')})
                      </tspan>
                    )}
                    {member.returnType && (
                      <tspan fontSize="10" fill="#6B7280">
                        : {member.returnType}
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
        </g>
      );
    };

    const renderInheritanceArrow = (parentName: string, childName: string) => {
      const parentPos = positions.get(parentName);
      const childPos = positions.get(childName);
      if (!parentPos || !childPos) return null;

      const startX = parentPos.x;
      const startY = parentPos.y + 40;
      const endX = childPos.x;
      const endY = childPos.y;

      // Calculate control points for curved arrow
      const midY = (startY + endY) / 2;

      return (
        <g key={`${parentName}-${childName}`}>
          {/* Arrow shadow */}
          <path
            d={`M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="3"
            fill="none"
            markerEnd="url(#arrowhead-shadow)"
          />

          {/* Main arrow */}
          <path
            d={`M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`}
            stroke="#6366F1"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />

          {/* Inheritance label */}
          <text
            x={(startX + endX) / 2}
            y={midY - 5}
            textAnchor="middle"
            fill="#6366F1"
            fontSize="10"
            fontWeight="bold"
          >
            extends
          </text>
        </g>
      );
    };

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          🏗️ Class Hierarchy
        </div>

        {/* Legend */}
        {showVisibility && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '12px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: visibilityColors.public,
                }}
              ></div>
              <span>Public</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: visibilityColors.private,
                }}
              ></div>
              <span>Private</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: visibilityColors.protected,
                }}
              ></div>
              <span>Protected</span>
            </div>
          </div>
        )}

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrow markers */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
            <marker
              id="arrowhead-shadow"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0,0,0,0.1)" />
            </marker>
          </defs>

          {/* Render inheritance arrows */}
          {classes.map((cls) =>
            cls.extends ? renderInheritanceArrow(cls.extends, cls.name) : null
          )}

          {/* Render class boxes */}
          {classes.map(renderClassBox)}
        </svg>
      </div>
    );
  }
);

export default ClassHierarchy2D;
