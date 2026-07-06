# Architecture

Decisions here are settled unless WORKLOG records a deviation. Rationale included so
future sessions don't re-debate them.

## 1. Legacy codebase analysis (2026-07-06)

Three files, no build step, opened via `file://` or `serve.py`:

- `index.html` (~160 lines) — static tab shell, modals.
- `tracker.css` (~450 lines) — hand-rolled tokens, light/dark via `data-theme`.
- `tracker.js` (~1,800 lines) — everything else: state, seed data, rendering, events.

Structure of `tracker.js`: `defaultState()` + `save()` (localStorage key `cp_tracker_v1`,
additive `Object.assign` migration), then nine seed arrays (TASKS 28, PROJECTS 6, CERTS 8,
PROSPECTS 22, BUILT_IN_APPS, JOB_LISTINGS, GAPS 9, SCHOLARSHIPS 21, INTERNSHIPS 17), then
per-tab `renderX()` functions that rebuild DOM via `innerHTML` string concatenation
(16 uses), wired with inline `onclick`.

Note: the committed `HANDOFF.md` describes a DIFFERENT (macOS, `cp_v4`) variant with
resume manager and docx parsing. The code in this repo is the truth; that handoff is
historical context only. Both now live in `legacy/`.

### Weaknesses (why a rebuild, not a refactor)

1. Monolith: state, data, logic, and view in one file; every feature grows it linearly.
2. String rendering: full-section `innerHTML` rebuilds — no composition, fragile escaping
   (manual `escHtml`), loses focus/scroll, unmeasurable performance ceiling.
3. Implicit global mutable state; no schema versioning beyond additive assign; no way to
   derive analytics/streaks/achievements consistently from history (no history at all).
4. Zero types, zero tests, no CI, no deploy story (prompt requires all four).
5. Design ceiling: hand-rolled CSS drifts; can't hit the Linear/Vercel bar or ship
   skeletons/transitions/a11y systematically.

### What the legacy app got right (carry forward)

- Zero-backend, local-first, instant load.
- Additive state migration mindset.
- No-emoji, GitHub-ish visual restraint.
- The seed data itself — real curated career content. It gets ported, not discarded.

## 2. Stack decisions

| Decision | Choice | Rationale |
|---|---|---|
| Build | Vite 7 | Static output for Pages, fast HMR, first-class TS/React, Vitest shares config. |
| UI | React 19 + TypeScript (strict) | Component model fits the module system; types are the maintainability contract for a years-long personal project. |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) | Design tokens in one place, dark-first, consistent spacing/typography without CSS drift. |
| Routing | React Router 7 (`createBrowserRouter`) | Clean URLs on Pages via the 404-redirect trick (see §6); `basename` from `import.meta.env.BASE_URL`. |
| State | Zustand 5 + `persist` (versioned) | Minimal API, selector-based subscriptions, versioned localStorage migrations; storage adapter swappable later for GitHub sync. |
| Icons | lucide-react | Inline SVG, tree-shaken, no emoji policy. |
| Fonts | Inter Variable + JetBrains Mono Variable via @fontsource (bundled, no CDN) | Self-contained like legacy, professional typography. |
| Charts | Recharts (added in Analytics/Dashboard phases) | Composable, fits React; custom heatmap built by hand. |
| Tests | Vitest (+ Testing Library when component tests start) | Engines are pure functions — unit-test heavy, DOM-test light. |
| Lint/format | ESLint 9 flat + typescript-eslint + react-hooks; Prettier | CI-enforced hygiene. |
| Hosting | GitHub Pages via Actions | Prompt requires GitHub-hosted single URL + automated pipeline. |

Storage key: `gt_v1` (fresh origin, fresh schema; legacy import is an explicit tool, see §7).

## 3. Core domain model — the event log

The keystone decision: **every meaningful action appends an immutable `ActivityEvent`**
(assignment completed, todo done, practice logged, challenge shipped, commit detected...).
Streaks, weekly/monthly progress, analytics, heatmaps, and achievements are all **pure
functions over the event log** — never separately mutated counters.

Why: the prompt demands "missed days reset the streak while preserving historical data",
historical challenge tracking, analytics, and achievements. One append-only source of
truth makes all of them consistent, testable, and immune to drift. Counters that are
stored (achievement unlock timestamps) are caches of derivations, never authorities.

```ts
interface AppState {
  schemaVersion: 1
  settings: Settings            // theme, ghUsername, lcUsername, reminder prefs
  todos: Todo[]
  assignments: Assignment[]     // generated daily, status + date
  challenges: Challenge[]       // weekly/monthly, milestones, rubric, repo link
  events: ActivityEvent[]       // append-only history
  achievements: Unlock[]        // { id, unlockedAt } — cache of derived unlocks
}
```

