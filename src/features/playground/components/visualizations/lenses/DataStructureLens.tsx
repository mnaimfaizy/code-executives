import React, { useMemo } from 'react';
import { ReactFlow, type Node, type Edge, Position, MarkerType } from '@xyflow/react';
import AnimatedNode from '../shared/AnimatedNode';
import type { AnimationState } from '../shared/AnimatedNode';
import type { StateSnapshot, CapturedVariable } from '../../../types';

interface DataStructureLensProps {
  currentSnapshot: StateSnapshot;
  previousSnapshot: StateSnapshot | null;
}

/* ── Color palette ── */
const COLORS = {
  array: '#00d4ff',
  linkedList: '#8b5cf6',
  tree: '#14b8a6',
  stack: '#ffaa00',
  hashTable: '#ff4466',
  edge: '#a0a0cc',
  textMuted: '#6b6b99',
};

const nodeTypes = { animated: AnimatedNode };

/* ── Detect the likely structure type from a variable ── */
type StructureKind = 'array' | 'linked-list' | 'tree' | 'stack' | 'hash-table' | 'unknown';

function detectStructure(variable: CapturedVariable): StructureKind {
  const { type, value, name } = variable;
  const lowerName = name.toLowerCase();

  if (type === 'Array' || Array.isArray(value)) return 'array';
  if (lowerName.includes('stack')) return 'stack';
  if (lowerName.includes('queue')) return 'array'; // queues visualize like arrays

  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.includes('next') || keys.includes('prev')) return 'linked-list';
    if (keys.includes('left') || keys.includes('right')) return 'tree';
    if (keys.includes('buckets') || lowerName.includes('map') || lowerName.includes('hash'))
      return 'hash-table';
  }

  if (type === 'Map' || type === 'Set') return 'hash-table';
  return 'unknown';
}

function colorForKind(kind: StructureKind): string {
  const map: Record<StructureKind, string> = {
    array: COLORS.array,
    'linked-list': COLORS.linkedList,
    tree: COLORS.tree,
    stack: COLORS.stack,
    'hash-table': COLORS.hashTable,
    unknown: COLORS.array,
  };
  return map[kind];
}

/* ── Build array visualization ── */
function buildArrayNodes(
  variable: CapturedVariable,
  color: string,
  offsetY: number
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const items = Array.isArray(variable.value) ? (variable.value as unknown[]) : [];
  const CELL_W = 70;

  // Label node
  nodes.push({
    id: `label-${variable.name}`,
    type: 'animated',
    position: { x: 0, y: offsetY },
    data: {
      label: variable.name,
      sublabel: `${variable.type}[${items.length}]`,
      color,
      animationState: 'normal' as AnimationState,
    },
    draggable: false,
  });

  items.forEach((item, i) => {
    nodes.push({
      id: `${variable.name}-${i}`,
      type: 'animated',
      position: { x: i * CELL_W + 10, y: offsetY + 55 },
      data: {
        label: String(item),
        sublabel: `[${i}]`,
        color,
        animationState: 'normal' as AnimationState,
        showLeftHandle: i > 0,
        showRightHandle: i < items.length - 1,
      },
      draggable: false,
    });
  });

  return { nodes, edges: [] };
}

