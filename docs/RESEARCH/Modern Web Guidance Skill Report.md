# **Modern Web Guidance (GoogleChrome/modern-web-guidance): Evaluation for Code Executives**

Research for GitHub issue #148, "investigate and include this skill modern-web-guidance". Primary sources only. Pinned commit: `84ae7251ee919239d5ea85aef25897983f26601e` (release v0.0.191, 2026-09-28), https://github.com/GoogleChrome/modern-web-guidance/commit/84ae7251ee919239d5ea85aef25897983f26601e. The npm tarball `modern-web-guidance@0.0.191` was downloaded and inspected locally.

## **1. What it is, who maintains it, licence, maturity**

- It is a skill plus CLI that gives coding agents expert-written, Baseline-aware guides on modern HTML, CSS and browser JavaScript, so agents stop generating legacy patterns. The README calls it "a set of skills that embed web platform expertise... directly into your coding agents" and says it is supported by the Google Chrome team, the Microsoft Edge team and the community (README at the pinned SHA: https://github.com/GoogleChrome/modern-web-guidance/blob/84ae7251ee919239d5ea85aef25897983f26601e/README.md).
- GoogleChrome/modern-web-guidance is only a **publish target**. Contributions and issues go to `GoogleChrome/modern-web-guidance-src` (CONTRIBUTING.md at the pinned SHA; `package.json` `repository.url` points to the same source repo).
- npm maintainers: paulirish, rviscomi, hoten, micahjo7 (`npm view modern-web-guidance maintainers`). The npm package homepage is https://developer.chrome.com/docs/modern-web-guidance (`.codex-plugin/plugin.json`).
- Licence: Apache-2.0 (GitHub API licence field; `LICENSE` is the standard Apache text, 11,358 bytes). The npm tarball adds a `THIRD_PARTY_NOTICES` file (MIT notice for @huggingface/jinja and others bundled into the CLI). The README Attribution section says parts of the docs derive from MDN Web Docs (Mozilla contributors), W3C, WHATWG and IETF specifications.
- Maturity: the README labels it a **preview release**. The repo was created 2026-03-23. As of 2026-10-02 it had about 2,370 stars, 87 forks, 1 open issue, and was not archived. The latest push was 2026-09-28. The commit history spans 209 commits (GitHub API `commits` pagination). The version is 0.0.191, with weekly-ish "Release vX" commits (v0.0.188 on 2026-09-11, v0.0.189 on 09-14, v0.0.190 on 09-21, v0.0.191 on 09-28). The content churns quickly. The README cites eval results, but the evals live in the source repo and were not verified here.

## **2. File layout, skill format, installation**

Layout at the pinned SHA (git tree API):

- `skills/modern-web-guidance/SKILL.md` (6.7 KB): the skill entry point.
- `skills/modern-web-guidance/guides/<category>/<id>.md`: about 150 guides in 14 category folders. Each is plain Markdown with no frontmatter. It opens with an H1, gives the rationale, then "How to implement" and "Example code" sections, plus fallback and browser-support notes (sample: `guides/performance/optimize-image-priority.md`).
- `skills/chrome-extensions/SKILL.md` plus `references/extensions/*.md` (19 files) and `references/webstore/*.md` (4 files): a second skill pack for Chrome extensions (Manifest V3, Web Store publishing). It is irrelevant to this site.
- Per-harness plugin manifests: `.claude-plugin/plugin.json` and `marketplace.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.github/plugin/plugin.json`, `.grok-plugin/`, `.agents/plugins/marketplace.json`, `gemini-extension.json`, `kimi.plugin.json`, and `policies/modern-web-guidance.toml` (Gemini policy: ask the user before running a shell command matching "modern-web").
- **Not in the git repo, only in the npm tarball**: `skills/modern-web-guidance/modern-web.mjs` (71 KB CLI), `search.mjs` (852 KB bundled search code), `tfjs_model_minilm/` (23 MB MiniLM model), `use-cases.vectors.gen.json.gz`, `watchdog/main.js`, `skill-version.txt` (`2026_09_04-7de96777`). The tarball's unpacked size is 37.8 MB. The `bin` entry in the repo's `package.json` therefore points at a file the repo does not contain.

SKILL.md frontmatter (verbatim fields): `name: modern-web-guidance` and a multi-line `description`. The description says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks", lists triggers (dialogs, popovers, anchor positioning, container queries, `:has()`, View Transitions, scroll-driven animation, CWV, forms, "Adapting layout/styles in React, Vue, Angular") and explicit non-triggers (backend, CI/CD, Python, ESLint, Git). The body tells the agent to:

1. Run `npx -y modern-web-guidance@latest search "<query>" --skill-version <ver>`. The result is JSON with id, description, category, featuresUsed, tokenCount and similarity.
2. Run `npx -y modern-web-guidance@latest retrieve "<id>"`.
3. Verify the implementation against the guide. By default, Baseline Widely available features need no fallback. Newer features need the guide's fallback unless the user has declared a browser-support policy. The skill also suggests recording that policy in CLAUDE.md or AGENTS.md. On Windows it says to use `npx.cmd`, and it says to allowlist `npx -y modern-web-guidance@latest *` specifically.

The skill therefore **depends on the npx CLI at runtime**. The guides are not meant to be read directly from disk.

Install routes (README "Quickstart" and "Alternative Installation Methods"):

- `npx modern-web-guidance@latest install`. In the tarball this shells out to `npx -y skills add GoogleChrome/modern-web-guidance --skill modern-web-guidance` (the Vercel "skills" CLI); `modern-web.mjs` lines ~1915-1945).
- `npx skills add GoogleChrome/modern-web-guidance` or `gh skill install GoogleChrome/modern-web-guidance`.
- Claude Code: `/plugin marketplace add GoogleChrome/modern-web-guidance`, then `/plugin install modern-web-guidance@googlechrome`.
- Also documented: Copilot CLI (same plugin commands), OpenAI Codex (`codex plugin marketplace add ...`), Google Antigravity, Grok Build, Kimi Code.
- Updating: `npx modern-web-guidance@latest update`, or plugin auto-update.

