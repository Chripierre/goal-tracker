# Worklog

Newest entry first. Every entry ends with NEXT so a resuming session knows exactly
where to pick up.

---

## Session 5 — 2026-07-06 (Phase 5, owner remote)

Owner went remote mid-day and cannot mint tokens: Phase 4b (needs owner PAT) and the
Google Calendar OAuth (Phase 11) are DEFERRED until the owner is back at a browser
where he can create credentials. Proceeded to Phase 5, which needs nothing from him.

Shipped challenges: schema v4 (ChallengeRecord keyed by period id), deterministic
ISO-week/month template rotation (8 weekly + 4 monthly tight templates), start ->
milestone checklist with live % -> repo linkage (API create when token exists;
prefilled github.com/new + paste fallback now) -> points-weighted rubric self-score
-> confirm -> archive with score/pct + challenge_completed event -> history with
score badges. 68 tests green (isoWeek edges incl. 2027-01-01 -> 2026-W53, rotation
determinism, scoring math, v3->v4 migration). Browser-verified the full lifecycle
including the confirm dialog (browse dialog-accept) and the dashboard feed entry;
dev-origin test data cleared after QA.

NEXT: Phase 6 — LeetCode stats (needs only the lcUsername the owner can type any
time; community proxy fallback + the GitHub-Actions data pipeline both work without
owner action). After that: Phase 7 Resource Center is CONTENT-HEAVY (batch it),
Phase 8 interview game, Phase 9 analytics. When the owner is back at a desk:
Phase 4b sync PAT, then Google Calendar OAuth walkthrough.

---

## Session 4 — 2026-07-06 (Phase 4)

Shipped GitHub integration; split state sync into Phase 4b (storage-core surgery
deserves its own session — recorded in ROADMAP).

Shipped: lib/github/ (token store in its OWN persist key gt_gh_token so it can never
travel with exports/sync; REST+GraphQL client with 10-min localStorage cache and
GithubError statuses; pure event parser covering 10 event types; heatmap level
buckets) — parser+levels unit tested (59 total). Real Settings page (profile, GitHub
username+token with live /user validation, LeetCode username, export/import/reset —
export excludes the token by construction). GitHub page: profile card, GraphQL
heatmap when token present / ghchart img with dark filter otherwise, activity feed,
repos with stats, skeletons, friendly 403 rate-limit copy. Dashboard GitHub
mini-panel. New nav item (GitBranch icon — lucide 1.x dropped brand icons).

Browser-verified live: feed showed this session's own pushes, repo card showed
goal-tracker, fallback heatmap rendered with today's cells green. Token/GraphQL path
is code-complete but unverified until the owner saves a PAT (heads-up: if GraphQL
rejects fine-grained tokens, recommend a classic token with read:user).

Gotchas learned:
- react-hooks set-state-in-effect also forbids the sync "reset states at effect top"
  pattern for refetch-on-key-change. Fix: keyed child component
  (<GithubData key={user:token}>) so remount resets state naturally.
- The stale console entry from a previous page persists across browse navigations —
  check console AFTER goto, filter by timestamp.

NEXT: Phase 4b — GitHub state sync (multi-device): app-state JSON to a private
goal-tracker-data repo via contents API; last-write-wins on updatedAt; conflict
banner; sync status UI + manual sync; token needs contents write on that repo.
Design questions to settle at start: debounce cadence, pull-on-load ordering, and
guarding against clock skew (consider both updatedAt and a monotonic counter).
Still open: owner GCP setup walkthrough for Google Calendar API (Phase 11);
legacy career-analysis scrub decision; gstack upgrade + onboarding prompts.

---

## Session 3 — 2026-07-06 (Phase 3)

Mid-phase scope pivot from the owner: todos must be PERSONAL and standalone — no
coupling to assignments/challenges/streak/events (no double counting), calendar-first,
Google Calendar as the notification channel. Decision recorded in ROADMAP Phase 3 +
ARCHITECTURE §3 before building. The event union dropped 'todo_completed' (todos
live entirely on the entity; completedAt drives everything).