/* ── Build linked list visualization ── */
function buildLinkedListNodes(
  variable: CapturedVariable,
  color: string,
  offsetY: number
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const X_SPACING = 120;

  // Traverse linked list
  let current = variable.value as Record<string, unknown> | null;
  let i = 0;
  const visited = new Set<unknown>();
  const MAX_NODES = 20;

  while (current && typeof current === 'object' && !visited.has(current) && i < MAX_NODES) {
    visited.add(current);
    const nodeId = `${variable.name}-ll-${i}`;
    const val = 'val' in current ? current.val : 'value' in current ? current.value : '?';

    nodes.push({
      id: nodeId,
      type: 'animated',
      position: { x: i * X_SPACING, y: offsetY },
      data: {
        label: String(val),
        color,
        animationState: 'normal' as AnimationState,
        showLeftHandle: i > 0,
        showRightHandle: true,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
    });

    if (i > 0) {
      edges.push({
        id: `${variable.name}-edge-${i - 1}-${i}`,
        source: `${variable.name}-ll-${i - 1}`,
        target: nodeId,
        markerEnd: { type: MarkerType.ArrowClosed, color },
        style: { stroke: color, strokeWidth: 1.5 },
      });
    }

    current = (current.next as Record<string, unknown> | null) ?? null;
    i++;
  }

  return { nodes, edges };
}

/* ── Build tree visualization ── */
function buildTreeNodes(
  variable: CapturedVariable,
  color: string,
  offsetY: number
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const X_SPACING = 100;
  const Y_SPACING = 80;

  function traverse(
    node: Record<string, unknown> | null,
    id: string,
    x: number,
    y: number,
    spread: number
  ): void {
    if (!node || typeof node !== 'object') return;
    const val = 'val' in node ? node.val : 'value' in node ? node.value : '?';

    nodes.push({
      id,
      type: 'animated',
      position: { x, y: y + offsetY },
      data: {
        label: String(val),
        color,
        animationState: 'normal' as AnimationState,
        showTopHandle: true,
        showBottomHandle: !!(node.left || node.right),
      },
      draggable: false,
    });

    const left = node.left as Record<string, unknown> | null;
    const right = node.right as Record<string, unknown> | null;

    if (left) {
      const childId = `${id}-L`;
      edges.push({
        id: `edge-${id}-L`,
        source: id,
        target: childId,
        style: { stroke: color, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color },
      });
      traverse(left, childId, x - spread, y + Y_SPACING, spread / 2);
    }
    if (right) {
      const childId = `${id}-R`;
      edges.push({
        id: `edge-${id}-R`,
        source: id,
        target: childId,
        style: { stroke: color, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color },
      });
      traverse(right, childId, x + spread, y + Y_SPACING, spread / 2);
    }
  }

  const root = variable.value as Record<string, unknown> | null;
  traverse(root, `${variable.name}-root`, X_SPACING * 3, 0, X_SPACING * 2);

  return { nodes, edges };
}

/* ── Build graph from all detected data structures ── */
function buildGraph(
  snapshot: StateSnapshot,
  prevSnapshot: StateSnapshot | null
): { nodes: Node[]; edges: Edge[] } {
  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];
  let offsetY = 0;

  // Find variables that look like data structures
  const structVars = snapshot.variables.filter((v) => {
    const kind = detectStructure(v);
    return kind !== 'unknown';
  });

  if (structVars.length === 0) {
    // Fallback: show all arrays
    const arrays = snapshot.variables.filter((v) => v.type === 'Array' || Array.isArray(v.value));
    structVars.push(...arrays);
  }

  for (const variable of structVars) {
    const kind = detectStructure(variable);
    const color = colorForKind(kind);

    let result: { nodes: Node[]; edges: Edge[] };

    switch (kind) {
      case 'linked-list':
        result = buildLinkedListNodes(variable, color, offsetY);
        break;
      case 'tree':
        result = buildTreeNodes(variable, color, offsetY);
        break;
      case 'array':
      case 'stack':
      default:
        result = buildArrayNodes(variable, color, offsetY);
        break;
    }

    allNodes.push(...result.nodes);
    allEdges.push(...result.edges);
    offsetY += 130;
  }

  // Highlight changed variables
  if (prevSnapshot) {
    const prevVarMap = new Map(prevSnapshot.variables.map((v) => [v.name, v]));
    for (const node of allNodes) {
      const nameParts = node.id.split('-');
      const varName = nameParts[0];
      if (varName && !prevVarMap.has(varName)) {
        // New variable
        (node.data as { animationState: AnimationState }).animationState = 'pulse';
      }
    }
  }

  return { nodes: allNodes, edges: allEdges };
}

/* ── Main Component ── */
const DataStructureLens: React.FC<DataStructureLensProps> = ({
  currentSnapshot,
  previousSnapshot,
}) => {
  const { nodes, edges } = useMemo(
    () => buildGraph(currentSnapshot, previousSnapshot),
    [currentSnapshot, previousSnapshot]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: COLORS.textMuted }}>
        <div className="text-center space-y-2">
          <div className="text-2xl" aria-hidden="true">
            ⌬
          </div>
          <p className="text-xs">No data structure variables detected</p>
          <p className="text-xs" style={{ maxWidth: 200 }}>
            Declare arrays, linked lists, or trees to see them visualized here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
        minZoom={0.2}
        maxZoom={3}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      />
    </div>
  );
};

export default DataStructureLens;