## **3. Guidance contained**

README says 130 web features and 153 use cases; the git tree has about 150 guide files. Counts by folder (git tree, pinned SHA):

| Folder | Files | Covers |
|---|---|---|
| `accessibility` | 2 | General accessibility guidance and accessible error announcement (aria-invalid synced with visible state) |
| `built-in-ai` | 5 | On-device Prompt API/LanguageModel, Summarizer, Translator, language detection |
| `css` | 15 | `css.md` and `css-layout.md` overviews; container, size and style queries; `:has()`; `calc-size`/`interpolate-size`; fluid scaling; design-token reactivity; `@function`; sibling-index; individual transforms; overflow-clip |
| `forms` | 16 | Autofill (address, payment, sign-in, sign-up), `:user-valid`/`:user-invalid` timing, `field-sizing`, customizable `<select>` and pickers, IME-safe Enter submit, brand-consistent forms |
| `html` | 8 | Custom elements, shadow DOM, declarative shadow DOM, form-associated custom elements, web-component styling and accessibility |
| `js` | 8 | Temporal-style partial time, Intl.DurationFormat, calendars, interval management, global event coordination, reactive state stability |
| `performance` | 26 | LCP and fetch priority, INP diagnosis, long tasks and `scheduler.yield`, `content-visibility`, speculation rules and preloading, `fetchLater` analytics batching, view-transition speed, font sharing, HTML streaming |
| `privacy` | 1 | Privacy overview |
| `pwa` | 1 | Web app origin migration |
| `security` | 10 | Passkeys (5 flows), Trusted Types, Sanitizer API, local network access, security overview |
| `ui-atoms` | 11 | Tooltips, sticky/shrinking headers, scroll progress, responsive tables, carousel effects, light/dark per component |
| `ui-behaviors` | 26 | View Transitions (same-doc, cross-doc, directional), enter/exit animation with `@starting-style`, scroll-driven animation, scrollytelling, popover/dialog/invoker commands, interest invokers, swipe-to-remove, `moveBefore` |
| `ui-components` | 7 | Navigation drawer, toasts, progress ring, scrollspy, spinner, stack drill-down, app tours |
| `visual-design` | 16 | Dark mode, `contrast-color()`, scrollbar styling, text layout, font fallbacks, canvas export and canvas accessibility, WebGL shaders, interactive content in 3D scenes |
| `wasm` | 1 | C++ on the web |
| `webmcp` | 3 | WebMCP agentic forms and JS tools |

