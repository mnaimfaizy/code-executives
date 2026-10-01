/**
 * Branch Pointers story: one step model, rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/git/branch-pointers.md
 *
 * Every step is a full snapshot, so stepping backwards is free and switching views
 * mid-story keeps the learner on the same beat. Commit ids are 4-character fake SHAs.
 */

export type ShotId = 'overview' | 'graph' | 'refs' | 'bridge' | 'orphan';

/**
 * `live` = reachable from a branch or HEAD; `reflog-only` = reachable only through the
 * HEAD reflog; `unreachable` = reachable from nothing; `collected` = deleted by gc.
 */
export type CommitState = 'live' | 'reflog-only' | 'unreachable' | 'collected';

export interface Cell {
  col: number;
  row: number;
}

/** An immutable commit object in the graph region. */
export interface Commit {
  id: string;
  message: string;
  /** Parent commit ids; arrows always point backward, child to parent. */
  parents: string[];
  state: CommitState;
  /** Stable cell on the 4 x 3 graph grid, shared by both views. */
  cell: Cell;
}

export type BranchId = 'main' | 'feature';

/** What `.git/HEAD` holds: a branch name (symbolic) or, when detached, a commit id. */
export type HeadTarget = { kind: 'branch'; branch: BranchId } | { kind: 'commit'; commit: string };

export interface HeadRef {
  id: 'HEAD';
  kind: 'head';
  path: 'HEAD';
  target: HeadTarget;
  cell: Cell;
}

export interface BranchRef {
  id: BranchId;
  kind: 'branch';
  path: `refs/heads/${BranchId}`;
  /** Commit id the branch names. */
  target: string;
  cell: Cell;
}

export interface ReflogEntry {
  commit: string;
  action: string;
}

export interface ReflogRef {
  id: 'head-reflog';
  kind: 'reflog';
  path: 'logs/HEAD';
  /** Newest first, as `git reflog` prints them: index n is `HEAD@{n}`. */
  entries: ReflogEntry[];
  cell: Cell;
}

export type Ref = HeadRef | BranchRef | ReflogRef;
export type RefId = Ref['id'];

export type GcPhase = 'expire' | 'prune';

export interface StoryStep {
  id: string;
  title: string;
  caption: string;
  /** 1-based line in STORY_CODE. */
  line: number;
  shot: ShotId;
  commits: Commit[];
  refs: Ref[];
  /** Entity ids and `owner.slot` keys (`b2c4.parents`, `HEAD.target`) to spotlight. */
  focus: string[];
  phase?: GcPhase;
}

export type ReferenceKind = 'parent' | 'ref' | 'reflog';

export interface Reference {
  /** Unique per step, e.g. `e5a6.parents.1`, `HEAD.target`, `head-reflog.f6b1`. */
  id: string;
  kind: ReferenceKind;
  /** Slot key the arrow starts from, e.g. `e5a6.parents`, `main.target`, `head-reflog`. */
  from: string;
  fromOwner: string;
  to: string;
  toKind: 'commit' | 'ref';
}

export const STORY_CODE = `git commit -m "add login"
git branch feature
git commit -m "hotfix"
git switch feature
git commit -m "search"
git switch main
git merge feature
git switch --detach b2c4
git commit -m "experiment"
git switch main
git reflog expire --expire-unreachable=now --all
git gc --prune=now`;

export const slotKey = (owner: string, slot: string) => `${owner}.${slot}`;

// ---------------------------------------------------------------------------
// Factories: identity, message, parents and cell never change across steps.

const commit =
  (id: string, message: string, parents: string[], cell: Cell) =>
  (state: CommitState = 'live'): Commit => ({ id, message, parents, state, cell });

const a1f0 = commit('a1f0', 'init', [], { col: 0, row: 1 });
const b2c4 = commit('b2c4', 'add login', ['a1f0'], { col: 1, row: 1 });
const c3d8 = commit('c3d8', 'hotfix', ['b2c4'], { col: 2, row: 1 });
const d4e2 = commit('d4e2', 'search', ['b2c4'], { col: 2, row: 2 });
const e5a6 = commit('e5a6', "Merge branch 'feature'", ['c3d8', 'd4e2'], { col: 3, row: 1 });
const f6b1 = commit('f6b1', 'experiment', ['b2c4'], { col: 2, row: 0 });

const headOn = (branch: BranchId): HeadRef => ({
  id: 'HEAD',
  kind: 'head',
  path: 'HEAD',
  target: { kind: 'branch', branch },
  cell: { col: 0, row: 0 },
});

