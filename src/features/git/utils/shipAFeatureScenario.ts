/**
 * Shipping a feature with your team: a scenario (a story with a cast, a timeline and one
 * choice point), rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/git/ship-a-feature.md · ADR: docs/adr/0003-scenarios-with-choice-points.md
 *
 * Every beat is a full snapshot of all four regions (your clone, Sam's clone, origin, the CI
 * runner). Entity keys are region-scoped (`you.d4e2`, `origin.main`, `you.origin/main`,
 * `ci.job`): the same SHA in two regions is two entities that share a SHA and a cell.
 * Derived facts (staleness, reachability, ancestry, tracking links, PR check, HEAD badge)
 * come from the helpers at the bottom, never from stored duplicate fields.
 */

// ---------------------------------------------------------------------------
// Types

export type ShotId = 'overview' | 'you' | 'origin' | 'bridge' | 'ship';

export type CastId = 'you' | 'sam' | 'origin' | 'ci';
export type CastRole = 'developer' | 'teammate' | 'reviewer' | 'bot' | 'server';

export interface CastMember {
  id: CastId;
  /** Name tag drawn on the member's region. */
  name: string;
  role: CastRole;
  /** What the member's region is: their copy of the system. */
  copy: string;
}

/** The regions with a commit grid and a ref rail. `ci` has cards only. */
export type GraphRegionId = Exclude<CastId, 'ci'>;

export type Sha = 'a1f0' | 'b7c2' | 'c9d1' | 'd4e2' | 'f1a3' | 'e5a6' | '0b3e' | '9c4f';

/**
 * `live` = reachable from a ref in that region; `reflog-only` = in a clone, reachable only
 * through its reflogs; `unreachable` = on origin, no ref reaches it (a bare server keeps no
 * reflogs).
 */
export type CommitState = 'live' | 'reflog-only' | 'unreachable';

export interface Cell {
  col: number;
  row: number;
}

export interface Commit {
  /** Region-scoped key, e.g. `you.d4e2`. */
  id: string;
  region: GraphRegionId;
  sha: Sha;
  message: string;
  /** Parent SHAs, resolved inside the same region. Arrows point child to parent. */
  parents: Sha[];
  /** Same cell in every region that holds this SHA (4 cols x 3 rows). */
  cell: Cell;
  state: CommitState;
}

export type RefKind = 'branch' | 'remote-tracking';
export type RefState = 'present' | 'deleted';

/** A card on a region's ref rail. */
export interface RefCard {
  /** Region-scoped key, e.g. `you.origin/main`. */
  id: string;
  region: GraphRegionId;
  /** Ref name as Git prints it: `main`, `feature/search`, `origin/main`. */
  name: string;
  kind: RefKind;
  /** Rail slot 0-3, fixed per region and name. */
  slot: number;
  /** SHA the ref names (a deleted ref keeps the SHA it last named). */
  target: Sha;
  state: RefState;
}

export type PullRequestState = 'open' | 'merged';

/** The `PR #7` card on origin's ref rail. */
export interface PullRequest {
  id: 'origin.pr-7';
  number: 7;
  slot: 3;
  /** Branch names on origin; resolve with `getPullRequestTargets`. */
  head: 'feature/search';
  base: 'main';
  state: PullRequestState;
}

export interface GraphRegion {
  id: GraphRegionId;
  /** `clone` = a developer's non-bare clone (keeps reflogs); `server` = GitHub. */
  kind: 'clone' | 'server';
  commits: Commit[];
  refs: RefCard[];
  /** Branch name HEAD names, drawn as a badge on that branch card; `null` on origin. */
  head: string | null;
  pr?: PullRequest;
}

export type CiJobState = 'idle' | 'running' | 'passed';

export interface CiRegion {
  id: 'ci';
  job: { id: 'ci.job'; slot: 0; state: CiJobState };
  /** What the runner checked out; `null` = nothing yet. */
  checkout: { id: 'ci.checkout'; slot: 1; ref: 'refs/pull/7/merge' | null };
}

/** A commit object copied between regions during this beat (push or fetch). */
export interface Crossing {
  /** e.g. `cross.d4e2.you-origin` */
  id: string;
  sha: Sha;
  from: GraphRegionId;
  to: GraphRegionId;
}

export interface ChoiceOption {
  id: string;
  label: string;
  /** Id of the path this option leads to. */
  path: string;
}

export interface Choice {
  question: string;
  options: ChoiceOption[];
}

export interface ScenarioBeat {
  id: string;
  /** ≤ 8 words. */
  title: string;
  /** ≤ 60 words, present tense. */
  caption: string;
  shot: ShotId;
  /** Entity keys to spotlight (commit, ref, PR and CI card ids). */
  focus: string[];
  actor: CastId;
  /** Display time, `Mon 09:05`; non-decreasing along every route. */
  time: string;
  command?: string;
  /** What the actor did when there is no command, e.g. a click in a web UI. */
  action?: string;
  output?: string;
  /** Only on the last beat of a path. */
  choice?: Choice;
  /** Required on every ending (a last beat without `choice`). */
  outcome?: string;
  regions: Record<GraphRegionId, GraphRegion>;
  ci: CiRegion;
  crossings: Crossing[];
}