Shipped: schema v3 (todos array; array order = manual order), recurrence engine
(spawn-on-complete anchored to max(dueDay, today), monthly end-clamping), tombstoneless
entity undo (removes still-open spawned successor), filter/sort/search lib, Google
Calendar all-day template links, quick-add/edit composer, list view with dnd-kit
drag reorder + segmented status + tag-chip filters, month calendar view (chips toggle
completion, overdue red, add-on-day prefills composer, selected-day panel), dashboard
Todos panel. 52 tests green; typecheck/lint/build clean.

Browser-verified on dev server: add (controlled inputs via native setters), recurring
complete -> spawn due +7d with spawnedFrom link, undo from Done tab -> spawn removed +
reopened, calendar chip/day panel/gcal href, dashboard panel counts, fresh-state reload.

Gotchas learned:
- react-hooks `set-state-in-effect` also fires for prop-sync effects — use the
  render-time prev-state adjustment pattern (TodoComposer, same as AppShell drawer).
- updateTodo merges patches, so the composer must submit optional keys as explicit
  undefined to CLEAR them on edit (JSON persist drops undefined keys).
- dnd-kit + React 19: no issues; PointerSensor with distance 5 keeps row clicks working.
- The npm optional-deps lock bug STRUCK AGAIN after the incremental dnd-kit install
  (same "Missing @emnapi/* from lock file" npm ci failure on CI). Durable fix now in
  place: @emnapi/core and @emnapi/runtime are explicit optionalDependencies in
  package.json, so every lock resolution includes them. RULE: after any npm install
  that touches the lock, run `npm ci` locally before pushing.

NEXT: Phase 4 — GitHub integration + sync (ROADMAP): PAT settings page, activity
feed, commit/PR monitor, contribution heatmap (GraphQL w/ ghchart image fallback),
then state sync to a private goal-tracker-data repo. Phase 11 carries the Google
Calendar API OAuth sync (owner GCP setup needed — walk him through console steps).
Still open: owner call on scrubbing self-authored career analysis in legacy/;
gstack upgrade + onboarding prompts deferred.

---

## Session 2 — 2026-07-06 (Phase 2)

Built and shipped Phase 2, the core loop. All gates green locally: typecheck, lint,
34/34 tests, build. Verified interactively in the browser against the dev server:
complete -> streak 0->1 + feed entry + "First step" unlock; undo -> streak drops,
unlock stays (permanent by design); complete all 5 -> "Perfect day" unlock; reload ->
everything persists (7 events incl. the tombstone pair, 2 cached unlocks in gt_v1).

Design decisions locked (details in ROADMAP Phase 2 + code):
- Assignments are GENERATED, never stored: pure function of dayKey over
  src/data/assignmentTemplates.ts. Only completion events persist.
- Undo = tombstone event; latest-per-refId wins (lib/events/completion.ts).
- Streak/day attribution uses the refId's dayKey, not event ts (midnight-safe).
- Achievements: lib/achievements/achievements.ts, evaluated inside
  completeAssignment only; unlocks permanent; schema v2 adds the cache.

Gotchas learned:
- eslint react-hooks now runs React Compiler diagnostics:
  `preserve-manual-memoization` rejects useMemo deps derived from a RETAINED
  mutable Date and memos it can't reproduce. Fix pattern: inline `new Date()` per
  use (keep deps primitive), and drop manual useMemo for cheap derivations.
- Sidebar footer phase label (AppShell.tsx) is static — bump it each phase.
- Prod (github.io) has its own localStorage; dev-server test data does not carry
  over. Fresh start on prod is expected, not a bug.

NEXT: Phase 3 — TODO system (ROADMAP): full todo CRUD with priorities, deadlines,
tags, recurring rules, filter/search/sort, drag-and-drop; completions feed the same
event log (todo_completed already in the event union); overdue surfacing on
dashboard. Also pending: owner call on scrubbing self-authored career analysis in
legacy/; gstack upgrade + onboarding prompts still deferred.

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
