import { describe, expect, it } from 'vitest';
import { getReferences } from '../../../shared/snapshot';
import type { Snapshot } from '../../../shared/snapshot';
import { STORY_BEATS, STORY_CODE } from '../../javascript/utils/stackHeapStory';
import { traceSync } from './trace';

/**
 * A snapshot with its ids replaced by positions, so a beat and a step can be compared by
 * structure: a frame is its place on the stack, an object is its place in the order the
 * references reach it. What only an author can write is dropped: an object's label (`User`),
 * its cell, and its garbage-collection state. A collected object is gone, as in `getReferences`.
 */
function byStructure(snapshot: Snapshot): Snapshot {
  const objects = snapshot.objects.filter((object) => object.state !== 'collected');
  const byId = new Map(objects.map((object) => [object.id, object]));
  const renamed = new Map<string, string>();
  snapshot.frames.forEach((frame, index) => renamed.set(frame.id, `frame${index}`));

  const order: string[] = [];
  const reach = (id: string | undefined) => {
    const queue = id ? [id] : [];
    while (queue.length) {
      const next = queue.shift()!;
      const object = byId.get(next);
      if (!object || renamed.has(next)) continue;
      renamed.set(next, `object${order.length}`);
      order.push(next);
      for (const slot of object.slots) queue.push(slot.refId ?? '');
    }
  };
  for (const frame of snapshot.frames) for (const slot of frame.slots) reach(slot.refId);
  for (const object of objects) reach(object.id);

  const slots = (owner: { slots: Snapshot['frames'][number]['slots'] }) =>
    owner.slots.map((slot) =>
      slot.refId
        ? { name: slot.name, refId: renamed.get(slot.refId) ?? slot.refId }
        : { name: slot.name, value: slot.value }
    );
  return {
    frames: snapshot.frames.map((frame) => ({
      id: renamed.get(frame.id)!,
      name: frame.name,
      slots: slots(frame),
    })),
    objects: order.map((id) => {
      const object = byId.get(id)!;
      return {
        id: renamed.get(id)!,
        label: object.kind,
        kind: object.kind,
        slots: slots(object),
        state: 'live' as const,
      };
    }),
  };
}

describe('tracing the Stack ↔ Heap story code', () => {
  const trace = traceSync(STORY_CODE);
  const steps = trace.steps.map((step) => byStructure(step.snapshot));
  /** The sweep is the one beat a run cannot observe (ADR 0004). */
  const observable = STORY_BEATS.filter((beat) => beat.id !== 'gc-sweep');

  it('runs to the end', () => {
    expect(trace.outcome).toBe('completed');
    expect(observable).toHaveLength(STORY_BEATS.length - 1);
  });

  it('holds every beat a run can observe, in order, on the same line, with the same references', () => {
    let from = 0;
    for (const beat of observable) {
      const wanted = byStructure(beat);
      // The mark beat changes only what the collector knows: it is the same moment of the run.
      const at = steps.findIndex(
        (step, index) =>
          index >= from &&
          trace.steps[index].line === beat.line &&
          JSON.stringify(step) === JSON.stringify(wanted)
      );
      expect(at, `beat ${beat.id}`).toBeGreaterThanOrEqual(0);
      expect(getReferences(steps[at]), `beat ${beat.id}`).toEqual(getReferences(wanted));
      expect(steps[at].frames, `beat ${beat.id}`).toEqual(wanted.frames);
      from = at;
    }
  });

  it('shows each allocation, and each reference inside the heap, as the focus of its step', () => {
    const pushed = trace.steps.find((step) => step.line === 9 && step.kind === 'statement')!;
    const main = pushed.snapshot.frames[1];
    const ada = pushed.snapshot.objects.find(
      (object) => object.id === main.slots.find((slot) => slot.name === 'ada')!.refId
    )!;
    const friends = ada.slots.find((slot) => slot.name === 'friends')!.refId;
    expect(pushed.focus).toEqual([`${friends}.0`]);
  });

  it('never shows the sweep: every object stays live to the last step', () => {
    const sweep = byStructure(STORY_BEATS.find((beat) => beat.id === 'gc-sweep')!);
    expect(sweep.objects).toHaveLength(0);
    for (const step of trace.steps) {
      for (const object of step.snapshot.objects) expect(object.state).toBe('live');
    }
    const afterNull = steps.filter((step) =>
      step.frames[1]?.slots.every((slot) => slot.value === 'null')
    );
    expect(afterNull.length).toBeGreaterThan(0);
    for (const step of afterNull) expect(step.objects).toHaveLength(4);
    expect(steps[steps.length - 1].objects).toHaveLength(4);
  });
});
