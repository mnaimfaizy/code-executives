---
description: 'Use when changing npm dependencies, package-lock.json, .npmrc, or GitHub Actions workflows. Covers supply-chain security review, exact version pinning, install-script review, dependency incident response, and CI hardening for compromised packages such as Axios.'
name: 'Dependency and Workflow Security'
applyTo:
  - package.json
  - package-lock.json
  - .npmrc
  - .github/workflows/**
  - .github/dependabot.yml
  - docs/SECURITY/**
---

# Dependency and Workflow Security

- Treat any dependency, lockfile, registry, or workflow change as security-sensitive.
- This repository is npm-only. Do not introduce Yarn or pnpm for this repo unless the package manager migration is explicitly approved and the security policy is updated.
- Prefer an existing dependency or a platform-native API before introducing a new package.
- For this application repository, use exact versions for direct dependencies. Avoid `^` and `~` in `package.json`, and keep `.npmrc` configured with `save-exact=true`.
- For existing lockfiles, use `npm ci`. For dependency review in disposable environments or dedicated CI security checks, prefer `npm ci --ignore-scripts` first.
- Do not use `npm install`, `npm update`, or `npm audit fix` in CI. CI must use `npm ci` only and fail if `package-lock.json` changes.
- If Yarn or pnpm are ever introduced elsewhere, require their immutable or frozen lockfile mode and disable lifecycle scripts unless an explicit allowlist process is in place.
- Before adding or updating a package, check the current advisories, the latest patched version, maintainer health, recent publish activity, and whether the package adds install-time scripts, native binaries, or unusually large transitive churn.
- Review `package-lock.json` diffs for unexpected new packages, registry changes, or install-time script packages.
- Popularity is not a trust signal. Treat high-usage packages such as Axios as high-impact dependencies that still require full review.
- Do not enable a blanket `ignore-scripts=true` policy for normal local installs in this repo without a migration plan because the current toolchain depends on reviewed install-script packages such as `esbuild` and `@tailwindcss/oxide`.
- Keep `package-lock.json` committed. Prefer `npm ci` in CI and reproducible installs over ad hoc `npm install` in automation.
- Keep Axios guardrails in `package.json` overrides so the compromised releases `1.14.1` and `0.30.4` cannot be selected if Axios is introduced directly or transitively.
- When editing GitHub Actions workflows, pin third-party actions to full commit SHAs, set explicit minimal `permissions`, and prefer OIDC over long-lived secrets.
- Require human review for workflow files, dependency manifests, and lockfiles.
- If a package compromise is reported, immediately identify direct and transitive usage, block the affected versions, clear caches, rotate potentially exposed secrets, and record the outcome in `docs/SECURITY/Dependency-Supply-Chain-Security-Plan.md`.