export interface ScenarioPath {
  id: string;
  from?: { beat: string; option: string };
  beats: ScenarioBeat[];
}

export interface TrackingLinkDef {
  /** e.g. `link.you.origin/main` */
  id: string;
  /** Remote-tracking ref key in a clone, e.g. `you.origin/main`. */
  local: string;
  /** The origin branch it records, e.g. `origin.main`. */
  remote: string;
}

export interface TrackingLink extends TrackingLinkDef {
  localTarget: Sha;
  /** `null` when origin's branch is deleted or gone. */
  remoteTarget: Sha | null;
  stale: boolean;
}

// ---------------------------------------------------------------------------
// Scenario metadata

export interface ScenarioMeta {
  id: string;
  title: string;
  summary: string;
  cast: CastMember[];
  /** Section labels from moduleNavigation.ts. */
  concepts: string[];
}

export const SCENARIO: ScenarioMeta = {
  id: 'ship-a-feature',
  title: 'Shipping a feature with your team',
  summary:
    'You build search on a branch while Sam merges rate limiting into main first. You bring Sam\'s work into your branch, open a pull request, pass CI and merge. Setting: the repository is github.com:acme/shop; main is protected and needs an approving review and a passing check; pull requests merge with "Create a merge commit"; head branches are deleted automatically; CI runs on pull requests only.',
  cast: [
    { id: 'you', name: 'You', role: 'developer', copy: "your laptop's clone of acme/shop" },
    { id: 'sam', name: 'Sam', role: 'teammate', copy: "Sam's laptop clone of acme/shop" },
    { id: 'origin', name: 'origin', role: 'server', copy: 'the GitHub repository acme/shop' },
    {
      id: 'ci',
      name: 'CI runner',
      role: 'bot',
      copy: 'a GitHub Actions runner for the pull request',
    },
  ],
  concepts: [
    'Core Workflow',
    'Branching & Merging',
    'History Management',
    'Professional Workflows',
    'Troubleshooting',
  ],
};

/** Every remote-tracking ref and the origin branch it records. */
export const TRACKING_LINKS: TrackingLinkDef[] = [
  { id: 'link.you.origin/main', local: 'you.origin/main', remote: 'origin.main' },
  {
    id: 'link.you.origin/feature/search',
    local: 'you.origin/feature/search',
    remote: 'origin.feature/search',
  },
  { id: 'link.sam.origin/main', local: 'sam.origin/main', remote: 'origin.main' },
  { id: 'link.sam.origin/rate-limit', local: 'sam.origin/rate-limit', remote: 'origin.rate-limit' },
];

// ---------------------------------------------------------------------------
// Factories: SHA, message, parents, cell and rail slot never change across beats.

const COMMITS: Record<Sha, { message: string; parents: Sha[]; cell: Cell }> = {
  a1f0: { message: 'Initial shop', parents: [], cell: { col: 0, row: 0 } },
  b7c2: { message: 'Add rate limit', parents: ['a1f0'], cell: { col: 1, row: 1 } },
  c9d1: {
    message: 'Merge pull request #6 from acme/rate-limit',
    parents: ['a1f0', 'b7c2'],
    cell: { col: 2, row: 0 },
  },
  d4e2: { message: 'Add search', parents: ['a1f0'], cell: { col: 1, row: 2 } },
  f1a3: { message: 'Add search', parents: ['c9d1'], cell: { col: 2, row: 2 } },
  e5a6: {
    message: "Merge remote-tracking branch 'origin/main' into feature/search",
    parents: ['d4e2', 'c9d1'],
    cell: { col: 2, row: 2 },
  },
  '0b3e': {
    message: 'Merge pull request #7 from acme/feature/search',
    parents: ['c9d1', 'f1a3'],
    cell: { col: 3, row: 1 },
  },
  '9c4f': {
    message: 'Merge pull request #7 from acme/feature/search',
    parents: ['c9d1', 'e5a6'],
    cell: { col: 3, row: 1 },
  },
};

const REF_SLOTS: Record<GraphRegionId, Record<string, number>> = {
  you: { main: 0, 'feature/search': 1, 'origin/main': 2, 'origin/feature/search': 3 },
  sam: { main: 0, 'rate-limit': 1, 'origin/main': 2, 'origin/rate-limit': 3 },
  origin: { main: 0, 'rate-limit': 1, 'feature/search': 2 },
};

type CommitSpec = Sha | [Sha, CommitState];
type RefSpec = [string, Sha] | [string, Sha, RefState];

const commit = (region: GraphRegionId, spec: CommitSpec): Commit => {
  const [sha, state] = typeof spec === 'string' ? [spec, 'live' as const] : spec;
  const { message, parents, cell } = COMMITS[sha];
  return {
    id: `${region}.${sha}`,
    region,
    sha,
    message,
    parents: [...parents],
    cell: { ...cell },
    state,
  };
};

