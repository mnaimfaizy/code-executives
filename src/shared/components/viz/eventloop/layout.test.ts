import { describe, expect, it } from 'vitest';
import type { QueueEntry, Snapshot, StackFrame } from '../../../snapshot';
import { QUEUE_ROLES } from '../../../viz/palette';
import {
  EVENT_LOOP_REGIONS,
  MIN_ENTRY_ROWS,
  QUEUE_REGIONS,
  REGION_INFO,
  entryCell,
  entryRows,
  entrySource,
  extentOf,
  hasQueues,
  placeEntries,
} from './layout';

const entry = (id: string, source: QueueEntry['source'] = 'promise', delay?: number): QueueEntry =>
  delay === undefined ? { id, label: id, source } : { id, label: id, source, delay };

const frame = (id: string, slots = 0): StackFrame => ({
  id,
  name: `${id}()`,
  slots: Array.from({ length: slots }, (_, i) => ({ name: `v${i}`, value: String(i) })),
});

const snapshot = (over: Partial<Snapshot> = {}): Snapshot => ({
  frames: [],
  objects: [],
  microtasks: [],
  tasks: [],
  timers: [],
  ...over,
});

describe('event loop layout', () => {
  it('orders the regions as the loop takes work: stack, every microtask, one task', () => {
    expect(EVENT_LOOP_REGIONS).toEqual(['stack', 'microtasks', 'tasks', 'timers']);
    expect(EVENT_LOOP_REGIONS.map((r) => REGION_INFO[r].column)).toEqual([0, 1, 2, 3]);
    expect(EVENT_LOOP_REGIONS.map((r) => REGION_INFO[r].order)).toEqual([1, 2, 3, null]);
  });

  it('gives each queue region its own palette role and the stack none', () => {
    expect(REGION_INFO.stack.role).toBeNull();
    expect(QUEUE_REGIONS.map((r) => REGION_INFO[r].role)).toEqual([...QUEUE_ROLES]);
  });

  it('tags the head of the two queues and not the first timer, which is not about to run', () => {
    expect(REGION_INFO.microtasks.headTag).toBe('NEXT');
    expect(REGION_INFO.tasks.headTag).toBe('NEXT');
    expect(REGION_INFO.timers.headTag).toBeNull();
  });

  it('keeps every caption and note short enough for one line of a region', () => {
    for (const region of EVENT_LOOP_REGIONS) {
      expect(REGION_INFO[region].caption.length, region).toBeLessThanOrEqual(15);
      expect(REGION_INFO[region].note.length, region).toBeLessThanOrEqual(23);
    }
  });

  it('places entries one per cell, first to run in row 0', () => {
    const placed = placeEntries(
      snapshot({
        microtasks: [entry('m1'), entry('m2'), entry('m3')],
        tasks: [entry('t1', 'timeout', 0)],
        timers: [entry('x1', 'timeout', 50), entry('x2', 'interval', 100)],
      })
    );
    expect(placed.map((p) => `${p.entry.id}@${p.region}:${p.cell.col},${p.cell.row}`)).toEqual([
      'm1@microtasks:0,0',
      'm2@microtasks:0,1',
      'm3@microtasks:0,2',
      't1@tasks:0,0',
      'x1@timers:0,0',
      'x2@timers:0,1',
    ]);
    expect(placed.filter((p) => p.head).map((p) => p.entry.id)).toEqual(['m1', 't1', 'x1']);
    expect(entryCell(4)).toEqual({ col: 0, row: 4 });

    const cells = placed.map((p) => `${p.region}:${p.cell.col},${p.cell.row}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it('moves an entry up a row when the one ahead of it leaves, and keeps its id', () => {
    const before = placeEntries(snapshot({ microtasks: [entry('m1'), entry('m2')] }));
    const after = placeEntries(snapshot({ microtasks: [entry('m2')] }));
    expect(before.find((p) => p.entry.id === 'm2')!.cell.row).toBe(1);
    expect(after.find((p) => p.entry.id === 'm2')).toMatchObject({ cell: { row: 0 }, head: true });
  });

  it('places an id once, even if a snapshot lists it in two regions', () => {
    const fired = entry('x1', 'timeout', 0);
    const placed = placeEntries(snapshot({ tasks: [fired], timers: [fired, entry('x2')] }));
    expect(placed.map((p) => `${p.entry.id}@${p.region}:${p.cell.row}`)).toEqual([
      'x1@tasks:0',
      'x2@timers:0',
    ]);
  });

  it('tells a snapshot that records the queues from one that does not', () => {
    expect(hasQueues({ frames: [], objects: [] })).toBe(false);
    expect(hasQueues(snapshot())).toBe(true);
    expect(placeEntries({ frames: [], objects: [] } as Snapshot)).toEqual([]);
  });

  it('finds the extent that holds every snapshot of a run', () => {
    const run: Snapshot[] = [
      snapshot({ frames: [frame('a', 3), frame('b')], microtasks: [entry('m1')] }),
      snapshot({
        frames: [frame('a', 1)],
        tasks: [entry('t1'), entry('t2')],
        timers: [entry('x')],
      }),
      { frames: [frame('a'), frame('b'), frame('c')], objects: [] },
    ];
    expect(extentOf(run)).toEqual({ frames: 3, slotRows: 4, microtasks: 1, tasks: 2, timers: 1 });
    expect(extentOf(run, { microtasks: 5, frames: 1 })).toMatchObject({ microtasks: 5, frames: 3 });
    expect(extentOf([])).toEqual({ frames: 0, slotRows: 0, microtasks: 0, tasks: 0, timers: 0 });
  });

  it('lays every queue region out for the fullest one, and never fewer than the minimum', () => {
    expect(entryRows({ microtasks: 0, tasks: 0, timers: 0 })).toBe(MIN_ENTRY_ROWS);
    expect(entryRows({ microtasks: 2, tasks: 7, timers: 1 })).toBe(7);
  });

  it('reads a delay only when the entry has one', () => {
    expect(entrySource(entry('m', 'await'))).toBe('await');
    expect(entrySource(entry('t', 'timeout', 0))).toBe('timeout · 0 ms');
    expect(entrySource(entry('t', 'interval', 250))).toBe('interval · 250 ms');
  });
});