## **4. Executables, network calls, dependencies (supply-chain)**

- **Runtime execution of remote code**: the skill instructs `npx -y modern-web-guidance@latest ...`. The `-y` flag and `@latest` mean that every agent run executes whatever was most recently published to npm, with no review. That conflicts with this repo's "exact versions, frozen lockfile, owner approval for dependencies" policy (AGENTS.md "Dependencies"). It also needs outbound network, so it is awkward in sandboxed agents. The README says the CLI works offline once cached.
- Zero declared npm dependencies: `npm view` shows none, and the README states the package is "self-contained" so that supply-chain exposure is low. In practice the package bundles 852 KB of minified-style code and a 23 MB model, which are hard to audit.
- `modern-web.mjs`: `spawnSync("npx", ["-y","skills","add"|"update"|"remove", ...])` for install, update and uninstall. This pulls the third-party `skills` package at run time. `search` and `retrieve` do local work only.
- **Telemetry, on by default**: `modern-web.mjs` (`ClearcutLogger`) spawns `watchdog/main.js` as a child process. It posts to `https://play.googleapis.com/log?format=json_proto` (Google Clearcut). The payload contains the **search query string the agent generated**, returned item ids, retrieved guide ids, OS, tool and skill versions, and bucketed latency. The README says raw user prompts are not collected. Opt out by setting `DISABLE_TELEMETRY=1` (or `true`). Agent-written queries can leak project details such as feature names. The README links this to the Google Privacy Policy.
- Optional file logging via `ENABLE_FILE_LOGGING` and `MODERN_WEB_LOG_DIR`. No postinstall scripts appear in `package.json`.
- Guide Markdown is plain text, but it is prompt-injection surface in principle, as any vendored instruction text is. I read only samples, not all 150 guides.

## **5. Fit with a React 19 + Vite + TS + Tailwind v4 site**

Project stack from `package.json`: react 19.3.0, tailwindcss 4.3.3, vite 7.3.6, three 0.186.1, react-router-dom 7.18.4.

Useful:

- Accessibility (`accessibility.md`, `accessible-error-announcement`), performance (LCP, INP, long tasks, `content-visibility`, speculation rules), and form guides, including the quiz UI.
- `visual-design/dark-mode` and `component-specific-light-dark-theme`: **not applicable**, because AGENTS.md mandates light mode only.
- `visual-design/interactive-content-in-3d-scenes`, `expose-canvas-content-to-browser-features` and `apply-webgl-shaders`: relevant to the optional 3D views, but they are written for plain DOM and canvas, not react-three-fiber.
- Motion guides (View Transitions, scroll-driven animations) must be adapted to respect `useReducedMotion` from `src/shared/hooks`, which AGENTS.md requires.

Mismatches:

- The guides are framework-agnostic plain HTML/CSS/JS. Nothing in the 14 folders is React- or Tailwind-specific (a grep for "tailwind" in the guides returned no hits; React is mentioned in only a handful of files). Adapting them to Tailwind v4 utilities (arbitrary values, `@theme`) is left to the agent.
- Some guides recommend features that are not Baseline-widely available, such as interest invokers, anchor positioning, and `popover="hint"`. These need fallbacks per the skill's own rules, and the repo has no declared browser-support policy yet.
- The skill's description says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks". In this repo that would fire on almost every task. It competes with the existing story pipeline (viz-story-writer, 2D builder, 3D builder), where the visualization rules are set by `step-model` and `verify-viz`, and it adds network and telemetry side effects to routine work.
- The content-focused agents (viz-story-writer, module-quiz-generator) have no use for it. Only `viz-2d-builder` and `viz-3d-builder` could benefit.

