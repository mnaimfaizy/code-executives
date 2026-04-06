# Dependency and Supply Chain Security Plan

Last updated: 2026-04-06

## Purpose

This document records the current npm and CI supply-chain posture of the Code Executives repository and the measures required to reduce dependency compromise risk. It is written for future maintenance, incident response, and dependency-review work.

## Current Repository Assessment

### Confirmed facts from this repository

- The project is an npm-based React and Vite application with a committed `package-lock.json`.
- The repository is now explicitly npm-only via `packageManager: npm@10.9.3`.
- Direct dependencies are pinned to exact versions, and `.npmrc` is configured with `save-exact=true` to avoid introducing new `^` or `~` ranges by default.
- `package.json` now includes Axios override guardrails so the compromised releases `axios@1.14.1` and `axios@0.30.4` are replaced with safe versions if Axios is ever introduced.
- The current CI workflow already uses `npm ci`, which is the correct baseline for reproducible installs.
- The current lockfile does not contain `axios`, so the March 2026 Axios incident is not an active dependency in this repository today.
- The directly vulnerable top-level packages have been upgraded to `happy-dom@20.8.9`, `react-router-dom@7.14.0`, and `vite@7.1.12`.
- The remaining transitive advisories have been remediated with `npm audit fix`.
- The current lockfile includes packages with install-time scripts. Confirmed examples include `@tailwindcss/oxide`, `esbuild`, and `fsevents`.
- The repository currently has one GitHub Actions workflow and one workspace instruction file.

### Vulnerability snapshot from `npm audit --json`

- Total advisories: 0
- Severity breakdown: 0 critical, 0 high, 0 moderate, 0 low
- Resolved dependency footprint in the lockfile: 590 packages
- The earlier direct and transitive findings have been remediated.
- This is a reduction from the earlier 13 advisories to a clean audit result.

### Current CI posture and remaining governance gaps

- The main CI workflow now pins all referenced actions to full commit SHAs.
- The workflow now declares explicit least-privilege permissions with `contents: read` at the workflow level.
- A pull-request dependency review job has been added and is configured to fail when a PR introduces moderate-or-higher vulnerabilities in `development`, `runtime`, or `unknown` scopes.
- The workflow now includes a `Secure Install Review` job that runs `npm ci --ignore-scripts` for metadata-only dependency review before the regular build jobs.
- The workflow now verifies that `package-lock.json` remains unchanged after every `npm ci` run.
- Dependabot is configured for npm and GitHub Actions updates.
- `CODEOWNERS` now protects workflows, dependency manifests, lockfiles, and security documentation.
- A repository `SECURITY.md` policy file now defines supported branches and private reporting expectations.

### Local tooling observations

- `npm audit signatures` did not produce a usable provenance result in the current local workspace.
- `npm config get min-release-age` returns `undefined`, so the current npm CLI should not be assumed to support release-cooldown policy yet.
- Because this repository currently relies on install-time script packages, a blanket `ignore-scripts=true` policy for normal local installs would be disruptive unless the toolchain is changed first.
- The practical safe flow for this repo is: review dependencies first with `npm ci --ignore-scripts` in a disposable environment or dedicated CI job, then use normal `npm ci` only when build or test execution is actually required.

### Validation after remediation

- `npm run test:run` passes: 10 test files, 76 tests.
- `npm run build` passes with Vite `7.1.12`.
- `npm audit --json` reports 0 known vulnerabilities.
- `npm run lint` completes with no errors or warnings.

## Axios 2026 Lessons That Apply Here

Public reporting in March and April 2026 described a real compromise of the npm `axios` package through a maintainer-account takeover. The reported malicious releases were `axios@1.14.1` and `axios@0.30.4`, and multiple incident write-ups also identified a malicious dependency path involving `plain-crypto-js`.

The useful lesson for this repository is not "avoid Axios only." The lesson is that package popularity does not reduce supply-chain risk. Controls must assume that any popular package, including foundational web tooling, can become hostile for a short window.

Required takeaways:

- Lockfile discipline matters because it prevents silent resolver drift.
- Dependency updates need review, not blind automation.
- Provenance and signature verification should run in CI on installed dependencies.
- Install-time scripts must be treated as executable code, not metadata.
- Secrets used by CI or package publishing flows must be minimized or removed.

## Required Measures

### 1. Immediate actions for this repository

1. Completed 2026-04-06: upgraded `happy-dom` to `20.8.9` and regenerated the lockfile.
2. Completed 2026-04-06: upgraded `react-router-dom` to `7.14.0` and regenerated the lockfile.
3. Completed 2026-04-06: upgraded `vite` to `7.1.12` and regenerated the lockfile.
4. Completed 2026-04-06: remediated the remaining transitive advisories with `npm audit fix`.
5. Review the lockfile diff for all newly introduced packages and call out any package with install-time scripts.

