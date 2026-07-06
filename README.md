# Goal Tracker

Personal career operating system: daily assignments, streaks, weekly and monthly
project challenges, LeetCode statistics and study material, interview practice,
todos, analytics, and achievements. Local-first, no backend — hosted on GitHub Pages.

Status: early development. The application is being rebuilt in phases from a vanilla
JS prototype (preserved in `legacy/`) into a typed, tested, modular React application.
The plan and current phase live in `Prompt and Notes/ROADMAP.md`; architecture and
decision rationale in `Prompt and Notes/ARCHITECTURE.md`.

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS 4 · React Router · Zustand ·
Vitest · ESLint · GitHub Actions → GitHub Pages.

## Development

```
npm install        # install dependencies
npm run dev        # dev server with HMR
npm run build      # typecheck + production build to dist/
npm test           # unit tests (Vitest)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Requires Node 20.19+ (developed on Node 24).

## Structure

```
src/
  app/          shell: router, layout, navigation config
  components/   reusable UI primitives
  features/     one folder per module (dashboard, assignments, todos, ...)
  lib/          pure domain engines: storage, dates, streak; API clients later
  styles/       design tokens and global styles
legacy/         original vanilla JS tracker (reference only)
```

Core architectural rule: every meaningful action appends an immutable activity event;
streaks, progress, analytics, and achievements are pure derivations over that log.

## Deployment

Every push to `main` runs typecheck, lint, tests, and build, then deploys `dist/` to
GitHub Pages: https://chripierre.github.io/goal-tracker/
