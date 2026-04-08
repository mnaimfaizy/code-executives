import React, { useMemo } from 'react';
import { ReactFlow, type Node, type Edge, Position, MarkerType } from '@xyflow/react';
import type { StateSnapshot, StackFrame, CapturedVariable, HeapObject } from '../../../types';

interface HeapStackLensProps {
  currentSnapshot: StateSnapshot;
  previousSnapshot: StateSnapshot | null;
}

/* ── Color palette ── */
const COLORS = {
  stackFrame: '#00d4ff',
  stackFrameActive: 'rgba(0, 212, 255, 0.15)',
  heapObject: '#8b5cf6',
  heapBg: 'rgba(139, 92, 246, 0.08)',
  primitive: '#14b8a6',
  refEdge: '#ffaa00',
  textPrimary: '#e0e0ff',
  textSecondary: '#a0a0cc',
  border: '#2a2a4e',
  bg: '#0a0a1a',
};

/* ── Helpers ── */
function formatVal(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value.length > 20 ? value.slice(0, 19) + '…' : value}"`;
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 30);
  return String(value);
}

function isPrimitive(type: string): boolean {
  return ['number', 'string', 'boolean', 'undefined', 'null', 'bigint', 'symbol'].includes(type);
}

/* ── Custom Stack Frame Node ── */
function StackFrameNode({
  data,
}: {
  data: { frame: StackFrame; variables: CapturedVariable[]; isTop: boolean };
}): React.ReactElement {
  const { frame, variables, isTop } = data;
  return (
    <div
      style={{
        background: isTop ? COLORS.stackFrameActive : 'rgba(18, 18, 42, 0.9)',
        border: `1px solid ${isTop ? COLORS.stackFrame : COLORS.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        minWidth: 180,
        maxWidth: 220,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: isTop ? COLORS.stackFrame : COLORS.textPrimary,
          marginBottom: 4,
          fontFamily: 'var(--pg-font-mono)',
        }}
      >
        {frame.functionName || '(anonymous)'}
        <span style={{ opacity: 0.5 }}> :{frame.line}</span>
      </div>
      {variables.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 4, marginTop: 2 }}>
          {variables.slice(0, 6).map((v) => (
            <div
              key={v.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                fontSize: 10,
                fontFamily: 'var(--pg-font-mono)',
                lineHeight: '18px',
              }}
            >
              <span style={{ color: COLORS.textSecondary }}>{v.name}</span>
              <span style={{ color: isPrimitive(v.type) ? COLORS.primitive : COLORS.refEdge }}>
                {isPrimitive(v.type) ? formatVal(v.value) : `→ ${v.type}`}
              </span>
            </div>
          ))}
          {variables.length > 6 && (
            <div style={{ fontSize: 9, color: COLORS.textSecondary, marginTop: 2 }}>
              +{variables.length - 6} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Custom Heap Object Node ── */
function HeapObjectNode({ data }: { data: { obj: HeapObject } }): React.ReactElement {
  const { obj } = data;
  const entries = Object.entries(obj.properties).slice(0, 8);

  return (
    <div
      style={{
        background: COLORS.heapBg,
        border: `1px solid ${COLORS.heapObject}`,
        borderRadius: 8,
        padding: '8px 12px',
        minWidth: 160,
        maxWidth: 200,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.heapObject,
          marginBottom: 4,
          fontFamily: 'var(--pg-font-mono)',
        }}
      >
        {obj.type}
        {obj.refCount !== undefined && (
          <span style={{ opacity: 0.5, fontSize: 9, marginLeft: 4 }}>refs: {obj.refCount}</span>
        )}
      </div>
      {entries.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 4, marginTop: 2 }}>
          {entries.map(([key, val]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                fontSize: 10,
                fontFamily: 'var(--pg-font-mono)',
                lineHeight: '18px',
              }}
            >
              <span style={{ color: COLORS.textSecondary }}>{key}</span>
              <span style={{ color: COLORS.primitive }}>{formatVal(val)}</span>
            </div>
          ))}
          {Object.keys(obj.properties).length > 8 && (
            <div style={{ fontSize: 9, color: COLORS.textSecondary, marginTop: 2 }}>
              +{Object.keys(obj.properties).length - 8} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  stackFrame: StackFrameNode,
  heapObject: HeapObjectNode,
};

/* ── Build React Flow nodes and edges from snapshot ── */
function buildGraph(snapshot: StateSnapshot): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const STACK_X = 20;
  const HEAP_X = 300;
  const ROW_HEIGHT = 100;

  // Stack frames (bottom-up, so reverse for top-down display)
  snapshot.callStack.forEach((frame, i) => {
    const frameVars = i === snapshot.callStack.length - 1 ? snapshot.variables : [];

    nodes.push({
      id: `stack-${i}`,
      type: 'stackFrame',
      position: { x: STACK_X, y: i * ROW_HEIGHT + 10 },
      data: {
        frame,
        variables: i === snapshot.callStack.length - 1 ? frameVars : [],
        isTop: i === snapshot.callStack.length - 1,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
    });
  });

  // Heap objects
  snapshot.heapObjects.forEach((obj, i) => {
    nodes.push({
      id: `heap-${obj.id}`,
      type: 'heapObject',
      position: { x: HEAP_X, y: i * ROW_HEIGHT + 10 },
      data: { obj },
      sourcePosition: Position.Left,
      targetPosition: Position.Left,
      draggable: true,
    });
  });

  // Edges: variables that reference heap objects
  const topFrameIdx = snapshot.callStack.length - 1;
  if (topFrameIdx >= 0) {
    snapshot.variables.forEach((v) => {
      if (!isPrimitive(v.type)) {
        // Try to find matching heap object
        const heapObj = snapshot.heapObjects.find(
          (obj) => obj.id === String(v.value) || obj.type === v.type
        );
        if (heapObj) {
          edges.push({
            id: `edge-${v.name}-${heapObj.id}`,
            source: `stack-${topFrameIdx}`,
            target: `heap-${heapObj.id}`,
            markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.refEdge },
            style: { stroke: COLORS.refEdge, strokeWidth: 1.5 },
            animated: true,
            label: v.name,
            labelStyle: { fontSize: 9, fill: COLORS.textSecondary },
          });
        }
      }
    });
  }

  return { nodes, edges };
}

/* ── Main Component ── */
const HeapStackLens: React.FC<HeapStackLensProps> = ({ currentSnapshot }) => {
  const { nodes, edges } = useMemo(() => buildGraph(currentSnapshot), [currentSnapshot]);

  // If no heap objects, show a simplified stack-only view
  if (currentSnapshot.heapObjects.length === 0 && currentSnapshot.callStack.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: COLORS.textSecondary }}
      >
        <div className="text-center space-y-2">
          <div className="text-2xl" aria-hidden="true">
            ⬒
          </div>
          <p className="text-xs">No heap or stack data in current step</p>
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
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      />
    </div>
  );
};

export default HeapStackLens;