const headAt = (commitId: string): HeadRef => ({
  id: 'HEAD',
  kind: 'head',
  path: 'HEAD',
  target: { kind: 'commit', commit: commitId },
  cell: { col: 0, row: 0 },
});

const main = (target: string): BranchRef => ({
  id: 'main',
  kind: 'branch',
  path: 'refs/heads/main',
  target,
  cell: { col: 1, row: 0 },
});

const feature = (target: string): BranchRef => ({
  id: 'feature',
  kind: 'branch',
  path: 'refs/heads/feature',
  target,
  cell: { col: 2, row: 0 },
});

/** Every HEAD reflog entry the story writes, oldest first. */
const HEAD_HISTORY: ReflogEntry[] = [
  { commit: 'a1f0', action: 'commit (initial): init' },
  { commit: 'b2c4', action: 'commit: add login' },
  { commit: 'c3d8', action: 'commit: hotfix' },
  { commit: 'b2c4', action: 'checkout: moving from main to feature' },
  { commit: 'd4e2', action: 'commit: search' },
  { commit: 'c3d8', action: 'checkout: moving from feature to main' },
  { commit: 'e5a6', action: 'merge feature: Merge made by the ort strategy.' },
  { commit: 'b2c4', action: 'checkout: moving from main to b2c4' },
  { commit: 'f6b1', action: 'commit: experiment' },
  { commit: 'e5a6', action: 'checkout: moving from f6b1 to main' },
];

/** HEAD's reflog after the first `count` entries were written, minus expired commits. */
const headReflog = (count: number, expired: string[] = []): ReflogRef => ({
  id: 'head-reflog',
  kind: 'reflog',
  path: 'logs/HEAD',
  entries: HEAD_HISTORY.slice(0, count)
    .filter((e) => !expired.includes(e.commit))
    .reverse(),
  cell: { col: 0, row: 1 },
});

const mergedCommits = () => [a1f0(), b2c4(), c3d8(), d4e2(), e5a6()];

// ---------------------------------------------------------------------------

