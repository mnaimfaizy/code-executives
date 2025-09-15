import { parse } from 'acorn';

export type StackEvent = { type: 'push' | 'pop'; label: string };
export type FunctionInfo = {
  label: string;
  start: number; // start of function declaration
  end: number; // end of function declaration
  bodyStart: number; // start index just after '{'
  bodyEnd: number; // end index just before '}'
};

export interface InstrumentResult {
  transpiled: string;
  run: (hooks: { __push: (label: string) => void; __pop: (label: string) => void }) => unknown;
  events: StackEvent[];
  functions: FunctionInfo[];
}

// Very minimal AST walker; instruments FunctionDeclaration and FunctionExpression calls.
// Minimal AST types we need from acorn to avoid using any
type BlockStatement = { type: 'BlockStatement'; start: number; end: number };
type FunctionDeclaration = {
  type: 'FunctionDeclaration';
  id?: { name: string };
  body: BlockStatement;
  start: number;
  end: number;
};
type FunctionExpression = {
  type: 'FunctionExpression';
  id?: { name: string };
  body: BlockStatement;
  start: number;
  end: number;
};
type ArrowFunctionExpression = {
  type: 'ArrowFunctionExpression';
  body: BlockStatement | { type: string; start: number; end: number };
  start: number;
  end: number;
};
type Identifier = { type: 'Identifier'; name: string };
type VariableDeclarator = { type: 'VariableDeclarator'; id: Identifier };
type AssignmentExpression = {
  type: 'AssignmentExpression';
  left: Identifier | { type: 'MemberExpression'; property?: Identifier; computed?: boolean };
};
type Property = { type: 'Property'; key: Identifier; method?: boolean };
type MethodDefinition = { type: 'MethodDefinition'; key: Identifier };
type Node = { type: string; start: number; end: number } & Record<string, unknown>;
type Program = { body: Array<FunctionDeclaration | { type: string }> };

