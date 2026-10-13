/**
 * The 2D floor holds up to 20 objects. These runs fill most of it with the structures a
 * learner is most likely to build, and check that no reference arrow of any step passes
 * through a frame or a heap object: on a floor this size an arrow runs along the gutters.
 */
import { describe, expect, it } from 'vitest';
import { checkArrows } from '../../../../../shared/components/viz/stackheap/heapGeometryForTests';
import { getReferences } from '../../../../../shared/snapshot';
import { traceSync } from '../../../tracer';
import { prepareTrace } from './stackHeapLensModel';

/** 15 nodes, each new one linked after the last: every `next` points at the following cell. */
const LIST_APPENDED = `function node(value) { return { value, next: null }; }
const head = node(0);
let tail = head;
for (let i = 1; i < 15; i++) {
  tail.next = node(i);
  tail = tail.next;
}`;

/** 15 nodes, each new one put in front: every `next` points back at the cell before. */
const LIST_PREPENDED = `let head = null;
for (let i = 0; i < 15; i++) {
  head = { value: i, next: head };
}`;

/** A binary search tree of 15 nodes: parents and children land far apart on the floor. */
const TREE = `function insert(root, value) {
  if (root === null) return { value, left: null, right: null };
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  return root;
}
let root = null;
const values = [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15];
for (let i = 0; i < values.length; i++) root = insert(root, values[i]);`;

/** A doubly linked list of 10 nodes, and an array that holds every node. */
const DOUBLY_LINKED = `const nodes = [];
let last = null;
for (let i = 0; i < 10; i++) {
  const n = { value: i, prev: last, next: null };
  if (last) last.next = n;
  nodes.push(n);
  last = n;
}`;

describe.each([
  ['a list of 15 nodes, appended', LIST_APPENDED, 15],
  ['a list of 15 nodes, prepended', LIST_PREPENDED, 15],
  ['a binary search tree of 15 nodes', TREE, 15],
  ['a doubly linked list of 10 nodes in an array', DOUBLY_LINKED, 10],
])('the arrows of %s', (_name, code, nodes) => {
  const run = traceSync(code);
  const trace = prepareTrace(run.steps, { view: '2d' });

  it('draws every step in 2D', () => {
    expect(run.outcome).toBe('completed');
    expect(trace.steps.every((step) => step.status === 'drawn')).toBe(true);
    const last = trace.steps[trace.steps.length - 1];
    if (last.status !== 'drawn') throw new Error('not drawn');
    expect(last.snapshot.objects.length).toBeGreaterThanOrEqual(nodes);
    expect(last.snapshot.objects.length).toBeLessThanOrEqual(20);
    expect(trace.grid.cols).toBeGreaterThanOrEqual(4);
  });

  it('gives every reference of every step an arrow that passes through nothing', () => {
    let arrows = 0;
    trace.steps.forEach((step, i) => {
      if (step.status !== 'drawn') return;
      const check = checkArrows(step.snapshot, trace.grid);
      expect(check.crossings, `step ${i + 1}`).toEqual([]);
      expect(check.arrows, `step ${i + 1}`).toBe(getReferences(step.snapshot).length);
      arrows += check.arrows;
    });
    expect(arrows).toBeGreaterThan(nodes);
  });
});