export const STORY_STEPS: StoryStep[] = [
  {
    id: 'commit-parent',
    title: 'A commit points to its parent',
    caption:
      'git commit writes a new commit object, b2c4, that stores its snapshot and a pointer to its parent, a1f0. a1f0 is not touched: commits never change, since editing one would change its hash. History is this chain of backward-pointing arrows. The branch main moves forward to the new commit.',
    line: 1,
    shot: 'graph',
    commits: [a1f0(), b2c4()],
    refs: [headOn('main'), main('b2c4'), headReflog(2)],
    focus: ['b2c4', 'b2c4.parents'],
  },
  {
    id: 'branch-is-a-label',
    title: 'A branch is just a label',
    caption:
      'git branch feature creates a single ref that names b2c4. That is the whole branch: a lightweight pointer to a commit, not a copy of the code. The graph is unchanged. Two labels now point at the same commit, and HEAD still points at main, so you have not switched.',
    line: 2,
    shot: 'bridge',
    commits: [a1f0(), b2c4()],
    refs: [headOn('main'), main('b2c4'), feature('b2c4'), headReflog(2)],
    focus: ['feature', 'feature.target', 'b2c4'],
  },
  {
    id: 'only-head-branch-moves',
    title: 'Only the branch HEAD names moves',
    caption:
      'You commit again without switching. The new commit c3d8 goes onto main, because HEAD names main, and only the branch HEAD names moves when you commit. feature stays on b2c4. Creating a branch did not put you on it.',
    line: 3,
    shot: 'bridge',
    commits: [a1f0(), b2c4(), c3d8()],
    refs: [headOn('main'), main('c3d8'), feature('b2c4'), headReflog(3)],
    focus: ['c3d8', 'main.target', 'feature.target', 'HEAD'],
  },
  {
    id: 'switch-moves-head',
    title: 'Switching rewrites HEAD',
    caption:
      'git switch feature rewrites one small file: HEAD now says ref: refs/heads/feature. The working directory is updated to b2c4\'s snapshot. No commit is created or moved. "Being on a branch" just means HEAD points at that branch\'s name.',
    line: 4,
    shot: 'refs',
    commits: [a1f0(), b2c4(), c3d8()],
    refs: [headOn('feature'), main('c3d8'), feature('b2c4'), headReflog(4)],
    focus: ['HEAD', 'HEAD.target'],
  },
  {
    id: 'graph-forks',
    title: 'The history forks',
    caption:
      'Committing on feature creates d4e2 with parent b2c4, and moves only feature. b2c4 now has two children, c3d8 and d4e2: the history has forked. Neither commit knows which branch made it. A commit records its parents, not a branch name.',
    line: 5,
    shot: 'graph',
    commits: [a1f0(), b2c4(), c3d8(), d4e2()],
    refs: [headOn('feature'), main('c3d8'), feature('d4e2'), headReflog(5)],
    focus: ['d4e2', 'd4e2.parents', 'feature.target'],
  },
  {
    id: 'switch-back',
    title: 'Switching back loses nothing',
    caption:
      "git switch main points HEAD back at main, and the working directory changes to c3d8's snapshot. The search work in d4e2 is not lost or hidden. It sits in the graph, still named by feature.",
    line: 6,
    shot: 'refs',
    commits: [a1f0(), b2c4(), c3d8(), d4e2()],
    refs: [headOn('main'), main('c3d8'), feature('d4e2'), headReflog(6)],
    focus: ['HEAD', 'HEAD.target'],
  },
  {
    id: 'merge-two-parents',
    title: 'A merge commit has two parents',
    caption:
      'The two histories have diverged, so git merge feature makes a three-way merge. It creates a merge commit, e5a6, with two parents: c3d8 and d4e2. main moves to e5a6 because HEAD names main. feature does not move and is not used up. It still names d4e2.',
    line: 7,
    shot: 'bridge',
    commits: mergedCommits(),
    refs: [headOn('main'), main('e5a6'), feature('d4e2'), headReflog(7)],
    focus: ['e5a6', 'e5a6.parents', 'main.target', 'feature.target'],
  },
  {
    id: 'detached-head',
    title: 'HEAD points straight at a commit',
    caption:
      "git switch --detach b2c4 gives HEAD a commit id instead of a branch name: this is detached HEAD. git checkout b2c4 does the same. The working directory shows b2c4's snapshot. Nothing is broken: HEAD simply points at a commit, not at a label that could move.",
    line: 8,
    shot: 'orphan',
    commits: mergedCommits(),
    refs: [headAt('b2c4'), main('e5a6'), feature('d4e2'), headReflog(8)],
    focus: ['HEAD', 'HEAD.target', 'b2c4'],
  },
  {
    id: 'detached-commit',
    title: 'Committing while detached',
    caption:
      'Committing while detached works: f6b1 is a real commit with parent b2c4. HEAD moves to f6b1, but no branch does, because HEAD does not name one. Right now, HEAD is the only thing pointing at this commit.',
    line: 9,
    shot: 'orphan',
    commits: [...mergedCommits(), f6b1()],
    refs: [headAt('f6b1'), main('e5a6'), feature('d4e2'), headReflog(9)],
    focus: ['f6b1', 'f6b1.parents', 'HEAD.target'],
  },
  {
    id: 'orphaned-commit',
    title: 'A commit with no label',
    caption:
      "Switching back leaves f6b1 with no label. Parent arrows point backward, so no commit leads to it either. It is not deleted: HEAD's reflog still records f6b1, so git reflog can find it and git branch experiment f6b1 would rescue it. Commits are not stored inside branches. Branches only point at them.",
    line: 10,
    shot: 'orphan',
    commits: [...mergedCommits(), f6b1('reflog-only')],
    refs: [headOn('main'), main('e5a6'), feature('d4e2'), headReflog(10)],
    focus: ['f6b1', 'HEAD.target', 'head-reflog'],
  },
  {
    id: 'reflog-expired',
    title: 'The last trace expires',
    caption:
      'This command forces what Git does on its own after about 30 days: it expires reflog entries for commits no ref can reach. That was the last trace of f6b1. Nothing can reach it now, not a branch, not HEAD, not the reflog. Until gc runs, the object still sits in the database.',
    line: 11,
    shot: 'orphan',
    commits: [...mergedCommits(), f6b1('unreachable')],
    refs: [headOn('main'), main('e5a6'), feature('d4e2'), headReflog(10, ['f6b1'])],
    focus: ['head-reflog', 'f6b1'],
    phase: 'expire',
  },
  {
    id: 'gc-collects',
    title: 'gc deletes what nothing reaches',
    caption:
      'git gc --prune=now deletes unreachable objects, so f6b1 is removed. Without the flags, gc waits: a commit you leave detached survives for weeks, which is why recovery usually works. Every other commit survives because a branch reaches it through parent arrows. A commit lives as long as a ref can reach it.',
    line: 12,
    shot: 'overview',
    commits: [...mergedCommits(), f6b1('collected')],
    refs: [headOn('main'), main('e5a6'), feature('d4e2'), headReflog(10, ['f6b1'])],
    focus: ['f6b1'],
    phase: 'prune',
  },
];

// ---------------------------------------------------------------------------
// Pure helpers shared by views and tests: derive facts, never store them twice.

