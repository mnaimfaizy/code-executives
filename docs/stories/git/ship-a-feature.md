# Shipping a feature with your team

- Module: git › Visualization (gallery), scenario id `ship-a-feature`
- Workflow: you build a feature on a branch while a teammate merges their own work to `main` first; you bring their work into your branch (rebase or merge), open a pull request, pass CI and merge.
- Invisible effects it reveals: your clone's `origin/main` is a local record that stays stale until you fetch, even while Git reports "up to date"; rebase writes new commits (new SHAs) while the originals live on; a rewritten, already-pushed branch can only be replaced by a force push.
- Concepts touched: Core Workflow, Branching & Merging, History Management, Professional Workflows, Troubleshooting
- Sources: `docs/RESEARCH/Git 20_80 Learning Guide.md` › "The Core Git Workflow: From Local to Remote" (clone holds full history, push uploads, pull = fetch + merge, fetch downloads new commits), "Branching, Merging, and Collaboration" (branch is a lightweight pointer, fast-forward vs three-way merge, merge commit with multiple parents), "HEAD, Detached HEAD, the Reflog, and Garbage Collection" (HEAD names the branch that moves, commits record parents, reachability, gc keeps remote-tracking branches and reflogs, "reflogs ... may reference commits in branches that were later amended or rewound", 4-char abbreviations), "Navigating and Rewriting History" (merge vs rebase: rebase moves commits onto another tip and rewrites history, linear log, never on a shared public branch; merge preserves history, adds merge-commit noise), "Common Professional Workflows" (GitHub Flow: branch from `main`, merge back via pull request; protect `main` by requiring pull requests and automated checks), Part II "Git's Content-Addressable Database" (any change gives a new hash), "Remotes, Remote-Tracking Branches, and Push Rules" (remote-tracking refs are local and stale until network contact, "up to date" compares against them, fetch moves only `refs/remotes/origin/*`, `push -u`, push rules, rebase + `--force-with-lease`, GitHub merge methods and auto-delete, protected branches, `pull_request` CI on `refs/pull/<n>/merge`). Quiz ids: git-q12 (push rejected as non-fast-forward because someone pushed first; integrate, then push), git-q09 (rebasing a published branch is not safer), git-q20 (merge commit preserves topology, rebase rewrites), git-q28 (integrate with `main` regularly through merge or rebase), git-q25 (GitHub Flow order), git-q31 (changed commit gives a new hash), git-q02 (pushes can be rejected), git-q04 (publish cycle ends with `git push`).
- Status: approved (2026-09-26)

## Conventions

