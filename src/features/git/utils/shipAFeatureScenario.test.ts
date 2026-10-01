import { describe, expect, it } from 'vitest';
import {
  allPickSets,
  getBeat,
  getCommit,
  getCrossings,
  getEntityKeys,
  getPath,
  getPreviousBeat,
  getPullRequestCheck,
  getPullRequestTargets,
  getReachable,
  getRefCard,
  getTrackingLinks,
  getTranscript,
  GRAPH_REGIONS,
  hasHeadBadge,
  isAncestor,
  isFastForward,
  isStale,
  matchesUpstream,
  reachabilityState,
  reachableFrom,
  refTarget,
  routeFor,
  SCENARIO,
  SCENARIO_PATHS,
  timeToMinutes,
  TRACKING_LINKS,
  type ScenarioBeat,
} from './shipAFeatureScenario';

const beat = (id: string) => getBeat(id)!;
const words = (text: string) => text.trim().split(/\s+/).length;
const allBeats = SCENARIO_PATHS.flatMap((p) => p.beats);
const routes = allPickSets().map((picks) => ({
  name: picks.join('>') || 'main',
  route: routeFor(picks),
}));
const castIds = new Set(SCENARIO.cast.map((c) => c.id));
const GIT_SECTIONS = [
  'Introduction',
  'Git Architecture',
  'Three-Tree Model',
  'Object Model',
  'Core Workflow',
  'Branching & Merging',
  'Professional Workflows',
  'History Management',
  'Troubleshooting',
  'Visualization',
];

describe('ship-a-feature scenario shape', () => {
  it('has the approved paths and beat counts', () => {
    expect(SCENARIO.id).toBe('ship-a-feature');
    expect(SCENARIO_PATHS.map((p) => [p.id, p.beats.length])).toEqual([
      ['main', 7],
      ['rebase', 6],
      ['merge', 5],
    ]);
    expect(allBeats).toHaveLength(18);
  });

  it('respects the scenario shape limits', () => {
    const [main, ...others] = SCENARIO_PATHS;
    expect(main.id).toBe('main');
    expect(main.from).toBeUndefined();
    expect(main.beats.length).toBeGreaterThanOrEqual(5);
    expect(main.beats.length).toBeLessThanOrEqual(10);
    for (const p of others) {
      expect(p.beats.length).toBeGreaterThanOrEqual(3);
      expect(p.beats.length).toBeLessThanOrEqual(6);
    }
    expect(allBeats.length).toBeLessThanOrEqual(24);
    expect(allBeats.filter((b) => b.choice).length).toBeLessThanOrEqual(2);
    expect(new Set(allBeats.map((b) => b.id)).size).toBe(allBeats.length);
    expect(new Set(SCENARIO_PATHS.map((p) => p.id)).size).toBe(SCENARIO_PATHS.length);
  });

  it('has a cast with one region each and concepts that are section labels', () => {
    expect(SCENARIO.cast.map((c) => [c.id, c.role])).toEqual([
      ['you', 'developer'],
      ['sam', 'teammate'],
      ['origin', 'server'],
      ['ci', 'bot'],
    ]);
    for (const c of SCENARIO.concepts) expect(GIT_SECTIONS).toContain(c);
  });

  it('puts choices only on last beats, and every option leads to a path that points back', () => {
    for (const p of SCENARIO_PATHS)
      p.beats.forEach((b, i) => {
        if (b.choice) expect(i).toBe(p.beats.length - 1);
      });
    for (const b of allBeats.filter((x) => x.choice))
      for (const o of b.choice!.options) {
        const target = getPath(o.path);
        expect(target).toBeDefined();
        expect(target!.from).toEqual({ beat: b.id, option: o.id });
      }
  });

  it('reaches every path and ends every ending with an outcome', () => {
    const reached = new Set(routes.flatMap((r) => r.route.map((b) => b.id)));
    for (const b of allBeats) expect(reached).toContain(b.id);
    for (const p of SCENARIO_PATHS) {
      const last = p.beats[p.beats.length - 1];
      if (!last.choice) expect(last.outcome, p.id).toBeTruthy();
      for (const b of p.beats.slice(0, -1)) expect(b.outcome).toBeUndefined();
    }
  });

  it('routes picks to beats and stops at an unanswered choice', () => {
    expect(allPickSets()).toEqual([['rebase'], ['merge']]);
    expect(routeFor([]).map((b) => b.id)).toEqual(getPath('main')!.beats.map((b) => b.id));
    expect(routeFor(['nope'])).toHaveLength(7);
    expect(routeFor(['rebase'])).toHaveLength(13);
    expect(routeFor(['merge'])).toHaveLength(12);
    expect(getPreviousBeat('rebase-copies')!.id).toBe('diverged');
    expect(getPreviousBeat('branch-off')).toBeUndefined();
  });

  it('gives every beat a command or an action', () => {
    for (const b of allBeats) expect(b.command ?? b.action, b.id).toBeTruthy();
    expect(beat('rebase-merged').action).toBe('Merged pull request #7 on GitHub');
    expect(beat('merge-merged').action).toBe('Merged pull request #7 on GitHub');
  });

  it('builds a transcript of actor, time and command', () => {
    const t = getTranscript(routeFor(['rebase']), 8);
    expect(t).toHaveLength(9);
    expect(t[8]).toMatchObject({ beat: 'rebase-push-rejected', actor: 'you', command: 'git push' });
    expect(t[3]).toMatchObject({
      beat: 'sam-merges',
      actor: 'sam',
      command: undefined,
      action: 'Merged pull request #6 on GitHub',
    });
  });
});

