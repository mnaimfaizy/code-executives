/**
 * An exercise: a task in the Playground with a goal, checks that pass or fail on the
 * learner's code, and hints (CONTEXT.md, ADR 0004 decision 5).
 *
 * Pure data. JavaScript only for now.
 */

import type { VisualizationLens } from '../types';

export type ExerciseLevel = 'easy' | 'medium' | 'hard';

/** Plain data: what a check passes in and expects back. It crosses `postMessage` unchanged. */
export type CheckValue =
  null | boolean | number | string | CheckValue[] | { [key: string]: CheckValue };

/** One call of the entry function and the result it must return. */
export interface ExerciseCheck {
  /** The arguments of the call, in order. */
  args: CheckValue[];
  /** What the call must return, compared by structural equality. */
  expected: CheckValue;
  /** Shown when the check fails: why this result is the right one. */
  explanation?: string;
  /** A hidden check reports only that it passed or failed. */
  hidden?: boolean;
}

/** A reference solution, shown to the learner when they ask for it. */
export interface ExerciseSolution {
  /** Complete code for the editor: it passes every check of its exercise. */
  code: string;
  /**
   * The idea, in two to four plain sentences for a learner: why it works and what it costs.
   * `backticks` mark code, and any term of art is explained where it appears.
   */
  explanation: string;
}

export interface Exercise {
  /** Stable, and the value of `?exercise=` in a link. Lower-case letters, digits and hyphens. */
  id: string;
  title: string;
  level: ExerciseLevel;
  /**
   * What to write and the goal, as prose. Paragraphs are separated by an empty line and
   * `backticks` mark code. Anything a check relies on is stated here: how a list or a tree
   * is passed in, and whether the order of a result matters.
   */
  task: string;
  /** The code the editor starts with. It fails at least one check. */
  starterCode: string;
  /** The name of the function the checks call. The learner's code must define it at top level. */
  entry: string;
  checks: ExerciseCheck[];
  /** Revealed one at a time, in this order. */
  hints: string[];
  /** Shown only after the learner asks for it and confirms. */
  solution: ExerciseSolution;
  /** The lens selected when the exercise opens, and when a check is watched with no lens on. */
  suggestedLens: VisualizationLens;
  /**
   * `any-order`: the result is a list whose order the task leaves open, so a check compares
   * the lists as collections. Set it only when the task says "in any order".
   */
  compare?: 'any-order';
}

/**
 * How one check ended.
 * - `pass` / `fail`: the entry function returned; `actual` is what it returned.
 * - `threw`: an error nothing caught; `beforeCall` when it came before the entry function ran.
 * - `missing`: the code defines no function with the entry's name.
 * - `step-limit`: the run was stopped, most often an endless loop.
 * - `not-reached`: the code ended before the check could call the entry function.
 * - `unavailable`: the sandbox did not answer.
 * - `skipped`: not run, because an earlier check hit the step limit.
 */
export type CheckStatus =
  'pass' | 'fail' | 'threw' | 'missing' | 'step-limit' | 'not-reached' | 'unavailable' | 'skipped';

/** What the sandbox reports for one check. */
export interface CheckReport {
  status: CheckStatus;
  /** What the entry function returned, as text on one line. */
  actual?: string;
  /** The error, for `threw` and `unavailable`. */
  message?: string;
  beforeCall?: boolean;
}

/** What the sandbox needs to run one check. */
export interface SandboxCheck {
  /** The name the code calls the check hook by. */
  hook: string;
  args: CheckValue[];
  expected: CheckValue;
  anyOrder: boolean;
}

/** One check's result as the task panel shows it. A hidden check keeps only pass, fail or skipped. */
export interface CheckResult extends CheckReport {
  /** Position in the exercise's `checks`. */
  index: number;
  hidden: boolean;
}

/** The result of the Check action. */
export type ChecksRun =
  /** The code did not parse, so no check ran. */
  | { kind: 'syntax-error'; message: string; line?: number }
  /** The code parses but the tracer cannot rewrite it, so no check ran. */
  | { kind: 'untraceable'; message: string }
  | { kind: 'ran'; results: CheckResult[]; passed: boolean };
