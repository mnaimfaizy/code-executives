/**
 * The tracer runtime: what instrumented code calls while it runs.
 *
 * It runs inside the sandbox iframe, which receives it as a source string. So `createTracer`
 * is ONE self-contained function: it may use nothing from module scope (no imports, no
 * helpers, no constants), because `runtimeSource` is its `toString()`. Types are erased and
 * are fine. `runtime.test.ts` runs the serialised source on its own to keep this true.
 */

import type { HeapObject, Slot, StackFrame } from '../../../shared/snapshot';
import type { Step, StepKind, Trace, TraceError, TraceLimits, TraceOutcome } from './types';

/** A variable's name and a live reader of it, created in the scope that declares it. */
export type Getter = [name: string, read: () => unknown];

/** A frame or a block scope, as instrumented code holds it. Opaque outside the runtime. */
export interface ScopeHandle {
  readonly id: string;
}

/** The calls the rewrite in `instrument.ts` emits, plus what the sandbox uses to end a run. */
export interface Tracer {
  /** Pushes the global frame. `line` is the first statement that will run. */
  start(line: number, getters: Getter[]): ScopeHandle;
  /** The top-level code ran to its end. */
  done(frame: ScopeHandle): void;
  /** Pushes a frame. The first `argCount` getters are its parameters; -1 hides the arguments. */
  enter(
    name: string,
    line: number,
    getters: Getter[],
    parent: ScopeHandle,
    argCount: number
  ): ScopeHandle;
  /** Pops a frame, recording a return step unless it is unwinding from a throw. */
  leave(frame: ScopeHandle | undefined): void;
  /** Notes where an error left a frame. Returns the error so it can be rethrown. */
  thrown<E>(error: E, frame: ScopeHandle | undefined): E;
  /** A statement on `line` is about to run in `frame`. */
  step(line: number, frame: ScopeHandle): void;
  /** One more turn of the loop whose head is on `line`. */
  loop(line: number, frame: ScopeHandle): void;
  /**
   * Opens a block scope inside `frame`. A loop body's block also holds the loop's own
   * variables, which the statement before it (the loop's head) already declared: `head`.
   */
  block(frame: ScopeHandle, getters: Getter[], parent: ScopeHandle, head?: boolean): ScopeHandle;
  unblock(block: ScopeHandle | undefined): void;
  /** Registers the scope a function was created in. Returns the function. */
  fn<F>(fn: F, scope: ScopeHandle, name: string): F;
  /** `frame` is about to wait on `await` or `yield`: it leaves the stack. */
  suspend<V>(frame: ScopeHandle, value?: V): V;
  /** `frame` continues after `await` or `yield`: it is back on the stack. */
  resume<V>(frame: ScopeHandle, value: V): V;
  /** First call of every catch clause: the signal that stops a run is never swallowed. */
  guard(error: unknown, frame: ScopeHandle): void;
  /** Ends the trace with outcome `error`. The sandbox calls this with whatever was not caught. */
  fail(error: unknown): void;
  /** True for the signal the tracer throws to stop the run. It is not a learner error. */
  stopped(error: unknown): boolean;
  /** The trace so far. Safe to call at any time, during or after the run. */
  getTrace(): Trace;
}