describe.each(routes)('route $name', ({ route }) => {
  it('never goes backwards in time and only uses cast actors', () => {
    for (let i = 1; i < route.length; i++)
      expect(timeToMinutes(route[i].time)).toBeGreaterThanOrEqual(timeToMinutes(route[i - 1].time));
    for (const b of route) expect(castIds).toContain(b.actor);
  });

  it.each(route.map((b) => [b.id, b] as [string, ScenarioBeat]))(
    '%s is internally consistent',
    (_id, b) => {
      expect(words(b.title)).toBeLessThanOrEqual(8);
      expect(words(b.caption)).toBeLessThanOrEqual(60);

      const keys = getEntityKeys(b);
      for (const key of b.focus) expect(keys, key).toContain(key);

      for (const r of GRAPH_REGIONS) {
        const reg = b.regions[r];
        expect(reg.id).toBe(r);
        const shas = new Set(reg.commits.map((c) => c.sha));
        for (const c of reg.commits) {
          expect(c.id).toBe(`${r}.${c.sha}`);
          for (const p of c.parents) expect(shas, `${c.id} parent ${p}`).toContain(p);
          // state as data agrees with reachability
          expect(c.state, c.id).toBe(reachabilityState(b, r, c.sha));
        }
        for (const card of reg.refs) {
          expect(card.id).toBe(`${r}.${card.name}`);
          expect(shas, card.id).toContain(card.target);
        }
        if (reg.head) expect(reg.refs.map((c) => c.name)).toContain(reg.head);
        const cells = reg.commits.map((c) => `${c.cell.col},${c.cell.row}`);
        expect(new Set(cells).size).toBe(cells.length);
        for (const c of reg.commits) {
          expect(c.cell.col).toBeLessThan(4);
          expect(c.cell.row).toBeLessThan(3);
        }
        const slots = [...reg.refs.map((c) => c.slot), ...(reg.pr ? [reg.pr.slot] : [])];
        expect(new Set(slots).size).toBe(slots.length);
        for (const s of slots) expect(s).toBeLessThan(4);
      }
      expect(b.regions.origin.head).toBeNull();

      if (b.regions.origin.pr) expect(getPullRequestTargets(b)).not.toBeNull();

      for (const link of getTrackingLinks(b)) expect(keys).toContain(link.local);
    }
  );

  it('keeps every entity id on one cell or slot along the route', () => {
    const placed = new Map<string, string>();
    const check = (id: string, where: string) => {
      if (placed.has(id)) expect(placed.get(id), id).toBe(where);
      else placed.set(id, where);
    };
    for (const b of route) {
      for (const r of GRAPH_REGIONS) {
        for (const c of b.regions[r].commits) check(c.id, `cell ${c.cell.col},${c.cell.row}`);
        for (const c of b.regions[r].refs) check(c.id, `slot ${c.slot}`);
        const pr = b.regions[r].pr;
        if (pr) check(pr.id, `slot ${pr.slot}`);
      }
      check(b.ci.job.id, `slot ${b.ci.job.slot}`);
      check(b.ci.checkout.id, `slot ${b.ci.checkout.slot}`);
    }
    // the same SHA shares one cell across regions
    const bySha = new Map<string, string>();
    for (const [id, where] of placed)
      if (where.startsWith('cell')) {
        const sha = id.split('.')[1];
        if (bySha.has(sha)) expect(bySha.get(sha), sha).toBe(where);
        else bySha.set(sha, where);
      }
  });

  it('only crosses commits that arrive in the target region on that beat', () => {
    route.forEach((b, i) => {
      for (const x of getCrossings(b)) {
        expect(getCommit(b, `${x.from}.${x.sha}`), x.id).toBeDefined();
        expect(getCommit(b, `${x.to}.${x.sha}`), x.id).toBeDefined();
        expect(getCommit(route[i - 1], `${x.to}.${x.sha}`), x.id).toBeUndefined();
      }
      // conversely, a commit that appears in a region without being written there crossed
      if (i === 0) return;
      for (const r of GRAPH_REGIONS)
        for (const c of b.regions[r].commits)
          if (!getCommit(route[i - 1], c.id)) {
            const crossed = getCrossings(b).some((x) => x.to === r && x.sha === c.sha);
            const written = b.actor === r || (r === 'origin' && b.command === undefined);
            expect(crossed || written, c.id).toBe(true);
          }
    });
  });
});