export const getCommit = (step: StoryStep, id: string) => step.commits.find((c) => c.id === id);

export const getRef = <K extends RefId>(step: StoryStep, id: K) =>
  step.refs.find((r) => r.id === id) as Extract<Ref, { id: K }> | undefined;

export const getHead = (step: StoryStep): HeadRef => getRef(step, 'HEAD')!;

export const getBranches = (step: StoryStep): BranchRef[] =>
  step.refs.filter((r): r is BranchRef => r.kind === 'branch');

/** The branch HEAD names, or `null` when HEAD is detached. */
export const getHeadBranch = (step: StoryStep): BranchId | null => {
  const t = getHead(step).target;
  return t.kind === 'branch' ? t.branch : null;
};

export const isDetached = (step: StoryStep) => getHeadBranch(step) === null;

/** The commit HEAD resolves to, through its branch when symbolic. */
export const resolveHead = (step: StoryStep): string => {
  const t = getHead(step).target;
  if (t.kind === 'commit') return t.commit;
  return getRef(step, t.branch)!.target;
};

/** Text of the `.git/HEAD` file: `ref: refs/heads/main` or a commit id. */
export const headFileText = (step: StoryStep): string => {
  const t = getHead(step).target;
  return t.kind === 'branch' ? `ref: refs/heads/${t.branch}` : t.commit;
};

/** Commit ids the HEAD reflog still lists, newest first, without duplicates. */
export const getReflogCommits = (step: StoryStep): string[] => {
  const reflog = getRef(step, 'head-reflog');
  return reflog ? [...new Set(reflog.entries.map((e) => e.commit))] : [];
};

/**
 * Every arrow in a step: parent arrows (child to parent), ref arrows (HEAD to a branch
 * card or, when detached, straight to a commit; each branch to its commit) and, with
 * `includeReflog`, one arrow from the head-reflog card to each commit it lists.
 * Collected commits draw no arrows.
 */
export function getReferences(
  step: StoryStep,
  { includeReflog = false }: { includeReflog?: boolean } = {}
): Reference[] {
  const refs: Reference[] = [];
  for (const c of step.commits) {
    if (c.state === 'collected') continue;
    const from = slotKey(c.id, 'parents');
    c.parents.forEach((p, i) =>
      refs.push({
        id: `${from}.${i}`,
        kind: 'parent',
        from,
        fromOwner: c.id,
        to: p,
        toKind: 'commit',
      })
    );
  }
  for (const r of step.refs) {
    if (r.kind === 'head') {
      const from = slotKey('HEAD', 'target');
      const to = r.target.kind === 'branch' ? r.target.branch : r.target.commit;
      const toKind = r.target.kind === 'branch' ? 'ref' : 'commit';
      refs.push({ id: from, kind: 'ref', from, fromOwner: 'HEAD', to, toKind });
    } else if (r.kind === 'branch') {
      const from = slotKey(r.id, 'target');
      refs.push({ id: from, kind: 'ref', from, fromOwner: r.id, to: r.target, toKind: 'commit' });
    }
  }
  if (includeReflog) {
    for (const id of getReflogCommits(step))
      refs.push({
        id: `head-reflog.${id}`,
        kind: 'reflog',
        from: 'head-reflog',
        fromOwner: 'head-reflog',
        to: id,
        toKind: 'commit',
      });
  }
  return refs;
}

/**
 * Commit ids reachable from the refs (every branch and HEAD, plus the HEAD reflog with
 * `includeReflog`), following parent arrows. Collected commits are gone and reach nothing.
 */
export function getReachable(
  step: StoryStep,
  { includeReflog = false }: { includeReflog?: boolean } = {}
): Set<string> {
  const refs = getReferences(step, { includeReflog });
  const queue = refs.filter((r) => r.kind !== 'parent' && r.toKind === 'commit').map((r) => r.to);
  const reached = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (reached.has(id) || getCommit(step, id)?.state === 'collected') continue;
    reached.add(id);
    for (const r of refs) if (r.kind === 'parent' && r.fromOwner === id) queue.push(r.to);
  }
  return reached;
}

/** The state reachability implies for a commit that has not been collected. */
export function reachabilityState(step: StoryStep, id: string): Exclude<CommitState, 'collected'> {
  if (getReachable(step).has(id)) return 'live';
  if (getReachable(step, { includeReflog: true }).has(id)) return 'reflog-only';
  return 'unreachable';
}

export const isFocused = (step: StoryStep, key: string) => step.focus.includes(key);

/** An arrow is spotlighted when its source slot (or owner, for the reflog) is in focus. */
export const isRefFocused = (step: StoryStep, ref: Reference) => step.focus.includes(ref.from);