const ref = (region: GraphRegionId, [name, target, state = 'present']: RefSpec): RefCard => ({
  id: `${region}.${name}`,
  region,
  name,
  kind: name.startsWith('origin/') ? 'remote-tracking' : 'branch',
  slot: REF_SLOTS[region][name],
  target,
  state,
});

const region = (
  id: GraphRegionId,
  head: string | null,
  commits: CommitSpec[],
  refs: RefSpec[],
  pr?: PullRequestState
): GraphRegion => ({
  id,
  kind: id === 'origin' ? 'server' : 'clone',
  commits: commits.map((c) => commit(id, c)),
  refs: refs.map((r) => ref(id, r)),
  head,
  ...(pr
    ? {
        pr: {
          id: 'origin.pr-7',
          number: 7,
          slot: 3,
          head: 'feature/search',
          base: 'main',
          state: pr,
        } as PullRequest,
      }
    : {}),
});

const ci = (state: CiJobState = 'idle'): CiRegion => ({
  id: 'ci',
  job: { id: 'ci.job', slot: 0, state },
  checkout: { id: 'ci.checkout', slot: 1, ref: state === 'idle' ? null : 'refs/pull/7/merge' },
});

const cross = (sha: Sha, from: GraphRegionId, to: GraphRegionId): Crossing => ({
  id: `cross.${sha}.${from}-${to}`,
  sha,
  from,
  to,
});

const lines = (...l: string[]) => l.join('\n');

// Sam's clone is static for the whole scenario.
const SAM = () =>
  region(
    'sam',
    'rate-limit',
    ['a1f0', 'b7c2'],
    [
      ['main', 'a1f0'],
      ['rate-limit', 'b7c2'],
      ['origin/main', 'a1f0'],
      ['origin/rate-limit', 'b7c2'],
    ]
  );

// Your clone, beat by beat.
const youAt = (
  head: string,
  commits: CommitSpec[],
  refs: { fs: Sha; om: Sha; ofs?: Sha }
): GraphRegion =>
  region('you', head, commits, [
    ['main', 'a1f0'],
    ['feature/search', refs.fs],
    ['origin/main', refs.om],
    ...(refs.ofs ? [['origin/feature/search', refs.ofs] as RefSpec] : []),
  ]);

const FETCHED: CommitSpec[] = ['a1f0', 'b7c2', 'c9d1', 'd4e2'];

// Origin before and after Sam's merge.
const ORIGIN_START = (withSearch: boolean) =>
  region('origin', null, withSearch ? ['a1f0', 'b7c2', 'd4e2'] : ['a1f0', 'b7c2'], [
    ['main', 'a1f0'],
    ['rate-limit', 'b7c2'],
    ...(withSearch ? [['feature/search', 'd4e2'] as RefSpec] : []),
  ]);

const ORIGIN_MAIN = ['a1f0', 'b7c2', 'c9d1'] as const;

const MERGE_OPTION_Q = "How do you bring Sam's work into feature/search?";

const OPEN_PR_CAPTION =
  "You open pull request #7: a request, stored on GitHub, to merge feature/search into main. Opening it starts the team's CI workflow. A fresh runner checks out what main would look like after the merge and runs the tests there, not on your laptop.";

const GH_PR_CREATE = {
  command: 'gh pr create --fill',
  output: lines(
    'Creating pull request for feature/search into main in acme/shop',
    'https://github.com/acme/shop/pull/7'
  ),
};

const NPM_TEST = { command: 'npm test', output: '  42 passing (3s)' };

// ---------------------------------------------------------------------------
// Paths