export function instrumentCode(source: string): InstrumentResult {
  // Parse to AST
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script' }) as unknown as Program &
    Node;

  // Collect insertions: tuple of [position, text]
  type Insertion = { pos: number; text: string };
  const insertions: Insertion[] = [];

  // Traverse AST to instrument all block-bodied functions (declarations, expressions, arrow)
  const functions: FunctionInfo[] = [];

  const hasTypeField = (v: unknown): v is { type: string } =>
    typeof v === 'object' &&
    v !== null &&
    'type' in v &&
    typeof (v as { type: unknown }).type === 'string';

  function deriveName(node: Node, parent?: Node): string {
    // Named declarations
    if (
      (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
      (node as unknown as FunctionDeclaration | FunctionExpression).id?.name
    ) {
      return (node as unknown as FunctionDeclaration | FunctionExpression).id!.name;
    }
    // From parent contexts
    if (parent) {
      if (parent.type === 'VariableDeclarator') {
        const vd = parent as unknown as VariableDeclarator;
        if (vd.id?.name) return vd.id.name;
      }
      if (parent.type === 'AssignmentExpression') {
        const ae = parent as unknown as AssignmentExpression;
        const left = ae.left as unknown as {
          type: string;
          name?: string;
          property?: { name?: string };
          computed?: boolean;
        };
        if (left.type === 'Identifier' && left.name) return left.name;
        if (
          left.type === 'MemberExpression' &&
          left.property &&
          !left.computed &&
          left.property.name
        )
          return left.property.name;
      }
      if (parent.type === 'Property') {
        const p = parent as unknown as Property;
        if (p.key?.name) return p.key.name;
      }
      if (parent.type === 'MethodDefinition') {
        const md = parent as unknown as MethodDefinition;
        if (md.key?.name) return md.key.name;
      }
    }
    return 'anonymous';
  }

  function instrumentFunction(node: Node, parent?: Node) {
    if (node.type === 'FunctionDeclaration') {
      const fn = node as unknown as FunctionDeclaration;
      if (fn.body && fn.body.type === 'BlockStatement') {
        const label = deriveName(node, parent);
        const startPos = fn.body.start + 1;
        const endPos = fn.body.end - 1;
        insertions.push({ pos: endPos, text: `\n__pop(${JSON.stringify(label)});` });
        insertions.push({ pos: startPos, text: `\n__push(${JSON.stringify(label)});` });
        functions.push({
          label,
          start: fn.start,
          end: fn.end,
          bodyStart: startPos,
          bodyEnd: endPos,
        });
      }
      return;
    }
    if (node.type === 'FunctionExpression') {
      const fn = node as unknown as FunctionExpression;
      if (fn.body && fn.body.type === 'BlockStatement') {
        const label = deriveName(node, parent);
        const startPos = fn.body.start + 1;
        const endPos = fn.body.end - 1;
        insertions.push({ pos: endPos, text: `\n__pop(${JSON.stringify(label)});` });
        insertions.push({ pos: startPos, text: `\n__push(${JSON.stringify(label)});` });
        functions.push({
          label,
          start: fn.start,
          end: fn.end,
          bodyStart: startPos,
          bodyEnd: endPos,
        });
      }
      return;
    }
    if (node.type === 'ArrowFunctionExpression') {
      const fn = node as unknown as ArrowFunctionExpression;
      if (fn.body && (fn.body as BlockStatement).type === 'BlockStatement') {
        const block = fn.body as BlockStatement;
        const label = deriveName(node, parent);
        const startPos = block.start + 1;
        const endPos = block.end - 1;
        insertions.push({ pos: endPos, text: `\n__pop(${JSON.stringify(label)});` });
        insertions.push({ pos: startPos, text: `\n__push(${JSON.stringify(label)});` });
        functions.push({
          label,
          start: fn.start,
          end: fn.end,
          bodyStart: startPos,
          bodyEnd: endPos,
        });
      } else if (
        fn.body &&
        typeof (fn.body as unknown as { start?: number }).start === 'number' &&
        typeof (fn.body as unknown as { end?: number }).end === 'number'
      ) {
        // Expression-bodied arrow: wrap body with IIFE to preserve value and emit push/pop
        const expr: { start: number; end: number } = fn.body as unknown as {
          start: number;
          end: number;
        };
        const label = deriveName(node, parent);
        // Insert closing first (end)
        const tail = ` } finally { __pop(${JSON.stringify(label)}); }})()`;
        const head = `(() => { __push(${JSON.stringify(label)}); try { return `;
        insertions.push({ pos: expr.end, text: tail });
        insertions.push({ pos: expr.start, text: head });
        // Highlight the original expression body
        functions.push({
          label,
          start: fn.start,
          end: fn.end,
          bodyStart: expr.start,
          bodyEnd: expr.end,
        });
      }
      return;
    }
  }

  function walk(node: unknown, parent?: Node) {
    if (!hasTypeField(node)) return;
    const n = node as Node;
    // instrument if it's a function-like node
    instrumentFunction(n, parent);
    // Recurse children
    for (const key of Object.keys(n)) {
      const value = (n as Record<string, unknown>)[key];
      if (hasTypeField(value)) {
        walk(value, n);
      } else if (Array.isArray(value)) {
        for (const el of value) {
          if (hasTypeField(el)) walk(el, n);
        }
      }
    }
  }

  walk(ast as unknown as Node, undefined);

  // Apply insertions from end to start to preserve indices
  let transpiled = source;
  insertions
    .sort((a, b) => b.pos - a.pos)
    .forEach((ins) => {
      transpiled = transpiled.slice(0, ins.pos) + ins.text + transpiled.slice(ins.pos);
    });

  const events: StackEvent[] = [];

  const run = (hooks: { __push: (label: string) => void; __pop: (label: string) => void }) => {
    const sandbox = {
      __push: (l: string) => {
        events.push({ type: 'push', label: l });
        hooks.__push(l);
      },
      __pop: (l: string) => {
        events.push({ type: 'pop', label: l });
        hooks.__pop(l);
      },
    } as Record<string, unknown>;
    // Expose push/pop in function scope and eval code in a closure
    const fn = new Function('__push', '__pop', `'use strict';\n${transpiled}`);
    return fn(sandbox.__push as (l: string) => void, sandbox.__pop as (l: string) => void);
  };

  return { transpiled, run, events, functions };
}

// --- Color utilities ---------------------------------------------------------
// Palette of visually distinct colors with good contrast on light bg.
const PALETTE = [
  '#60a5fa', // blue
  '#f59e0b', // amber
  '#34d399', // emerald
  '#f472b6', // pink
  '#f87171', // red
  '#a78bfa', // violet
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#4ade80', // green
  '#93c5fd', // light blue
  '#facc15', // yellow
  '#c084fc', // purple
];

const labelColorMap: Map<string, string> = new Map();
let nextColorIndex = 0;

export function colorForLabel(label: string): string {
  if (!labelColorMap.has(label)) {
    const color = PALETTE[nextColorIndex % PALETTE.length];
    labelColorMap.set(label, color);
    nextColorIndex++;
  }
  return labelColorMap.get(label)!;
}

export function resetLabelColors() {
  labelColorMap.clear();
  nextColorIndex = 0;
}

export function getLabelColorMap(): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of labelColorMap.entries()) obj[k] = v;
  return obj;
}

export function setLabelColorMap(map: Record<string, string>) {
  labelColorMap.clear();
  for (const k of Object.keys(map)) labelColorMap.set(k, map[k]);
  nextColorIndex = labelColorMap.size % PALETTE.length;
}
