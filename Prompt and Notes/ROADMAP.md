# Roadmap

Status legend: [ ] todo · [x] done · IN PROGRESS marks the active phase.
Order within later phases may flex; finish-verify-document before advancing.

## Phase 0 — Analysis & design docs — DONE 2026-07-06

- [x] Analyze legacy codebase, record weaknesses and keepers
- [x] Settle stack + architecture (ARCHITECTURE.md)
- [x] Phased roadmap (this file), continuity README, WORKLOG

## Phase 1 — Foundation — IN PROGRESS

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
- [ ] Push; site live at https://chripierre.github.io/goal-tracker/ (pushed; awaiting
      owner to flip the repo public after the privacy scrub — see WORKLOG)
- [ ] Browser smoke test of the live site (first item next session)

## Phase 2 — Core loop: assignments, streak, dashboard v1

- [ ] Daily assignment generator (seeded from ported legacy TASKS + rotation rules)
- [ ] Complete-assignment flow appends events; streak/weekly/monthly derive live
- [ ] Dashboard v1: progress cards, streak flame, today panel, recent activity feed
- [ ] Historical record view (per-day log)
- [ ] Achievements groundwork: unlock rules evaluated on event append (cache unlocks)

## Phase 3 — TODO system

- [ ] Todos: priorities, deadlines, tags, categories, recurring rules
- [ ] Filtering, search, sort; drag-and-drop reorder
- [ ] Todo completion feeds event log / streak
- [ ] Overdue surfacing on dashboard

## Phase 4 — GitHub integration + sync

- [ ] Settings: fine-grained PAT (local-only, warning copy)
- [ ] Activity feed, commit monitor, PR monitor, repo stats
- [ ] Contribution heatmap (GraphQL; image fallback without token)
- [ ] State sync to private `goal-tracker-data` repo (multi-device)

## Phase 5 — Weekly & monthly challenges

- [ ] Challenge generator (requirements, milestones, due dates, rubric, deliverables)
- [ ] Auto repo creation via API (naming: `week-NN-slug`, `month-mon-slug`)
- [ ] Completion flow: checklist scoring, completion %, archive, dashboard update
- [ ] Challenge history view

## Phase 6 — LeetCode stats

- [ ] Scheduled Action pipeline writing `leetcode.json`; client fallback proxy
- [ ] Stats: solved, difficulty split, LC streak, trends, weak-area analysis
- [ ] Daily question surfacing on dashboard

## Phase 7 — LeetCode Resource Center (content-heavy; ship in batches)

- [ ] Handbook framework: topic page template (intuition, patterns, mistakes, templates, complexity, progression, linked problems)
- [ ] Batch A: Arrays, Strings, Hash Maps, Two Pointers/Sliding Window, Binary Search, Prefix Sum
- [ ] Batch B: Linked Lists, Stacks/Queues/Monotonic, Trees, BST, Heaps, Tries, Recursion, Sorting
- [ ] Batch C: Graphs, DFS/BFS, Topological Sort, Union Find, DP, Memoization, Backtracking, Greedy, Bit Manipulation, Divide & Conquer, Math, Geometry

## Phase 8 — Interview practice game

- [ ] Wordle-inspired daily interview question game; categories per prompt
- [ ] Score, streak, timer, hints, explanations, local leaderboard
- [ ] Question bank content (batched, per category)

## Phase 9 — Analytics

- [ ] Coding hours, commits, solved, completions, streak history
- [ ] Productivity graphs, activity heatmap, consistency metrics, challenge completion rate

## Phase 10 — Achievements (full)

- [ ] Full rule catalog (30-day streak, 100 LC, first project, 100 commits, perfect week/month, Interview Master, DP Expert...)
- [ ] Achievement gallery UI + unlock toasts

## Phase 11 — Reminders

- [ ] ReminderChannel interface; browser notifications channel
- [ ] ICS / Google Calendar links channel
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
