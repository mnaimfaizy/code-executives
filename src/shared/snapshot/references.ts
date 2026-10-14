import type { HeapSpace, Reference, Snapshot } from './types';

export const slotKey = (owner: string, slot: string) => `${owner}.${slot}`;

/**
 * Every reference edge in a snapshot, from stack slots and from heap object slots.
 * A collected object no longer exists, and a copied one lives on in its copy, so neither one's
 * slots contribute references.
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
    if (object.state === 'collected' || object.state === 'copied') continue;
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
 * Heap object ids reachable from the roots (every stack frame and `snapshot.roots`), following
 * references.
 * Frame ids and ids that match nothing are never in the result: a frame is a root already,
 * so its own slots are followed whether or not something points at it.
 */
export function getReachable(snapshot: Snapshot): Set<string> {
  const objectIds = new Set(snapshot.objects.map((o) => o.id));
  const refs = getReferences(snapshot);
  const reached = new Set<string>();
  const queue = [
    ...(snapshot.roots ?? []),
    ...refs.filter((r) => r.fromKind === 'frame').map((r) => r.to),
  ];
  while (queue.length) {
    const id = queue.shift()!;
    if (!objectIds.has(id) || reached.has(id)) continue;
    reached.add(id);
    for (const r of refs) if (r.fromKind === 'object' && r.fromOwner === id) queue.push(r.to);
  }
  return reached;
}

/**
 * The space an object is in: the one whose row is the object's cell row. `undefined` when the
 * snapshot has no spaces, or the object is unknown or unplaced.
 */
export function spaceOf(snapshot: Snapshot, id: string): HeapSpace | undefined {
  const row = snapshot.objects.find((o) => o.id === id)?.cell?.row;
  if (row === undefined) return undefined;
  return snapshot.spaces?.find((space) => space.row === row);
}

/**
 * The object a chain of copies started from: follows `copyOf` back to an object that is not a
 * copy. The program sees one object; this is its identity. Returns `id` itself when it is no copy.
 */
export function originOf(snapshot: Snapshot, id: string): string {
  const byId = new Map(snapshot.objects.map((o) => [o.id, o]));
  const seen = new Set<string>();
  let current = id;
  while (!seen.has(current)) {
    seen.add(current);
    const from = byId.get(current)?.copyOf;
    if (from === undefined) break;
    current = from;
  }
  return current;
}

/** The ids of the copies made of an object on a snapshot: the objects whose `copyOf` names it. */
export function copiesOf(snapshot: Snapshot, id: string): string[] {
  return snapshot.objects.filter((o) => o.copyOf === id).map((o) => o.id);
}

/** The ids of the objects in one space, in heap order. Empty when the snapshot has no spaces. */
export function objectsInSpace(snapshot: Snapshot, spaceId: string): string[] {
  const space = snapshot.spaces?.find((s) => s.id === spaceId);
  if (!space) return [];
  return snapshot.objects.filter((o) => o.cell?.row === space.row).map((o) => o.id);
}

/**
 * A space freed as a whole: it holds objects and every one of them is `collected`. A view draws
 * it once (`FREE`) instead of tagging each object.
 */
export function isSpaceFreed(snapshot: Snapshot, spaceId: string): boolean {
  const ids = new Set(objectsInSpace(snapshot, spaceId));
  return ids.size > 0 && snapshot.objects.every((o) => !ids.has(o.id) || o.state === 'collected');
}

/** A link from a `copied` object to its copy. Derived by `getCopyTrails`; not a reference. */
export interface CopyTrail {
  id: string;
  from: string;
  to: string;
}

/** One trail per `copied` object to the copy whose `copyOf` names it, while the original is `copied`. */
export function getCopyTrails(snapshot: Snapshot): CopyTrail[] {
  const trails: CopyTrail[] = [];
  for (const original of snapshot.objects) {
    if (original.state !== 'copied') continue;
    for (const to of copiesOf(snapshot, original.id)) {
      trails.push({ id: `${original.id}->${to}`, from: original.id, to });
    }
  }
  return trails;
}
