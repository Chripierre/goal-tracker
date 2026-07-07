# Roadmap

Status legend: [ ] todo · [x] done · IN PROGRESS marks the active phase.
Order within later phases may flex; finish-verify-document before advancing.

## Phase 0 — Analysis & design docs — DONE 2026-07-06

- [x] Analyze legacy codebase, record weaknesses and keepers
- [x] Settle stack + architecture (ARCHITECTURE.md)
- [x] Phased roadmap (this file), continuity README, WORKLOG

## Phase 1 — Foundation — DONE 2026-07-06

Goal: deployed, navigable, dark, responsive app shell with real storage core and CI.

- [x] Move legacy app (`index.html`, `tracker.css`, `tracker.js`, `serve.py`, `README.txt`, `HANDOFF.md`) to `legacy/`
- [x] Scaffold Vite + React 19 + TS strict + Tailwind v4 (hand-written config; npm resolved Vite 8 / RR 8 / lucide 1.x — all fine)
- [x] Design tokens + global styles (dark-first), fonts bundled
- [x] App shell: sidebar (desktop) / drawer (mobile), topbar, routed placeholder pages for all modules
- [x] Storage core: schema v1 types, zustand persist store (`gt_v1`), versioned migrate, event-log append + selectors
- [x] Streak engine (pure) + unit tests; migrate unit test — proves Vitest harness (14 tests green)
- [x] Dashboard skeleton wired to real store selectors (zeros are honest)
- [x] ESLint flat + Prettier configured; typecheck/lint/test/build all green locally
- [x] `.github/workflows/ci.yml`: check job (typecheck+lint+test+build) + Pages deploy on main
- [x] Interim root `README.md` (honest, professional; full rewrite is Phase 13)
- [x] Push; site live at https://chripierre.github.io/goal-tracker/ (repo public,
      Pages source set to GitHub Actions by owner, CI check + deploy green)
- [x] Browser smoke test of the live site: loads clean (no console errors), dashboard
      renders, SPA nav works, deep-link 404 redirect works, mobile layout verified

## Phase 2 — Core loop: assignments, streak, dashboard v1 — DONE 2026-07-06

- [x] Daily assignment generator — deterministic pure function of dayKey over built-in
      templates (2 rotating pools: study, career); assignments are never stored, only
      completion events (`refId = dayKey/templateId`, label snapshot on the event)
- [x] Complete-assignment flow appends events; undo is an `assignment_uncompleted`
      tombstone (latest-per-refId wins); streak/weekly/monthly derive live, day
      attribution from the refId's dayKey (midnight-safe)
- [x] Dashboard v1: stat cards on real selectors, today panel with inline completion,
      recent activity feed (completions + unlocks, relative time)
- [x] Historical record view — per-day log on Assignments page (last 14 days, perfect badge)
- [x] Achievements groundwork: 6 rules, evaluated on complete, permanent unlock cache
      (survives undo); schema v2 migration
- [x] Browser-verified end to end on dev server (see WORKLOG Session 2)

## Phase 3 — TODO system (personal, standalone) — DONE 2026-07-06

Owner decision (2026-07-06): todos are the owner's PERSONAL list, deliberately
DECOUPLED from assignments/challenges, the streak, and the event log — the same
work must not be counted twice. Calendar-first workflow; Google Calendar is the
chosen reminder channel.

- [x] Todo entities in state (schema v3): priorities, day-granular deadlines, tags,
      categories, recurrence (daily/weekly/monthly; completion spawns the next
      occurrence anchored to max(dueDay, today); undo removes a still-open successor)
- [x] List view: quick-add composer (also inline edit), filters (status/priority/
      category/tag-chip), search, sort (manual/priority/due/created), drag-and-drop
      manual order via dnd-kit (array order IS the manual order)
- [x] Calendar view: month grid, chips on due days (toggle to complete), overdue in
      red, add-on-a-day (+ prefills composer), selected-day panel with full rows
- [x] Per-todo "Add to Google Calendar" link (all-day event template; zero setup)
- [x] Dashboard: standalone Todos panel (due today / overdue / open) separate from
      assignment stats
- [x] Browser-verified end to end (see WORKLOG Session 3)
- MOVED to Phase 11: Google Calendar API OAuth sync (auto-create/update events with
      reminders) — requires owner GCP setup (project, Calendar API, OAuth client ID,
      test-user consent). True SMS is out (Google retired Calendar SMS; would need a
      paid SMS service) — Calendar mobile notifications are the practical channel.