describe('aha beats', () => {
  it('looks-up-to-date: Git says up to date while origin/main is stale until the fetch', () => {
    const b = beat('looks-up-to-date');
    expect(matchesUpstream(b, 'you.main', 'you.origin/main')).toBe(true);
    expect(b.output).toContain("up to date with 'origin/main'");
    expect(isStale(b, 'you.origin/main')).toBe(true);
    expect(refTarget(b, 'you.origin/main')).toBe('a1f0');
    expect(refTarget(b, 'origin.main')).toBe('c9d1');

    const staleBeats = routeFor([])
      .filter((x) => isStale(x, 'you.origin/main'))
      .map((x) => x.id);
    expect(staleBeats).toEqual(['sam-merges', 'looks-up-to-date']);
    expect(isStale(beat('fetch'), 'you.origin/main')).toBe(false);
    // fetch moved only origin/main, never your branches
    const before = beat('looks-up-to-date');
    const after = beat('fetch');
    expect(refTarget(after, 'you.main')).toBe(refTarget(before, 'you.main'));
    expect(refTarget(after, 'you.feature/search')).toBe(refTarget(before, 'you.feature/search'));
  });

  it('rebase-copies: the rebase writes a copy and the original lives on', () => {
    const b = beat('rebase-copies');
    const orig = getCommit(b, 'you.d4e2')!;
    const copy = getCommit(b, 'you.f1a3')!;
    expect(copy.message).toBe(orig.message);
    expect(copy.parents).not.toEqual(orig.parents);
    expect(copy.sha).not.toBe(orig.sha);
    expect(refTarget(b, 'you.feature/search')).toBe('f1a3');
    expect(reachableFrom(b, 'you.origin/feature/search')).toContain('d4e2');
    expect(reachableFrom(b, 'you.feature/search')).not.toContain('d4e2');
    expect(orig.state).toBe('live');
  });

  it('rebase-push-rejected: the rewritten branch is not a fast-forward of origin', () => {
    const b = beat('rebase-push-rejected');
    expect(refTarget(b, 'origin.feature/search')).toBe('d4e2');
    expect(isAncestor(b, 'you', 'd4e2', 'f1a3')).toBe(false);
    expect(isFastForward(b, 'you.feature/search', 'origin.feature/search')).toBe(false);
    expect(getCrossings(b)).toEqual([]);

    // contrast: merging keeps d4e2 as an ancestor, so the plain push fast-forwards
    expect(isFastForward(beat('merge-in'), 'you.feature/search', 'origin.feature/search')).toBe(
      true
    );
    expect(isAncestor(beat('merge-push'), 'you', 'd4e2', 'e5a6')).toBe(true);
  });
});

