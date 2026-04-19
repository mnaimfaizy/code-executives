import React, { useState } from 'react';

/**
 * AbstractionLayers2D — Interactive abstraction layered diagram.
 * Shows how abstract classes and interfaces hide implementation details,
 * exposing only essential functionality.
 */

interface LayerItem {
  label: string;
  type: 'abstract' | 'interface' | 'concrete';
  members: string[];
}

interface AbstractionExample {
  title: string;
  layers: { name: string; color: string; items: LayerItem[] }[];
}

const EXAMPLES: AbstractionExample[] = [
  {
    title: 'Payment System',
    layers: [
      {
        name: 'Interface Layer (What)',
        color: '#6366f1',
        items: [
          {
            label: 'PaymentProcessor',
            type: 'interface',
            members: ['processPayment(amount): boolean', 'refund(txId): boolean'],
          },
        ],
      },
      {
        name: 'Abstract Layer (Shared Logic)',
        color: '#8b5cf6',
        items: [
          {
            label: 'BasePayment',
            type: 'abstract',
            members: ['validate(amount): boolean', 'abstract connect(): void', 'logTransaction()'],
          },
        ],
      },
      {
        name: 'Concrete Layer (How)',
        color: '#22c55e',
        items: [
          {
            label: 'StripePayment',
            type: 'concrete',
            members: ['connect(): void', 'processPayment()', 'refund()'],
          },
          {
            label: 'PayPalPayment',
            type: 'concrete',
            members: ['connect(): void', 'processPayment()', 'refund()'],
          },
        ],
      },
    ],
  },
  {
    title: 'Data Access',
    layers: [
      {
        name: 'Interface Layer',
        color: '#0ea5e9',
        items: [
          {
            label: 'Repository<T>',
            type: 'interface',
            members: ['findById(id): T', 'save(entity: T): void', 'delete(id): void'],
          },
        ],
      },
      {
        name: 'Abstract Layer',
        color: '#06b6d4',
        items: [
          {
            label: 'BaseRepository<T>',
            type: 'abstract',
            members: ['abstract getConnection()', 'cache: Map<string, T>', 'findById(id): T'],
          },
        ],
      },
      {
        name: 'Concrete Layer',
        color: '#10b981',
        items: [
          {
            label: 'SQLRepository',
            type: 'concrete',
            members: ['getConnection()', 'query(sql)'],
          },
          {
            label: 'MongoRepository',
            type: 'concrete',
            members: ['getConnection()', 'collection()'],
          },
          {
            label: 'InMemoryRepository',
            type: 'concrete',
            members: ['getConnection()', 'store: Map'],
          },
        ],
      },
    ],
  },
  {
    title: 'Logger System',
    layers: [
      {
        name: 'Interface Layer',
        color: '#f59e0b',
        items: [
          {
            label: 'Logger',
            type: 'interface',
            members: ['info(msg): void', 'warn(msg): void', 'error(msg): void'],
          },
        ],
      },
      {
        name: 'Abstract Layer',
        color: '#f97316',
        items: [
          {
            label: 'BaseLogger',
            type: 'abstract',
            members: ['abstract write(level, msg)', 'format(msg): string', 'timestamp(): string'],
          },
        ],
      },
      {
        name: 'Concrete Layer',
        color: '#22c55e',
        items: [
          {
            label: 'ConsoleLogger',
            type: 'concrete',
            members: ['write(level, msg)'],
          },
          {
            label: 'FileLogger',
            type: 'concrete',
            members: ['write(level, msg)', 'filePath: string'],
          },
        ],
      },
    ],
  },
];

