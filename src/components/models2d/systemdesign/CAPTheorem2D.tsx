import React, { useState, useCallback, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface CAPTheorem2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const CAPTheorem2D: React.FC<CAPTheorem2DProps> = React.memo(({ className = '' }) => {
  const [selectedProperties, setSelectedProperties] = useState<Set<'C' | 'A' | 'P'>>(new Set());
  const [hoveredProperty, setHoveredProperty] = useState<'C' | 'A' | 'P' | null>(null);

  const properties = useMemo(
    () => ({
      C: {
        name: 'Consistency',
        fullName: 'Strong Consistency',
        description: 'All nodes see the same data at the same time',
        color: 'blue',
        implications: {
          positive: ['Data integrity', 'Predictable behavior', 'ACID transactions'],
          negative: ['Higher latency', 'Reduced availability', 'Complex coordination'],
        },
        examples: ['Banking systems', 'Financial transactions', 'Inventory management'],
      },
      A: {
        name: 'Availability',
        fullName: 'High Availability',
        description: 'System remains operational despite failures',
        color: 'green',
        implications: {
          positive: ['Fault tolerance', 'Continuous operation', 'Better user experience'],
          negative: ['Eventual consistency', 'Complex conflict resolution', 'Stale data possible'],
        },
        examples: ['Social media', 'E-commerce sites', 'Content delivery'],
      },
      P: {
        name: 'Partition Tolerance',
        fullName: 'Partition Tolerance',
        description: 'System continues to operate during network partitions',
        color: 'purple',
        implications: {
          positive: [
            'Resilient to network failures',
            'Global distribution possible',
            'Scalable architecture',
          ],
          negative: ['Consistency challenges', 'Complex reconciliation', 'Eventual consistency'],
        },
        examples: ['Distributed databases', 'Global applications', 'Microservices'],
      },
    }),
    []
  );

  const handlePropertyToggle = useCallback(
    (property: 'C' | 'A' | 'P') => {
      const newSelected = new Set(selectedProperties);
      if (newSelected.has(property)) {
        newSelected.delete(property);
      } else if (newSelected.size < 2) {
        newSelected.add(property);
      }
      setSelectedProperties(newSelected);
    },
    [selectedProperties]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, property: 'C' | 'A' | 'P') => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePropertyToggle(property);
      }
    },
    [handlePropertyToggle]
  );

  const getUnavailableProperty = useCallback(() => {
    const all = new Set(['C', 'A', 'P'] as const);
    for (const prop of selectedProperties) {
      all.delete(prop);
    }
    return all.size === 1 ? Array.from(all)[0] : null;
  }, [selectedProperties]);

  const unavailableProperty = getUnavailableProperty();

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 ${className}`}
      role="application"
      aria-label="CAP Theorem Interactive Simulator"
    >
      {/* Title and Description */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">CAP Theorem Interactive Simulator</h3>
        <p className="text-gray-600 text-sm" id="cap-description">
          Choose any 2 out of 3 properties. The third becomes unavailable in distributed systems.
        </p>
      </div>

      {/* CAP Triangle */}
      <div className="relative w-80 h-80 mx-auto mb-6">
        <svg viewBox="0 0 300 260" className="w-full h-full">
          {/* Triangle */}
          <polygon points="150,30 30,230 270,230" fill="none" stroke="#e5e7eb" strokeWidth="3" />

          {/* Property Labels */}
          <text x="150" y="20" textAnchor="middle" className="text-lg font-bold fill-gray-800">
            Consistency (C)
          </text>
          <text x="15" y="245" textAnchor="start" className="text-lg font-bold fill-gray-800">
            Availability (A)
          </text>
          <text x="285" y="245" textAnchor="end" className="text-lg font-bold fill-gray-800">
            Partition Tolerance (P)
          </text>

          {/* Interactive Areas */}
          {Object.entries(properties).map(([key, prop]) => {
            const isSelected = selectedProperties.has(key as 'C' | 'A' | 'P');
            const isUnavailable = unavailableProperty === key;
            const isHovered = hoveredProperty === key;

            let circleX = 150,
              circleY = 130; // Center default
            if (key === 'C') {
              circleX = 150;
              circleY = 80;
            } else if (key === 'A') {
              circleX = 80;
              circleY = 180;
            } else if (key === 'P') {
              circleX = 220;
              circleY = 180;
            }

            return (
              <g key={key}>
                {/* Clickable area */}
                <circle
                  cx={circleX}
                  cy={circleY}
                  r="25"
                  fill={
                    isSelected
                      ? `var(--color-${prop.color}-500)`
                      : isUnavailable
                        ? '#ef4444'
                        : '#f3f4f6'
                  }
                  stroke={isHovered ? `var(--color-${prop.color}-600)` : '#d1d5db'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => handlePropertyToggle(key as 'C' | 'A' | 'P')}
                  onMouseEnter={() => setHoveredProperty(key as 'C' | 'A' | 'P')}
                  onMouseLeave={() => setHoveredProperty(null)}
                  onKeyDown={(e) => handleKeyDown(e, key as 'C' | 'A' | 'P')}
                  tabIndex={0}
                  role="button"
                  aria-label={`${prop.fullName}: ${prop.description}. ${isSelected ? 'Selected' : isUnavailable ? 'Unavailable' : 'Available'}. Press Enter or Space to ${isSelected ? 'deselect' : 'select'}.`}
                  aria-pressed={isSelected}
                />

                {/* Icon */}
                <circle
                  cx={circleX}
                  cy={circleY}
                  r="12"
                  fill="white"
                  className="pointer-events-none"
                />
                {isSelected ? (
                  <CheckCircle
                    x={circleX - 8}
                    y={circleY - 8}
                    width="16"
                    height="16"
                    className="text-white pointer-events-none"
                  />
                ) : isUnavailable ? (
                  <AlertTriangle
                    x={circleX - 8}
                    y={circleY - 8}
                    width="16"
                    height="16"
                    className="text-white pointer-events-none"
                  />
                ) : (
                  <circle
                    cx={circleX}
                    cy={circleY}
                    r="6"
                    fill="#9ca3af"
                    className="pointer-events-none"
                  />
                )}

                {/* Property letter */}
                <text
                  x={circleX}
                  y={circleY + 25}
                  textAnchor="middle"
                  className={`text-sm font-bold pointer-events-none ${
                    isSelected ? 'fill-white' : isUnavailable ? 'fill-red-600' : 'fill-gray-600'
                  }`}
                >
                  {key}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selection Status */}
      <div className="text-center mb-4" role="status" aria-live="polite" aria-atomic="true">
        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-gray-700">Selected:</span>
          {selectedProperties.size === 0 ? (
            <span className="text-gray-500 text-sm">None</span>
          ) : (
            Array.from(selectedProperties).map((prop) => (
              <span
                key={prop}
                className={`px-2 py-1 rounded text-xs font-semibold bg-${properties[prop].color}-100 text-${properties[prop].color}-800`}
              >
                {properties[prop].name}
              </span>
            ))
          )}
          {unavailableProperty && (
            <>
              <span className="text-gray-400" aria-hidden="true">
                •
              </span>
              <span className="text-sm font-medium text-red-600">Unavailable:</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                {properties[unavailableProperty].name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Property Details */}
      {hoveredProperty && (
        <div
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          role="tooltip"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start space-x-3">
            <Info
              className={`w-5 h-5 text-${properties[hoveredProperty].color}-600 mt-0.5`}
              aria-hidden="true"
            />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {properties[hoveredProperty].fullName}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {properties[hoveredProperty].description}
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold text-green-700 mb-1">✅ Benefits</div>
                  <ul className="text-green-600 space-y-0.5" role="list" aria-label="Benefits">
                    {properties[hoveredProperty].implications.positive.map((item, index) => (
                      <li key={index} role="listitem">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-red-700 mb-1">⚠️ Trade-offs</div>
                  <ul className="text-red-600 space-y-0.5" role="list" aria-label="Trade-offs">
                    {properties[hoveredProperty].implications.negative.map((item, index) => (
                      <li key={index} role="listitem">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3">
                <div className="font-semibold text-gray-700 text-xs mb-1">Common Use Cases:</div>
                <div className="flex flex-wrap gap-1" role="list" aria-label="Common use cases">
                  {properties[hoveredProperty].examples.map((example, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 bg-${properties[hoveredProperty].color}-50 text-${properties[hoveredProperty].color}-700 text-xs rounded`}
                      role="listitem"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-world Implications */}
      {selectedProperties.size === 2 && unavailableProperty && (
        <div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
          role="region"
          aria-labelledby="implications-heading"
        >
          <h4 id="implications-heading" className="font-semibold text-blue-800 mb-2">
            Real-World Implications
          </h4>
          <div className="text-sm text-blue-700">
            {unavailableProperty === 'C' && (
              <p>
                Choosing Availability + Partition Tolerance means you sacrifice strong consistency.
                This is common in systems like DynamoDB, Cassandra, and many web applications where
                eventual consistency is acceptable.
              </p>
            )}
            {unavailableProperty === 'A' && (
              <p>
                Choosing Consistency + Partition Tolerance means you sacrifice availability during
                partitions. This approach is used in traditional RDBMS and systems requiring ACID
                transactions, but may result in downtime during network failures.
              </p>
            )}
            {unavailableProperty === 'P' && (
              <p>
                Choosing Consistency + Availability means you cannot tolerate network partitions.
                This is only possible in single-datacenter, non-distributed systems where network
                failures don't create partitions.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        className="absolute bottom-2 right-2 text-xs text-gray-500 max-w-xs"
        role="complementary"
        aria-label="Usage instructions"
      >
        Click the circles or use Tab/Enter/Space to select/deselect properties. You can choose any 2
        out of 3.
      </div>
    </div>
  );
});

export default CAPTheorem2D;
