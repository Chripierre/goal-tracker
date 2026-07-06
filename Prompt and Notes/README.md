# Agent Process Notes — START HERE

This folder is the continuity system for the Goal Tracker rebuild. If you are an
agent resuming this project (after compaction, a new session, or handoff), read
this file first, then follow the resume protocol below.

## File map

| File | Purpose |
|---|---|
| `Prompt.txt` | The owner's original brief. The product spec. Never edit it. |
| `ARCHITECTURE.md` | Legacy analysis, all technical decisions with rationale, target architecture. |
| `ROADMAP.md` | Phased implementation plan with live checkboxes. The current phase is marked. |
| `WORKLOG.md` | Session journal. Newest entry at top. Each entry ends with concrete next steps. |
| `README.md` | This file. |

## Resume protocol

1. Read `WORKLOG.md` — the newest entry says exactly where work stopped and what is next.
2. Read `ROADMAP.md` — find the phase marked IN PROGRESS.
3. Skim `ARCHITECTURE.md` sections relevant to that phase. Decisions there are settled;
   do not relitigate them without new information. If you must deviate, record why in
   WORKLOG and update ARCHITECTURE.
4. Run `npm install` then `npm run build` in the repo root to confirm a working baseline
   before changing anything.
5. Work in small commits. Update `ROADMAP.md` checkboxes and append to `WORKLOG.md` as
   you go — treat the docs as part of the deliverable.

## Project facts

- Repo root: `%USERPROFILE%\Desktop\Goal Tracker`
- Remote: `git@github-chripierre:Chripierre/goal-tracker.git` (SSH alias `github-chripierre`
  routes to the owner's personal account **Chripierre** via `~/.ssh/id_chripierre`).
- Committing and pushing to THIS repo is allowed and expected.
- Live site (once Phase 1 deploy lands): `https://chripierre.github.io/goal-tracker/`
- Legacy app (the original vanilla JS tracker) lives in `legacy/` — reference only,
  never extend it. Its seed data gets ported module by module (see ROADMAP).
- Owner: Christian Pierre. Goal: daily-driver personal career OS. Quality bar is
  Linear / Vercel / Stripe dashboard, not a portfolio toy.

## Standing rules

- No emojis anywhere — UI, code, docs, commit messages. Inline SVG icons (lucide-react).
- Dark mode is the default theme.
- Favor clean architecture over speed; every module must stay independently addable.
- Do not rush ahead of the current phase; finish and verify, then update docs, then move on.
