/**
 * The tracer runtime: what instrumented code calls while it runs.
 *
 * It runs inside the sandbox iframe, which receives it as a source string. So `createTracer`
 * is ONE self-contained function: it may use nothing from module scope (no imports, no
 * helpers, no constants), because `runtimeSource` is its `toString()`. Types are erased and
 * are fine. `runtime.test.ts` runs the serialised source on its own to keep this true.
 *
 * It also models the event loop (ADR 0004: a model of the specification, not the engine's own
 * queues). Promises stay the engine's: the runtime watches `then`, the resolving functions and
 * `await` to know when a reaction joins the microtask queue, and its wrappers see each one
 * run. Timers are the runtime's own, on a virtual clock. The engine's order is the truth: when
 * a callback runs that the model did not expect next, the model is repaired and the trace is
 * marked `queuesApproximate`. `queues.test.ts` holds the corpus of known orderings.
 */

import type {
  HeapObject,
  QueueEntry,
  QueueSource,
  Slot,
  StackFrame,
} from '../../../shared/snapshot';
import type { Step, StepKind, Trace, TraceError, TraceLimits, TraceOutcome } from './types';

/** A variable's name and a live reader of it, created in the scope that declares it. */
export type Getter = [name: string, read: () => unknown];

/** A frame or a block scope, as instrumented code holds it. Opaque outside the runtime. */
export interface ScopeHandle {
  readonly id: string;
}

/** What the host of a run gives the tracer. Every hook is optional. */
export interface TracerHooks {
  /**
   * Runs `turn` as a task of its own, so every microtask the engine holds has run before it.
   * Without it the tracer uses the `setTimeout` it finds when it is created.
   */
  defer?(turn: () => void): void;
  /** A timer or `queueMicrotask` callback threw. Without it the tracer calls its own `fail`. */
  uncaught?(error: unknown): void;
  /** No task and no timer is left: the run has nothing more to do. */
  settled?(): void;
}

