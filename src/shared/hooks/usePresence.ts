import { useEffect, useRef, useState } from 'react';

export interface Presence<T> {
  item: T;
  exiting: boolean;
}

/**
 * Keeps items that left `items` mounted for `ms` so views can animate them out.
 * Each exiting item has its own timer that the next change never cancels: a learner
 * stepping faster than `ms` must not strand an exiting item on screen.
 */
export function usePresence<T>(items: T[], keyOf: (t: T) => string, ms: number): Presence<T>[] {
  const [leaving, setLeaving] = useState<Map<string, T>>(() => new Map());
  const prev = useRef(items);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const now = new Set(items.map(keyOf));
    const removed = prev.current.filter((i) => !now.has(keyOf(i)));
    prev.current = items;
    if (!removed.length) return;
    setLeaving((m) => new Map([...m, ...removed.map((r) => [keyOf(r), r] as const)]));
    for (const r of removed) {
      const key = keyOf(r);
      clearTimeout(timers.current.get(key));
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          setLeaving((m) => {
            const next = new Map(m);
            next.delete(key);
            return next;
          });
        }, ms)
      );
    }
  }, [items, keyOf, ms]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const present = new Set(items.map(keyOf));
  return [
    ...items.map((item) => ({ item, exiting: false })),
    ...[...leaving.entries()]
      .filter(([k]) => !present.has(k))
      .map(([, item]) => ({ item, exiting: true })),
  ];
}
