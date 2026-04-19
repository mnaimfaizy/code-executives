import React, { useState, useCallback } from 'react';

/**
 * SOLIDVisualizer2D — Interactive SOLID principles dependency diagram.
 * Shows how each principle transforms code architecture from bad to good design.
 */

interface DependencyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  type: 'class' | 'interface' | 'module';
}

interface DependencyEdge {
  from: string;
  to: string;
  label?: string;
  style: 'solid' | 'dashed';
  color: string;
}

interface Scenario {
  title: string;
  letter: string;
  letterColor: string;
  bad: { nodes: DependencyNode[]; edges: DependencyEdge[]; caption: string };
  good: { nodes: DependencyNode[]; edges: DependencyEdge[]; caption: string };
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Single Responsibility',
    letter: 'S',
    letterColor: '#ef4444',
    bad: {
      nodes: [
        { id: 'god', label: 'UserManager', x: 350, y: 80, color: '#fca5a5', type: 'class' },
        { id: 'db', label: 'Database', x: 150, y: 220, color: '#d1d5db', type: 'module' },
        { id: 'email', label: 'Email', x: 350, y: 220, color: '#d1d5db', type: 'module' },
        { id: 'log', label: 'Logger', x: 550, y: 220, color: '#d1d5db', type: 'module' },
      ],
      edges: [
        { from: 'god', to: 'db', label: 'saves', style: 'solid', color: '#ef4444' },
        { from: 'god', to: 'email', label: 'sends', style: 'solid', color: '#ef4444' },
        { from: 'god', to: 'log', label: 'logs', style: 'solid', color: '#ef4444' },
      ],
      caption: 'One class does everything — hard to change',
    },
    good: {
      nodes: [
        { id: 'user', label: 'UserService', x: 200, y: 80, color: '#bbf7d0', type: 'class' },
        {
          id: 'notif',
          label: 'NotificationService',
          x: 500,
          y: 80,
          color: '#bbf7d0',
          type: 'class',
        },
        { id: 'db', label: 'UserRepo', x: 200, y: 220, color: '#d1fae5', type: 'class' },
        { id: 'email', label: 'EmailSender', x: 500, y: 220, color: '#d1fae5', type: 'class' },
      ],
      edges: [
        { from: 'user', to: 'db', label: 'uses', style: 'solid', color: '#22c55e' },
        { from: 'notif', to: 'email', label: 'uses', style: 'solid', color: '#22c55e' },
      ],
      caption: 'Each class has one job — easy to change',
    },
  },
  {
    title: 'Open/Closed',
    letter: 'O',
    letterColor: '#f97316',
    bad: {
      nodes: [
        { id: 'calc', label: 'AreaCalculator', x: 350, y: 80, color: '#fed7aa', type: 'class' },
        { id: 'circle', label: 'Circle', x: 150, y: 220, color: '#d1d5db', type: 'class' },
        { id: 'rect', label: 'Rectangle', x: 350, y: 220, color: '#d1d5db', type: 'class' },
        { id: 'tri', label: 'Triangle?', x: 550, y: 220, color: '#fca5a5', type: 'class' },
      ],
      edges: [
        { from: 'calc', to: 'circle', label: 'if circle', style: 'solid', color: '#f97316' },
        { from: 'calc', to: 'rect', label: 'if rect', style: 'solid', color: '#f97316' },
        { from: 'calc', to: 'tri', label: 'modify!', style: 'dashed', color: '#ef4444' },
      ],
      caption: 'Adding shapes requires modifying calculator',
    },
    good: {
      nodes: [
        {
          id: 'iface',
          label: 'Shape (interface)',
          x: 350,
          y: 60,
          color: '#bfdbfe',
          type: 'interface',
        },
        { id: 'calc', label: 'AreaCalculator', x: 350, y: 170, color: '#bbf7d0', type: 'class' },
        { id: 'circle', label: 'Circle', x: 150, y: 280, color: '#d1fae5', type: 'class' },
        { id: 'rect', label: 'Rectangle', x: 350, y: 280, color: '#d1fae5', type: 'class' },
        { id: 'tri', label: 'Triangle', x: 550, y: 280, color: '#d1fae5', type: 'class' },
      ],
      edges: [
        { from: 'calc', to: 'iface', label: 'depends on', style: 'dashed', color: '#3b82f6' },
        { from: 'circle', to: 'iface', label: 'implements', style: 'dashed', color: '#22c55e' },
        { from: 'rect', to: 'iface', label: 'implements', style: 'dashed', color: '#22c55e' },
        { from: 'tri', to: 'iface', label: 'implements', style: 'dashed', color: '#22c55e' },
      ],
      caption: 'New shapes just implement the interface',
    },
  },
  {
    title: 'Liskov Substitution',
    letter: 'L',
    letterColor: '#eab308',
    bad: {
      nodes: [
        { id: 'bird', label: 'Bird', x: 350, y: 60, color: '#fef08a', type: 'class' },
        { id: 'eagle', label: 'Eagle', x: 200, y: 200, color: '#d1fae5', type: 'class' },
        { id: 'penguin', label: 'Penguin', x: 500, y: 200, color: '#fca5a5', type: 'class' },
      ],
      edges: [
        { from: 'eagle', to: 'bird', label: 'extends', style: 'solid', color: '#22c55e' },
        { from: 'penguin', to: 'bird', label: 'extends', style: 'solid', color: '#ef4444' },
      ],
      caption: "Penguin can't fly — breaks Bird.fly() contract",
    },
    good: {
      nodes: [
        { id: 'bird', label: 'Bird', x: 350, y: 40, color: '#fef08a', type: 'class' },
        { id: 'flyable', label: 'Flyable', x: 200, y: 130, color: '#bfdbfe', type: 'interface' },
        { id: 'swim', label: 'Swimmable', x: 500, y: 130, color: '#bfdbfe', type: 'interface' },
        { id: 'eagle', label: 'Eagle', x: 200, y: 250, color: '#d1fae5', type: 'class' },
        { id: 'penguin', label: 'Penguin', x: 500, y: 250, color: '#d1fae5', type: 'class' },
      ],
      edges: [
        { from: 'eagle', to: 'bird', label: 'extends', style: 'solid', color: '#22c55e' },
        { from: 'penguin', to: 'bird', label: 'extends', style: 'solid', color: '#22c55e' },
        { from: 'eagle', to: 'flyable', label: 'implements', style: 'dashed', color: '#3b82f6' },
        { from: 'penguin', to: 'swim', label: 'implements', style: 'dashed', color: '#3b82f6' },
      ],
      caption: 'Capabilities via interfaces — proper substitution',
    },
  },
  {
    title: 'Interface Segregation',
    letter: 'I',
    letterColor: '#22c55e',
    bad: {
      nodes: [
        { id: 'fat', label: 'Worker (fat)', x: 350, y: 60, color: '#fca5a5', type: 'interface' },
        { id: 'human', label: 'HumanWorker', x: 200, y: 200, color: '#d1d5db', type: 'class' },
        { id: 'robot', label: 'RobotWorker', x: 500, y: 200, color: '#fca5a5', type: 'class' },
      ],
      edges: [
        { from: 'human', to: 'fat', label: 'implements all', style: 'solid', color: '#22c55e' },
        {
          from: 'robot',
          to: 'fat',
          label: 'forced to impl eat()',
          style: 'solid',
          color: '#ef4444',
        },
      ],
      caption: "Robot forced to implement eat() it can't use",
    },
    good: {
      nodes: [
        { id: 'workable', label: 'Workable', x: 200, y: 60, color: '#bbf7d0', type: 'interface' },
        { id: 'feedable', label: 'Feedable', x: 500, y: 60, color: '#bbf7d0', type: 'interface' },
        { id: 'human', label: 'HumanWorker', x: 200, y: 200, color: '#d1fae5', type: 'class' },
        { id: 'robot', label: 'RobotWorker', x: 500, y: 200, color: '#d1fae5', type: 'class' },
      ],
      edges: [
        { from: 'human', to: 'workable', label: 'implements', style: 'dashed', color: '#22c55e' },
        { from: 'human', to: 'feedable', label: 'implements', style: 'dashed', color: '#22c55e' },
        { from: 'robot', to: 'workable', label: 'implements', style: 'dashed', color: '#22c55e' },
      ],
      caption: 'Clients only depend on interfaces they use',
    },
  },
  {
    title: 'Dependency Inversion',
    letter: 'D',
    letterColor: '#8b5cf6',
    bad: {
      nodes: [
        { id: 'app', label: 'OrderService', x: 350, y: 60, color: '#e9d5ff', type: 'class' },
        { id: 'mysql', label: 'MySQLDatabase', x: 200, y: 200, color: '#fca5a5', type: 'class' },
        { id: 'stripe', label: 'StripePayment', x: 500, y: 200, color: '#fca5a5', type: 'class' },
      ],
      edges: [
        { from: 'app', to: 'mysql', label: 'depends on', style: 'solid', color: '#ef4444' },
        { from: 'app', to: 'stripe', label: 'depends on', style: 'solid', color: '#ef4444' },
      ],
      caption: 'High-level depends on low-level implementations',
    },
    good: {
      nodes: [
        { id: 'app', label: 'OrderService', x: 350, y: 40, color: '#d8b4fe', type: 'class' },
        { id: 'idb', label: 'IDatabase', x: 200, y: 140, color: '#bfdbfe', type: 'interface' },
        { id: 'ipay', label: 'IPayment', x: 500, y: 140, color: '#bfdbfe', type: 'interface' },
        { id: 'mysql', label: 'MySQLDatabase', x: 200, y: 260, color: '#d1fae5', type: 'class' },
        { id: 'stripe', label: 'StripePayment', x: 500, y: 260, color: '#d1fae5', type: 'class' },
      ],
      edges: [
        { from: 'app', to: 'idb', label: 'depends on', style: 'dashed', color: '#3b82f6' },
        { from: 'app', to: 'ipay', label: 'depends on', style: 'dashed', color: '#3b82f6' },
        { from: 'mysql', to: 'idb', label: 'implements', style: 'dashed', color: '#22c55e' },
        { from: 'stripe', to: 'ipay', label: 'implements', style: 'dashed', color: '#22c55e' },
      ],
      caption: 'Both levels depend on abstractions',
    },
  },
];