### 2. Immediate organization-wide actions related to Axios

1. Search all active repositories, CI caches, artifact caches, and developer workstations for `axios@1.14.1`, `axios@0.30.4`, and `plain-crypto-js`.
2. Block those versions in any internal registry or proxy if one exists.
3. If any environment installed those versions, rotate developer, CI, cloud, and package-registry secrets that were present on the host at install time.
4. Rebuild affected environments from a clean baseline instead of attempting in-place trust restoration.

### 3. CI and workflow hardening

1. Completed 2026-04-06: pinned all referenced GitHub Actions in the main CI workflow to full commit SHAs.
2. Completed 2026-04-06: added explicit workflow permissions with a least-privilege default.
3. Completed 2026-04-06: added a pull-request dependency review job so manifest and lockfile changes are surfaced before merge.
4. Completed 2026-04-06: added Dependabot for both npm dependencies and GitHub Actions updates.
5. Completed 2026-04-06: protected `.github/workflows/**`, `package.json`, and `package-lock.json` with `CODEOWNERS` review.
6. Completed 2026-04-06: enforced frozen lockfile checks after `npm ci` in CI.
7. Completed 2026-04-06: added a no-scripts dependency review install stage with `npm ci --ignore-scripts`.
8. Keep preferring OIDC-based authentication over long-lived cloud or registry secrets in workflows.

### 4. Package manager policy

1. This repository is npm-only. Do not use Yarn or pnpm here unless the repo is formally migrated and equivalent security controls are added.
2. Keep `package-lock.json` committed at all times.
3. Use `npm ci` in CI and automation. Avoid `npm install`, `npm update`, and `npm audit fix` in CI because they can rewrite the lockfile or change resolution behavior.
4. Verify that `package-lock.json` remains unchanged after every CI install.
5. Use exact versions for direct dependencies. Avoid `^` and `~`, and keep `.npmrc` configured with `save-exact=true`.
6. For metadata-only dependency review, prefer `npm ci --ignore-scripts` in disposable environments or dedicated security jobs.
7. Do not enable a blanket `ignore-scripts=true` setting for normal local installs yet. This repository currently depends on toolchain components that use reviewed install-time scripts.
8. Preserve the Axios override guardrails in `package.json` so the compromised releases `1.14.1` and `0.30.4` cannot be selected.
9. Re-evaluate release cooldown controls such as `min-release-age` after upgrading npm to a version that supports them.
10. If the organization manages multiple apps, strongly consider an internal npm proxy or policy-enforcing registry so newly published public packages can be delayed or blocked centrally.

### 5. Approval checklist for new dependencies

Every new direct dependency should answer all of the following before merge:

1. Why is a new package necessary instead of existing code, browser APIs, or an already-approved dependency?
2. What is the exact version being introduced?
3. Does it add install-time scripts, native binaries, or external network behavior?
4. Does it significantly expand the transitive dependency graph?
5. Does it have open advisories, suspicious publish patterns, or a weak maintainer posture?
6. Is there a simpler or better-maintained alternative?

### 6. Incident response playbook for dependency compromise

1. Detect: identify the compromised package, versions, affected repos, and affected build agents.
2. Contain: block the versions, stop builds that resolve them, and freeze related dependency updates.
3. Eradicate: remove the package, clear package caches, and rotate any reachable secrets.
4. Recover: rebuild from a known-good lockfile, re-run audit and provenance checks, and compare the new SBOM to the prior one.
5. Review: document timeline, blast radius, and permanent control changes in `docs/SECURITY`.

## Commands To Use During Reviews

```bash
npm audit --json
npm audit --audit-level=high
npm outdated --json
rg '"axios"' package-lock.json
rg 'hasInstallScript' package-lock.json
```

If dependencies are installed locally or in CI, also run:

```bash
npm audit signatures
npm sbom --sbom-format cyclonedx
```

## Planned Follow-up Work

- Add `docs/SECURITY/README.md` if this folder grows beyond one policy document.
- Review Dependabot PR cadence after a few update cycles and tune grouping or limits if it creates too much churn.
- Add OIDC-based authentication if future workflows need cloud or package-registry access.
- If the repo is ever migrated to Yarn or pnpm, mirror the current npm protections with immutable lockfile mode, disabled lifecycle scripts by default, and equivalent Axios version blocking.

## References

- npm docs: `npm audit`, `npm audit signatures`, trusted publishing, and scopes
- GitHub docs: security hardening for GitHub Actions, dependency review, Dependabot, and `GITHUB_TOKEN` permissions
- Public Axios incident reporting from March and April 2026, including Snyk, Dark Reading, Mondoo, eSentire, and SANS summaries