Engines in `src/lib/` are UI-free pure TS: `streak.ts`, `assignments.ts`,
`achievements.ts`, `analytics.ts`. This is where the unit tests concentrate.

## 4. Project structure

```
src/
  app/          # shell: router, layout (sidebar/topbar), providers, nav config
  components/   # reusable primitives: Card, Button, Badge, EmptyState, ...
  features/     # one folder per module: dashboard, assignments, todos, challenges,
                #   leetcode, interview, analytics, achievements, settings, career(legacy port)
  lib/          # pure domain engines + clients: storage/, events/, streak/, github/,
                #   leetcode/, reminders/
  data/         # seed content: ported legacy arrays, question banks, topic guides
  styles/       # global.css (@theme tokens, base styles)
```

Rule: features may import from `components`, `lib`, `data` — never from each other.
New module = new folder in `features/` + a nav entry. That is the extensibility story.

## 5. Integrations

**GitHub (Phase 4-5).** Fine-grained PAT pasted in Settings, stored locally with a
plain-language warning. Client calls `api.github.com` directly (CORS-enabled). Features:
activity feed, contribution heatmap (GraphQL `contributionsCollection`; `ghchart.rshah.org`
image as tokenless fallback), repo stats, and challenge repo auto-creation
(`POST /user/repos`, names like `week-23-algorithms`). Later: **GitHub-as-backend sync** —
app state JSON committed to a private `goal-tracker-data` repo via contents API for
multi-device continuity; last-write-wins on `updatedAt`, manual conflict banner.

**LeetCode (Phase 6).** No official API. Primary: scheduled GitHub Action (cron) queries
LeetCode GraphQL server-side (no CORS there), commits `leetcode.json`; the app fetches it.
Fallback: community proxy (`leetcode-stats-api.herokuapp.com`, 10-min TTL cache like legacy).
Decide at implementation whether the Action commits to `main` (triggers redeploy, fine daily)
or a `data` branch read via raw URL.

**Reminders (Phase 11).** `ReminderChannel` interface so channels are pluggable:
1. Browser notifications (service worker) — first.
2. Calendar: generated `.ics` feed / "Add to Google Calendar" links — no backend needed.
3. Optional: scheduled Action emails (SMTP secrets) once state sync exists.
SMS is out (needs paid backend); revisit only if the owner asks.

## 6. Deployment

- GitHub Pages, project site: `https://chripierre.github.io/goal-tracker/`.
- Vite `base: '/goal-tracker/'`.
- SPA deep links: `public/404.html` redirect trick (spa-github-pages pattern,
  `pathSegmentsToKeep = 1`) + decoder snippet in `index.html`.
- One workflow `.github/workflows/ci.yml`: job `check` (typecheck, lint, test, build) on
  every push/PR; job `deploy` (Pages artifact + deploy, `enablement` on) only on `main`.
  If auto-enablement is rejected, one-time manual step: repo Settings → Pages → Source:
  GitHub Actions.

## 7. Legacy data migration

localStorage does not cross origins — the old `file://`/localhost data cannot be read by
the Pages site. Plan (Phase 12): port the nine seed arrays into `src/data/` as typed
content; ship the career modules (applications, network, scholarships, internships, gaps,
certs, projects) as a `career` feature group; provide Settings → "Import legacy data"
accepting the `cp_tracker_v1` JSON (owner copies it from the old app's devtools once).

## 8. Design system

- Dark-first. Tokens in `@theme`: near-black bg (#0a0a0b), layered surfaces, 1px subtle
  borders, indigo accent (#6366f1), semantic success/warn/danger, streak orange, radii
  6/8/12, Inter Variable UI + JetBrains Mono for numerals/code.
- Component primitives own all visual decisions; feature code composes, never restyles.
- Motion: subtle, fast (120-200ms), transform/opacity only; skeletons for async panels.
- Accessibility: real buttons/links, focus-visible rings, aria on nav/drawer/dialogs,
  keyboard paths for everything; Radix primitives adopted per-component when dialogs/
  menus arrive rather than hand-rolling.

## 9. Risks / constraints register

- LeetCode community APIs are unstable → Action-based pipeline is the hedge; degrade gracefully.
- PAT in localStorage: acceptable for a personal tool, but Settings must say so plainly;
  recommend fine-grained minimal scopes; never sync the token itself.
- localStorage ~5MB: event log is text and fine for years; revisit (IndexedDB adapter)
  only if attachments ever arrive.
- GitHub Pages is static: anything "scheduled" lives in GitHub Actions, not the client.
- Solo-owner product: no auth, no multi-tenant complexity — do not add it.