const SOLIDVisualizer2D: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showGood, setShowGood] = useState(false);

  const scenario = SCENARIOS[activeIdx];
  const diagram = showGood ? scenario.good : scenario.bad;

  const renderNode = useCallback((node: DependencyNode) => {
    const isInterface = node.type === 'interface';
    const radius = isInterface ? 0 : 8;
    return (
      <g key={node.id}>
        <rect
          x={node.x - 65}
          y={node.y - 18}
          width={130}
          height={36}
          rx={radius}
          fill={node.color}
          stroke={isInterface ? '#3b82f6' : '#6b7280'}
          strokeWidth={1.5}
          strokeDasharray={isInterface ? '6 3' : 'none'}
        />
        <text
          x={node.x}
          y={node.y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="600"
          fontFamily="ui-monospace, monospace"
          fill="#1f2937"
        >
          {node.label}
        </text>
      </g>
    );
  }, []);

  const renderEdge = useCallback((edge: DependencyEdge, nodes: DependencyNode[]) => {
    const from = nodes.find((n) => n.id === edge.from);
    const to = nodes.find((n) => n.id === edge.to);
    if (!from || !to) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;

    const x1 = from.x + ux * 22;
    const y1 = from.y + uy * 22;
    const x2 = to.x - ux * 22;
    const y2 = to.y - uy * 22;

    return (
      <g key={`${edge.from}-${edge.to}`}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={edge.color}
          strokeWidth={2}
          strokeDasharray={edge.style === 'dashed' ? '6 4' : 'none'}
          markerEnd={`url(#arrow-${edge.color.replace('#', '')})`}
        />
        {edge.label && (
          <text
            x={(x1 + x2) / 2 + (uy > 0 ? 8 : -8)}
            y={(y1 + y2) / 2 - 6}
            textAnchor="middle"
            fontSize="10"
            fill={edge.color}
            fontWeight="500"
            fontStyle="italic"
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  }, []);

  const uniqueColors = [...new Set(diagram.edges.map((e) => e.color))];

  return (
    <div className="space-y-5">
      {/* Principle tabs */}
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.letter}
            onClick={() => {
              setActiveIdx(i);
              setShowGood(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeIdx === i
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={activeIdx === i ? { backgroundColor: s.letterColor } : undefined}
          >
            {s.letter} — {s.title}
          </button>
        ))}
      </div>

      {/* Toggle bad/good */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowGood(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !showGood
              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✗ Violation
        </button>
        <button
          onClick={() => setShowGood(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showGood
              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✓ Following Principle
        </button>
        <span className="ml-auto text-sm text-gray-500 italic">{diagram.caption}</span>
      </div>

      {/* SVG diagram */}
      <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 overflow-hidden">
        <svg viewBox="0 0 700 320" className="w-full" style={{ minHeight: '16rem' }}>
          <defs>
            {uniqueColors.map((c) => (
              <marker
                key={c}
                id={`arrow-${c.replace('#', '')}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={c} />
              </marker>
            ))}
          </defs>
          {diagram.edges.map((e) => renderEdge(e, diagram.nodes))}
          {diagram.nodes.map(renderNode)}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded border border-gray-400 bg-gray-100 inline-block" /> Class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 border border-blue-400 border-dashed bg-blue-50 inline-block" />{' '}
          Interface
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 border-t-2 border-gray-500 inline-block" /> Depends on
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 border-t-2 border-dashed border-blue-500 inline-block" /> Implements
        </span>
      </div>
    </div>
  );
};

export default React.memo(SOLIDVisualizer2D);