## Phase 4 — GitHub integration — DONE 2026-07-06

Split decision (2026-07-06): state sync moved to its own sub-phase (4b below) —
it rewires the storage core and must not ship rushed alongside UI work.

- [x] Settings page (real): profile name, GitHub username + PAT (local-only, its own
      storage key `gt_gh_token`, never exported/synced; validated via /user on save),
      LeetCode username, data export / import / reset (interim multi-device path)
- [x] GitHub module page (new nav item): profile summary, activity feed (pushes, PRs
      merged/closed, issues, comments, branches, stars, forks, releases),
      repositories with stats; skeleton loading states; 403/404-aware error copy
- [x] Contribution heatmap: GraphQL-rendered when a token is set; ghchart image
      fallback (dark filter) without one — token path untested until owner adds one
- [x] Dashboard: recent GitHub activity mini-panel
- [x] REST responses cached 10 min in localStorage (gt_ghc:*) for rate-limit sanity
- [x] Browser-verified against the live API (see WORKLOG Session 4)

## Phase 4b — GitHub state sync (multi-device) — DEFERRED (owner action needed)

Deferred 2026-07-06: owner is remote-controlling and cannot mint tokens right now.
Resume once the owner saves a PAT with contents write access (Settings). Same
deferral applies to the Phase 11 Google Calendar OAuth setup.

- [ ] App state JSON synced to a private `goal-tracker-data` repo via the contents
      API; last-write-wins on updatedAt with a conflict banner; token needs
      contents write on that one repo; the token itself NEVER syncs
- [ ] Sync status indicator + manual "Sync now"

## Phase 5 — Weekly & monthly challenges — DONE 2026-07-06

- [x] Deterministic generator: ISO-week/month keyed rotation over 8 weekly + 4 monthly
      templates (src/data/challengeTemplates.ts); challenge materializes into state on
      Start (schema v4, id = 2026-W28 / 2026-07); isoWeek + rotation + scoring tested
- [x] Challenge card: requirements, milestone checklist with live %, due day,
      deliverables, testing requirement
- [x] Repo linkage: createRepo via API when a token exists; prefilled github.com/new
      link + paste-URL fallback otherwise (token path untested — owner tokenless)
- [x] Completion flow: rubric self-scoring (points-weighted), confirm dialog, score +
      completion % archived, challenge_completed event lands in dashboard feed
- [x] History view with score badges; browser-verified full lifecycle (Session 5)

## Phase 5b — Bounty board amendment — DONE 2026-07-07 (owner request)

Owner amendment: challenges became a BOUNTY BOARD. Fresh postings every Monday
(deterministic per ISO week), three tiers: low (~1 week), mid (~1 month), high
(multi-month or team-up). Pool = 21 bounties: the 12 legacy templates retiered by
mapping (zero retyping) + 9 new researched from 2026 project-idea roundups (each
carries a source URL): GitHub contribution insights, AI commit summarizer,
RAG doc Q&A, AI PR reviewer, mini search engine, explainable resume screener,
collaborative markdown editor (CRDT, team-up), pair-programming rooms (team-up),
replicated key-value store.

- [x] lib/challenges/board.ts: TIER_META (due windows 7/30/90d), weeklyBoard
      (2 low + 2 mid + 1 high, excludes ever-claimed slugs, graceful exhaustion),
      bountyDueDay, bountyRepoName (`bounty-<slug>`) — tested
- [x] ChallengeKind widened with low|mid|high (legacy week/month records still render)
- [x] Page rewrite: Claimed section (full milestone/repo/rubric/archive flow, Team-up
      badges), tiered board with claim buttons + idea-source links, history with tier
      badges. Achievements (Shipped/Flawless/Serial shipper) unchanged — bounties are
      ChallengeRecords.
- [x] Browser-verified claim flow (Session 12). Old challenges.ts period functions
      (templateFor/dueDayFor/repoNameFor/monthChallengeId) now unused by UI — prune
      in Phase 13.

## Amendment — Daily briefing + researched pool refresh — DONE 2026-07-07

Owner request: apply the bounty-board "cowork research" pattern to recurring content.
- [x] Assignment pools refreshed from 2026 skills research: study pool +8 (LLM APIs,
      RAG, Docker, K8s, microservices, OWASP, observability, WASM), career pool +4
- [x] Dashboard Daily Briefing panel (deterministic per day, like assignments):
      perseverance quote pool (Nietzsche, Malcolm X, Douglass, Angelou, Ali, Mandela,
      Aurelius, Epictetus, Baldwin, Seneca, Confucius — verified attributions only),
      explore-topic-of-the-day (researched, with source links), tip-of-the-day
