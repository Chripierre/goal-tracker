# Worklog

Newest entry first. Every entry ends with NEXT so a resuming session knows exactly
where to pick up.

---

## Session 1 — 2026-07-06

Context: repo was created earlier this session (initial commit of the legacy vanilla
app) and pushed to github.com/Chripierre/goal-tracker over the `github-chripierre`
SSH alias.

Done:
- Read owner brief (`Prompt.txt`); adopted its development process.
- Analyzed legacy codebase (findings in ARCHITECTURE.md §1).
- Settled stack and architecture (ARCHITECTURE.md §2-9). Keystone: append-only
  ActivityEvent log; all stats/streaks/achievements derive from it.
- Wrote continuity docs (README, ARCHITECTURE, ROADMAP, WORKLOG).
- Phase 1 built end to end: scaffold, tokens, shell, storage core,
  streak engine, dashboard skeleton, ESLint/Prettier, CI+Pages workflow, interim README.
  All green locally: typecheck clean, 14/14 tests, lint clean, build 268ms (96KB gz).

Resolved versions (npm picked newer majors than planned; all compatible): Vite 8.1.3,
React 19.2.7, React Router 8.1, Tailwind v4, Vitest 4.1.9, lucide-react 1.23.

Gotchas learned:
- `@fontsource-variable/*` bare imports fail TS (TS2882) — import `<pkg>/index.css`.
- New react-hooks lint flags setState-in-effect — drawer close on navigation uses the
  render-time `prevPath` adjustment pattern instead (AppShell.tsx).
- PowerShell 5.1 has no `&&`; `ssh-keygen -N ""` must run under Git Bash, not PS.
- No gh CLI on this machine — CI status is invisible for private repos; consider
  installing gh (would also simplify future repo automation). Public-repo runs ARE
  visible via unauthenticated REST (runs + per-step jobs), but job LOGS need admin.
- Two-stage `npm install` on Windows wrote a lock missing `@emnapi/*` (wasm fallback
  deps of Tailwind oxide) -> `npm ci` failed on CI (EUSAGE "Missing ... from lock
  file"). Fix: delete package-lock.json + node_modules, single fresh `npm install`,
  verify with a local `npm ci` before pushing.
- `configure-pages` `enablement: true` cannot create the Pages site with the default
  workflow token (needs admin) -> one-time manual toggle required: repo Settings ->
  Pages -> Source: GitHub Actions. CI check job green on CI as of this session.

HOSTING DECISION (owner): repo goes PUBLIC after a privacy scrub (GitHub Pages on
Free requires public). Scrub performed this session:
- legacy/tracker.js: PROSPECTS (22 third-party names/LinkedIn profiles) and
  BUILT_IN_APPS (application strategy notes) removed; private copies live outside
  the repo in Desktop\goal-tracker-private\.
- Identity/account references removed from process notes; machine paths generalized
  to %USERPROFILE% here and in legacy/HANDOFF.md.
- Git history squashed to a single clean initial commit with a repo-local author
  identity (Chripierre noreply email) so no prior-account metadata survives.
Residue caveat: force-pushed-away commits can remain fetchable on GitHub by raw SHA
until garbage-collected. For zero residue: delete the GitHub repo, recreate it empty
(same name, private), have the agent re-push, then flip public.

DEPLOYED AND VERIFIED (session end): owner made repo public and set Pages source
to GitHub Actions; CI fully green; https://chripierre.github.io/goal-tracker/ live.
Browser smoke test via gstack /browse passed: zero console errors on load, dashboard
renders (greeting, 4 stat cards, module grid), sidebar SPA nav works, deep link
/leetcode 404-redirects correctly into the router, mobile 375px layout correct.
Note: deep links log ONE expected console 404 (the initial response before the
spa-github-pages redirect) — by design, not a bug. Browse gotcha: @e refs went
stale between calls; scoped CSS selectors (nav[aria-label="Primary"] a[href=...])
are the reliable fallback.

PHASE 1 COMPLETE.

NEXT:
1. Phase 2 (ROADMAP): daily assignment engine (generator + rotation over seed
   tasks ported from legacy TASKS array), completion flow appending events,
   dashboard v1 (streak flame, today panel, recent activity feed), history view,
   achievements groundwork. Engines are pure functions in src/lib/ with tests.
2. Owner judgment call, still open: remaining legacy content is self-authored
   career analysis (GAPS narratives, job-lead notes) — public by choice; gets the
   same scrub treatment on request.
3. Housekeeping: gstack upgrade 1.58.3.0 -> 1.58.5.0 available; gstack one-time
   onboarding prompts (telemetry/proactive/lake) deferred during smoke test.
