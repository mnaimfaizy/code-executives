/**
 * StateSnapshot utilities — serialization, deep clone, and diff.
 *
 * Used by the timeline player to compute what changed between steps
 * so the UI can highlight variable mutations.
 */

import type { StateSnapshot, CapturedVariable } from '../types';

/**
 * A diff between two consecutive snapshots.
 */
export interface SnapshotDiff {
  /** Variables that were added since the previous step */
  addedVars: CapturedVariable[];
  /** Variables whose value changed since the previous step */
  changedVars: Array<{
    name: string;
    oldValue: unknown;
    newValue: unknown;
    type: string;
  }>;
  /** Variables that were removed (went out of scope) */
  removedVars: string[];
  /** Whether the call stack changed */
  callStackChanged: boolean;
  /** Whether console output was added */
  newConsoleEntries: number;
}

/**
 * Deep-clone a value with circular reference protection.
 * Used to safely snapshot runtime values.
 */
export function safeDeepClone<T>(value: T, maxDepth: number = 4): T {
  if (maxDepth <= 0) return '[max depth]' as unknown as T;

  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  const seen = new WeakSet();

  function clone(val: unknown, depth: number): unknown {
    if (depth <= 0) return '[max depth]';
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;

    const obj = val as Record<string, unknown>;
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map((item) => clone(item, depth - 1));
    }

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = clone(obj[key], depth - 1);
    }
    return result;
  }

  return clone(value, maxDepth) as T;
}

/**
 * Compute the diff between two consecutive snapshots.
 * Returns information about what changed, which the UI uses to
 * highlight mutations in the variables panel.
 */
export function diffSnapshots(prev: StateSnapshot | null, curr: StateSnapshot): SnapshotDiff {
  if (!prev) {
    return {
      addedVars: curr.variables,
      changedVars: [],
      removedVars: [],
      callStackChanged: curr.callStack.length > 0,
      newConsoleEntries: curr.consoleOutput.length,
    };
  }

  const prevVarMap = new Map(prev.variables.map((v) => [v.name, v]));
  const currVarMap = new Map(curr.variables.map((v) => [v.name, v]));

  const addedVars: CapturedVariable[] = [];
  const changedVars: SnapshotDiff['changedVars'] = [];
  const removedVars: string[] = [];

  // Find added and changed variables
  for (const [name, currVar] of currVarMap) {
    const prevVar = prevVarMap.get(name);
    if (!prevVar) {
      addedVars.push(currVar);
    } else if (JSON.stringify(prevVar.value) !== JSON.stringify(currVar.value)) {
      changedVars.push({
        name,
        oldValue: prevVar.value,
        newValue: currVar.value,
        type: currVar.type,
      });
    }
  }

  // Find removed variables
  for (const name of prevVarMap.keys()) {
    if (!currVarMap.has(name)) {
      removedVars.push(name);
    }
  }

  // Check call stack changes
  const callStackChanged =
    prev.callStack.length !== curr.callStack.length ||
    prev.callStack.some((frame, i) => frame.functionName !== curr.callStack[i]?.functionName);

  return {
    addedVars,
    changedVars,
    removedVars,
    callStackChanged,
    newConsoleEntries: curr.consoleOutput.length - prev.consoleOutput.length,
  };
}

/**
 * Format a captured variable value for display.
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
