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

## Phase 7 — LeetCode Resource Center (content-heavy; ship in batches) — NEXT

- [ ] Handbook framework: topic page template (intuition, patterns, mistakes, templates, complexity, progression, linked problems)
- [ ] Batch A: Arrays, Strings, Hash Maps, Two Pointers/Sliding Window, Binary Search, Prefix Sum
- [ ] Batch B: Linked Lists, Stacks/Queues/Monotonic, Trees, BST, Heaps, Tries, Recursion, Sorting
- [ ] Batch C: Graphs, DFS/BFS, Topological Sort, Union Find, DP, Memoization, Backtracking, Greedy, Bit Manipulation, Divide & Conquer, Math, Geometry

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

## Phase 10 — Achievements (full)

- [ ] Full rule catalog (30-day streak, 100 LC, first project, 100 commits, perfect week/month, Interview Master, DP Expert...)
- [ ] Achievement gallery UI + unlock toasts

## Phase 11 — Reminders

- [ ] ReminderChannel interface; browser notifications channel
- [ ] Google Calendar API sync channel for todos (client-side OAuth via Google Identity
      Services; owner GCP setup required) — todos auto-create/update calendar events
      with reminders; this is the owner's preferred notification path
- [ ] ICS export channel
- [ ] Optional Actions email channel (needs Phase 4 sync)

## Phase 12 — Career modules port + legacy import

- [ ] Port seed arrays to typed `src/data/` content
- [ ] Career feature group: applications, network, scholarships, internships, gaps, certs, projects
- [ ] Settings → Import legacy `cp_tracker_v1` JSON

## Phase 13 — Polish & release

- [ ] A11y audit, keyboard pass, skeletons/transitions sweep
- [ ] Test hardening, error boundaries, empty/error states everywhere
- [ ] Full README rewrite (per prompt's Documentation section), screenshots
- [ ] Roadmap section in README; LICENSE
