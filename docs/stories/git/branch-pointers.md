# Branch Pointers: What Is a Branch, Really?

- Module / section: git › Branching & Merging
- Question: What is a branch, really: a copy of the code, or a movable label on a commit?
- Sources: `docs/RESEARCH/Git 20_80 Learning Guide.md` › "Git's Content-Addressable Database" (commit objects, parent pointers, DAG, hash immutability), "Branching, Merging, and Collaboration" (lightweight pointer, pointer moves on commit, `git switch`, three-way merge commit with multiple parents), "HEAD, Detached HEAD, the Reflog, and Garbage Collection" (symbolic HEAD, which branch moves, detached HEAD, reachability, reflog, expiry defaults, abbreviated names). Quiz ids: git-q08 (`git branch` creates a pointer without moving HEAD; "Detached HEAD" is a distractor), git-q23 (commits point to parents; objects are immutable), git-q31 (changed metadata means a new commit and hash), git-q20 (merge commit keeps both parent histories), git-q17 / git-q24 / git-q21 (reflog records HEAD and ref movements for recovery).
- Status: approved (2026-09-25)

## Code

```sh
git commit -m "add login"
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
git gc --prune=now
```

Starting state (before line 1): a repository with one commit `a1f0` on `main`, HEAD on `main`. Every command runs cleanly (no conflicts, clean working tree).

SHAs are 4-character fakes used the same way everywhere (spec, code, captions): `a1f0` (init), `b2c4` (add login), `c3d8` (hotfix), `d4e2` (search), `e5a6` (merge), `f6b1` (experiment). Four characters is Git's minimum abbreviation length, so every command is valid as written; in a real repository, substitute the SHA that `git log` shows for "add login".

## Regions and shots

Two regions:

- **graph**: commit nodes (immutable objects) and their parent arrows, which always point backward from child to parent.
- **refs**: the literal files in `.git/`: `HEAD`, `refs/heads/main`, `refs/heads/feature`, and HEAD's reflog (`logs/HEAD`). Each ref card has one arrow to what it names. `HEAD` names either a branch (symbolic, `ref: refs/heads/main`) or, when detached, a commit id directly.

Layout cells (stable for the whole story):

- graph (4 cols x 3 rows): `a1f0` (0,1), `b2c4` (1,1), `c3d8` (2,1), `e5a6` (3,1); `d4e2` (2,2); `f6b1` (2,0).
- refs (3 x 2): `HEAD` (0,0), `main` (1,0), `feature` (2,0), `head-reflog` (0,1).

Commit `state` values: `live` (reachable from a branch or HEAD), `reflog-only` (reachable only through the HEAD reflog), `unreachable` (reachable from nothing), `collected` (deleted by gc). `a1f0` through `e5a6` stay `live` throughout.

| Shot | Must keep in frame |
|---|---|
| overview | everything: all commit cells, all ref cards, every parent arrow and ref arrow |
| graph | all graph cells (4 x 3) and parent arrows; ref cards may fall out of frame |
| refs | the four ref cards and the start of their outgoing arrows |
| bridge | the refs region, graph columns 1 to 3 (`b2c4`, `c3d8`, `d4e2`, `e5a6`, `f6b1`), and the ref arrows landing on them |
| orphan | `b2c4`, `f6b1`, the `HEAD` card, the `head-reflog` card, and the arrows between them |

## Beats