- **SHAs** are 4-character fakes, used the same way in commands, output and captions (Git's minimum abbreviation is 4; real Git prints 7). `a1f0` "Initial shop", `b7c2` "Add rate limit" (Sam), `c9d1` "Merge pull request #6 from acme/rate-limit", `d4e2` "Add search" (you), `f1a3` "Add search" (rebased copy, rebase path), `e5a6` "Merge remote-tracking branch 'origin/main' into feature/search" (merge path), `0b3e` "Merge pull request #7 from acme/feature/search" (rebase path), `9c4f` same message (merge path).
- **Setting assumptions** (stated once in the scenario summary, not argued in captions): the repository is `github.com:acme/shop`; `main` is protected and needs an approving review and a passing CI check; pull requests are merged with GitHub's "Create a merge commit" button; "Automatically delete head branches" is on; the CI workflow runs on `pull_request` only, so pushing a branch alone starts no job.
- **Entity keys** are region-scoped, `<region>.<name>`: `you.d4e2`, `origin.main`, `you.origin/main`, `ci.job`. The same SHA in two regions is two entities that share a SHA and a cell.
- **Output** is trimmed real Git 2.4x / GitHub CLI 2.x output ("Enumerating objects" progress lines removed).
- No second choice point. A `--force` vs `--force-with-lease` choice would end identically here (nobody else pushed to `feature/search`), so it would teach nothing visible; beat `rebase-force-with-lease` explains the difference in its caption instead.

## Cast

| id | Name tag | Role | Their copy (region) |
|---|---|---|---|
| you | You | developer | your laptop's clone of `acme/shop` |
| sam | Sam | teammate | Sam's laptop clone (also the reviewer who approves #7; no separate reviewer) |
| origin | origin | server | the GitHub repository `acme/shop`, with its branches and pull requests |
| ci | CI runner | bot | a GitHub Actions runner started for the pull request |

## Regions and shots

Clone regions (`you`, `sam`, `origin`) share one layout: a **commit grid** of 4 cols x 3 rows plus a **ref rail** of 4 slots under it. A commit sits in the same cell in every region that has it. Row 0 is `main`'s line, row 1 is Sam's work, row 2 is yours.

| Commit | Cell | Parents |
|---|---|---|
| `a1f0` | (0,0) | none |
| `b7c2` | (1,1) | `a1f0` |
| `c9d1` | (2,0) | `a1f0`, `b7c2` |
| `d4e2` | (1,2) | `a1f0` |
| `f1a3` (rebase path) | (2,2) | `c9d1` |
| `e5a6` (merge path) | (2,2) | `d4e2`, `c9d1` |
| `0b3e` (rebase path) | (3,1) | `c9d1`, `f1a3` |
| `9c4f` (merge path) | (3,1) | `c9d1`, `e5a6` |

`f1a3`/`e5a6` and `0b3e`/`9c4f` share cells but never appear on the same route.

Ref rails (slot: ref). HEAD is a `head` field on a clone region, drawn as a badge on the branch card it names, not a card of its own. `origin` is shown without HEAD.

- `you`: 0 `main`, 1 `feature/search`, 2 `origin/main`, 3 `origin/feature/search` (from beat 3).
- `sam`: 0 `main`, 1 `rate-limit` (HEAD), 2 `origin/main`, 3 `origin/rate-limit`. Static for the whole scenario.
- `origin`: 0 `main`, 1 `rate-limit` (`deleted` at beat 4, absent after), 2 `feature/search` (from beat 3), 3 `PR #7` card (from the open-PR beat; `open` then `merged`; names head `feature/search` and base `main`).
- `ci` (no grid, 2 slots): 0 `job` card (`idle`, `running`, `passed`), 1 `checkout` card (`none`, then `refs/pull/7/merge`).

States: commits are `live` (reachable from a ref in that region), `reflog-only` (in your clone, reachable only through your reflogs) or `unreachable` (on origin, no ref reaches it). Refs are `present` or `deleted`.

**Tracking links** (derived, drawn only in `overview` and `bridge`): `you.origin/main` ↔ `origin.main`, `you.origin/feature/search` ↔ `origin.feature/search`, `sam.origin/main` ↔ `origin.main`, `sam.origin/rate-limit` ↔ `origin.rate-limit`. A link is **stale** when its two ends name different commits (helper `isStale`); stale links are drawn broken, in the warning colour.

| Shot | Must keep in frame |
|---|---|
| overview | all four regions and every tracking link |
| you | your commit grid (4 x 3), your ref rail and the HEAD badge |
| origin | origin's commit grid, its ref rail including the `PR #7` card |
| bridge | your clone and origin side by side, the tracking links between them, and objects crossing during push/fetch |
| ship | origin's ref rail (`main`, `feature/search`, `PR #7`), origin's grid columns 2–3, and the `ci` region |

## Paths

```
main (7) ──► choice "How do you bring Sam's work into feature/search?"
                 ├─► rebase (6) ──► ending: linear branch, new SHA, force push
                 └─► merge  (5) ──► ending: true history, plain pushes, extra merge commit
```

18 beats in total.

### main (7 beats)

| # | id | Time | Actor | Command → output | Shot | Focus | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|---|
| 1 | branch-off | Mon 09:05 | you | `git switch -c feature/search` → `Switched to a new branch 'feature/search'` | you | `you.feature/search` | You: `a1f0`; `main`, `feature/search` (new, HEAD badge) and `origin/main` all name `a1f0`. Origin: `a1f0`, `b7c2`; `main`→`a1f0`, `rate-limit`→`b7c2`. Sam: `a1f0`, `b7c2`; `main`, `origin/main`→`a1f0`; `rate-limit` (HEAD), `origin/rate-limit`→`b7c2`. CI: job `idle`. | Your laptop holds a full clone of the shop repository. `git switch -c` creates `feature/search` at `a1f0`, the commit your `main` names, and puts HEAD on it. No files are copied: a branch is a pointer. Sam's clone has the same history plus `b7c2`, Sam's rate-limit work, already pushed to origin for review. |
| 2 | commit-search | Mon 11:40 | you | `git commit -m "Add search"` → `[feature/search d4e2] Add search` / ` 2 files changed, 64 insertions(+)` | you | `you.d4e2`, `you.feature/search` | New `you.d4e2` at (1,2), parent `a1f0`. `feature/search` moves to `d4e2`; `main` and `origin/main` stay on `a1f0`. Other regions unchanged. | Your commit `d4e2` records its snapshot and its parent, `a1f0`. Only `feature/search` moves, because HEAD names it; `main` and `origin/main` stay on `a1f0`. Nothing has left your laptop yet: origin and Sam's clone know nothing about `d4e2`. |
| 3 | publish-branch | Mon 11:42 | you | `git push -u origin feature/search` → `remote: Create a pull request for 'feature/search' on GitHub by visiting:` / `remote:      https://github.com/acme/shop/pull/new/feature/search` / `To github.com:acme/shop.git` / ` * [new branch]      feature/search -> feature/search` / `branch 'feature/search' set up to track 'origin/feature/search'.` | bridge | `origin.d4e2`, `origin.feature/search`, `you.origin/feature/search` | `d4e2` crosses from your grid to origin's (1,2). Origin rail gains `feature/search`→`d4e2`. Your rail gains `origin/feature/search`→`d4e2`; its tracking link is intact. | `git push` copies `d4e2` to origin and creates origin's `feature/search`. Your clone writes a new ref too, `origin/feature/search`: its record of where origin's branch is. That record is right now only because you just talked to origin. You push to back up the work; the pull request comes later. |
| 4 | sam-merges | Mon 14:10 | sam | none: Sam clicks "Merge pull request" on #6 in GitHub | overview | `origin.c9d1`, `origin.main`, `you.origin/main`, `sam.origin/main` | Origin gains `c9d1` at (2,0), parents `a1f0` and `b7c2`; `origin.main`→`c9d1`; `origin.rate-limit` turns `deleted`. Your clone and Sam's clone are unchanged: both `origin/main` cards still name `a1f0`; both links to `origin.main` turn stale (broken). | Sam merges pull request #6 on GitHub. Origin writes merge commit `c9d1` with two parents, `a1f0` and `b7c2`, and moves its `main` there. Nothing reaches any laptop: your `origin/main` and even Sam's still name `a1f0`. A clone learns about new commits only when it fetches. |
| 5 | looks-up-to-date | Tue 09:15 | you | `git switch main` → `Switched to branch 'main'` / `Your branch is up to date with 'origin/main'.` | bridge | `you.main`, `you.origin/main`, `origin.main` | HEAD badge moves to `you.main`. `you.main` and `you.origin/main` both name `a1f0`; the stale link from `you.origin/main` to `origin.main` (on `c9d1`) is highlighted. `origin.rate-limit` is gone. | Next morning Git says your `main` is up to date with `origin/main`. It compared two files on your laptop, `main` and `origin/main`, both on `a1f0`. It did not ask GitHub. Your `origin/main` is only what you saw at your last fetch; origin's real `main` moved to `c9d1` yesterday. |
| 6 | fetch | Tue 09:16 | you | `git fetch` → `From github.com:acme/shop` / `   a1f0..c9d1  main       -> origin/main` | bridge | `you.b7c2`, `you.c9d1`, `you.origin/main`, `you.main` | `b7c2` (1,1) and `c9d1` (2,0) cross from origin into your grid. `you.origin/main` moves `a1f0`→`c9d1`; its link heals. `you.main` stays on `a1f0` (HEAD badge still on it); `feature/search` stays on `d4e2`. | `git fetch` downloads `b7c2` and `c9d1` and moves `origin/main` from `a1f0` to `c9d1`. That is the only ref it moves. Your own `main` still names `a1f0`, and `feature/search` is untouched: fetching downloads, it does not integrate. Integrating is a separate step, and you choose how. |
| 7 | diverged | Tue 09:17 | you | `git switch feature/search` → `Switched to branch 'feature/search'` / `Your branch is up to date with 'origin/feature/search'.` | you | `you.d4e2`, `you.c9d1`, `you.a1f0` | HEAD badge back on `feature/search`. Your grid shows two lines leaving `a1f0`: `d4e2` (row 2) and `b7c2`→`c9d1` (rows 1 and 0). | Your graph now shows two lines leaving `a1f0`: your `d4e2`, and Sam's work ending at `c9d1` on `origin/main`. The histories have diverged. Before opening a pull request, you bring Sam's work into your branch so your code is tested against today's `main`. Git gives you two ways, and they leave different history. |

Choice point at beat 7: "How do you bring Sam's work into `feature/search`?"
- `rebase`: "Rebase your branch onto origin/main" → path `rebase`
- `merge`: "Merge origin/main into your branch" → path `merge`

### rebase (6 beats)

| # | id | Time | Actor | Command → output | Shot | Focus | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|---|
| 1 | rebase-copies | Tue 09:20 | you | `git rebase origin/main` → `Successfully rebased and updated refs/heads/feature/search.` | you | `you.f1a3`, `you.d4e2`, `you.feature/search`, `you.origin/feature/search` | New `you.f1a3` at (2,2), parent `c9d1`, message "Add search". `feature/search` moves `d4e2`→`f1a3`. `you.d4e2` stays in place, still `live`, named by `origin/feature/search`. | Rebase replays your change on top of `c9d1` as a new commit, `f1a3`. Same message, same change, but a different parent, so a different hash: a commit can never be edited. `feature/search` moves to the copy. The original `d4e2` still exists, because `origin/feature/search` still names it. |
| 2 | rebase-push-rejected | Tue 09:22 | you | `git push` → `To github.com:acme/shop.git` / ` ! [rejected]        feature/search -> feature/search (non-fast-forward)` / `error: failed to push some refs to 'github.com:acme/shop.git'` / `hint: Updates were rejected because the tip of your current branch is behind` / `hint: its remote counterpart.` | bridge | `origin.feature/search`, `origin.d4e2`, `you.f1a3` | Nothing crosses. `origin.feature/search` still names `d4e2`; `you.feature/search` names `f1a3`. The path from `f1a3` back through `c9d1` to `a1f0` never passes `d4e2`. | Origin refuses. Its `feature/search` names `d4e2`, and a plain push may only move a branch forward to a descendant. `f1a3` does not descend from `d4e2`: it replaced it. Accepting would drop `d4e2` from origin's branch, so Git calls it non-fast-forward. This is the price of rewriting a branch you already pushed. |
| 3 | rebase-force-with-lease | Tue 09:23 | you | `git push --force-with-lease` → `To github.com:acme/shop.git` / ` + d4e2...f1a3 feature/search -> feature/search (forced update)` | bridge | `origin.feature/search`, `origin.f1a3`, `origin.d4e2`, `you.origin/feature/search`, `you.d4e2` | `f1a3` crosses to origin (2,2). `origin.feature/search`→`f1a3`; `origin.d4e2` turns `unreachable`. `you.origin/feature/search`→`f1a3`; `you.d4e2` turns `reflog-only`. | The lease: overwrite origin's branch only if it still names `d4e2`, the commit your `origin/feature/search` recorded. It does, so the branch jumps to `f1a3`. Had Sam pushed to your branch meanwhile, this would fail instead of erasing their commit; plain `--force` checks nothing. `d4e2` is now unreachable on origin, and only your reflog remembers it. |
| 4 | rebase-open-pr | Tue 09:30 | you | `gh pr create --fill` → `Creating pull request for feature/search into main in acme/shop` / `https://github.com/acme/shop/pull/7` | ship | `origin.pr-7`, `ci.job`, `ci.checkout` | Origin rail gains `PR #7` (`open`, head `feature/search`→`f1a3`, base `main`→`c9d1`). CI: `job` `running`, `checkout` `refs/pull/7/merge`. | You open pull request #7: a request, stored on GitHub, to merge `feature/search` into `main`. Opening it starts the team's CI workflow. A fresh runner checks out what `main` would look like after the merge and runs the tests there, not on your laptop. |
| 5 | rebase-ci-passes | Tue 09:34 | ci | `npm test` → `  42 passing (3s)` | ship | `ci.job` | `ci.job` turns `passed`; `PR #7` shows a passing check. | The tests pass on `f1a3` combined with `c9d1`, the same code `main` will hold after the merge. `main` is protected: a passing check and an approving review are both required before anyone can merge. Sam reviews the change and approves it. |
| 6 | rebase-merged | Tue 10:05 | you | none: you click "Merge pull request" on #7 | origin | `origin.0b3e`, `origin.main`, `origin.pr-7` | Origin gains `0b3e` at (3,1), parents `c9d1` and `f1a3`; `origin.main`→`0b3e`; `PR #7` turns `merged`; `origin.feature/search` turns `deleted`. `origin.d4e2` stays `unreachable`. | You merge pull request #7. Origin writes merge commit `0b3e` with parents `c9d1` and `f1a3`, and moves `main` there. Your feature joins `main` as one commit sitting on top of Sam's work, with no catch-up merge inside it. `d4e2`, the commit you first pushed, appears nowhere in `main`'s history. |

Outcome (ending): Rebasing bought a linear branch: one commit on top of today's `main`, and no merge commit except the pull request's own. It cost your commit a new SHA and a force push, which was safe only because nobody else had built on `feature/search`.

### merge (5 beats)

| # | id | Time | Actor | Command → output | Shot | Focus | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|---|
| 1 | merge-in | Tue 09:20 | you | `git merge origin/main` → `Merge made by the 'ort' strategy.` / ` src/rateLimit.ts \| 18 ++++++++++++++++++` / ` 1 file changed, 18 insertions(+)` | you | `you.e5a6`, `you.d4e2`, `you.feature/search` | New `you.e5a6` at (2,2), parents `d4e2` and `c9d1`, message "Merge remote-tracking branch 'origin/main' into feature/search". `feature/search` moves `d4e2`→`e5a6`. `d4e2` unchanged. | Merge writes a new commit, `e5a6`, with two parents: your `d4e2` and `c9d1`. Nothing is rewritten: `d4e2` keeps its hash and its place, and `feature/search` moves forward to `e5a6`. The graph records what really happened: you branched from `a1f0` and caught up with Sam's work on Tuesday. |
| 2 | merge-push | Tue 09:22 | you | `git push` → `To github.com:acme/shop.git` / `   d4e2..e5a6  feature/search -> feature/search` | bridge | `origin.e5a6`, `origin.feature/search`, `you.origin/feature/search` | `e5a6` crosses to origin (2,2). `origin.feature/search` moves `d4e2`→`e5a6`; `you.origin/feature/search`→`e5a6`. Every commit on both sides stays `live`. | A plain push succeeds. Origin's `feature/search` names `d4e2`, and `e5a6` descends from it, so origin simply moves the branch forward: a fast-forward. No force, no lease, nothing dropped. Anyone who had fetched `d4e2` still finds it inside the new history. |
| 3 | merge-open-pr | Tue 09:30 | you | `gh pr create --fill` → `Creating pull request for feature/search into main in acme/shop` / `https://github.com/acme/shop/pull/7` | ship | `origin.pr-7`, `ci.job`, `ci.checkout` | Origin rail gains `PR #7` (`open`, head `feature/search`→`e5a6`, base `main`→`c9d1`). CI: `job` `running`, `checkout` `refs/pull/7/merge`. | You open pull request #7: a request, stored on GitHub, to merge `feature/search` into `main`. Opening it starts the team's CI workflow. A fresh runner checks out what `main` would look like after the merge and runs the tests there, not on your laptop. |
| 4 | merge-ci-passes | Tue 09:34 | ci | `npm test` → `  42 passing (3s)` | ship | `ci.job` | `ci.job` turns `passed`; `PR #7` shows a passing check. | The tests pass on your branch combined with `main`: the same code `main` will hold after the merge. `main` is protected: a passing check and an approving review are both required before anyone can merge. Sam reviews the change and approves it. |
| 5 | merge-merged | Tue 10:05 | you | none: you click "Merge pull request" on #7 | origin | `origin.9c4f`, `origin.main`, `origin.pr-7`, `origin.e5a6` | Origin gains `9c4f` at (3,1), parents `c9d1` and `e5a6`; `origin.main`→`9c4f`; `PR #7` turns `merged`; `origin.feature/search` turns `deleted`. | You merge pull request #7. Origin writes `9c4f` with parents `c9d1` and `e5a6`, and moves `main` there. `main`'s history now holds two merge commits for your feature: the pull request's and your catch-up `e5a6`. Every commit keeps the hash it was pushed with, including `d4e2`. |

Outcome (ending): Merging preserved the true history: every SHA you pushed survives, and every push was a plain fast-forward, safe even on a branch others share. It cost an extra merge commit, so the log shows a non-linear detour.

Aha beats:

- main#5 `looks-up-to-date`: breaks "`origin/main` is GitHub's `main`" and "up to date means up to date with the server". Test: at this beat `isStale(step, 'you.origin/main')` is true (`a1f0` vs `c9d1`), and it turns false only at `fetch`.
- rebase#1 `rebase-copies`: breaks "rebase moves my commit". Test: `you.d4e2` and `you.f1a3` both exist with the same message and different parents, and `d4e2` is still reachable from `you.origin/feature/search`.
- rebase#2 `rebase-push-rejected`: breaks "once I've integrated `main`, my push will go through". Test: `isAncestor(route, 'you', 'd4e2', 'f1a3')` is false while `origin.feature/search` names `d4e2`; the contrast test on `merge-push` shows `isAncestor(…, 'd4e2', 'e5a6')` is true.

## Claim sources

"Report" is `docs/RESEARCH/Git 20_80 Learning Guide.md`; "HEAD section" is its "HEAD, Detached HEAD, the Reflog, and Garbage Collection"; "Remotes section" is its "Remotes, Remote-Tracking Branches, and Push Rules".

| Beat | Claim | Source |
|---|---|---|
| main 1 | Each clone holds the full history; a branch is a lightweight pointer, not a copy | Report › Core Git Workflow (`git clone` downloads "the entire codebase, history, and branches"); Branching, Merging, and Collaboration; git-q02 |
| main 1–2, 7 | HEAD names the branch that moves on commit; a commit records its parent | HEAD section; Report › Content-Addressable Database |
| main 3 | `git push` uploads local commits to the remote | Report › Core Git Workflow |
| main 3 | `-u` sets upstream and the push creates `origin/feature/search` | Remotes section › Push and upstream (git-push `-u`; Pro Git: network contact moves remote-tracking refs) |
| main 4 | Merging diverged work creates a merge commit with multiple parents | Report › Branching, Merging, and Collaboration; git-q20 |
| main 4 | GitHub PR merge writes a merge commit; the head branch is auto-deleted | Remotes section › GitHub pull requests ("Create a merge commit" is the default method; "Automatically delete head branches" is a repository setting, stated here as a setting assumption because its default is not documented) |
| main 4, 5 | A clone learns of new remote commits only by fetching; `origin/main` is a local ref that stays stale until then; `git switch`/`git status` compare against it without contacting the remote | Remotes section (opening paragraph: local refs moved only on network contact; Upstream and "up to date": counts are "only since the last time you fetched", the command "does not reach out to the servers") |
| main 6 | `git fetch` downloads new commits; integrating is a separate merge step | Report › Core Git Workflow ("git fetch (downloading new commits) and git merge (integrating them...)") |
| main 6 | Fetch moves only remote-tracking refs, never your local branches | Remotes section › Fetch (default refspec writes `refs/remotes/origin/*`; "With default settings, fetch never moves your branches") |
| main 7 | Integrate `main` regularly through merge or rebase | git-q28; Report › Navigating and Rewriting History |
| rebase 1 | Rebase puts your commits onto another tip; any change (here the parent) gives a new hash | Report › Navigating and Rewriting History; Report › Content-Addressable Database; git-q31 |
| rebase 1, 3 | The original commit still exists; reflogs keep commits of rewound branches | HEAD section (git-gc Notes: reflogs "may reference commits in branches that were later amended or rewound"; gc keeps remote-tracking branches) |
| rebase 2 | A push is rejected as non-fast-forward when origin's branch has a commit your push would drop | Remotes section › Push rules (remote tip "must be an ancestor of the source commit"; rewritten commits are rejected); git-q12 |
| rebase 2 | Rewriting a pushed branch has a cost; don't rebase shared public branches | Report › Navigating and Rewriting History; git-q09 |
| rebase 3 | `--force-with-lease` checks origin's branch against your remote-tracking ref; `--force` does not | Remotes section › Rebase and force-with-lease |
| rebase 3 | `d4e2` is unreachable on origin, reflog-only in your clone | HEAD section (reachability; reflog) |
| rebase 4, merge 3 | Pull requests merge a branch into `main`; GitHub Flow | Report › Common Professional Workflows; git-q25 |
| rebase 4, merge 3 | CI starts on opening the PR; the runner checks out `refs/pull/7/merge` | Remotes section › Protected branches and CI (`pull_request` runs on `opened`; `GITHUB_REF` is `refs/pull/<number>/merge`; `actions/checkout` checks it out) |
| rebase 5, merge 4 | `main` protected by required PRs and automated checks | Report › Common Professional Workflows ("protecting important branches like main by requiring pull requests and automated checks"); Remotes section › Protected branches and CI (required approving reviews and status checks) |
| rebase 6 / ending | Rebase gives a linear log with no merge-commit noise | Report › Navigating and Rewriting History (table) |
| merge 1 | Merge preserves history and records where lines joined, with a merge commit | Report › Navigating and Rewriting History; git-q20 |
| merge 2 | Fast-forward: the target moves forward when the old tip is an ancestor | Report › Branching, Merging, and Collaboration (fast-forward merge); Remotes section › Push rules ("if and only if B is a descendant of A") |
| merge 5 / ending | Merge leaves a non-linear log with merge-commit noise; best for shared branches | Report › Navigating and Rewriting History (table) |
| all | 4-character SHAs are valid abbreviations | HEAD section, Abbreviated names |

## UNSOURCED

Resolved on 2026-09-26: the remote-tracking, upstream, push-rule, `--force-with-lease` and GitHub claims formerly listed here are now cited from the Remotes section (see the claim table). Remaining:

- Command output (`git`, `gh`, `remote:` lines) is modelled on current Git and GitHub CLI, not quoted from the research.
- "Automatically delete head branches" being on is a setting assumption; the research notes GitHub does not document its default.

## Owner decisions (2026-09-26)

1. The rejected push lives in the rebase path (`rebase-push-rejected`). Before the choice, the reveal is `git switch main` reporting "up to date with 'origin/main'" while origin's `main` has moved.
2. Both endings merge the pull request with GitHub's "Create a merge commit".
3. The CI runner's role is `bot`.
4. The UNSOURCED claims above are sourced in the Git learning guide's research section on remotes before the model is encoded.
