---
name: add-dependency
description: "Supply-chain procedure for changing npm dependencies in Code Executives: adding or bumping a package, fixing npm audit failures, and reviewing the lockfile. Use whenever package.json or package-lock.json changes."
---

Dependency changes are security-sensitive and need the owner's approval (the architect asks; specialists only report the need). Policy lives in `.github/instructions/dependency-security.instructions.md`; this is the procedure.

## Steps

1. **Justify.** Name the need and check that an installed package or a platform API can't cover it. Done when the justification is one sentence in the PR.
2. **Pick the version.** `npm view <pkg> time --json`: choose the newest release that is **≥ 7 days old** (a fresh release is the usual window for a compromised publish). Check `npm view <pkg>@<v> scripts peerDependencies`: install scripts need explicit justification; peers must accept our React/three versions.
3. **Install exact.** `npm install <pkg>@<version>` (`save-exact` is on). For dev tools add `-D`.
4. **Review the lockfile diff.** Done when all four hold:
   - every new `node_modules/...` entry is expected (list them in the PR);
   - every `resolved` URL is `https://registry.npmjs.org/`;
   - no new `hasInstallScript: true` without justification;
   - `npm audit --audit-level=high` exits 0 (the CI gate).
5. **Prove CI will accept it.** `rm -rf node_modules && npm ci --ignore-scripts`, then confirm `git diff --exit-code -- package-lock.json` is clean. CI runs npm 10.9.3 with a frozen lockfile.
6. **Verify the app.** `npx tsc -b`, `npm run lint`, `npm run test:run`, `npm run build`. For browser-only packages, confirm they land in a lazy chunk (`verify-viz` has the check for three.js).

## Fixing a failing audit gate

`npm audit --audit-level=high` fails CI on advisories published after the last green run, even with no dependency change. Bump the direct packages named in `fixAvailable` to patched releases (step 2's age rule applies), then `npm audit fix` for transitive ones. `npm audit fix --force` and major upgrades are separate, reviewed changes.

## Gotchas

- **npm 10 `Cannot read properties of null (reading 'edgesOut')`** on install: resolve once with `npx -y npm@11 install`, then run `npm install --ignore-scripts` with the repo's npm 10 so it restores the optional-peer entries (e.g. `@emnapi/*`) npm 11 omits, then repeat step 5.
- **Global JSX types**: `@react-three/fiber` augments JSX, so a bare `React.ElementType` rejects `className`. Type icon props as `LucideIcon`.
- **Bundling**: a `manualChunks` rule that names a lazily used library can pull it into the entry graph. Let Rollup split on the dynamic import.
