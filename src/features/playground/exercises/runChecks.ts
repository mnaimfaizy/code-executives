/**
 * Running an exercise's checks on the learner's code.
 *
 * Each check is one run in the sandbox: the learner's code, followed by one line that hands
 * the entry function to the sandbox's check hook. The sandbox calls the function with the
 * check's arguments and compares the result itself (see `sandboxRuntime.ts`), so the verdict
 * never depends on what the code printed.
 *
 * The code runs instrumented, like a traced run, because the tracer's step limit is what
 * ends an endless loop: an untraced `while (true) {}` never yields, and nothing in the page
 * can stop it. One run per check gives every check the full step budget and a clean start.
 * Once a check hits the step limit the rest are skipped: code that does not end rarely ends
 * for the next arguments, and each such run costs the learner a wait.
 */

import { instrument, resolveTraceLimits, type TraceLimits } from '../tracer';
import type {
  CheckReport,
  CheckResult,
  CheckValue,
  ChecksRun,
  Exercise,
  ExerciseCheck,
  SandboxCheck,
} from './types';

/** The name the appended line calls the sandbox's check hook by. */
export const CHECK_HOOK = '__pgCheck__';

/**
 * A check's step budget: the same as a watched run's, so a call that passes its check can
 * always be watched to its end. The checks use small inputs and need a few hundred steps at
 * most. A larger budget would not be cheap: every step snapshots the whole stack, so a
 * recursion that never ends costs the square of the limit.
 */
export const CHECK_TRACE_LIMITS: TraceLimits = resolveTraceLimits();

export const CHECK_MAX_STEPS = CHECK_TRACE_LIMITS.maxSteps;

/** How long the sandbox gets for one check before the host gives up on it. */
export const CHECK_TIMEOUT_MS = 5_000;

export type CheckCode =
  | { ok: true; code: string }
  | { ok: false; run: Extract<ChecksRun, { kind: 'syntax-error' | 'untraceable' }> };

const lineCount = (code: string): number => code.split('\n').length;

/** The instrumented code of a check run: the learner's code, then the entry handed to the hook. */
export function buildCheckCode(code: string, entry: string): CheckCode {
  const source = `${code}\n;${CHECK_HOOK}(typeof ${entry} === "function" ? ${entry} : undefined);`;
  const instrumented = instrument(source);
  if (instrumented.ok) return { ok: true, code: instrumented.code };
  const { message, line } = instrumented.error;
  if (line === undefined) {
    // The position at the end of the message is one in the rewritten code
    return {
      ok: false,
      run: { kind: 'untraceable', message: message.replace(/\s*\(\d+:\d+\)$/, '') },
    };
  }
  // Code that never closes a bracket fails on the appended line: point at the learner's last line
  return {
    ok: false,
    run: { kind: 'syntax-error', message, line: Math.min(line, lineCount(code)) },
  };
}

/** A value as the learner would write it in code, on one line. */
export function formatValue(value: CheckValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  const slots = Object.entries(value).map(([key, slot]) => `${key}: ${formatValue(slot)}`);
  return slots.length > 0 ? `{ ${slots.join(', ')} }` : '{}';
}

/** The call a check makes, e.g. `twoSum([2, 7, 11, 15], 9)`. */
export function formatCall(entry: string, check: ExerciseCheck): string {
  return `${entry}(${check.args.map(formatValue).join(', ')})`;
}

/**
 * The code a watched check runs: the learner's code plus the one call. The call is on a line
 * of its own after the learner's last line, so the steps inside the code keep their lines.
 */
export function buildWatchCode(code: string, exercise: Exercise, check: ExerciseCheck): string {
  return `${code}\n${formatCall(exercise.entry, check)};`;
}

export function sandboxCheck(exercise: Exercise, check: ExerciseCheck): SandboxCheck {
  return {
    hook: CHECK_HOOK,
    args: check.args,
    expected: check.expected,
    anyOrder: exercise.compare === 'any-order',
  };
}

/** A hidden check reports only that it passed or failed. */
function toResult(index: number, check: ExerciseCheck, report: CheckReport): CheckResult {
  if (check.hidden) {
    const status = report.status === 'pass' || report.status === 'skipped' ? report.status : 'fail';
    return { index, hidden: true, status };
  }
  return { ...report, index, hidden: false };
}

/**
 * Runs every check of `exercise` on `code`, one after the other. `run` sends one check to
 * the sandbox with the instrumented code and resolves with its report.
 */
export async function runChecks(
  exercise: Exercise,
  code: string,
  run: (instrumentedCode: string, check: SandboxCheck) => Promise<CheckReport>
): Promise<ChecksRun> {
  const built = buildCheckCode(code, exercise.entry);
  if (!built.ok) return built.run;

  const results: CheckResult[] = [];
  let stopped = false;
  for (let index = 0; index < exercise.checks.length; index++) {
    const check = exercise.checks[index];
    let report: CheckReport;
    if (stopped) {
      results.push(toResult(index, check, { status: 'skipped' }));
      continue;
    }
    try {
      report = await run(built.code, sandboxCheck(exercise, check));
    } catch (error) {
      report = {
        status: 'unavailable',
        message: error instanceof Error ? error.message : 'The check did not run',
      };
    }
    if (report.status === 'step-limit') stopped = true;
    results.push(toResult(index, check, report));
  }
  return { kind: 'ran', results, passed: results.every((result) => result.status === 'pass') };
}

/** What a result says in words, for the task panel and for a screen reader. */
export function describeResult(result: CheckResult, entry: string): string {
  switch (result.status) {
    case 'pass':
      return 'Passed';
    case 'fail':
      return 'Failed';
    case 'threw':
      return result.beforeCall
        ? `Failed: the code threw before ${entry} was called. ${result.message ?? ''}`.trim()
        : `Failed: ${entry} threw. ${result.message ?? ''}`.trim();
    case 'missing':
      return `Failed: no function named ${entry} was found. Define it at the top level of the code.`;
    case 'step-limit':
      return `Failed: stopped after ${CHECK_MAX_STEPS.toLocaleString('en-US')} steps. A loop or a recursion does not end, or the code takes far more steps than this small input needs.`;
    case 'not-reached':
      return `Failed: the code ended before ${entry} could be called. Remove a top-level return.`;
    case 'skipped':
      return 'Not run: an earlier check was stopped at the step limit.';
    case 'unavailable':
      return `Did not run: ${result.message ?? 'the sandbox did not answer'}.`;
  }
}