/** The calls the rewrite in `instrument.ts` emits, plus what the sandbox uses to end a run. */
export interface Tracer {
  /**
   * The first call of an instrumented program: the values it uses in place of the globals
   * `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `queueMicrotask`, `Promise`,
   * `Date` and `performance`, in that order. From here to `done` the script itself runs.
   */
  globals(): unknown[];
  /** Pushes the global frame. `line` is the first statement that will run. */
  start(line: number, getters: Getter[]): ScopeHandle;
  /** The top-level code ran to its end. */
  done(frame: ScopeHandle): void;
  /**
   * Pushes a frame. The first `argCount` getters are its parameters; -1 hides the arguments.
   * `promise` is what `async` returned for this call, when the function is an async one.
   */
  enter(
    name: string,
    line: number,
    getters: Getter[],
    parent: ScopeHandle,
    argCount: number,
    promise?: object
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
  /**
   * `frame` is about to wait on `yield`: it leaves the stack. `unmodelled` marks a wait the
   * engine schedules where the tracer cannot see it (`for await`, an async generator).
   */
  suspend<V>(frame: ScopeHandle, value?: V, unmodelled?: boolean): V;
  /**
   * `frame` is about to wait on `await value`: it leaves the stack and the rest of it will join
   * the microtask queue. Returns what to await: `value`, or a stand-in for a thenable.
   */
  wait(frame: ScopeHandle, value: unknown): unknown;
  /** `frame` continues after `await` or `yield`: it is back on the stack. */
  resume<V>(frame: ScopeHandle, value: V): V;
  /** A call of an async function starts. Returns the model of the promise it will return. */
  async(): object;
  /** Links the promise an async function returned to its model. Returns the promise. */
  made<P>(promise: object, returned: P): P;
  /** An async function's `return value`. Returns what to return: `value`, or a stand-in. */
  ret(frame: ScopeHandle | undefined, value: unknown): unknown;
  /** First call of every catch clause: the signal that stops a run is never swallowed. */
  guard(error: unknown, frame: ScopeHandle): void;
  /** Ends the trace with outcome `error`. The sandbox calls this with whatever was not caught. */
  fail(error: unknown): void;
  /** True for the signal the tracer throws to stop the run. It is not a learner error. */
  stopped(error: unknown): boolean;
  /** The trace so far. Safe to call at any time, during or after the run. */
  getTrace(): Trace;
  /** True while a turn of the event loop is still to come: a task, a timer, or the last look. */
  pending(): boolean;
  /** Ends the run for good: drops its timers and takes its hooks off `Promise.prototype`. */
  dispose(): void;
}

export function createTracer(
  limits: TraceLimits,
  consoleLength?: () => number,
  hooks?: TracerHooks
): Tracer {
  /* eslint-disable @typescript-eslint/no-explicit-any -- promises and callbacks of any shape pass through */
  type Callback = (...args: any[]) => any;
  /** What the tracer knows of one promise. 0 pending, 1 fulfilled, 2 rejected, -1 never seen made. */
  interface Model {
    state: number;
    /** Reactions that join the microtask queue when the promise settles, in order. */
    reactions: Job[];
    promise?: unknown;
    /** An async function's model: its frame was pushed. */
    entered?: boolean;
  }
  /** One microtask: waiting on a promise, in the queue, or done. */
  interface Job {
    source: QueueSource;
    /** Set once the job is in the queue. */
    entry: QueueEntry | null;
    /** A fixed label; a reaction has none, its handler is only known once the promise settles. */
    label?: string;
    /** `then`, `catch` or `finally`: what a reaction is called when its handler has no name. */
    kind?: string;
    /** The static helper that registered the reaction, if one did. */
    helper?: string;
    onFulfilled?: unknown;
    onRejected?: unknown;
    /** The learner's function that will run, when there is one. */
    fn?: unknown;
    done: boolean;
  }
  /** One timer: counting down in `timers`, or fired and waiting in `tasks`. */
  interface Timer {
    /** What `setTimeout` returned. An interval keeps it for every turn. */
    handle: number;
    entry: QueueEntry;
    due: number;
    /** An interval's delay; -1 for a timeout. */
    every: number;
    handler: unknown;
    args: unknown[];
    fn?: unknown;
  }
  /** What a promise is about to be resolved with, and how to tell the model once it is. */
  interface Resolution {
    value: unknown;
    commit: () => void;
  }
  interface Scope extends ScopeHandle {
    /** A frame's name with its arguments. */
    name: string;
    /** A frame's function name, bare: what its queue entry is called while it awaits. */
    fn: string;
    /** The microtask that will continue this frame after its `await`. */
    waiting: Job | null;
    /** An async function's frame: the promise its call returned, and what it returned so far. */
    model: Model | null;
    result: Resolution | null;
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

  // The event loop. `microtasks` is the model; the engine's own queue decides what runs.
  const microtasks: Job[] = [];
  const tasks: Timer[] = [];
  const timers: Timer[] = [];
  /** What the tracer knows of each promise it saw being made. */
  const models = new WeakMap<object, Model>();
  /** Names for the functions the tracer itself hands to `then`. */
  const labels = new WeakMap<object, string>();
  /** The learner's function behind one of the tracer's own. */
  const origins = new WeakMap<object, unknown>();
  /** Ids of the entries that joined or left a region since the last step. */
  let changed: string[] = [];
  let regions: { microtasks: QueueEntry[]; tasks: QueueEntry[]; timers: QueueEntry[] } | null =
    null;
  let regionsCut = false;
  let entrySeq = 0;
  let timerSeq = 0;
  /** Virtual milliseconds since the run started. Only the event loop moves it. */
  let clock = 0;
  /** The program called `globals`: it is an instrumented one, with an event loop to run. */
  let begun = false;
  /** The script's own synchronous run has not ended. */
  let scriptRunning = false;
  /** Frames that stay on the stack when nothing runs: the global frame, until the script ends. */
  let floor = 0;
  /** Callbacks the tracer is calling right now, whether or not they are instrumented. */
  let depth = 0;
  /** The entry that started to run and has no step yet. */
  let started: string | null = null;
  let approximate = false;
  let scheduled = false;
  let disposed = false;
  let installed = false;
  /** The next `then` call is `catch`'s own. */
  let catching = false;
  /** The static helper (`Promise.all`) whose reactions are being registered. */
  let helper = '';
  let env: unknown[] | null = null;

  const NativePromise = Promise;
  const NativeDate = Date;
  const promiseProto = NativePromise.prototype as any;
  let nativeThen: Callback = promiseProto.then;
  let nativeCatch: Callback = promiseProto.catch;
  let nativeFinally: Callback = promiseProto.finally;
  const nativeMicrotask = queueMicrotask;
  const nativeTimeout = setTimeout;
  const epoch = NativeDate.now();

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
      fn: '',
      waiting: null,
      model: null,
      result: null,
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
      // The global frame once the script has ended: its variables live on without a frame.
      const label =
        scope === globalScope
          ? 'global'
          : isFrame
            ? scope.name + ' scope'
            : scope.frame.name + ' block';
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

    // What the engine holds without a frame: the global variables once the script has ended,
    // and the closures of the callbacks that wait in a region.
    const roots: string[] = [];
    const root = (id: string) => {
      if (roots.indexOf(id) < 0) roots.push(id);
      if (!seen.has(id)) {
        seen.add(id);
        queue.push(id);
      }
    };
    const held = (fn: unknown) => {
      if (typeof fn !== 'function') return;
      const made = fnScope.get(fn);
      if (made && made !== globalScope) root(idOf(fn));
    };

    for (const frame of frames) want(frame.slots);
    if (globalScope && heapScopes.has(globalScope.id)) root(globalScope.id);
    for (const job of microtasks) held(job.fn);
    for (const timer of tasks) held(timer.fn);
    for (const timer of timers) held(timer.fn);
    drain();
    for (const id of rank.keys()) {
      if (truncated) break;
      if (seen.has(id) || frameIds.has(id)) continue;
      seen.add(id);
      queue.push(id);
      drain();
    }
    objects.sort((a, b) => (rank.get(a.id) || 0) - (rank.get(b.id) || 0));
    return { frames, objects, truncated, roots };
  };

  /** The three regions as a step holds them. They are only rebuilt after a change. */
  const queues = () => {
    if (!regions) {
      regionsCut = false;
      const cut = (list: { entry: QueueEntry | null }[]): QueueEntry[] => {
        const out: QueueEntry[] = [];
        for (let i = 0; i < list.length && i < limits.maxQueueEntries; i++) {
          out.push(list[i].entry as QueueEntry);
        }
        if (list.length > out.length) regionsCut = true;
        return out;
      };
      regions = { microtasks: cut(microtasks), tasks: cut(tasks), timers: cut(timers) };
    }
    return regions;
  };

  /** An entry joined or left a region: it is part of the next step's focus. */
  const note = (entry: QueueEntry | null) => {
    if (entry) changed.push(entry.id);
    regions = null;
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

      const waiting = queues();
      for (const id of changed) if (focus.indexOf(id) < 0) focus.push(id);
      changed = [];
      const step: Step = {
        snapshot: {
          frames: taken.frames.map(settle),
          objects: taken.objects.map(settle),
          microtasks: waiting.microtasks,
          tasks: waiting.tasks,
          timers: waiting.timers,
        },
        line,
        focus,
        kind,
        consoleLength: consoleLength ? consoleLength() : 0,
        truncated: taken.truncated,
      };
      if (taken.roots.length) step.snapshot.roots = taken.roots;
      if (started) step.entryId = started;
      started = null;
      if (regionsCut) step.queuesTruncated = true;
      steps.push(step);
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

  /** True while the learner's code is on the engine's stack. */
  const inCode = () => !halted && !busy && (scriptRunning || depth > 0 || stack.length > floor);

  /** Once nothing of the learner's runs any more, an entry that started without a step has none. */
  const ended = () => {
    if (depth === 0 && stack.length <= floor) started = null;
  };

  /** What a callback is called in its region: its own name, or `fallback`. */
  const nameOf = (fn: unknown, fallback: string): string => {
    if (typeof fn !== 'function') return fallback;
    const given = labels.get(fn);
    if (given) return given;
    let name: unknown;
    try {
      name = fn.name;
    } catch {
      name = '';
    }
    if (typeof name !== 'string' || !name) return fallback;
    return name.length > 24 ? name.slice(0, 24) + '…' : name;
  };

  const newEntry = (label: string, source: QueueSource, delay?: number): QueueEntry => {
    const entry: QueueEntry = { id: 'q' + ++entrySeq, label, source };
    if (delay !== undefined) entry.delay = delay;
    return entry;
  };

  const newModel = (state: number): Model => ({ state, reactions: [] });

  /** The model of a promise. One the tracer never saw being made is in a state it cannot know. */
  const modelOf = (promise: object): Model => {
    let model = models.get(promise);
    if (!model) {
      model = newModel(-1);
      models.set(promise, model);
    }
    return model;
  };

  const link = (promise: unknown, model: Model) => {
    if (isPrimitive(promise)) return;
    model.promise = promise;
    models.set(promise as object, model);
  };

  /** The engine's own test before it awaits a value as it is, or returns it from `Promise.resolve`. */
  const isPlainPromise = (value: unknown): boolean => {
    try {
      return value instanceof NativePromise && (value as any).constructor === NativePromise;
    } catch {
      return false;
    }
  };

  /** A reaction joins the microtask queue. Which handler will run is known only now. */
  const enqueue = (job: Job, state: number) => {
    if (job.done || job.entry) return;
    let label = job.label;
    if (label === undefined) {
      const handler = state === 2 ? job.onRejected : job.onFulfilled;
      if (typeof handler === 'function') {
        // A helper such as `Promise.all` registers the engine's own nameless functions.
        const own = job.helper && !fnScope.has(handler) ? job.helper : job.kind + ' callback';
        label = nameOf(handler, own);
        job.fn = origins.get(handler) || handler;
      } else {
        // No handler for this outcome: the job only passes the value or the reason on.
        label = job.kind + ' skipped';
      }
    }
    job.entry = newEntry(label, job.source);
    microtasks.push(job);
    note(job.entry);
  };

  const settle = (model: Model, state: number) => {
    if (model.state > 0) return;
    model.state = state;
    const reactions = model.reactions;
    model.reactions = [];
    for (const job of reactions) enqueue(job, state);
  };

  /**
   * The engine runs `job` now. A microtask queue is first in, first out, so the job must be the
   * head of the model's queue. When it is not, the model is wrong for this program: the job is
   * taken from wherever it is, and the trace says its queues are approximate.
   */
  const begin = (job: Job) => {
    if (job.done) return;
    job.done = true;
    const at = microtasks.indexOf(job);
    if (at !== 0) approximate = true;
    if (at >= 0) {
      microtasks.splice(at, 1);
      note(job.entry);
    }
    started = job.entry ? job.entry.id : null;
  };

  /**
   * The signal that stops a run must not travel on as a rejection nobody handles: the promise
   * that would carry it stays pending instead, and nothing after it runs.
   */
  const unsettled = () => new NativePromise(() => {});
  const quiet = (promise: unknown) => {
    if (promise instanceof NativePromise) nativeThen.call(promise, undefined, () => {});
  };

  /** The frame runs again: the microtask that continues it after `await` has started. */
  const arrive = (frame: Scope) => {
    const job = frame.waiting;
    if (job) {
      frame.waiting = null;
      begin(job);
    }
  };

  /**
   * The pair of functions that settle a promise, wrapped so the model learns of it. Only the
   * first call of either counts, as with the engine's own pair.
   */
  const resolvers = (model: Model, resolve: Callback, reject: Callback) => {
    let used = false;
    const fns = {
      resolve: (value?: unknown) => {
        if (used) return;
        used = true;
        const resolution = prepare(model, value);
        resolution.commit();
        return resolve(resolution.value);
      },
      reject: (reason?: unknown) => {
        if (used) return;
        used = true;
        settle(model, 2);
        return reject(reason);
      },
      /** The code that held the pair threw: the engine rejects the promise unless it is settled. */
      spoil: () => {
        if (!used) {
          used = true;
          settle(model, 2);
        }
      },
    };
    labels.set(fns.resolve, 'resolve promise');
    labels.set(fns.reject, 'reject promise');
    return fns;
  };

  /**
   * What happens when a promise is resolved with `value`. A plain value fulfils it at once. A
   * thenable does not: the engine queues a microtask that calls its `then`, and the promise
   * settles when that `then` calls back. To see that job run, the engine is given a stand-in
   * whose `then` calls the real one; `then` is read once, as the engine would read it.
   */
  const prepare = (model: Model, value: unknown): Resolution => {
    if (isPrimitive(value)) return { value, commit: () => settle(model, 1) };
    // A promise resolved with itself is rejected.
    if (value === model.promise) return { value, commit: () => settle(model, 2) };
    let then: unknown;
    try {
      then = (value as any).then;
    } catch (error) {
      const throws = {
        get then() {
          throw error;
        },
      };
      return { value: throws, commit: () => settle(model, 2) };
    }
    if (typeof then !== 'function') return { value, commit: () => settle(model, 1) };
    const job: Job = {
      source: 'promise',
      entry: null,
      label: value instanceof NativePromise ? 'promise.then' : 'thenable.then',
      fn: then,
      done: false,
    };
    const standIn = {
      then(resolve: Callback, reject: Callback) {
        begin(job);
        depth++;
        const fns = resolvers(model, resolve, reject);
        try {
          return (then as Callback).call(value, fns.resolve, fns.reject);
        } catch (error) {
          if (error === halt) return;
          fns.spoil();
          throw error;
        } finally {
          depth--;
          ended();
        }
      },
    };
    return { value: standIn, commit: () => enqueue(job, 1) };
  };

  /** `Promise.resolve`: a plain promise is returned as it is, anything else resolves a new one. */
  const promiseResolve = (value: unknown): any => {
    if (isPlainPromise(value)) return value;
    const model = newModel(0);
    const promise = new NativePromise((resolve) => {
      const resolution = prepare(model, value);
      resolution.commit();
      resolve(resolution.value);
    });
    link(promise, model);
    return promise;
  };

  // The three functions that stand on `Promise.prototype` while a traced program runs. Called by
  // anything but the learner's code (the test runner, a finished run), they only pass on.

  function patchedThen(this: unknown, ...args: unknown[]) {
    const isCatch = catching;
    catching = false;
    if (!inCode()) return nativeThen.apply(this, args);
    const onFulfilled = args[0];
    const onRejected = args[1];
    const job: Job = {
      source: 'promise',
      entry: null,
      kind:
        isCatch || (typeof onFulfilled !== 'function' && typeof onRejected === 'function')
          ? 'catch'
          : 'then',
      helper,
      onFulfilled,
      onRejected,
      done: false,
    };
    const derived = newModel(0);
    let model: Model | null = null;
    const reaction = (handler: unknown, state: number) => (value: unknown) => {
      // Running at all proves the promise settled, whatever the model believed.
      if (model && model.state <= 0) settle(model, state);
      begin(job);
      depth++;
      try {
        if (typeof handler !== 'function') {
          if (state === 2 && value === halt) return unsettled();
          settle(derived, state);
          if (state === 2) throw value;
          return value;
        }
        let result: unknown;
        try {
          result = handler(value);
        } catch (error) {
          if (error === halt) return unsettled();
          settle(derived, 2);
          throw error;
        }
        const resolution = prepare(derived, result);
        resolution.commit();
        return resolution.value;
      } finally {
        depth--;
        ended();
      }
    };
    const promise = nativeThen.call(this, reaction(onFulfilled, 1), reaction(onRejected, 2));
    link(promise, derived);
    model = modelOf(this as object);
    if (model.state > 0) enqueue(job, model.state);
    else if (model.state === 0) model.reactions.push(job);
    return promise;
  }

  function patchedCatch(this: any, onRejected?: unknown) {
    if (!inCode()) return nativeCatch.call(this, onRejected);
    catching = true;
    try {
      return this.then(undefined, onRejected);
    } finally {
      catching = false;
    }
  }

  /**
   * `finally` as the specification writes it, on the hooks above: the callback runs in one
   * microtask, and passing the outcome on takes more, each of them an entry of its own.
   */
  function patchedFinally(this: any, onFinally?: unknown) {
    if (!inCode() || typeof onFinally !== 'function') return nativeFinally.call(this, onFinally);
    const after = (passOn: () => unknown) => {
      const result = onFinally();
      labels.set(passOn, 'finally passes on');
      return promiseResolve(result).then(passOn);
    };
    const onFulfilled = (value: unknown) => after(() => value);
    const onRejected = (reason: unknown) =>
      after(() => {
        throw reason;
      });
    const label = nameOf(onFinally, 'finally callback');
    for (const handler of [onFulfilled, onRejected]) {
      labels.set(handler, label);
      origins.set(handler, onFinally);
    }
    return this.then(onFulfilled, onRejected);
  }

  const install = () => {
    if (installed || disposed) return;
    installed = true;
    nativeThen = promiseProto.then;
    nativeCatch = promiseProto.catch;
    nativeFinally = promiseProto.finally;
    promiseProto.then = patchedThen;
    promiseProto.catch = patchedCatch;
    promiseProto.finally = patchedFinally;
  };

  const uninstall = () => {
    // A tracer that hooked in later calls these hooks; they stay and only pass on.
    if (
      !installed ||
      promiseProto.then !== patchedThen ||
      promiseProto.catch !== patchedCatch ||
      promiseProto.finally !== patchedFinally
    ) {
      return;
    }
    promiseProto.then = nativeThen;
    promiseProto.catch = nativeCatch;
    promiseProto.finally = nativeFinally;
    installed = false;
  };

  /** A timer joins `tasks` when it is due at once, else `timers`: soonest first, then oldest first. */
  const place = (timer: Timer) => {
    if (timer.due <= clock) {
      tasks.push(timer);
    } else {
      let at = 0;
      while (at < timers.length && timers[at].due <= timer.due) at++;
      timers.splice(at, 0, timer);
    }
    note(timer.entry);
  };

  const kick = () => {
    if (scheduled || disposed) return;
    scheduled = true;
    if (hooks && hooks.defer) hooks.defer(turn);
    else nativeTimeout(turn, 0);
  };

  const arm = (handler: unknown, delay: unknown, args: unknown[], repeats: boolean): number => {
    const handle = ++timerSeq;
    if (halted || disposed) return handle;
    let ms = Number(delay);
    if (!(ms > 0)) ms = 0;
    // An interval of 0 would never let the clock move on. Browsers do not allow one either.
    const every = repeats ? Math.max(ms, 1) : -1;
    const fallback = repeats ? 'setInterval callback' : 'setTimeout callback';
    const label = typeof handler === 'function' ? nameOf(handler, fallback) : 'code string';
    place({
      handle,
      entry: newEntry(label, repeats ? 'interval' : 'timeout', ms),
      due: clock + (repeats ? every : ms),
      every,
      handler,
      args,
      fn: handler,
    });
    kick();
    return handle;
  };

  /** Browsers keep timeouts and intervals in one list, so either clear function clears both. */
  const disarm = (handle: unknown) => {
    const wanted = Number(handle);
    for (const list of [timers, tasks]) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].handle === wanted) {
          note(list[i].entry);
          list.splice(i, 1);
        }
      }
    }
  };

  const report = (failure: unknown) => {
    if (hooks && hooks.uncaught) hooks.uncaught(failure);
    else tracer.fail(failure);
  };

  /**
   * One turn of the event loop. The host runs it as a task of its own, so the engine has
   * emptied its microtask queue before: the model's queue must be empty as well. With no task
   * waiting, the clock jumps to the next timer, which is how a 5 second timer takes no time.
   * Then one task runs; the engine runs the microtasks it queues before the next turn.
   *
   * Not modelled: browsers raise the delay of deeply nested timers to 4 ms. An interval's next
   * turn is set before its callback runs, so the learner sees it wait while the callback runs.
   */
  function turn() {
    scheduled = false;
    if (disposed) return;
    if (microtasks.length) {
      approximate = true;
      for (const job of microtasks) note(job.entry);
      microtasks.length = 0;
    }
    if (stack.length > floor) stack.length = floor;
    depth = 0;
    started = null;
    if (!halted && !tasks.length && timers.length) {
      clock = timers[0].due;
      while (timers.length && timers[0].due <= clock) {
        const fired = timers.shift() as Timer;
        tasks.push(fired);
        note(fired.entry);
      }
    }
    // A task counts towards the step limit even when it records nothing, like a loop turn.
    if (!halted && tasks.length && (steps.length >= limits.maxSteps || ++idle > limits.maxSteps)) {
      halted = true;
      outcome = 'step-limit';
    }
    const timer = halted ? undefined : tasks.shift();
    if (!timer) {
      timers.length = 0;
      tasks.length = 0;
      regions = null;
      uninstall();
      if (hooks && hooks.settled) hooks.settled();
      return;
    }
    note(timer.entry);
    started = timer.entry.id;
    if (timer.every >= 0) {
      const again = newEntry(timer.entry.label, 'interval', timer.entry.delay);
      place({ ...timer, entry: again, due: clock + timer.every });
    }
    depth++;
    try {
      if (typeof timer.handler === 'function') timer.handler.apply(undefined, timer.args);
      else globalThis.eval(String(timer.handler));
    } catch (failure) {
      if (failure !== halt) report(failure);
    } finally {
      depth--;
      ended();
    }
    kick();
  }

  /** What an instrumented program uses in place of the globals of the same names. */
  const makeGlobals = (): unknown[] => {
    const TracedPromise: any = function (this: unknown, executor: unknown) {
      if (!new.target) return (NativePromise as any)(executor);
      if (typeof executor !== 'function') {
        return Reflect.construct(NativePromise, [executor], new.target);
      }
      const model = newModel(0);
      const promise = Reflect.construct(
        NativePromise,
        [
          (resolve: Callback, reject: Callback) => {
            const fns = resolvers(model, resolve, reject);
            try {
              executor(fns.resolve, fns.reject);
            } catch (error) {
              if (error === halt) return;
              fns.spoil();
              throw error;
            }
          },
        ],
        new.target
      );
      link(promise, model);
      return promise;
    };
    // Its promises are the engine's own, so `await` treats them as it treats any promise.
    TracedPromise.prototype = promiseProto;
    // The helpers run as the engine wrote them, but build their promises through the functions
    // here, so every reaction they register is seen.
    for (const name of Object.getOwnPropertyNames(NativePromise)) {
      const helperFn = (NativePromise as any)[name];
      if (typeof helperFn !== 'function') continue;
      TracedPromise[name] = (...args: unknown[]) => {
        const outer = helper;
        helper = 'Promise.' + name;
        try {
          return helperFn.apply(TracedPromise, args);
        } finally {
          helper = outer;
        }
      };
    }
    TracedPromise.resolve = promiseResolve;
    TracedPromise.reject = (reason: unknown) => {
      const promise = NativePromise.reject(reason);
      link(promise, newModel(2));
      return promise;
    };
    Object.defineProperty(TracedPromise, Symbol.species, { get: () => TracedPromise });

    // The time a traced run sees is the virtual clock: a callback that ran after a 1000 ms timer
    // finds 1000 ms gone, and a trace of the same code is the same every time. The price: code
    // that waits for the clock in a loop never sees it move, and ends at the step limit.
    const now = () => epoch + Math.floor(clock);
    const TracedDate: any = function (this: unknown, ...args: unknown[]) {
      if (!new.target) return new NativeDate(now()).toString();
      return Reflect.construct(NativeDate, args.length ? args : [now()], new.target);
    };
    TracedDate.prototype = NativeDate.prototype;
    TracedDate.now = now;
    TracedDate.parse = NativeDate.parse;
    TracedDate.UTC = NativeDate.UTC;

    return [
      (handler: unknown, delay?: unknown, ...args: unknown[]) => arm(handler, delay, args, false),
      (handler: unknown, delay?: unknown, ...args: unknown[]) => arm(handler, delay, args, true),
      disarm,
      disarm,
      (callback: unknown) => {
        if (typeof callback !== 'function') return nativeMicrotask(callback as () => void);
        const job: Job = {
          source: 'queueMicrotask',
          entry: null,
          label: nameOf(callback, 'queueMicrotask callback'),
          fn: callback,
          done: false,
        };
        enqueue(job, 1);
        nativeMicrotask(() => {
          begin(job);
          depth++;
          try {
            callback();
          } catch (failure) {
            if (failure !== halt) report(failure);
          } finally {
            depth--;
            ended();
          }
        });
      },
      TracedPromise,
      TracedDate,
      { now: () => clock, timeOrigin: epoch },
    ];
  };

  const tracer: Tracer = {
    globals() {
      begun = true;
      scriptRunning = true;
      install();
      if (!env) env = makeGlobals();
      return env;
    },

    start(line, getters) {
      const frame = newScope('global', getters, null, null, line);
      frame.name = 'global';
      globalScope = frame;
      stack.push(frame);
      floor = 1;
      record('call', line);
      return frame;
    },

    done(handle) {
      const frame = handle as Scope;
      if (!halted && !busy) {
        const line = frame.pending !== null ? frame.pending : frame.line;
        flush(frame);
        if (stack[0] === frame) {
          // The script has ended: its frame is popped, and what waits finds the stack empty.
          // The global variables stay, as a scope on the heap that the engine holds on to.
          stack.length = 0;
          floor = 0;
          if (frame.getters.length) {
            heapScopes.set(frame.id, frame);
            rank.set(frame.id, ++seq);
          }
          if (microtasks.length || tasks.length || timers.length) record('return', line);
        }
      }
      scriptRunning = false;
      if (begun) kick();
    },

    enter(name, line, getters, parent, argCount, promise) {
      const frame = newScope('f' + ++seq, getters, parent as Scope, null, line);
      budget();
      if (busy) return frame;
      // Nothing the model knows of started this call: the engine ran a callback on its own.
      if (begun && !scriptRunning && depth === 0 && stack.length <= floor) approximate = true;
      if (promise) {
        frame.model = promise as Model;
        frame.model.entered = true;
      }
      frame.fn = name;
      const caller = stack[stack.length - 1];
      frame.name = callName(name, getters, argCount);
      stack.push(frame);
      record('call', caller && caller.pending !== null ? caller.pending : line);
      return frame;
    },

    leave(handle) {
      const frame = handle as Scope | undefined;
      if (!frame || busy) return;
      arrive(frame);
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
        // An async function ends: the promise its call returned is resolved or rejected.
        const model = frame.model;
        if (model && !halted) {
          if (frame.threw) settle(model, 2);
          else if (frame.result) frame.result.commit();
          else settle(model, 1);
        } else if (model) {
          quiet(model.promise);
        }
        ended();
      }
    },

    thrown(thrownError, handle) {
      const frame = handle as Scope | undefined;
      if (thrownError !== halt && frame && !busy) {
        arrive(frame);
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
      arrive(frame);
      wake(frame);
      flush(frame);
      frame.pending = line;
    },

    loop(line, handle) {
      budget();
      if (busy) return;
      const frame = handle as Scope;
      arrive(frame);
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

    suspend<V>(handle: ScopeHandle, value?: V, unmodelled?: boolean): V {
      if (busy) return value as V;
      const index = stack.lastIndexOf(handle as Scope);
      if (index >= 0) stack.length = index;
      if (unmodelled) approximate = true;
      ended();
      return value as V;
    },

    wait(handle, value) {
      const frame = handle as Scope;
      if (busy || halted) return value;
      const index = stack.lastIndexOf(frame);
      if (index >= 0) stack.length = index;
      const job: Job = { source: 'await', entry: null, label: frame.fn, done: false };
      frame.waiting = job;
      let awaited = value;
      if (isPlainPromise(value)) {
        // The engine awaits a plain promise as it is: one reaction on it, no extra microtask.
        const model = modelOf(value as object);
        if (model.state > 0) enqueue(job, model.state);
        else if (model.state === 0) model.reactions.push(job);
      } else {
        // Anything else is first wrapped in a new promise, resolved with the value.
        const model = newModel(0);
        model.reactions.push(job);
        const resolution = prepare(model, value);
        resolution.commit();
        awaited = resolution.value;
      }
      // The moment `await` splits the function: its frame is gone, the rest of it waits.
      record('statement', frame.pending !== null ? frame.pending : frame.line);
      ended();
      return awaited;
    },

    resume(handle, value) {
      if (!busy) {
        arrive(handle as Scope);
        wake(handle as Scope);
      }
      return value;
    },

    async() {
      install();
      return newModel(0);
    },

    made(promise, returned) {
      const model = promise as Model;
      // The frame was never pushed: the parameters threw, so the promise is rejected.
      if (!model.entered) settle(model, 2);
      link(returned, model);
      if (halted) quiet(returned);
      return returned;
    },

    ret(handle, value) {
      const frame = handle as Scope | undefined;
      if (!frame || !frame.model || busy || halted) return value;
      // The promise is only resolved when the function has left, after its `finally` blocks.
      frame.result = prepare(frame.model, value);
      return frame.result.value;
    },

    guard(caught, handle) {
      if (caught === halt) throw halt;
      if (busy) return;
      hasThrown = false;
      thrownValue = undefined;
      arrive(handle as Scope);
      wake(handle as Scope);
    },

    fail(failure) {
      scriptRunning = false;
      if (begun) kick();
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
      if (approximate) trace.queuesApproximate = true;
      return trace;
    },

    pending() {
      return scheduled && !disposed;
    },

    dispose() {
      disposed = true;
      timers.length = 0;
      tasks.length = 0;
      uninstall();
    },
  };
  return tracer;
}

/**
 * The runtime as source, for the sandbox: an expression that evaluates to `createTracer`.
 * `(${runtimeSource})(limits, consoleLength)` gives the object instrumented code calls.
 */
export const runtimeSource: string = createTracer.toString();