const AbstractionLayers2D: React.FC = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [highlightLayer, setHighlightLayer] = useState<number | null>(null);

  const example = EXAMPLES[exampleIdx];

  const layerHeight = 90;
  const svgWidth = 700;
  const startY = 20;

  return (
    <div className="space-y-5">
      {/* Example picker */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.title}
            onClick={() => {
              setExampleIdx(i);
              setExpandedItem(null);
              setHighlightLayer(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exampleIdx === i
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${startY + example.layers.length * layerHeight + 30}`}
          className="w-full"
          style={{ minHeight: '16rem' }}
        >
          {example.layers.map((layer, layerIdx) => {
            const y = startY + layerIdx * layerHeight;
            const isHighlighted = highlightLayer === null || highlightLayer === layerIdx;
            const itemWidth = (svgWidth - 40) / layer.items.length;

            return (
              <g
                key={layer.name}
                opacity={isHighlighted ? 1 : 0.3}
                onMouseEnter={() => setHighlightLayer(layerIdx)}
                onMouseLeave={() => setHighlightLayer(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Layer background band */}
                <rect
                  x={10}
                  y={y}
                  width={svgWidth - 20}
                  height={layerHeight - 8}
                  rx={12}
                  fill={`${layer.color}10`}
                  stroke={`${layer.color}40`}
                  strokeWidth={1}
                />
                {/* Layer title */}
                <text x={20} y={y + 16} fill={layer.color} fontSize="11" fontWeight="700">
                  {layer.name}
                </text>

                {/* Items in this layer */}
                {layer.items.map((item, itemIdx) => {
                  const itemX = 20 + itemIdx * itemWidth;
                  const itemY = y + 26;
                  const isInterface = item.type === 'interface';
                  const isAbstract = item.type === 'abstract';
                  const isExpanded = expandedItem === `${layerIdx}-${itemIdx}`;
                  const boxH = isExpanded ? 24 + item.members.length * 14 : 40;

                  return (
                    <g
                      key={item.label}
                      onClick={() => setExpandedItem(isExpanded ? null : `${layerIdx}-${itemIdx}`)}
                    >
                      <rect
                        x={itemX}
                        y={itemY}
                        width={itemWidth - 10}
                        height={boxH}
                        rx={8}
                        fill="white"
                        stroke={layer.color}
                        strokeWidth={1.5}
                        strokeDasharray={isInterface ? '6 3' : isAbstract ? '8 2' : 'none'}
                      />
                      {/* Item header */}
                      <text
                        x={itemX + (itemWidth - 10) / 2}
                        y={itemY + 16}
                        textAnchor="middle"
                        fill={layer.color}
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="ui-monospace, monospace"
                      >
                        {isInterface ? '\u00AB' : ''}
                        {isAbstract ? 'abstract ' : ''}
                        {item.label}
                        {isInterface ? '\u00BB' : ''}
                      </text>
                      {!isExpanded && (
                        <text
                          x={itemX + (itemWidth - 10) / 2}
                          y={itemY + 32}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="9"
                        >
                          {item.members.length} members — click to expand
                        </text>
                      )}
                      {isExpanded &&
                        item.members.map((m, mi) => (
                          <text
                            key={mi}
                            x={itemX + 8}
                            y={itemY + 30 + mi * 14}
                            fill="#374151"
                            fontSize="10"
                            fontFamily="ui-monospace, monospace"
                          >
                            {m}
                          </text>
                        ))}
                    </g>
                  );
                })}

                {/* Connection arrows to next layer */}
                {layerIdx < example.layers.length - 1 &&
                  layer.items.map((item, itemIdx) => {
                    const fromX = 20 + itemIdx * itemWidth + (itemWidth - 10) / 2;
                    const fromY = y + layerHeight - 8;
                    const nextLayer = example.layers[layerIdx + 1];
                    return nextLayer.items.map((_, nextIdx) => {
                      const toX =
                        20 +
                        nextIdx * ((svgWidth - 40) / nextLayer.items.length) +
                        ((svgWidth - 40) / nextLayer.items.length - 10) / 2;
                      const toY = y + layerHeight + 2;
                      return (
                        <line
                          key={`${item.label}-${nextIdx}`}
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={`${layer.color}60`}
                          strokeWidth={1.5}
                          strokeDasharray="4 3"
                        />
                      );
                    });
                  })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info */}
      <div className="flex items-center gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 border border-indigo-400 border-dashed bg-indigo-50 inline-block" />{' '}
          Interface
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-4 h-3 border border-purple-400 bg-purple-50 inline-block"
            style={{ borderStyle: 'dashed' }}
          />{' '}
          Abstract class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded border border-emerald-400 bg-emerald-50 inline-block" />{' '}
          Concrete class
        </span>
        <span className="ml-auto text-gray-400 italic">Hover layers · Click boxes to expand</span>
      </div>
    </div>
  );
};

export default React.memo(AbstractionLayers2D);