const MAIN_BEATS: ScenarioBeat[] = [
  {
    id: 'branch-off',
    title: 'Branch off main',
    caption:
      "Your laptop holds a full clone of the shop repository. git switch -c creates feature/search at a1f0, the commit your main names, and puts HEAD on it. No files are copied: a branch is a pointer. Sam's clone has the same history plus b7c2, Sam's rate-limit work, already pushed to origin for review.",
    shot: 'you',
    focus: ['you.feature/search'],
    actor: 'you',
    time: 'Mon 09:05',
    command: 'git switch -c feature/search',
    output: "Switched to a new branch 'feature/search'",
    regions: {
      you: youAt('feature/search', ['a1f0'], { fs: 'a1f0', om: 'a1f0' }),
      sam: SAM(),
      origin: ORIGIN_START(false),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'commit-search',
    title: 'Commit on your branch',
    caption:
      "Your commit d4e2 records its snapshot and its parent, a1f0. Only feature/search moves, because HEAD names it; main and origin/main stay on a1f0. Nothing has left your laptop yet: origin and Sam's clone know nothing about d4e2.",
    shot: 'you',
    focus: ['you.d4e2', 'you.feature/search'],
    actor: 'you',
    time: 'Mon 11:40',
    command: 'git commit -m "Add search"',
    output: lines('[feature/search d4e2] Add search', ' 2 files changed, 64 insertions(+)'),
    regions: {
      you: youAt('feature/search', ['a1f0', 'd4e2'], { fs: 'd4e2', om: 'a1f0' }),
      sam: SAM(),
      origin: ORIGIN_START(false),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'publish-branch',
    title: 'Push the branch to origin',
    caption:
      "git push copies d4e2 to origin and creates origin's feature/search. Your clone writes a new ref too, origin/feature/search: its record of where origin's branch is. That record is right now only because you just talked to origin. You push to back up the work; the pull request comes later.",
    shot: 'bridge',
    focus: ['origin.d4e2', 'origin.feature/search', 'you.origin/feature/search'],
    actor: 'you',
    time: 'Mon 11:42',
    command: 'git push -u origin feature/search',
    output: lines(
      "remote: Create a pull request for 'feature/search' on GitHub by visiting:",
      'remote:      https://github.com/acme/shop/pull/new/feature/search',
      'To github.com:acme/shop.git',
      ' * [new branch]      feature/search -> feature/search',
      "branch 'feature/search' set up to track 'origin/feature/search'."
    ),
    regions: {
      you: youAt('feature/search', ['a1f0', 'd4e2'], { fs: 'd4e2', om: 'a1f0', ofs: 'd4e2' }),
      sam: SAM(),
      origin: ORIGIN_START(true),
    },
    ci: ci(),
    crossings: [cross('d4e2', 'you', 'origin')],
  },
  {
    id: 'sam-merges',
    title: 'Sam merges on GitHub',
    caption:
      "Sam merges pull request #6 on GitHub. Origin writes merge commit c9d1 with two parents, a1f0 and b7c2, and moves its main there. Nothing reaches any laptop: your origin/main and even Sam's still name a1f0. A clone learns about new commits only when it fetches.",
    shot: 'overview',
    focus: ['origin.c9d1', 'origin.main', 'you.origin/main', 'sam.origin/main'],
    actor: 'sam',
    time: 'Mon 14:10',
    action: 'Merged pull request #6 on GitHub',
    regions: {
      you: youAt('feature/search', ['a1f0', 'd4e2'], { fs: 'd4e2', om: 'a1f0', ofs: 'd4e2' }),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, 'd4e2'],
        [
          ['main', 'c9d1'],
          ['rate-limit', 'b7c2', 'deleted'],
          ['feature/search', 'd4e2'],
        ]
      ),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'looks-up-to-date',
    title: 'Git says you are up to date',
    caption:
      "Next morning Git says your main is up to date with origin/main. It compared two files on your laptop, main and origin/main, both on a1f0. It did not ask GitHub. Your origin/main is only what you saw at your last fetch; origin's real main moved to c9d1 yesterday.",
    shot: 'bridge',
    focus: ['you.main', 'you.origin/main', 'origin.main'],
    actor: 'you',
    time: 'Tue 09:15',
    command: 'git switch main',
    output: lines("Switched to branch 'main'", "Your branch is up to date with 'origin/main'."),
    regions: {
      you: youAt('main', ['a1f0', 'd4e2'], { fs: 'd4e2', om: 'a1f0', ofs: 'd4e2' }),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, 'd4e2'],
        [
          ['main', 'c9d1'],
          ['feature/search', 'd4e2'],
        ]
      ),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'fetch',
    title: 'Fetch downloads and moves origin/main',
    caption:
      'git fetch downloads b7c2 and c9d1 and moves origin/main from a1f0 to c9d1. That is the only ref it moves. Your own main still names a1f0, and feature/search is untouched: fetching downloads, it does not integrate. Integrating is a separate step, and you choose how.',
    shot: 'bridge',
    focus: ['you.b7c2', 'you.c9d1', 'you.origin/main', 'you.main'],
    actor: 'you',
    time: 'Tue 09:16',
    command: 'git fetch',
    output: lines('From github.com:acme/shop', '   a1f0..c9d1  main       -> origin/main'),
    regions: {
      you: youAt('main', FETCHED, { fs: 'd4e2', om: 'c9d1', ofs: 'd4e2' }),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, 'd4e2'],
        [
          ['main', 'c9d1'],
          ['feature/search', 'd4e2'],
        ]
      ),
    },
    ci: ci(),
    crossings: [cross('b7c2', 'origin', 'you'), cross('c9d1', 'origin', 'you')],
  },
  {
    id: 'diverged',
    title: 'Two lines leave a1f0',
    caption:
      "Your graph now shows two lines leaving a1f0: your d4e2, and Sam's work ending at c9d1 on origin/main. The histories have diverged. Before opening a pull request, you bring Sam's work into your branch so your code is tested against today's main. Git gives you two ways, and they leave different history.",
    shot: 'you',
    focus: ['you.d4e2', 'you.c9d1', 'you.a1f0'],
    actor: 'you',
    time: 'Tue 09:17',
    command: 'git switch feature/search',
    output: lines(
      "Switched to branch 'feature/search'",
      "Your branch is up to date with 'origin/feature/search'."
    ),
    regions: {
      you: youAt('feature/search', FETCHED, { fs: 'd4e2', om: 'c9d1', ofs: 'd4e2' }),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, 'd4e2'],
        [
          ['main', 'c9d1'],
          ['feature/search', 'd4e2'],
        ]
      ),
    },
    ci: ci(),
    crossings: [],
    choice: {
      question: MERGE_OPTION_Q,
      options: [
        { id: 'rebase', label: 'Rebase your branch onto origin/main', path: 'rebase' },
        { id: 'merge', label: 'Merge origin/main into your branch', path: 'merge' },
      ],
    },
  },
];

