import { describe, expect, it } from 'vitest';
import {
  getBranches,
  getHeadBranch,
  getReachable,
  getReferences,
  getRef,
  getReflogCommits,
  headFileText,
  reachabilityState,
  resolveHead,
  STORY_CODE,
  STORY_STEPS,
  slotKey,
  type StoryStep,
} from './branchPointersStory';

const step = (id: string) => STORY_STEPS.find((s) => s.id === id)!;
const prev = (id: string) => STORY_STEPS[STORY_STEPS.findIndex((s) => s.id === id) - 1];
const codeLines = STORY_CODE.split('\n').length;
const words = (text: string) => text.trim().split(/\s+/).length;
const branchTargets = (s: StoryStep) =>
  Object.fromEntries(getBranches(s).map((b) => [b.id, b.target]));

describe('branch pointers story model', () => {
  it('tells the approved 12 beats', () => {
    expect(STORY_STEPS).toHaveLength(12);
    expect(new Set(STORY_STEPS.map((s) => s.id)).size).toBe(12);
  });

  it('uses copy-pasteable 4-character SHAs in the code', () => {
    expect(STORY_CODE).toContain('git switch --detach b2c4');
    for (const s of STORY_STEPS) for (const c of s.commits) expect(c.id).toMatch(/^[0-9a-f]{4}$/);
  });

  it.each(STORY_STEPS)('$id is internally consistent', (s) => {
    expect(s.line).toBeGreaterThanOrEqual(1);
    expect(s.line).toBeLessThanOrEqual(codeLines);
    expect(words(s.title)).toBeLessThanOrEqual(8);
    expect(words(s.caption)).toBeLessThanOrEqual(60);

    const commitIds = new Set(s.commits.map((c) => c.id));
    const refIds = new Set(s.refs.map((r) => r.id));
    for (const ref of getReferences(s, { includeReflog: true })) {
      if (ref.toKind === 'ref') expect(refIds).toContain(ref.to);
      else {
        expect(commitIds).toContain(ref.to);
        expect(s.commits.find((c) => c.id === ref.to)!.state).not.toBe('collected');
      }
    }

    const keys = new Set<string>([
      ...commitIds,
      ...refIds,
      ...s.commits.filter((c) => c.parents.length).map((c) => slotKey(c.id, 'parents')),
      ...s.refs.filter((r) => r.kind !== 'reflog').map((r) => slotKey(r.id, 'target')),
    ]);
    for (const key of s.focus) expect(keys).toContain(key);

    const commitCells = s.commits.map((c) => `${c.cell.col},${c.cell.row}`);
    expect(new Set(commitCells).size).toBe(commitCells.length);
    const refCells = s.refs.map((r) => `${r.cell.col},${r.cell.row}`);
    expect(new Set(refCells).size).toBe(refCells.length);
    for (const c of s.commits) {
      expect(c.cell.col).toBeLessThan(4);
      expect(c.cell.row).toBeLessThan(3);
    }
    for (const r of s.refs) {
      expect(r.cell.col).toBeLessThan(3);
      expect(r.cell.row).toBeLessThan(2);
    }

    // The newest HEAD reflog entry is where HEAD is now.
    expect(getRef(s, 'head-reflog')!.entries[0].commit).toBe(resolveHead(s));
  });

  it('keeps every entity identical in identity and placement across steps', () => {
    const seen = new Map<string, string>();
    for (const s of STORY_STEPS) {
      for (const c of s.commits) {
        const sig = JSON.stringify([c.message, c.parents, c.cell]);
        expect(seen.get(c.id) ?? sig).toBe(sig);
        seen.set(c.id, sig);
      }
      for (const r of s.refs) {
        const sig = JSON.stringify(r.cell);
        expect(seen.get(r.id) ?? sig).toBe(sig);
        seen.set(r.id, sig);
      }
    }
  });

  it('derives every commit state from reachability', () => {
    for (const s of STORY_STEPS)
      for (const c of s.commits)
        if (c.state === 'collected')
          expect(getReachable(s, { includeReflog: true }).has(c.id)).toBe(false);
        else expect(c.state).toBe(reachabilityState(s, c.id));
  });

  it('#2 creating a branch adds one pointer and leaves the graph unchanged', () => {
    const before = prev('branch-is-a-label');
    const s = step('branch-is-a-label');
    expect(s.commits).toEqual(before.commits);
    expect(getBranches(before).map((b) => b.id)).toEqual(['main']);
    expect(branchTargets(s)).toEqual({ main: 'b2c4', feature: 'b2c4' });
    expect(getHeadBranch(s)).toBe('main');
    expect(getReachable(s)).toEqual(getReachable(before));
  });

  it('#3 committing moves only the branch HEAD names', () => {
    const before = step('branch-is-a-label');
    const s = step('only-head-branch-moves');
    const moved = getBranches(s)
      .filter((b) => branchTargets(before)[b.id] !== b.target)
      .map((b) => b.id);
    expect(moved).toEqual([getHeadBranch(before)]);
    expect(moved).toEqual(['main']);
    expect(branchTargets(s).feature).toBe('b2c4');
    expect(headFileText(s)).toBe('ref: refs/heads/main');
  });

  it('only ever moves the HEAD-named branch, and never while detached', () => {
    for (let i = 1; i < STORY_STEPS.length; i++) {
      const a = STORY_STEPS[i - 1];
      const b = STORY_STEPS[i];
      for (const br of getBranches(b)) {
        const was = branchTargets(a)[br.id];
        if (was !== undefined && was !== br.target) expect(getHeadBranch(a)).toBe(br.id);
      }
    }
  });

  it('points a detached HEAD straight at a commit, not a branch card', () => {
    const s = step('detached-head');
    const head = getReferences(s).find((r) => r.id === 'HEAD.target')!;
    expect(head).toMatchObject({ to: 'b2c4', toKind: 'commit' });
    expect(headFileText(s)).toBe('b2c4');
    const onBranch = getReferences(step('switch-back')).find((r) => r.id === 'HEAD.target')!;
    expect(onBranch).toMatchObject({ to: 'main', toKind: 'ref' });
  });

  it('#10 keeps f6b1 reachable only through the reflog after switching away', () => {
    const s = step('orphaned-commit');
    const pointsAtF6 = getReferences(s).filter((r) => r.to === 'f6b1');
    expect(pointsAtF6).toEqual([]);
    expect(getReachable(s).has('f6b1')).toBe(false);
    expect(getReflogCommits(s)).toContain('f6b1');
    expect(getReachable(s, { includeReflog: true }).has('f6b1')).toBe(true);
    // One beat earlier, HEAD alone kept it alive.
    expect(getReachable(step('detached-commit')).has('f6b1')).toBe(true);
  });

  it('#11 leaves f6b1 unreachable once the reflog entry expires', () => {
    const s = step('reflog-expired');
    expect(getReflogCommits(s)).not.toContain('f6b1');
    expect(getReachable(s, { includeReflog: true }).has('f6b1')).toBe(false);
    expect(reachabilityState(s, 'f6b1')).toBe('unreachable');
  });

  it('#12 collects f6b1 while a branch still reaches every other commit', () => {
    const s = step('gc-collects');
    expect(s.commits.find((c) => c.id === 'f6b1')!.state).toBe('collected');
    const fromBranches = new Set<string>();
    for (const b of getBranches(s)) {
      const queue = [b.target];
      while (queue.length) {
        const id = queue.shift()!;
        fromBranches.add(id);
        queue.push(...s.commits.find((c) => c.id === id)!.parents);
      }
    }
    const others = s.commits.filter((c) => c.id !== 'f6b1').map((c) => c.id);
    expect([...fromBranches].sort()).toEqual(others.sort());
    expect([...getReachable(s)].sort()).toEqual(others.sort());
  });
});
