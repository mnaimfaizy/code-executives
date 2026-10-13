/**
 * The loop guard: what stops a run with Trace off when its code does not end.
 *
 * Such a run is not rewritten by the tracer and runs on the sandbox's own thread, so
 * `while (true) {}` would block it for good. The guard is a second, much lighter
 * instrumentation that only counts: one call at the start of every loop turn and of every
 * function body. The sandbox supplies the function those calls reach; it throws once the
 * count passes the limit, and from then on at every counted point, and at the start of every
 * `catch` and `finally` block, so the learner's own error handling cannot swallow the stop.
 * It records no snapshot and no step.
 *
 * The calls are spliced into the learner's own text. Nothing is regenerated and no line
 * break is added, so every statement stays on its line and an error still reports the
 * learner's line.
 */

import { parseLearnerCode, type ProgramNode } from './instrument';

/** Loop turns and function calls one run with Trace off may make. Fixed: there is no setting. */
export const LOOP_GUARD_LIMIT = 1_000_000;

/** What the sandbox needs to count for a guarded run. */
export interface LoopGuard {
  /** The name the guarded code calls the counter by */
  name: string;
  limit: number;
  /** What the Console says when the run is stopped */
  message: string;
}

export type GuardResult =
  | { ok: true; code: string; guard: LoopGuard }
  | { ok: false; error: { message: string; line?: number } };

/** What the Console says when the guard stops a run. */
export function loopGuardMessage(limit: number = LOOP_GUARD_LIMIT): string {
  return (
    `Stopped after ${limit.toLocaleString('en-US')} loop turns and calls: ` +
    'a loop or recursion probably does not end. Turn Trace on to watch it step by step.'
  );
}

const LOOPS = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const SKIP = new Set(['type', 'loc', 'start', 'end']);

interface Insertion {
  at: number;
  text: string;
}

/** A name the learner's code does not use, so no declaration of theirs can shadow the counter. */
function freeName(code: string): string {
  let name = '__g';
  while (code.includes(name)) name += '_';
  return name;
}

/**
 * Collects the insertions for `node` and everything below it. An insertion that opens is
 * pushed before the children are visited and one that closes after, so at one position the
 * stable sort keeps outer openers first and inner closers first.
 */
function collect(node: unknown, name: string, out: Insertion[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) collect(child, name, out);
    return;
  }
  const current = node as ProgramNode;
  if (typeof current.type !== 'string') return;
  const count = `${name}();`;
  let closing: Insertion | null = null;

  if (LOOPS.has(current.type)) {
    const body: ProgramNode = current.body;
    if (body.type === 'BlockStatement') {
      out.push({ at: body.start + 1, text: count });
    } else {
      // A loop whose body is one statement gets a block around it
      out.push({ at: body.start, text: `{${count}` });
      closing = { at: body.end, text: '}' };
    }
  } else if (FUNCTIONS.has(current.type)) {
    const body: ProgramNode = current.body;
    if (body.type !== 'BlockStatement') {
      // An arrow function that returns an expression: count, then the expression
      out.push({ at: body.start, text: `(${name}(),` });
      closing = { at: body.end, text: ')' };
    } else {
      // Directives such as 'use strict' must stay the first statements of the body
      let directives = 0;
      while (directives < body.body.length && typeof body.body[directives].directive === 'string') {
        directives++;
      }
      if (directives === 0) out.push({ at: body.start + 1, text: count });
      else out.push({ at: body.body[directives - 1].end, text: `;${count}` });
    }
  } else if (current.type === 'TryStatement') {
    // Once the run is stopped, a catch or finally block throws again before its first statement
    const again = `${name}.c();`;
    if (current.handler) out.push({ at: current.handler.body.start + 1, text: again });
    if (current.finalizer) out.push({ at: current.finalizer.start + 1, text: again });
  }

  for (const key of Object.keys(current)) {
    if (!SKIP.has(key)) collect(current[key], name, out);
  }
  if (closing) out.push(closing);
}

/**
 * Adds the counting calls to the learner's JavaScript. The result runs as a `new Function`
 * body whose one parameter is `guard.name`. A syntax error is reported with its line and
 * nothing is changed; the caller then runs the code as it is, so the engine reports the
 * error in its own words.
 */
export function guardLoops(code: string, limit: number = LOOP_GUARD_LIMIT): GuardResult {
  const parsed = parseLearnerCode(code);
  if (!parsed.ok) return parsed;
  const name = freeName(code);
  const insertions: Insertion[] = [];
  collect(parsed.program, name, insertions);
  insertions.sort((a, b) => a.at - b.at);

  let guarded = '';
  let from = 0;
  for (const { at, text } of insertions) {
    guarded += code.slice(from, at) + text;
    from = at;
  }
  guarded += code.slice(from);

  // Splicing text is only safe if the result is still a program. Check, don't guess.
  const check = parseLearnerCode(guarded);
  if (!check.ok) {
    return { ok: false, error: { message: `This code cannot be guarded: ${check.error.message}` } };
  }
  return { ok: true, code: guarded, guard: { name, limit, message: loopGuardMessage(limit) } };
}

/** The signal a tripped guard throws. The sandbox's own guard throws one like it. */
export class LoopGuardStop extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoopGuardStop';
  }
}

/** A counter guarded code can be called with. */
export interface LoopGuardCounter {
  (): void;
  /** Throws again once the guard has tripped: the first statement of every catch and finally */
  c: () => void;
  tripped: () => boolean;
  count: () => number;
}

/**
 * The counter itself, for running guarded code outside the sandbox (tests, tools). The
 * sandbox script has its own copy of these few lines, because it cannot import.
 */
export function createLoopGuard(guard: Pick<LoopGuard, 'limit' | 'message'>): LoopGuardCounter {
  let count = 0;
  let stop: LoopGuardStop | null = null;
  const counter = (() => {
    if (++count > guard.limit) {
      stop ??= new LoopGuardStop(guard.message);
      throw stop;
    }
  }) as LoopGuardCounter;
  counter.c = () => {
    if (stop) throw stop;
  };
  counter.tripped = () => stop !== null;
  counter.count = () => count;
  return counter;
}