// Origin states shared by the rebase path.
const ORIGIN_PRE_PUSH = () =>
  region(
    'origin',
    null,
    [...ORIGIN_MAIN, 'd4e2'],
    [
      ['main', 'c9d1'],
      ['feature/search', 'd4e2'],
    ]
  );

const ORIGIN_REBASED = (pr?: PullRequestState) =>
  region(
    'origin',
    null,
    [...ORIGIN_MAIN, ['d4e2', 'unreachable'], 'f1a3'],
    [
      ['main', 'c9d1'],
      ['feature/search', 'f1a3'],
    ],
    pr
  );

const YOU_REBASED = () =>
  youAt('feature/search', [...FETCHED.slice(0, 3), ['d4e2', 'reflog-only'], 'f1a3'], {
    fs: 'f1a3',
    om: 'c9d1',
    ofs: 'f1a3',
  });

const REBASE_BEATS: ScenarioBeat[] = [
  {
    id: 'rebase-copies',
    title: 'Rebase writes a new commit',
    caption:
      'Rebase replays your change on top of c9d1 as a new commit, f1a3. Same message, same change, but a different parent, so a different hash: a commit can never be edited. feature/search moves to the copy. The original d4e2 still exists, because origin/feature/search still names it.',
    shot: 'you',
    focus: ['you.f1a3', 'you.d4e2', 'you.feature/search', 'you.origin/feature/search'],
    actor: 'you',
    time: 'Tue 09:20',
    command: 'git rebase origin/main',
    output: 'Successfully rebased and updated refs/heads/feature/search.',
    regions: {
      you: youAt('feature/search', [...FETCHED, 'f1a3'], { fs: 'f1a3', om: 'c9d1', ofs: 'd4e2' }),
      sam: SAM(),
      origin: ORIGIN_PRE_PUSH(),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'rebase-push-rejected',
    title: 'Origin rejects the push',
    caption:
      "Origin refuses. Its feature/search names d4e2, and a plain push may only move a branch forward to a descendant. f1a3 does not descend from d4e2: it replaced it. Accepting would drop d4e2 from origin's branch, so Git calls it non-fast-forward. This is the price of rewriting a branch you already pushed.",
    shot: 'bridge',
    focus: ['origin.feature/search', 'origin.d4e2', 'you.f1a3'],
    actor: 'you',
    time: 'Tue 09:22',
    command: 'git push',
    output: lines(
      'To github.com:acme/shop.git',
      ' ! [rejected]        feature/search -> feature/search (non-fast-forward)',
      "error: failed to push some refs to 'github.com:acme/shop.git'",
      'hint: Updates were rejected because the tip of your current branch is behind',
      'hint: its remote counterpart.'
    ),
    regions: {
      you: youAt('feature/search', [...FETCHED, 'f1a3'], { fs: 'f1a3', om: 'c9d1', ofs: 'd4e2' }),
      sam: SAM(),
      origin: ORIGIN_PRE_PUSH(),
    },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'rebase-force-with-lease',
    title: 'Force push with a lease',
    caption:
      "The lease: overwrite origin's branch only if it still names d4e2, the commit your origin/feature/search recorded. It does, so the branch jumps to f1a3. Had Sam pushed to your branch meanwhile, this would fail instead of erasing their commit; plain --force checks nothing. d4e2 is now unreachable on origin, and only your reflog remembers it.",
    shot: 'bridge',
    focus: [
      'origin.feature/search',
      'origin.f1a3',
      'origin.d4e2',
      'you.origin/feature/search',
      'you.d4e2',
    ],
    actor: 'you',
    time: 'Tue 09:23',
    command: 'git push --force-with-lease',
    output: lines(
      'To github.com:acme/shop.git',
      ' + d4e2...f1a3 feature/search -> feature/search (forced update)'
    ),
    regions: { you: YOU_REBASED(), sam: SAM(), origin: ORIGIN_REBASED() },
    ci: ci(),
    crossings: [cross('f1a3', 'you', 'origin')],
  },
  {
    id: 'rebase-open-pr',
    title: 'Open pull request #7',
    caption: OPEN_PR_CAPTION,
    shot: 'ship',
    focus: ['origin.pr-7', 'ci.job', 'ci.checkout'],
    actor: 'you',
    time: 'Tue 09:30',
    ...GH_PR_CREATE,
    regions: { you: YOU_REBASED(), sam: SAM(), origin: ORIGIN_REBASED('open') },
    ci: ci('running'),
    crossings: [],
  },
  {
    id: 'rebase-ci-passes',
    title: 'CI passes on the merge result',
    caption:
      'The tests pass on f1a3 combined with c9d1, the same code main will hold after the merge. main is protected: a passing check and an approving review are both required before anyone can merge. Sam reviews the change and approves it.',
    shot: 'ship',
    focus: ['ci.job'],
    actor: 'ci',
    time: 'Tue 09:34',
    ...NPM_TEST,
    regions: { you: YOU_REBASED(), sam: SAM(), origin: ORIGIN_REBASED('open') },
    ci: ci('passed'),
    crossings: [],
  },
  {
    id: 'rebase-merged',
    title: 'Pull request #7 merged',
    caption:
      "You merge pull request #7. Origin writes merge commit 0b3e with parents c9d1 and f1a3, and moves main there. Your feature joins main as one commit sitting on top of Sam's work, with no catch-up merge inside it. d4e2, the commit you first pushed, appears nowhere in main's history.",
    shot: 'origin',
    focus: ['origin.0b3e', 'origin.main', 'origin.pr-7'],
    actor: 'you',
    time: 'Tue 10:05',
    action: 'Merged pull request #7 on GitHub',
    regions: {
      you: YOU_REBASED(),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, ['d4e2', 'unreachable'], 'f1a3', '0b3e'],
        [
          ['main', '0b3e'],
          ['feature/search', 'f1a3', 'deleted'],
        ],
        'merged'
      ),
    },
    ci: ci('passed'),
    crossings: [],
    outcome:
      "Rebasing bought a linear branch: one commit on top of today's main, and no merge commit except the pull request's own. It cost your commit a new SHA and a force push, which was safe only because nobody else had built on feature/search.",
  },
];