Overlap with `.agents/skills/` (read from the repo): `add-dependency` (npm supply-chain procedure), `step-model` (story and scenario spec and step-snapshot contract with templates), and `verify-viz` (done-checklist with `check-lazy-chunk.mjs` and `label-overlap.js`). None covers general web-platform API guidance, so there is **no functional overlap**. The conflicts are procedural. First, ADR 0002 says `.agents/skills/` is the only place skills are edited, and `scripts/sync-agents.mjs` generates `.claude/skills/` copies, while the upstream installer would write into harness-specific directories and bypass `agents:sync` and `agents:check`. Second, `add-dependency` and the AGENTS.md rules forbid unpinned `npx ...@latest`. Third, `.claude/` and `.github/agents/` are generated, so hand-installed plugin files there would drift or be overwritten.

## **6. Recommendation**

**Recommended: do not install the plugin or CLI as-is, and do not vendor the whole repo. If any inclusion is wanted, use a small curated vendor copy (option B); otherwise reference it (option A) and defer.**

- **A. Reference only (lowest risk).** Add a short pointer in docs, or a short line in `viz-2d-builder`/`viz-3d-builder` guidance, to the public docs page https://developer.chrome.com/docs/modern-web-guidance and the repo for humans. This has no supply-chain, telemetry or licence-file cost. Because the content is quickly evolving at v0.0.x, this loses nothing.
- **B. Curated vendor copy.** Create `.agents/skills/modern-web-guidance/` containing a **rewritten, local SKILL.md** with neutral frontmatter (per ADR 0002), a narrow description (UI, accessibility, performance, forms; not "mandatory for everything"), and a hand-picked subset of guides copied under `guides/`, for example accessibility, `accessible-error-announcement`, `optimize-image-priority`, `break-up-long-tasks`, `identify-inp-causes`, `defer-rendering-heavy-content`, `animate-element-entry-exit`, `same-document-transitions`, `required-field-feedback`, and `interactive-content-in-3d-scenes`. The SKILL.md would read the files directly, with **no `npx` step**, no `@latest`, and no telemetry. Then run `npm run agents:sync` and commit the generated files. Pin the source commit SHA in a header comment. Because the guides are Baseline-sensitive, add a "Browser support policy" line to AGENTS.md (light mode only, Baseline widely available by default) before relying on them. Re-sync manually and deliberately, with owner review.
- **C. Install via plugin or `npx skills add`.** Not recommended: it conflicts with ADR 0002 and the dependency rules and enables telemetry by default. If the owner insists, set `DISABLE_TELEMETRY=1`, pin an exact version (`modern-web-guidance@0.0.191`, not `@latest`), allowlist only that exact command, and record the decision as an ADR.

**Licence attribution if vendoring (B):** Apache-2.0 section 4 requires including a copy of the licence (add `LICENSE` or `LICENSE-modern-web-guidance` text in the skill folder), retaining copyright and attribution notices, and marking modified files with a prominent notice that they were changed. Add a `NOTICE`-style header naming "GoogleChrome/modern-web-guidance @ 84ae725, Apache-2.0, portions derived from MDN Web Docs (Mozilla contributors, CC BY-SA 2.5) and W3C/WHATWG/IETF specs". The MDN licence detail is from general knowledge, not from the repo, so confirm it per file before copying. Check upstream's `NOTICE`, if any appears later. The repo tree has no NOTICE file at this SHA.

## **Sources**

- Repo tree, commit and metadata: https://github.com/GoogleChrome/modern-web-guidance/tree/84ae7251ee919239d5ea85aef25897983f26601e
- SKILL.md: https://github.com/GoogleChrome/modern-web-guidance/blob/84ae7251ee919239d5ea85aef25897983f26601e/skills/modern-web-guidance/SKILL.md
- README, CONTRIBUTING, LICENSE, `package.json` and the plugin manifests: same SHA, root and dot-directories
- npm package `modern-web-guidance@0.0.191`, files `skills/modern-web-guidance/modern-web.mjs` and `watchdog/main.js` (inspected locally)
- Project files read: `AGENTS.md`, `docs/adr/0002-agents-directory.md`, `.agents/skills/{add-dependency,step-model,verify-viz}`, `package.json`
- Not checked: the developer.chrome.com docs page and the `modern-web-guidance-src` repository (evals, contributor history).