| # | id | Line | Shot | Focus | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|
| 1 | commit-parent | 1 | graph | `b2c4`, `b2c4.parents` | New commit `b2c4` appears at (1,1) with a parent arrow to `a1f0`. `main` arrow moves `a1f0` to `b2c4`. `HEAD` still says `ref: refs/heads/main`. | `git commit` writes a new commit object, `b2c4`, that stores its snapshot and a pointer to its parent, `a1f0`. `a1f0` is not touched: commits never change, since editing one would change its hash. History is this chain of backward-pointing arrows. The branch `main` moves forward to the new commit. |
| 2 | branch-is-a-label | 2 | bridge | `feature`, `feature.target`, `b2c4` | A new `feature` ref card appears; its arrow lands on `b2c4`, the same commit `main` names. No commit, tree or file is added to the graph. | `git branch feature` creates a single ref that names `b2c4`. That is the whole branch: a lightweight pointer to a commit, not a copy of the code. The graph is unchanged. Two labels now point at the same commit, and HEAD still points at `main`, so you have not switched. |
| 3 | only-head-branch-moves | 3 | bridge | `c3d8`, `main.target`, `feature.target`, `HEAD` | New commit `c3d8` at (2,1), parent `b2c4`. `main` arrow moves to `c3d8`; `feature` arrow stays on `b2c4`. | You commit again without switching. The new commit `c3d8` goes onto `main`, because HEAD names `main`, and only the branch HEAD names moves when you commit. `feature` stays on `b2c4`. Creating a branch did not put you on it. |
| 4 | switch-moves-head | 4 | refs | `HEAD`, `HEAD.target` | `HEAD` card text changes to `ref: refs/heads/feature`; its arrow swings from `main` to `feature`. Graph unchanged. | `git switch feature` rewrites one small file: HEAD now says `ref: refs/heads/feature`. The working directory is updated to `b2c4`'s snapshot. No commit is created or moved. "Being on a branch" just means HEAD points at that branch's name. |
| 5 | graph-forks | 5 | graph | `d4e2`, `d4e2.parents`, `feature.target` | New commit `d4e2` at (2,2), parent `b2c4`. `feature` arrow moves to `d4e2`; `main` stays on `c3d8`. `b2c4` now has two children. | Committing on `feature` creates `d4e2` with parent `b2c4`, and moves only `feature`. `b2c4` now has two children, `c3d8` and `d4e2`: the history has forked. Neither commit knows which branch made it. A commit records its parents, not a branch name. |
| 6 | switch-back | 6 | refs | `HEAD`, `HEAD.target` | `HEAD` card returns to `ref: refs/heads/main`; arrow swings back to `main`. | `git switch main` points HEAD back at `main`, and the working directory changes to `c3d8`'s snapshot. The `search` work in `d4e2` is not lost or hidden. It sits in the graph, still named by `feature`. |
| 7 | merge-two-parents | 7 | bridge | `e5a6`, `e5a6.parents`, `main.target`, `feature.target` | New commit `e5a6` at (3,1) with two parent arrows, to `c3d8` and `d4e2`. `main` arrow moves to `e5a6`; `feature` arrow stays on `d4e2`. | The two histories have diverged, so `git merge feature` makes a three-way merge. It creates a merge commit, `e5a6`, with two parents: `c3d8` and `d4e2`. `main` moves to `e5a6` because HEAD names `main`. `feature` does not move and is not used up. It still names `d4e2`. |
| 8 | detached-head | 8 | orphan | `HEAD`, `HEAD.target`, `b2c4` | `HEAD` card text changes to the commit id `b2c4`; its arrow now goes straight to commit `b2c4`, bypassing every branch card. Head-reflog gains an entry for `b2c4`. | `git switch --detach b2c4` gives HEAD a commit id instead of a branch name: this is detached HEAD. `git checkout b2c4` does the same. The working directory shows `b2c4`'s snapshot. Nothing is broken: HEAD simply points at a commit, not at a label that could move. |
| 9 | detached-commit | 9 | orphan | `f6b1`, `f6b1.parents`, `HEAD.target` | New commit `f6b1` at (2,0), parent `b2c4`. `HEAD` arrow moves to `f6b1`. `main` and `feature` arrows do not move. Head-reflog gains an entry for `f6b1`. | Committing while detached works: `f6b1` is a real commit with parent `b2c4`. HEAD moves to `f6b1`, but no branch does, because HEAD does not name one. Right now, HEAD is the only thing pointing at this commit. |
| 10 | orphaned-commit | 10 | orphan | `f6b1`, `HEAD.target`, `head-reflog` | `HEAD` returns to `ref: refs/heads/main`. No ref card has an arrow to `f6b1`; only the head-reflog card still lists it. `f6b1` becomes `reflog-only` (dimmed, still solid). | Switching back leaves `f6b1` with no label. Parent arrows point backward, so no commit leads to it either. It is not deleted: HEAD's reflog still records `f6b1`, so `git reflog` can find it and `git branch experiment f6b1` would rescue it. Commits are not stored inside branches. Branches only point at them. |
| 11 | reflog-expired | 11 | orphan | `head-reflog`, `f6b1` | The head-reflog entry for `f6b1` is removed. Nothing in the refs region reaches `f6b1`; it turns `unreachable` (outlined, fading). | This command forces what Git does on its own after about 30 days: it expires reflog entries for commits no ref can reach. That was the last trace of `f6b1`. Nothing can reach it now, not a branch, not HEAD, not the reflog. Until gc runs, the object still sits in the database. |
| 12 | gc-collects | 12 | overview | `f6b1` | `f6b1` becomes `collected` and leaves the graph. `a1f0` to `e5a6` remain, all reachable from `main` or `feature`. | `git gc --prune=now` deletes unreachable objects, so `f6b1` is removed. Without the flags, gc waits: a commit you leave detached survives for weeks, which is why recovery usually works. Every other commit survives because a branch reaches it through parent arrows. A commit lives as long as a ref can reach it. |

