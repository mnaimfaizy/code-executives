import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Link } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  attributes: string[];
  color: string;
}

interface Relationship {
  from: string;
  to: string;
  label: string;
  cardinality: string;
}

interface ERDiagramBuilder2DProps {
  className?: string;
}

const ENTITY_TEMPLATES: Omit<Entity, 'id' | 'x' | 'y'>[] = [
  { name: 'User', attributes: ['user_id (PK)', 'name', 'email', 'created_at'], color: '#3b82f6' },
  {
    name: 'Order',
    attributes: ['order_id (PK)', 'user_id (FK)', 'total', 'status'],
    color: '#8b5cf6',
  },
  { name: 'Product', attributes: ['product_id (PK)', 'name', 'price', 'stock'], color: '#059669' },
  { name: 'Category', attributes: ['category_id (PK)', 'name', 'description'], color: '#f59e0b' },
  {
    name: 'Payment',
    attributes: ['payment_id (PK)', 'order_id (FK)', 'amount', 'method'],
    color: '#ef4444',
  },
  {
    name: 'Review',
    attributes: ['review_id (PK)', 'user_id (FK)', 'product_id (FK)', 'rating'],
    color: '#ec4899',
  },
];

let nextId = 1;

const ERDiagramBuilder2D: React.FC<ERDiagramBuilder2DProps> = React.memo(({ className = '' }) => {
  const [entities, setEntities] = useState<Entity[]>(() => [
    {
      id: 'e1',
      name: 'User',
      x: 80,
      y: 60,
      attributes: ['user_id (PK)', 'name', 'email', 'created_at'],
      color: '#3b82f6',
    },
    {
      id: 'e2',
      name: 'Order',
      x: 360,
      y: 60,
      attributes: ['order_id (PK)', 'user_id (FK)', 'total', 'status'],
      color: '#8b5cf6',
    },
    {
      id: 'e3',
      name: 'Product',
      x: 360,
      y: 220,
      attributes: ['product_id (PK)', 'name', 'price', 'stock'],
      color: '#059669',
    },
  ]);

  const [relationships, setRelationships] = useState<Relationship[]>([
    { from: 'e1', to: 'e2', label: 'places', cardinality: '1:N' },
    { from: 'e2', to: 'e3', label: 'contains', cardinality: 'N:M' },
  ]);

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const ENTITY_W = 180;
  const ENTITY_H = 120;

  const handleMouseDown = useCallback(
    (entityId: string, e: React.MouseEvent<SVGGElement>) => {
      if (connecting) return;
      const svg = (e.target as SVGElement).closest('svg');
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const entity = entities.find((en) => en.id === entityId);
      if (entity) {
        setDragOffset({ x: svgP.x - entity.x, y: svgP.y - entity.y });
        setDragging(entityId);
      }
    },
    [entities, connecting]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!dragging) return;
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      setEntities((prev) =>
        prev.map((en) =>
          en.id === dragging
            ? {
                ...en,
                x: Math.max(0, Math.min(600, svgP.x - dragOffset.x)),
                y: Math.max(0, Math.min(340, svgP.y - dragOffset.y)),
              }
            : en
        )
      );
    },
    [dragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleEntityClick = useCallback(
    (entityId: string) => {
      if (connecting) {
        if (connecting !== entityId) {
          const label = prompt('Relationship label (e.g., "has", "belongs to"):') || 'relates';
          const card = prompt('Cardinality (1:1, 1:N, N:M):') || '1:N';
          setRelationships((prev) => [
            ...prev,
            { from: connecting, to: entityId, label, cardinality: card },
          ]);
        }
        setConnecting(null);
      } else {
        setSelectedEntity(entityId === selectedEntity ? null : entityId);
      }
    },
    [connecting, selectedEntity]
  );

  const addEntity = useCallback((template: Omit<Entity, 'id' | 'x' | 'y'>) => {
    const id = `e${++nextId + 10}`;
    setEntities((prev) => [
      ...prev,
      {
        id,
        ...template,
        x: 80 + Math.random() * 400,
        y: 60 + Math.random() * 260,
      },
    ]);
  }, []);

  const removeEntity = useCallback(
    (entityId: string) => {
      setEntities((prev) => prev.filter((e) => e.id !== entityId));
      setRelationships((prev) => prev.filter((r) => r.from !== entityId && r.to !== entityId));
      if (selectedEntity === entityId) setSelectedEntity(null);
    },
    [selectedEntity]
  );

  const handleReset = useCallback(() => {
    nextId = 3;
    setEntities([
      {
        id: 'e1',
        name: 'User',
        x: 80,
        y: 60,
        attributes: ['user_id (PK)', 'name', 'email', 'created_at'],
        color: '#3b82f6',
      },
      {
        id: 'e2',
        name: 'Order',
        x: 360,
        y: 60,
        attributes: ['order_id (PK)', 'user_id (FK)', 'total', 'status'],
        color: '#8b5cf6',
      },
      {
        id: 'e3',
        name: 'Product',
        x: 360,
        y: 220,
        attributes: ['product_id (PK)', 'name', 'price', 'stock'],
        color: '#059669',
      },
    ]);
    setRelationships([
      { from: 'e1', to: 'e2', label: 'places', cardinality: '1:N' },
      { from: 'e2', to: 'e3', label: 'contains', cardinality: 'N:M' },
    ]);
    setSelectedEntity(null);
    setConnecting(null);
  }, []);

  const entityMap = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Canvas */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 overflow-hidden">
        <svg
          viewBox="0 0 700 400"
          className="w-full h-auto bg-gray-50 rounded-lg"
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="img"
          aria-label="Interactive Entity-Relationship Diagram"
        >
          <defs>
            <marker
              id="er-arrow"
              viewBox="0 0 10 7"
              refX="10"
              refY="3.5"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>

          {/* Grid */}
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`gv-${i}`}
              x1={i * 50}
              y1="0"
              x2={i * 50}
              y2="400"
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`gh-${i}`}
              x1="0"
              y1={i * 50}
              x2="700"
              y2={i * 50}
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          ))}

          {/* Relationships (lines first, under entities) */}
          {relationships.map((rel, i) => {
            const fromE = entityMap.get(rel.from);
            const toE = entityMap.get(rel.to);
            if (!fromE || !toE) return null;

            const x1 = fromE.x + ENTITY_W / 2;
            const y1 = fromE.y + ENTITY_H / 2;
            const x2 = toE.x + ENTITY_W / 2;
            const y2 = toE.y + ENTITY_H / 2;
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={`rel-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#6b7280"
                  strokeWidth="1.5"
                  markerEnd="url(#er-arrow)"
                />
                {/* Diamond for relationship */}
                <polygon
                  points={`${mx},${my - 14} ${mx + 24},${my} ${mx},${my + 14} ${mx - 24},${my}`}
                  fill="white"
                  stroke="#6b7280"
                  strokeWidth="1"
                />
                <text
                  x={mx}
                  y={my + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#374151"
                >
                  {rel.label}
                </text>
                {/* Cardinality labels */}
                <text
                  x={x1 + (mx - x1) * 0.25}
                  y={y1 + (my - y1) * 0.25 - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={fromE.color}
                >
                  {rel.cardinality.split(':')[0]}
                </text>
                <text
                  x={mx + (x2 - mx) * 0.75}
                  y={my + (y2 - my) * 0.75 - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={toE.color}
                >
                  {rel.cardinality.split(':')[1]}
                </text>
              </g>
            );
          })}

          {/* Entities */}
          {entities.map((entity) => {
            const isSelected = selectedEntity === entity.id;
            const isConnecting = connecting === entity.id;

            return (
              <g
                key={entity.id}
                onMouseDown={(e) => handleMouseDown(entity.id, e)}
                onClick={() => handleEntityClick(entity.id)}
                style={{ cursor: connecting ? 'crosshair' : 'grab' }}
              >
                {/* Entity rectangle */}
                <rect
                  x={entity.x}
                  y={entity.y}
                  width={ENTITY_W}
                  height={ENTITY_H}
                  rx="8"
                  fill="white"
                  stroke={isConnecting ? '#f59e0b' : isSelected ? entity.color : '#d1d5db'}
                  strokeWidth={isSelected || isConnecting ? 2.5 : 1}
                />
                {/* Header */}
                <rect
                  x={entity.x}
                  y={entity.y}
                  width={ENTITY_W}
                  height="28"
                  rx="8"
                  fill={entity.color}
                />
                <rect
                  x={entity.x}
                  y={entity.y + 20}
                  width={ENTITY_W}
                  height="8"
                  fill={entity.color}
                />
                <text
                  x={entity.x + ENTITY_W / 2}
                  y={entity.y + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="white"
                >
                  {entity.name}
                </text>

                {/* Attributes */}
                {entity.attributes.slice(0, 4).map((attr, ai) => (
                  <text
                    key={ai}
                    x={entity.x + 10}
                    y={entity.y + 46 + ai * 16}
                    fontSize="9"
                    fill={
                      attr.includes('PK')
                        ? entity.color
                        : attr.includes('FK')
                          ? '#f59e0b'
                          : '#6b7280'
                    }
                    fontWeight={attr.includes('PK') ? 'bold' : 'normal'}
                  >
                    {attr}
                  </text>
                ))}

                {/* Selection indicator */}
                {isSelected && (
                  <rect
                    x={entity.x - 3}
                    y={entity.y - 3}
                    width={ENTITY_W + 6}
                    height={ENTITY_H + 6}
                    rx="10"
                    fill="none"
                    stroke={entity.color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;-8"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
              </g>
            );
          })}

          {connecting && (
            <text
              x="350"
              y="390"
              textAnchor="middle"
              fontSize="11"
              fill="#f59e0b"
              fontWeight="bold"
            >
              Click another entity to create a relationship...
            </text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Add entities */}
        <div className="flex flex-wrap gap-1.5">
          {ENTITY_TEMPLATES.filter((t) => !entities.some((e) => e.name === t.name)).map(
            (template) => (
              <button
                key={template.name}
                onClick={() => addEntity(template)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:shadow-md transition-all"
              >
                <Plus className="w-3 h-3" />
                {template.name}
              </button>
            )
          )}
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setConnecting(connecting ? null : selectedEntity)}
            disabled={!selectedEntity}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              connecting
                ? 'bg-amber-500 text-white'
                : 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40'
            }`}
          >
            <Link className="w-3 h-3" />
            {connecting ? 'Cancel' : 'Connect'}
          </button>

          {selectedEntity && (
            <button
              onClick={() => removeEntity(selectedEntity)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Drag entities to reposition. Click to select. Use &quot;Connect&quot; to draw relationships.
        PK = Primary Key, FK = Foreign Key.
      </p>
    </div>
  );
});

ERDiagramBuilder2D.displayName = 'ERDiagramBuilder2D';

export default ERDiagramBuilder2D;
