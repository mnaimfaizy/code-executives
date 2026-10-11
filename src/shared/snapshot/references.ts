import type { Reference, Snapshot } from './types';

export const slotKey = (owner: string, slot: string) => `${owner}.${slot}`;

/**
 * Every reference edge in a snapshot, from stack slots and from heap object slots.
 * A collected object no longer exists, so its slots contribute no references.
 * The target may be a heap object, a frame, or nothing at all (a dangling `refId`).
 */
export function getReferences(snapshot: Snapshot): Reference[] {
  const refs: Reference[] = [];
  for (const frame of snapshot.frames) {
    for (const slot of frame.slots) {
      if (slot.refId) {
        const from = slotKey(frame.id, slot.name);
        refs.push({ id: from, from, fromOwner: frame.id, fromKind: 'frame', to: slot.refId });
      }
    }
  }
  for (const object of snapshot.objects) {
    if (object.state === 'collected') continue;
    for (const slot of object.slots) {
      if (slot.refId) {
        const from = slotKey(object.id, slot.name);
        refs.push({ id: from, from, fromOwner: object.id, fromKind: 'object', to: slot.refId });
      }
    }
  }
  return refs;
}

/**
 * Heap object ids reachable from the roots (every stack frame), following references.
 * Frame ids and ids that match nothing are never in the result: a frame is a root already,
 * so its own slots are followed whether or not something points at it.
 */
export function getReachable(snapshot: Snapshot): Set<string> {
  const objectIds = new Set(snapshot.objects.map((o) => o.id));
  const refs = getReferences(snapshot);
  const reached = new Set<string>();
  const queue = refs.filter((r) => r.fromKind === 'frame').map((r) => r.to);
  while (queue.length) {
    const id = queue.shift()!;
    if (!objectIds.has(id) || reached.has(id)) continue;
    reached.add(id);
    for (const r of refs) if (r.fromKind === 'object' && r.fromOwner === id) queue.push(r.to);
  }
  return reached;
}