Aha beats:

- #2 `branch-is-a-label`: breaks "a branch is a copy of the code". Creating one adds a pointer and leaves the graph unchanged.
- #3 `only-head-branch-moves`: breaks "`git branch` puts me on the new branch" and "all branches advance together". Only the branch HEAD names moves (git-q08).
- #10 `orphaned-commit`: breaks "commits live inside branches" and "switching away deletes my work". The commit exists without a label and is kept only by the reflog, so reachability decides whether it lives.

## Claim sources

"HEAD section" below means Report › HEAD, Detached HEAD, the Reflog, and Garbage Collection.

| Beat | Claim | Source |
|---|---|---|
| 1 | Commit points to its parent; history is the chain of backward pointers | Report › Git's Content-Addressable Database (DAG paragraph, "direction of the pointers always moving backward toward its ancestors"); git-q23 |
| 1 | Commits never change; a change means a new hash | Report › Git's Content-Addressable Database ("any change to the data will produce a completely different hash"); git-q23, git-q31 |
| 1, 3, 5 | The branch pointer moves forward to the new commit | Report › Branching, Merging, and Collaboration |
| 2 | A branch is a lightweight pointer, not a copy | Report › Branching, Merging, and Collaboration |
| 2, 3 | `git branch` does not switch HEAD | HEAD section (git-branch: "will not switch the working tree to it"); git-q08 |
| 3 to 7 | HEAD is a symbolic ref (`ref: refs/heads/<branch>`); committing moves only the branch HEAD names | HEAD section (git-symbolic-ref, Pro Git Git References; git-checkout: commit "updates branch `master`" while HEAD keeps naming it) |
| 4, 6 | `git switch` moves between branches and updates the working tree to match | Report › Branching, Merging, and Collaboration; HEAD section (git-switch: "the working tree and the index are updated to match the branch") |
| 5 | A commit records its tree, parents, author/committer and message, not the branch it was made on | HEAD section (Pro Git Git Objects; gitglossary "commit object") |
| 7 | Diverged histories give a three-way merge and a merge commit with multiple parents | Report › Branching, Merging, and Collaboration; HEAD section (git-merge); git-q20 |
| 7 | Only the current branch moves in a merge; the merged-in branch stays put | HEAD section, git-merge: "into the current branch". That the merged-in branch does not move is **inferred** from git-merge's diagrams (and Pro Git deleting it afterwards); the docs do not state it explicitly |
| 8 | `git switch --detach <commit>` / `git checkout <commit>` point HEAD at the commit id | HEAD section (git-checkout; git-switch) |
| 9 | Commits made while detached move HEAD without affecting any branch | HEAD section (gitglossary "detached HEAD") |
| 10 | After switching back, nothing refers to the detached commit; it survives only until gc, unless a reference is created | HEAD section (git-checkout, Detached HEAD) |
| 10 | The HEAD reflog records each commit and branch change, keeps the commit from gc, and `git branch <name> <sha>` rescues it | HEAD section (git-reflog; git-gc Notes on reflogs; Pro Git Maintenance and Data Recovery); git-q17, git-q24, git-q21 |
| 10, 11 | An object is reachable through refs and parent chains; unreachable means reachable from no reference | HEAD section (gitglossary "reachable" / "unreachable object") |
| 11 | Unreachable reflog entries expire after 30 days by default; `git reflog expire --expire-unreachable=now --all` removes them now | HEAD section, Expiry defaults (`gc.reflogExpireUnreachable`; git-reflog) |
| 12 | `git gc --prune=now` prunes unreachable loose objects regardless of age; by default they wait 2 weeks (`gc.pruneExpire`) | HEAD section, Expiry defaults (git-gc; git-config) |
| all | 4-character abbreviated SHAs are valid (minimum length 4) | HEAD section, Abbreviated names (`core.abbrev`; gitglossary "object name") |

## UNSOURCED

None of the captions' claims. Notes for builders:

- The research found no documented warning when you switch away and leave detached commits behind (only `advice.detachedHead` on *entering* the state). The story does not claim or show such a warning.
- The merged-in branch staying put (beat 7) is an inference from git-merge's diagrams, as cited above, not an explicit statement.

## Open questions for the architect

1. **Section placement.** Recommend **Branching & Merging** (`BranchingMerging.tsx`). It already hosts `Branching2D`, whose data tags each commit with a `branch` field, which is the exact misconception this story removes. Beats 10 to 12 also connect to the reflog material in **History Management**, which could link to this story.
