import React, { useState, useCallback, useMemo } from 'react';

export interface PolymorphicMethod {
  name: string;
  baseClass: string;
  implementations: Array<{
    className: string;
    signature: string;
    body: string;
    isOverride: boolean;
  }>;
}

export interface PolymorphismFlow2DProps {
  methods: PolymorphicMethod[];
  width?: number;
  height?: number;
  animationSpeed?: number;
}

export interface PolymorphismFlow2DHandle {
  animatePolymorphism(): void;
  showMethodImplementation(methodName: string, className: string): void;
  reset(): void;
}

const PolymorphismFlow2D = React.forwardRef<PolymorphismFlow2DHandle, PolymorphismFlow2DProps>(
  ({ methods, width = 800, height = 600, animationSpeed = 1500 }, ref) => {
    const [animationStep, setAnimationStep] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [animating, setAnimating] = useState(false);
    const [currentImplementation, setCurrentImplementation] = useState<{
      methodName: string;
      className: string;
    } | null>(null);

    // Calculate positions for methods and implementations
    const positions = useMemo(() => {
      const pos = new Map<string, { x: number; y: number }>();
      const methodSpacing = width / (methods.length + 1);

      methods.forEach((method, methodIndex) => {
        const methodX = (methodIndex + 1) * methodSpacing;
        const methodY = 100;
        pos.set(`method-${method.name}`, { x: methodX, y: methodY });

        // Position implementations below each method
        const implSpacing = 150;
        method.implementations.forEach((impl, implIndex) => {
          const implX = methodX;
          const implY = methodY + 120 + implIndex * implSpacing;
          pos.set(`impl-${method.name}-${impl.className}`, { x: implX, y: implY });
        });
      });

      return pos;
    }, [methods, width]);

    const animatePolymorphism = useCallback(() => {
      if (animating) return;

      setAnimating(true);
      setAnimationStep(0);

      const totalSteps = methods.reduce((sum, method) => sum + method.implementations.length, 0);
      let currentStep = 0;

      const animate = () => {
        setAnimationStep(currentStep);
        currentStep++;

        if (currentStep <= totalSteps) {
          setTimeout(animate, animationSpeed / totalSteps);
        } else {
          setAnimating(false);
        }
      };

      animate();
    }, [methods, animationSpeed, animating]);

    const showMethodImplementation = useCallback((methodName: string, className: string) => {
      setCurrentImplementation({ methodName, className });
      setSelectedMethod(methodName);
      setTimeout(() => {
        setCurrentImplementation(null);
        setSelectedMethod(null);
      }, 3000);
    }, []);

    React.useImperativeHandle(ref, () => ({
      animatePolymorphism,
      showMethodImplementation,
      reset: () => {
        setAnimationStep(0);
        setSelectedMethod(null);
        setCurrentImplementation(null);
        setAnimating(false);
      },
    }));

    const renderMethodNode = (method: PolymorphicMethod) => {
      const position = positions.get(`method-${method.name}`);
      if (!position) return null;

      const isSelected = selectedMethod === method.name;
      const nodeWidth = 200;
      const nodeHeight = 80;

      return (
        <g key={method.name} transform={`translate(${position.x - nodeWidth / 2}, ${position.y})`}>
          {/* Method node shadow */}
          <rect x="4" y="4" width={nodeWidth} height={nodeHeight} rx="12" fill="rgba(0,0,0,0.1)" />

          {/* Main method node */}
          <rect
            x="0"
            y="0"
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            fill="white"
            stroke={isSelected ? '#F59E0B' : '#E5E7EB'}
            strokeWidth={isSelected ? '3' : '2'}
            style={{
              cursor: 'pointer',
              filter: isSelected ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))' : 'none',
            }}
            onClick={() => setSelectedMethod(isSelected ? null : method.name)}
          />

          {/* Method header */}
          <rect x="0" y="0" width={nodeWidth} height="35" rx="12" fill="#6366F1" />
          <text
            x={nodeWidth / 2}
            y="22"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            🔄 {method.name}
          </text>

          {/* Implementation count */}
          <text x={nodeWidth / 2} y="55" textAnchor="middle" fill="#6B7280" fontSize="12">
            {method.implementations.length} implementation
            {method.implementations.length !== 1 ? 's' : ''}
          </text>
        </g>
      );
    };

    const renderImplementationNode = (
      method: PolymorphicMethod,
      impl: PolymorphicMethod['implementations'][0]
    ) => {
      const position = positions.get(`impl-${method.name}-${impl.className}`);
      if (!position) return null;

      const methodIndex = methods.indexOf(method);
      const implIndex = method.implementations.indexOf(impl);
      const globalImplIndex =
        methods.slice(0, methodIndex).reduce((sum, m) => sum + m.implementations.length, 0) +
        implIndex;
      const isAnimating = animationStep > globalImplIndex;

      const isCurrent =
        currentImplementation?.methodName === method.name &&
        currentImplementation?.className === impl.className;

      const nodeWidth = 280;
      const nodeHeight = 100;

      return (
        <g
          key={`${method.name}-${impl.className}`}
          transform={`translate(${position.x - nodeWidth / 2}, ${position.y})`}
        >
          {/* Implementation node shadow */}
          <rect x="4" y="4" width={nodeWidth} height={nodeHeight} rx="12" fill="rgba(0,0,0,0.1)" />

          {/* Main implementation node */}
          <rect
            x="0"
            y="0"
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            fill="white"
            stroke={isCurrent ? '#10B981' : isAnimating ? '#3B82F6' : '#E5E7EB'}
            strokeWidth={isCurrent ? '3' : '2'}
            style={{
              cursor: 'pointer',
              filter: isCurrent ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : 'none',
              opacity: isAnimating ? 1 : 0.6,
              transition: 'opacity 0.5s ease-in-out',
            }}
            onClick={() => showMethodImplementation(method.name, impl.className)}
          />

          {/* Class header */}
          <rect
            x="0"
            y="0"
            width={nodeWidth}
            height="30"
            rx="12"
            fill={impl.isOverride ? '#F59E0B' : '#10B981'}
          />
          <text
            x={nodeWidth / 2}
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="bold"
          >
            {impl.isOverride ? '🔄' : '🆕'} {impl.className}
          </text>

          {/* Method signature */}
          <text x="15" y="50" fill="#374151" fontSize="11" fontWeight="bold">
            {method.name}
            {impl.signature}
          </text>

          {/* Method body preview */}
          <text x="15" y="70" fill="#6B7280" fontSize="10">
            {impl.body.length > 40 ? `${impl.body.substring(0, 40)}...` : impl.body}
          </text>

          {/* Override indicator */}
          {impl.isOverride && (
            <text x={nodeWidth - 20} y="85" fill="#F59E0B" fontSize="9" fontWeight="bold">
              OVERRIDE
            </text>
          )}
        </g>
      );
    };

    const renderPolymorphismArrow = (
      method: PolymorphicMethod,
      impl: PolymorphicMethod['implementations'][0]
    ) => {
      const methodPos = positions.get(`method-${method.name}`);
      const implPos = positions.get(`impl-${method.name}-${impl.className}`);
      if (!methodPos || !implPos) return null;

      const methodIndex = methods.indexOf(method);
      const implIndex = method.implementations.indexOf(impl);
      const globalImplIndex =
        methods.slice(0, methodIndex).reduce((sum, m) => sum + m.implementations.length, 0) +
        implIndex;
      const isAnimating = animationStep > globalImplIndex;

      return (
        <g key={`arrow-${method.name}-${impl.className}`}>
          {/* Arrow shadow */}
          <line
            x1={methodPos.x}
            y1={methodPos.y + 40}
            x2={implPos.x}
            y2={implPos.y - 10}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="3"
            markerEnd="url(#polymorphism-arrowhead-shadow)"
          />

          {/* Main arrow */}
          <line
            x1={methodPos.x}
            y1={methodPos.y + 40}
            x2={implPos.x}
            y2={implPos.y - 10}
            stroke={isAnimating ? '#10B981' : '#6366F1'}
            strokeWidth="2"
            markerEnd="url(#polymorphism-arrowhead)"
            style={{
              strokeDasharray: isAnimating ? 'none' : '5,5',
              animation: isAnimating ? 'none' : 'polymorphism-dash 2s infinite',
            }}
          />

          {/* Implementation label */}
          <text
            x={(methodPos.x + implPos.x) / 2}
            y={(methodPos.y + implPos.y) / 2}
            textAnchor="middle"
            fill={isAnimating ? '#10B981' : '#6366F1'}
            fontSize="10"
            fontWeight="bold"
            opacity={isAnimating ? 1 : 0.7}
          >
            {impl.isOverride ? 'overrides' : 'implements'}
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
          🔄 Polymorphism Flow
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
                borderRadius: '2px',
                backgroundColor: '#10B981',
              }}
            ></div>
            <span>New Implementation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: '#F59E0B',
              }}
            ></div>
            <span>Method Override</span>
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
            onClick={animatePolymorphism}
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
            {animating ? '🔄 Animating...' : '▶️ Animate Polymorphism'}
          </button>
        </div>

        {/* Current implementation display */}
        {currentImplementation && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              zIndex: 10,
              border: '2px solid #10B981',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#10B981' }}>
              📋 {currentImplementation.className}.{currentImplementation.methodName}
            </div>
            <div style={{ fontFamily: 'monospace', color: '#374151' }}>
              {
                methods
                  .find((m) => m.name === currentImplementation!.methodName)
                  ?.implementations.find(
                    (impl) => impl.className === currentImplementation!.className
                  )?.body
              }
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
              id="polymorphism-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
            <marker
              id="polymorphism-arrowhead-shadow"
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
                @keyframes polymorphism-dash {
                  to {
                    stroke-dashoffset: -10;
                  }
                }
              `}
            </style>
          </defs>

          {/* Render polymorphism arrows */}
          {methods.map((method) =>
            method.implementations.map((impl) => renderPolymorphismArrow(method, impl))
          )}

          {/* Render method nodes */}
          {methods.map(renderMethodNode)}

          {/* Render implementation nodes */}
          {methods.map((method) =>
            method.implementations.map((impl) => renderImplementationNode(method, impl))
          )}
        </svg>
      </div>
    );
  }
);

export default PolymorphismFlow2D;