- [x] Recurring refresh RUNBOOK recorded in WORKLOG Session 13 (rerun cadence:
      monthly or on owner request; /schedule cloud agents are the automation option)

## Phase 6 — LeetCode stats — DONE 2026-07-06

- [x] Daily Actions pipeline (leetcode-data.yml + scripts/fetch-leetcode.mjs): queries
      LC GraphQL server-side, commits public/data/leetcode.json. INERT until
      LC_USERNAME is set in the workflow file (owner's username still unknown).
      Script verified locally against a real account.
- [x] Client: synced-file first (48h freshness), community proxy fallback with 10-min
      cache. FINDING: leetcode-stats-api.herokuapp.com is DEAD (503) — the pipeline
      is the only reliable source now; error copy says exactly that.
- [x] Stats page: solved + rank + LC submission streak, difficulty split with
      coverage % bars, 8-week trend chart (hand-rolled, no chart dep), weak-area
      focus card (difficulty-based v1; per-topic waits for Phase 7 data)
- [~] Daily question: plain link to the problemset (the daily-question APIs are the
      same dead/flaky community surface; revisit if a reliable source appears)

## Phase 7 — LeetCode Resource Center — DONE 2026-07-06 (all 28 guides)

- [x] Framework: typed TopicGuide model (src/data/guides/), planned-topic index with
      availability, handbook grid on the LeetCode page (works without a username),
      per-topic pages at /leetcode/:slug (intuition, patterns, TS template, mistakes,
      complexity, rehearsal questions, linked LC problems, study-next progression),
      content-integrity tests (unique slugs, completeness, valid progression links)
- [x] Batch A (6): arrays+two pointers, strings, hash maps, sliding window,
      binary search, prefix sum
- [x] Batch B (9): linked lists, queues+deques, stacks+monotonic, recursion, sorting,
      trees, BST, heaps, tries
- [x] Batch C (13): graphs, DFS, BFS, topological sort, union-find, DP, memoization,
      backtracking, greedy, bit manipulation, divide & conquer, math, geometry
- NOTE for Phase 13: guide content ships in the main JS chunk and tripped the
  bundle-size warning — lazy-load the guides (route-level code splitting) in polish.

## Phase 8 — Interview practice game — DONE 2026-07-06

- [x] Wordle-style daily round: 5 questions picked deterministically per day
      (lib/game, tested) from a 45-question bank — 3 per category across all 15
      categories in the owner brief (src/data/interviewQuestions.ts)
- [x] 30s timer per question with speed bonus (+50 max), hints (−25), color-coded
      reveal with explanations, score accrual; one round per day (schema v5
      gameResults, store stamps completedAt — react-compiler purity rule)
- [x] Play streak (reuses streak engine), local top-10 leaderboard, personal-best
      callout; full round browser-verified incl. replay lock (Session 8)
- Later: grow the question bank in content batches alongside Phase 7

## Phase 9 — Analytics — DONE 2026-07-06 (built before 7/8 — code-heavy, token-cheap)

- [x] Summary cards: assignments all-time + perfect days, best/current streak
      (longestStreak added to streak lib, tested), challenges completed with avg
      score/milestones, todos done
- [x] Activity heatmap (17 weeks, own event/todo/challenge data; reuses the GitHub
      heatmap level scale) + weekly completions bars (8 weeks, reuses lc weeklyCounts)
- [x] Consistency: 30-day active %, perfect days, GitHub commits last 30d (live from
      cached events API when username set)
- [x] Not built, honestly: coding hours (nothing tracks time yet — revisit if a time
      signal ever exists); LC solved lives on the LeetCode page
- [x] Browser-verified against seeded multi-day data (Session 7)

## Phase 10 — Achievements (full) — DONE 2026-07-06

- [x] 16-rule catalog over owned data: assignments (first, perfect day/week/month,
      streak 3/7/30, century), todos (first, 50), challenges (first, flawless 100%,
      five shipped), interview game (first round, Interview Master 5/5, 7-day play
      streak). Rule ids stable; unlocks permanent.
- [x] Evaluation on every completing action (assignment, todo, challenge, game) —
      store actions rebuilt on get()+set so toast side effects stay out of reducers
- [x] Gallery page: unlocked-first grid with dates, locked dimmed, progress bar
- [x] Unlock toasts: transient zustand store (lib/toast), auto-dismiss 5s, stacked
      bottom-right in the shell; browser-verified live (Session 9)
- Deferred honestly: 100-commits / 100-LC rules need external stats persisted into
  state — revisit when the LC pipeline is active (username) or with Phase 4b sync.
- DP Expert and other topic-based rules arrive with Phase 7 topic data.

## Phase 11 — Reminders

- [ ] ReminderChannel interface; browser notifications channel
- [x] Google Calendar API sync channel for todos — CODE-SIDE DONE 2026-07-07:
      GIS token flow (lib/gcal), timed 30-min events at settings.reminderTime with
      popup alerts, eventMap prevents duplicates (schema v7), Settings section with
      Client ID + Connect-and-sync. AWAITING OWNER: Google Cloud console setup
      (walkthrough delivered Session 13); E2E untested until his Client ID exists.
      v2 later: auto-sync on todo changes, delete events for removed todos.
- [ ] ICS export channel
- [ ] Optional Actions email channel (needs Phase 4 sync)

## Phase 12 — Career modules port + legacy import — DONE 2026-07-07

- [x] Seed data ported with ZERO retyping: scripts/extract-career.mjs vm-evaluates the
      legacy DATA SECTION into src/data/career.json (100 items: 28 tasks, 6 projects,
      8 certs, 11 jobs, 9 gaps, 21 scholarships, 17 internships) + typed wrapper
      src/data/career.ts. Prospects/built-in apps stay excluded (privacy scrub).
- [x] Career page (new nav item, 9 tabs): Checklist (grouped, checkable), Skill gaps,
      Certs, Projects, Jobs, Scholarships (tier filter), Internships (category filter)
      — all with per-item status selects — plus personal Applications and Network
      tabs (CRUD, localStorage-only, never in the public repo)
- [x] Schema v6: career {checks, statuses (namespaced kind:id), applications, contacts}
- [x] Settings -> "Import legacy tracker": maps cp_tracker_v1 (checks, five status
      maps namespaced, apps -> applications, custom tasks -> career-category todos;
      netStatus intentionally dropped — prospects were scrubbed). Mapping unit-tested.
- [x] Browser-verified: tabs, checklist persistence, namespaced status persistence
      (scholarship:s01 = submitted), scholarships render all 21 with tiers (Session 11)

## Amendment — Security hardening — DONE 2026-07-07 (owner request)

Owner asked for an "admin login" for a future friend-group expansion. Honest answer
shipped instead (client-side logins on public static sites are theater — documented):
- [x] SECURITY.md: full threat model — no backend, per-browser data isolation,
      what a repo visitor can/cannot get, why the Google Client ID is public by
      design, and the REAL path if shared features ever arrive (BaaS + row-level
      security as its own phase)
- [x] App lock (the honest "login"): GitHub token encrypted at rest with
      PBKDF2(310k)+AES-256-GCM (lib/crypto, tested); unlock-per-session UI in
      Settings; wrong-passphrase = GCM auth failure; forgotten passphrase =
      just paste a fresh token. Legacy plaintext slot migrates transparently.
- [x] Content-Security-Policy meta injected at BUILD only (dev HMR unaffected):
      script/connect/img/frame allowlists to exactly our APIs; inline spa-redirect
      script externalized to keep script-src 'self'; font-src needed data: for
      fontsource-inlined fonts (caught by testing the prod build under CSP)
- [x] Dependabot (npm + actions, weekly); tracked-file secret scan clean
- [x] Prod-build QA under CSP: zero violations; lock/unlock cycle verified

## Phase 13 — Polish & release — IN PROGRESS

- [ ] A11y audit, keyboard pass, skeletons/transitions sweep
- [ ] Test hardening, error boundaries, empty/error states everywhere
- [x] Full README rewrite (owner request, ahead of schedule 2026-07-07): Overview,
      Features, Architecture, Technologies, Installation, Development, Deployment,
      Environment Variables, Project Structure, Roadmap, Contributing, License —
      per the prompt's Documentation section. CI + license badges. Two real
      screenshots (docs/screenshots/) replace the old placeholder-era stub.
- [x] Roadmap section in README (concise snapshot; ROADMAP.md stays the live
      source of truth); LICENSE added (MIT)
- [ ] Prune dead code flagged earlier: challenges.ts period-based fns
      (templateFor/dueDayFor/repoNameFor/monthChallengeId) unused since the
      bounty-board amendment; their tests too
- [ ] Lazy-load Resource Center guide content (bundle-size warning, noted since Phase 7)
