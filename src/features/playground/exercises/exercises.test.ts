/**
 * The proof that the exercise data is right: every exercise's reference solution passes
 * all its checks, and its starter code fails at least one, through the real sandbox script.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { exercises, exercisesByLevel, findExercise } from './exercises';
import { runChecks } from './runChecks';
import { installSandbox, runCheckInSandbox } from './sandboxForTests';
import { parsePlaygroundLink } from '../utils/playgroundLink';

/** One reference solution per exercise id. Not shipped to the learner. */
const SOLUTIONS: Record<string, string> = {
  'two-sum': `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];
    if (seen.has(needed)) return [seen.get(needed), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  'contains-duplicate': `function containsDuplicate(nums) {
  const seen = new Set();
  for (const value of nums) {
    if (seen.has(value)) return true;
    seen.add(value);
  }
  return false;
}`,
  'valid-parentheses': `function isValid(s) {
  const stack = [];
  const opening = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in opening) {
      if (stack.pop() !== opening[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
  'reverse-linked-list': `function reverseList(head) {
  let previous = null;
  let current = head;
  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}`,
  'maximum-depth-binary-tree': `function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
  'implement-queue-using-stacks': `class MyQueue {
  constructor() {
    this.incoming = [];
    this.outgoing = [];
  }

  push(x) {
    this.incoming.push(x);
  }

  move() {
    if (this.outgoing.length === 0) {
      while (this.incoming.length > 0) this.outgoing.push(this.incoming.pop());
    }
  }

  pop() {
    this.move();
    return this.outgoing.pop();
  }

  peek() {
    this.move();
    return this.outgoing[this.outgoing.length - 1];
  }

  empty() {
    return this.incoming.length === 0 && this.outgoing.length === 0;
  }
}

function runQueue(operations) {
  const queue = new MyQueue();
  const results = [];
  for (const [name, ...args] of operations) {
    const result = queue[name](...args);
    results.push(result === undefined ? null : result);
  }
  return results;
}`,
  'maximum-subarray': `function maxSubArray(nums) {
  let best = nums[0];
  let endingHere = nums[0];
  for (let i = 1; i < nums.length; i++) {
    endingHere = Math.max(nums[i], endingHere + nums[i]);
    best = Math.max(best, endingHere);
  }
  return best;
}`,
};

describe('exercises', () => {
  beforeAll(installSandbox);

  it('have unique ids that a link can carry', () => {
    const ids = exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(parsePlaygroundLink(`?exercise=${id}`).exercise).toBe(id);
      expect(findExercise(id)?.id).toBe(id);
    }
    expect(findExercise('no-such-exercise')).toBeUndefined();
    expect(findExercise(undefined)).toBeUndefined();
  });

  it('are grouped by level, easiest first, with every exercise in one group', () => {
    const groups = exercisesByLevel();
    expect(groups.map((group) => group.label)).toEqual(['Easy', 'Medium']);
    expect(groups.flatMap((group) => group.exercises)).toHaveLength(exercises.length);
  });

  it('have a reference solution each, and no solution without an exercise', () => {
    expect(Object.keys(SOLUTIONS).sort()).toEqual(exercises.map((exercise) => exercise.id).sort());
  });

  describe.each(exercises)('$id', (exercise) => {
    it('states a task, names its entry in the starter code, and has hints and checks', () => {
      expect(exercise.task).toContain(exercise.entry);
      expect(exercise.starterCode).toContain(exercise.entry);
      expect(exercise.hints.length).toBeGreaterThan(0);
      // The learner can see why at least two checks expect what they expect
      const visible = exercise.checks.filter((check) => !check.hidden);
      expect(visible.length).toBeGreaterThanOrEqual(2);
      expect(exercise.checks.some((check) => check.hidden)).toBe(true);
      // Order is only ever left open where the task says so
      expect(exercise.task.includes('any order')).toBe(exercise.compare === 'any-order');
    });

    it('has checks made of plain data', () => {
      for (const check of exercise.checks) {
        expect(JSON.parse(JSON.stringify(check.args))).toEqual(check.args);
        expect(JSON.parse(JSON.stringify(check.expected))).toEqual(check.expected);
      }
    });

    it('passes every check with the reference solution', async () => {
      const run = await runChecks(exercise, SOLUTIONS[exercise.id], runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.results.map((result) => result.status)).toEqual(exercise.checks.map(() => 'pass'));
      expect(run.passed).toBe(true);
    });

    it('fails at least one check with the starter code', async () => {
      const run = await runChecks(exercise, exercise.starterCode, runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.passed).toBe(false);
      expect(run.results.some((result) => result.status !== 'pass')).toBe(true);
    });
  });
});
