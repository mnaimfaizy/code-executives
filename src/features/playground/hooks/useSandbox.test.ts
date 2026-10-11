import { describe, it, expect } from 'vitest';
import { mapSnapshotLines } from './useSandbox';
import type { StateSnapshot } from '../types';

function makeSnapshot(line: number, frameLines: number[]): StateSnapshot {
  return {
    step: 0,
    line,
    timestamp: 0,
    callStack: frameLines.map((frameLine) => ({ functionName: 'f', line: frameLine })),
    variables: [],
    heapObjects: [],
    microtaskQueue: [],
    macrotaskQueue: [],
    consoleOutput: [],
  };
}

describe('mapSnapshotLines', () => {
  it('maps the line of each step and of each call stack frame', () => {
    const snapshots = [makeSnapshot(2, []), makeSnapshot(5, [4, 9])];
    const mapped = mapSnapshotLines(snapshots, (line) => line + 10);

    expect(mapped.map((snapshot) => snapshot.line)).toEqual([12, 15]);
    expect(mapped[1].callStack.map((frame) => frame.line)).toEqual([14, 19]);
  });

  it('leaves the snapshots it was given unchanged', () => {
    const snapshots = [makeSnapshot(2, [1])];
    mapSnapshotLines(snapshots, () => 99);

    expect(snapshots[0].line).toBe(2);
    expect(snapshots[0].callStack[0].line).toBe(1);
  });
});