const YOU_MERGED = (ofs: Sha) =>
  youAt('feature/search', [...FETCHED, 'e5a6'], { fs: 'e5a6', om: 'c9d1', ofs });

const ORIGIN_MERGED = (pr?: PullRequestState) =>
  region(
    'origin',
    null,
    [...ORIGIN_MAIN, 'd4e2', 'e5a6'],
    [
      ['main', 'c9d1'],
      ['feature/search', 'e5a6'],
    ],
    pr
  );

const MERGE_BEATS: ScenarioBeat[] = [
  {
    id: 'merge-in',
    title: 'Merge origin/main into your branch',
    caption:
      "Merge writes a new commit, e5a6, with two parents: your d4e2 and c9d1. Nothing is rewritten: d4e2 keeps its hash and its place, and feature/search moves forward to e5a6. The graph records what really happened: you branched from a1f0 and caught up with Sam's work on Tuesday.",
    shot: 'you',
    focus: ['you.e5a6', 'you.d4e2', 'you.feature/search'],
    actor: 'you',
    time: 'Tue 09:20',
    command: 'git merge origin/main',
    output: lines(
      "Merge made by the 'ort' strategy.",
      ' src/rateLimit.ts | 18 ++++++++++++++++++',
      ' 1 file changed, 18 insertions(+)'
    ),
    regions: { you: YOU_MERGED('d4e2'), sam: SAM(), origin: ORIGIN_PRE_PUSH() },
    ci: ci(),
    crossings: [],
  },
  {
    id: 'merge-push',
    title: 'A plain push fast-forwards',
    caption:
      "A plain push succeeds. Origin's feature/search names d4e2, and e5a6 descends from it, so origin simply moves the branch forward: a fast-forward. No force, no lease, nothing dropped. Anyone who had fetched d4e2 still finds it inside the new history.",
    shot: 'bridge',
    focus: ['origin.e5a6', 'origin.feature/search', 'you.origin/feature/search'],
    actor: 'you',
    time: 'Tue 09:22',
    command: 'git push',
    output: lines('To github.com:acme/shop.git', '   d4e2..e5a6  feature/search -> feature/search'),
    regions: { you: YOU_MERGED('e5a6'), sam: SAM(), origin: ORIGIN_MERGED() },
    ci: ci(),
    crossings: [cross('e5a6', 'you', 'origin')],
  },
  {
    id: 'merge-open-pr',
    title: 'Open pull request #7',
    caption: OPEN_PR_CAPTION,
    shot: 'ship',
    focus: ['origin.pr-7', 'ci.job', 'ci.checkout'],
    actor: 'you',
    time: 'Tue 09:30',
    ...GH_PR_CREATE,
    regions: { you: YOU_MERGED('e5a6'), sam: SAM(), origin: ORIGIN_MERGED('open') },
    ci: ci('running'),
    crossings: [],
  },
  {
    id: 'merge-ci-passes',
    title: 'CI passes on the merge result',
    caption:
      'The tests pass on your branch combined with main: the same code main will hold after the merge. main is protected: a passing check and an approving review are both required before anyone can merge. Sam reviews the change and approves it.',
    shot: 'ship',
    focus: ['ci.job'],
    actor: 'ci',
    time: 'Tue 09:34',
    ...NPM_TEST,
    regions: { you: YOU_MERGED('e5a6'), sam: SAM(), origin: ORIGIN_MERGED('open') },
    ci: ci('passed'),
    crossings: [],
  },
  {
    id: 'merge-merged',
    title: 'Pull request #7 merged',
    caption:
      "You merge pull request #7. Origin writes 9c4f with parents c9d1 and e5a6, and moves main there. main's history now holds two merge commits for your feature: the pull request's and your catch-up e5a6. Every commit keeps the hash it was pushed with, including d4e2.",
    shot: 'origin',
    focus: ['origin.9c4f', 'origin.main', 'origin.pr-7', 'origin.e5a6'],
    actor: 'you',
    time: 'Tue 10:05',
    action: 'Merged pull request #7 on GitHub',
    regions: {
      you: YOU_MERGED('e5a6'),
      sam: SAM(),
      origin: region(
        'origin',
        null,
        [...ORIGIN_MAIN, 'd4e2', 'e5a6', '9c4f'],
        [
          ['main', '9c4f'],
          ['feature/search', 'e5a6', 'deleted'],
        ],
        'merged'
      ),
    },
    ci: ci('passed'),
    crossings: [],
    outcome:
      'Merging preserved the true history: every SHA you pushed survives, and every push was a plain fast-forward, safe even on a branch others share. It cost an extra merge commit, so the log shows a non-linear detour.',
  },
];