describe('derived facts the renderers read', () => {
  it('stale links break where origin moved or deleted a branch', () => {
    const links = (id: string) =>
      Object.fromEntries(getTrackingLinks(beat(id)).map((l) => [l.local, l.stale]));
    expect(links('branch-off')).toEqual({
      'you.origin/main': false,
      'sam.origin/main': false,
      'sam.origin/rate-limit': false,
    });
    expect(links('publish-branch')['you.origin/feature/search']).toBe(false);
    expect(links('sam-merges')).toMatchObject({
      'you.origin/main': true,
      'sam.origin/main': true,
      'sam.origin/rate-limit': true,
    });
    expect(links('rebase-merged')['you.origin/feature/search']).toBe(true);
    expect(TRACKING_LINKS).toHaveLength(4);
  });

  it('force-with-lease leaves d4e2 unreachable on origin and reflog-only in your clone', () => {
    const b = beat('rebase-force-with-lease');
    expect(getCommit(b, 'origin.d4e2')!.state).toBe('unreachable');
    expect(getCommit(b, 'you.d4e2')!.state).toBe('reflog-only');
    expect(getReachable(beat('rebase-merged'), 'origin')).not.toContain('d4e2');
    expect(getReachable(beat('merge-merged'), 'origin')).toContain('d4e2');
  });

  it('moves the HEAD badge with switch', () => {
    expect(hasHeadBadge(beat('branch-off'), 'you.feature/search')).toBe(true);
    expect(hasHeadBadge(beat('looks-up-to-date'), 'you.main')).toBe(true);
    expect(hasHeadBadge(beat('diverged'), 'you.feature/search')).toBe(true);
    expect(hasHeadBadge(beat('diverged'), 'origin.main')).toBe(false);
  });

  it('resolves the PR card and its check from origin and CI', () => {
    expect(getPullRequestTargets(beat('rebase-open-pr'))).toEqual({ head: 'f1a3', base: 'c9d1' });
    expect(getPullRequestTargets(beat('merge-open-pr'))).toEqual({ head: 'e5a6', base: 'c9d1' });
    expect(getPullRequestCheck(beat('rebase-open-pr'))).toBe('pending');
    expect(getPullRequestCheck(beat('merge-ci-passes'))).toBe('passed');
    expect(getPullRequestCheck(beat('diverged'))).toBe('none');
    const merged = beat('rebase-merged');
    expect(merged.regions.origin.pr!.state).toBe('merged');
    expect(getRefCard(merged, 'origin.feature/search')!.state).toBe('deleted');
    expect(beat('rebase-open-pr').ci.checkout.ref).toBe('refs/pull/7/merge');
  });

  it('lists the crossings of push and fetch', () => {
    const c = (id: string) => getCrossings(beat(id)).map((x) => `${x.sha}:${x.from}>${x.to}`);
    expect(c('publish-branch')).toEqual(['d4e2:you>origin']);
    expect(c('fetch')).toEqual(['b7c2:origin>you', 'c9d1:origin>you']);
    expect(c('rebase-force-with-lease')).toEqual(['f1a3:you>origin']);
    expect(c('merge-push')).toEqual(['e5a6:you>origin']);
  });
});