export function createTracer(limits: TraceLimits, consoleLength?: () => number): Tracer {
  interface Scope extends ScopeHandle {
    /** A frame's name with its arguments. */
    name: string;
    getters: Getter[];
    parent: Scope | null;
    /** The frame this scope is part of. A frame is its own. */
    frame: Scope;
    /** Block scopes open in this frame, outermost first. */
    blocks: Scope[];
    /** Where the function starts: the fallback when no statement has run yet. */
    line: number;
    /** The statement that is running in this frame and has no step yet. */
    pending: number | null;
    threw: boolean;
    /** A block the code has left; it stays readable until the frame's next step is recorded. */
    closed: boolean;
  }
  type Entity = StackFrame | HeapObject;

  const steps: Step[] = [];
  const stack: Scope[] = [];
  /** One id per object for the whole run. */
  const ids = new WeakMap<object, string>();
  /** Holds every object ever drawn, so one the program dropped can still be drawn. */
  const registry = new Map<string, object>();
  /** Scopes drawn on the heap: a frame that was popped, or a block the code has left. */
  const heapScopes = new Map<string, Scope>();
  /** Every heap id in the order it was first drawn. */
  const rank = new Map<string, number>();
  const fnScope = new WeakMap<object, Scope>();
  const classes = new WeakMap<object, boolean>();
  /** Thrown through the learner's code to stop the run. */
  const halt = new Error('The run was stopped after ' + limits.maxSteps + ' steps.');

  let last = new Map<string, Entity>();
  let globalScope: Scope | null = null;
  let seq = 0;
  /** Loop turns and calls since the last recorded step. */
  let idle = 0;
  let halted = false;
  /** True while a snapshot is taken: anything the reads trigger is not part of the run. */
  let busy = false;
  let outcome: TraceOutcome = 'completed';
  let error: TraceError | undefined;
  let hasThrown = false;
  let thrownValue: unknown;
  let thrownLine = 0;

  const text = (value: unknown, max: number): string => {
    if (typeof value === 'string') {
      const cut = value.length > max ? value.slice(0, max) + '…' : value;
      return "'" + cut.replace(/\n/g, '\\n') + "'";
    }
    if (typeof value === 'bigint') return value + 'n';
    if (typeof value === 'symbol') {
      const shown = value.toString();
      return shown.length > max ? shown.slice(0, max) + '…' : shown;
    }
    return String(value);
  };

  const isPrimitive = (value: unknown) =>
    value === null || (typeof value !== 'object' && typeof value !== 'function');

  const isClass = (fn: object): boolean => {
    let known = classes.get(fn);
    if (known === undefined) {
      try {
        known = /^class\b/.test(Function.prototype.toString.call(fn));
      } catch {
        known = false;
      }
      classes.set(fn, known);
    }
    return known;
  };

  const idOf = (object: object): string => {
    let id = ids.get(object);
    if (!id) {
      id = 'o' + ++seq;
      ids.set(object, id);
      registry.set(id, object);
      rank.set(id, seq);
    }
    return id;
  };

  const newScope = (
    id: string,
    getters: Getter[],
    parent: Scope | null,
    frame: Scope | null,
    line: number
  ): Scope => {
    const scope = {
      id,
      name: '',
      getters,
      parent,
      blocks: [],
      line,
      pending: null,
      threw: false,
      closed: false,
    } as unknown as Scope;
    scope.frame = frame || scope;
    return scope;
  };

  /**
   * The id a reference to a scope points at: its frame while that frame is on the stack and
   * the scope is still open, otherwise a `scope` object on the heap.
   */
  const target = (scope: Scope): string => {
    const frame = scope.frame;
    if (stack.includes(frame) && (scope === frame || frame.blocks.includes(scope))) return frame.id;
    if (!heapScopes.has(scope.id)) {
      heapScopes.set(scope.id, scope);
      rank.set(scope.id, ++seq);
    }
    return scope.id;
  };

  const encode = (name: string, value: unknown): Slot => {
    if (isPrimitive(value)) return { name, value: text(value, limits.maxStringLength) };
    const object = value as object;
    if (object === globalThis) return { name, value: 'globalThis' };
    if (typeof object === 'function') {
      // A function made at the top level retains no scope worth drawing, and neither does one
      // the tracer never saw being made (a built-in, a class): it is shown as a plain value.
      const scope = fnScope.get(object);
      if (!scope || scope === globalScope) return { name, value: isClass(object) ? 'class' : 'ƒ' };
    }
    return { name, refId: idOf(object) };
  };

  const more = (slots: Slot[], total: number) => {
    if (total > slots.length) {
      slots.push({ name: '…', value: '+' + (total - slots.length) + ' more' });
    }
  };

  /** Reads variables through their getters. An inner declaration shadows an outer one. */
  const read = (groups: Getter[][]): Slot[] => {
    const slots: Slot[] = [];
    const at = new Map<string, number>();
    for (const getters of groups) {
      for (const [name, get] of getters) {
        let slot: Slot;
        try {
          const value = get();
          // `this` is only worth a slot when it is an object the learner made.
          if (name === 'this' && (value === undefined || value === globalThis)) continue;
          slot = encode(name, value);
        } catch {
          slot = { name, value: 'uninit' }; // temporal dead zone
        }
        const index = at.get(name);
        if (index === undefined) {
          at.set(name, slots.length);
          slots.push(slot);
        } else {
          slots[index] = slot;
        }
      }
    }
    const total = slots.length;
    if (total > limits.maxSlots) slots.length = limits.maxSlots;
    more(slots, total);
    return slots;
  };

  const readFrame = (frame: Scope): Slot[] =>
    read([frame.getters].concat(frame.blocks.map((block) => block.getters)));

  const describe = (id: string): HeapObject => {
    const slots: Slot[] = [];
    const scope = heapScopes.get(id);
    if (scope) {
      const isFrame = scope === scope.frame;
      slots.push(...(isFrame ? readFrame(scope) : read([scope.getters])));
      if (scope.parent && scope.parent !== globalScope) {
        const outer = target(scope.parent);
        if (!globalScope || outer !== globalScope.id)
          slots.push({ name: '[[outer]]', refId: outer });
      }
      const label = isFrame ? scope.name + ' scope' : scope.frame.name + ' block';
      return { id, label, kind: 'scope', slots, state: 'live' };
    }

    const object = registry.get(id) as object;
    const max = limits.maxSlots;
    let label = 'Object';
    let kind: HeapObject['kind'] = 'object';
    try {
      if (typeof object === 'function') {
        kind = 'function';
        label = 'ƒ ' + ((object as { name?: string }).name || 'anonymous');
        const made = fnScope.get(object);
        if (made) slots.push({ name: '[[scope]]', refId: target(made) });
      } else if (Array.isArray(object)) {
        kind = 'array';
        label = 'Array';
        for (let i = 0; i < object.length && i < max; i++) {
          slots.push(
            i in object ? encode(String(i), object[i]) : { name: String(i), value: 'empty' }
          );
        }
        more(slots, object.length);
      } else {
        const proto = Object.getPrototypeOf(object);
        const ctor = proto && proto.constructor;
        if (typeof ctor === 'function' && ctor.name) label = ctor.name;
        if (object instanceof Map) {
          let i = 0;
          for (const [key, value] of object) {
            if (i >= max) break;
            slots.push(encode(isPrimitive(key) ? text(key, 12) : '[' + i + ']', value));
            i++;
          }
          more(slots, object.size);
        } else if (object instanceof Set) {
          let i = 0;
          for (const value of object) {
            if (i >= max) break;
            slots.push(encode(String(i++), value));
          }
          more(slots, object.size);
        } else {
          if (object instanceof Error) slots.push(encode('message', object.message));
          const keys = Object.keys(object);
          const extra = slots.length;
          for (let i = 0; i < keys.length && slots.length < max; i++) {
            const property = Object.getOwnPropertyDescriptor(object, keys[i]);
            slots.push(
              property && 'value' in property
                ? encode(keys[i], property.value)
                : { name: keys[i], value: '(accessor)' }
            );
          }
          more(slots, keys.length + extra);
        }
      }
    } catch {
      slots.length = 0; // an object that refuses to be read (a proxy) is drawn empty
    }
    return { id, label, kind, slots, state: 'live' };
  };

  /**
   * Frames, then every object reachable from them, then the ones the program dropped.
   * Nothing is ever marked or removed here: a run cannot observe a garbage collection.
   */
  const snapshot = () => {
    const frameIds = new Set<string>();
    for (const frame of stack) frameIds.add(frame.id);
    const frames: StackFrame[] = stack.map((frame) => ({
      id: frame.id,
      name: frame.name,
      slots: readFrame(frame),
    }));

    const seen = new Set<string>();
    const queue: string[] = [];
    const objects: HeapObject[] = [];
    let truncated = false;
    let next = 0;
    const want = (slots: Slot[]) => {
      for (const slot of slots) {
        if (slot.refId && !frameIds.has(slot.refId) && !seen.has(slot.refId)) {
          seen.add(slot.refId);
          queue.push(slot.refId);
        }
      }
    };
    // A queue, not recursion: a long linked list must not overflow the native stack.
    const drain = () => {
      while (next < queue.length) {
        if (objects.length >= limits.maxHeapObjects) {
          truncated = true;
          return;
        }
        const object = describe(queue[next++]);
        objects.push(object);
        want(object.slots);
      }
    };

    for (const frame of frames) want(frame.slots);
    drain();
    for (const id of rank.keys()) {
      if (truncated) break;
      if (seen.has(id) || frameIds.has(id)) continue;
      seen.add(id);
      queue.push(id);
      drain();
    }
    objects.sort((a, b) => (rank.get(a.id) || 0) - (rank.get(b.id) || 0));
    return { frames, objects, truncated };
  };

  const record = (kind: StepKind, line: number) => {
    if (halted || busy || steps.length >= limits.maxSteps) return;
    busy = true;
    try {
      const taken = snapshot();
      const focus: string[] = [];
      const now = new Map<string, Entity>();

      // An entity that did not change is the very object the previous step holds, so a long
      // trace stays small. Whatever did change is the step's focus.
      const settle = <T extends Entity>(entity: T): T => {
        const before = last.get(entity.id) as T | undefined;
        let kept = entity;
        if (!before || 'kind' in before !== 'kind' in entity) {
          focus.push(entity.id);
        } else {
          const old = new Map<string, Slot>();
          for (const slot of before.slots) old.set(slot.name, slot);
          let same =
            before.slots.length === entity.slots.length &&
            (before as StackFrame).name === (entity as StackFrame).name &&
            (before as HeapObject).label === (entity as HeapObject).label;
          let found = 0;
          entity.slots.forEach((slot, index) => {
            const was = old.get(slot.name);
            if (was) found++;
            if (!was || was.value !== slot.value || was.refId !== slot.refId) {
              focus.push(entity.id + '.' + slot.name);
              same = false;
            } else if (same && before.slots[index].name !== slot.name) {
              same = false;
            }
          });
          // A slot that went away leaves nothing to point at, so its object is the focus.
          // A frame only loses slots when a block scope closes, which no statement did.
          if (found < before.slots.length && 'kind' in entity) focus.push(entity.id);
          if (same) kept = before;
        }
        now.set(kept.id, kept);
        return kept;
      };

      steps.push({
        snapshot: { frames: taken.frames.map(settle), objects: taken.objects.map(settle) },
        line,
        focus,
        kind,
        consoleLength: consoleLength ? consoleLength() : 0,
        truncated: taken.truncated,
      });
      last = now;
      idle = 0;
    } finally {
      busy = false;
    }
  };

  /**
   * Stops the run at the step limit: by recorded steps, or by turns that record nothing.
   * Code that a snapshot's reads set off records nothing, but its turns still count, so a
   * loop in a proxy trap cannot hang the run.
   */
  const budget = () => {
    if (!halted && ((!busy && steps.length >= limits.maxSteps) || ++idle > limits.maxSteps)) {
      halted = true;
      outcome = 'step-limit';
    }
    if (halted) throw halt;
  };

  /**
   * `frame` is the one running, so it is the top of the stack. A frame that left without the
   * tracer seeing it (a rejected `await`, `yield*`) is repaired here.
   */
  const wake = (frame: Scope) => {
    const index = stack.lastIndexOf(frame);
    if (index < 0) stack.push(frame);
    else stack.length = index + 1;
  };

  /** Records the step of the statement that just finished in `frame`. */
  const flush = (frame: Scope) => {
    if (frame.pending !== null) {
      record('statement', frame.pending);
      frame.pending = null;
    }
    if (frame.blocks.some((block) => block.closed)) {
      frame.blocks = frame.blocks.filter((block) => !block.closed);
    }
  };

  const brief = (value: unknown): string => {
    if (isPrimitive(value)) return text(value, 12);
    if (typeof value === 'function') return 'ƒ';
    return Array.isArray(value) ? '[…]' : '{…}';
  };

  const callName = (name: string, getters: Getter[], argCount: number): string => {
    let args = '…';
    if (argCount >= 0) {
      try {
        args = getters
          .slice(0, argCount)
          .map((getter) => brief(getter[1]()))
          .join(', ');
        if (args.length > 30) args = '…';
      } catch {
        args = '…';
      }
    }
    return name + '(' + args + ')';
  };

  return {
    start(line, getters) {
      const frame = newScope('global', getters, null, null, line);
      frame.name = 'global';
      globalScope = frame;
      stack.push(frame);
      record('call', line);
      return frame;
    },

    done(frame) {
      if (!halted && !busy) flush(frame as Scope);
    },

    enter(name, line, getters, parent, argCount) {
      const frame = newScope('f' + ++seq, getters, parent as Scope, null, line);
      budget();
      if (busy) return frame;
      const caller = stack[stack.length - 1];
      frame.name = callName(name, getters, argCount);
      stack.push(frame);
      record('call', caller && caller.pending !== null ? caller.pending : line);
      return frame;
    },

    leave(handle) {
      const frame = handle as Scope | undefined;
      if (!frame || busy) return;
      try {
        if (!frame.threw && !halted) {
          wake(frame);
          record('return', frame.pending !== null ? frame.pending : frame.line);
        }
      } finally {
        const index = stack.lastIndexOf(frame);
        if (index >= 0) stack.length = index;
        frame.pending = null;
        frame.blocks = [];
      }
    },

    thrown(thrownError, handle) {
      const frame = handle as Scope | undefined;
      if (thrownError !== halt && frame && !busy) {
        frame.threw = true;
        if (!hasThrown || thrownValue !== thrownError) {
          hasThrown = true;
          thrownValue = thrownError;
          thrownLine = frame.pending !== null ? frame.pending : frame.line;
        }
      }
      return thrownError;
    },

    step(line, handle) {
      budget();
      if (busy) return;
      const frame = handle as Scope;
      wake(frame);
      flush(frame);
      frame.pending = line;
    },

    loop(line, handle) {
      budget();
      if (busy) return;
      const frame = handle as Scope;
      wake(frame);
      if (frame.pending !== line) {
        flush(frame);
        frame.pending = line;
      }
    },

    block(handle, getters, parent, head) {
      const frame = handle as Scope;
      const block = newScope('b' + ++seq, getters, parent as Scope, frame, frame.line);
      if (busy) return block;
      // The statement before the block ran without the block's variables.
      if (!head && !halted) flush(frame);
      frame.blocks.push(block);
      return block;
    },

    unblock(block) {
      if (block) (block as Scope).closed = true;
    },

    fn(fn, scope, name) {
      if (typeof fn === 'function' && !fnScope.has(fn)) {
        fnScope.set(fn, scope as Scope);
        // The wrapping call hides the function from the engine's own name inference.
        if (name && fn.name === '') {
          try {
            Object.defineProperty(fn, 'name', { value: name, configurable: true });
          } catch {
            // a frozen function keeps its empty name
          }
        }
      }
      return fn;
    },

    suspend<V>(handle: ScopeHandle, value?: V): V {
      const index = stack.lastIndexOf(handle as Scope);
      if (index >= 0 && !busy) stack.length = index;
      return value as V;
    },

    resume(handle, value) {
      if (!busy) wake(handle as Scope);
      return value;
    },

    guard(caught, handle) {
      if (caught === halt) throw halt;
      if (busy) return;
      hasThrown = false;
      thrownValue = undefined;
      wake(handle as Scope);
    },

    fail(failure) {
      if (halted || failure === halt) return;
      halted = true;
      outcome = 'error';
      let message: string;
      try {
        message = failure instanceof Error ? String(failure) : 'Uncaught ' + text(failure, 200);
      } catch {
        message = 'Uncaught error';
      }
      const line =
        hasThrown && thrownValue === failure ? thrownLine : globalScope && globalScope.pending;
      error = typeof line === 'number' ? { message, line } : { message };
    },

    stopped(caught) {
      return caught === halt;
    },

    getTrace() {
      const trace: Trace = { steps: steps.slice(), outcome };
      if (error) trace.error = { ...error };
      return trace;
    },
  };
}

/**
 * The runtime as source, for the sandbox: an expression that evaluates to `createTracer`.
 * `(${runtimeSource})(limits, consoleLength)` gives the object instrumented code calls.
 */
export const runtimeSource: string = createTracer.toString();