export const SCENARIO_PATHS: ScenarioPath[] = [
  { id: 'main', beats: MAIN_BEATS },
  { id: 'rebase', from: { beat: 'diverged', option: 'rebase' }, beats: REBASE_BEATS },
  { id: 'merge', from: { beat: 'diverged', option: 'merge' }, beats: MERGE_BEATS },
];

// ---------------------------------------------------------------------------
// Routes

export const getPath = (id: string) => SCENARIO_PATHS.find((p) => p.id === id);

/** The beats a learner sees for their picks, in order. Stops at an unanswered choice. */
export function routeFor(picks: string[]): ScenarioBeat[] {
  const route: ScenarioBeat[] = [];
  let path = getPath('main');
  let i = 0;
  while (path) {
    route.push(...path.beats);
    const choice = path.beats[path.beats.length - 1].choice;
    const option = choice?.options.find((o) => o.id === picks[i]);
    if (!option) break;
    path = getPath(option.path);
    i += 1;
  }
  return route;
}

/** Every complete pick list (one per ending), e.g. `[['rebase'], ['merge']]`. */
export function allPickSets(): string[][] {
  const walk = (pathId: string, picks: string[]): string[][] => {
    const path = getPath(pathId)!;
    const choice = path.beats[path.beats.length - 1].choice;
    if (!choice) return [picks];
    return choice.options.flatMap((o) => walk(o.path, [...picks, o.id]));
  };
  return walk('main', []);
}

export const getBeat = (id: string): ScenarioBeat | undefined =>
  SCENARIO_PATHS.flatMap((p) => p.beats).find((b) => b.id === id);

