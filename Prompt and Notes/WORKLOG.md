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
  installing gh (would also simplify future repo automation).

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

NEXT:
1. Owner: flip the repo public (Settings -> General -> Danger zone -> Change
   visibility), optionally deleting + recreating the repo first per the residue
   caveat above. Tell the agent when done.
2. Agent: trigger the deploy (empty commit or Actions re-run), confirm the site is
   live, browser smoke test (shell, drawer, all routes, 404 deep-link redirect).
3. Owner judgment call, flagged but not scrubbed: remaining legacy content is
   self-authored career analysis (GAPS narratives, job-lead notes) — public by
   choice; gets the same scrub treatment on request.
4. Then Phase 2 (ROADMAP): assignment engine + completion flow + dashboard v1;
   seed tasks port from legacy TASKS array.