/** The beat before `id` on any route through it (paths never rejoin, so it is unique). */
export function getPreviousBeat(id: string): ScenarioBeat | undefined {
  for (const path of SCENARIO_PATHS) {
    const i = path.beats.findIndex((b) => b.id === id);
    if (i > 0) return path.beats[i - 1];
    if (i === 0 && path.from) return getBeat(path.from.beat);
  }
  return undefined;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** `Tue 09:15` → minutes since Monday 00:00, for ordering. */
export function timeToMinutes(time: string): number {
  const [day, hm] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  return DAYS.indexOf(day) * 1440 + h * 60 + m;
}

export interface TranscriptEntry {
  beat: string;
  actor: CastId;
  time: string;
  command?: string;
  action?: string;
  output?: string;
}

/** The transcript up to and including `route[index]`. */
export const getTranscript = (route: ScenarioBeat[], index: number): TranscriptEntry[] =>
  route.slice(0, index + 1).map((b) => ({
    beat: b.id,
    actor: b.actor,
    time: b.time,
    command: b.command,
    action: b.action,
    output: b.output,
  }));

// ---------------------------------------------------------------------------
// Pure helpers shared by views and tests: derive facts, never store them twice.

export const GRAPH_REGIONS: GraphRegionId[] = ['you', 'sam', 'origin'];

export const regionOf = (key: string) => key.slice(0, key.indexOf('.'));

export const getCommit = (beat: ScenarioBeat, id: string): Commit | undefined =>
  GRAPH_REGIONS.flatMap((r) => beat.regions[r].commits).find((c) => c.id === id);

export const getRefCard = (beat: ScenarioBeat, id: string): RefCard | undefined =>
  GRAPH_REGIONS.flatMap((r) => beat.regions[r].refs).find((c) => c.id === id);

/** SHA a present ref names, or `null` when the ref is deleted or absent. */
export function refTarget(beat: ScenarioBeat, id: string): Sha | null {
  const card = getRefCard(beat, id);
  return card && card.state === 'present' ? card.target : null;
}

/** Whether the HEAD badge sits on this branch card. */
export function hasHeadBadge(beat: ScenarioBeat, refId: string): boolean {
  const card = getRefCard(beat, refId);
  return !!card && beat.regions[card.region].head === card.name;
}

/** Every entity key present at a beat: commits, ref cards, the PR card, CI cards. */
export function getEntityKeys(beat: ScenarioBeat): Set<string> {
  const keys = new Set<string>();
  for (const r of GRAPH_REGIONS) {
    const reg = beat.regions[r];
    reg.commits.forEach((c) => keys.add(c.id));
    reg.refs.forEach((c) => keys.add(c.id));
    if (reg.pr) keys.add(reg.pr.id);
  }
  keys.add(beat.ci.job.id);
  keys.add(beat.ci.checkout.id);
  return keys;
}

/** SHAs reachable in a region from one ref, following parent arrows. */
export function reachableFrom(beat: ScenarioBeat, refId: string): Set<Sha> {
  const start = refTarget(beat, refId);
  return start ? walkParents(beat, regionOf(refId) as GraphRegionId, [start]) : new Set();
}

function walkParents(beat: ScenarioBeat, regionId: GraphRegionId, starts: Sha[]): Set<Sha> {
  const commits = beat.regions[regionId].commits;
  const seen = new Set<Sha>();
  const queue = [...starts];
  while (queue.length) {
    const sha = queue.shift()!;
    if (seen.has(sha)) continue;
    const c = commits.find((x) => x.sha === sha);
    if (!c) continue;
    seen.add(sha);
    queue.push(...c.parents);
  }
  return seen;
}

/** SHAs reachable in a region from all its present refs (HEAD names one of them). */
export function getReachable(beat: ScenarioBeat, regionId: GraphRegionId): Set<Sha> {
  const starts = beat.regions[regionId].refs
    .filter((r) => r.state === 'present')
    .map((r) => r.target);
  return walkParents(beat, regionId, starts);
}

/**
 * The state reachability implies. In a non-bare clone every ref update is logged, so an
 * unreferenced commit is still `reflog-only`; the server keeps no reflogs.
 */
export function reachabilityState(
  beat: ScenarioBeat,
  regionId: GraphRegionId,
  sha: Sha
): CommitState {
  if (getReachable(beat, regionId).has(sha)) return 'live';
  return beat.regions[regionId].kind === 'clone' ? 'reflog-only' : 'unreachable';
}

/** Whether `ancestor` is `descendant` or one of its ancestors, in that region's graph. */
export const isAncestor = (
  beat: ScenarioBeat,
  regionId: GraphRegionId,
  ancestor: Sha,
  descendant: Sha
): boolean => walkParents(beat, regionId, [descendant]).has(ancestor);

/**
 * Whether a plain push of `localRefId` would fast-forward `remoteRefId`: origin's tip must
 * be an ancestor of the pushed commit (checked in the pushing clone's graph).
 */
export function isFastForward(
  beat: ScenarioBeat,
  localRefId: string,
  remoteRefId: string
): boolean {
  const local = refTarget(beat, localRefId);
  const remote = refTarget(beat, remoteRefId);
  if (!local) return false;
  if (!remote) return true;
  return isAncestor(beat, regionOf(localRefId) as GraphRegionId, remote, local);
}

/** Tracking links whose clone-side ref exists at this beat, with their stale flag. */
export function getTrackingLinks(beat: ScenarioBeat): TrackingLink[] {
  return TRACKING_LINKS.flatMap((def) => {
    const local = getRefCard(beat, def.local);
    if (!local) return [];
    const remoteTarget = refTarget(beat, def.remote);
    return [
      { ...def, localTarget: local.target, remoteTarget, stale: remoteTarget !== local.target },
    ];
  });
}

/**
 * A remote-tracking ref is stale when it and origin's branch name different commits (or
 * origin's branch is gone). Accepts the local ref key, e.g. `you.origin/main`.
 */
export const isStale = (beat: ScenarioBeat, localRefId: string): boolean =>
  getTrackingLinks(beat).find((l) => l.local === localRefId)?.stale ?? false;

/** What Git's "up to date with" compares: two local refs, no network. */
export const matchesUpstream = (beat: ScenarioBeat, branchId: string, upstreamId: string) =>
  refTarget(beat, branchId) !== null && refTarget(beat, branchId) === refTarget(beat, upstreamId);

/** The PR card's head and base, resolved through origin's refs (deleted refs keep their SHA). */
export function getPullRequestTargets(beat: ScenarioBeat): { head: Sha; base: Sha } | null {
  const pr = beat.regions.origin.pr;
  if (!pr) return null;
  const head = getRefCard(beat, `origin.${pr.head}`);
  const base = getRefCard(beat, `origin.${pr.base}`);
  return head && base ? { head: head.target, base: base.target } : null;
}

/** The check shown on the PR card, from the CI job. */
export function getPullRequestCheck(beat: ScenarioBeat): 'none' | 'pending' | 'passed' {
  const s = beat.ci.job.state;
  return s === 'idle' ? 'none' : s === 'running' ? 'pending' : 'passed';
}

export const getCrossings = (beat: ScenarioBeat): Crossing[] => beat.crossings;

export const isFocused = (beat: ScenarioBeat, key: string) => beat.focus.includes(key);
