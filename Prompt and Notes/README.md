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
2. Read `ROADMAP.md` — find the phase marked NEXT or IN PROGRESS.
3. Skim `ARCHITECTURE.md` sections relevant to that phase. Decisions there are settled;
   do not relitigate them without new information. If you must deviate, record why in
   WORKLOG and update ARCHITECTURE.
4. Run the identity checks in "Git identity and publishing" below BEFORE any commit.
5. Run `npm install` then `npm run build` in the repo root to confirm a working baseline
   before changing anything.
6. Work in small commits. Update `ROADMAP.md` checkboxes and append to `WORKLOG.md` as
   you go — treat the docs as part of the deliverable.

## Git identity and publishing — READ BEFORE COMMITTING

This repo is PUBLIC and belongs to the owner's personal GitHub account **Chripierre**.
The machine also carries an unrelated global git identity for other work; that identity
must never author commits here. Concretely:

1. Verify before the first commit of a session:
   - `git config user.name` -> `Christian Pierre`
   - `git config user.email` -> `Chripierre@users.noreply.github.com`
   - `git remote -v` -> `git@github-chripierre:Chripierre/goal-tracker.git`
   - `ssh -T git@github-chripierre` -> greets "Hi Chripierre!"
2. If any check fails (e.g. after a fresh clone), fix REPO-LOCALLY — never `--global`:
   - `git config user.name "Christian Pierre"`
   - `git config user.email "Chripierre@users.noreply.github.com"`
   - `git remote set-url origin git@github-chripierre:Chripierre/goal-tracker.git`
   The `github-chripierre` SSH alias lives in `~/.ssh/config` (key `~/.ssh/id_chripierre`);
   a plain `github.com` remote would route to the wrong account's credentials.
3. Repo settings on github.com (Pages, visibility, secrets) require the owner to be
   signed into the browser as **Chripierre**.
3b. NEW MACHINE / TOTAL CRASH RECOVERY — nothing but this repo is required:
   - Clone from github.com/Chripierre/goal-tracker (it is public; read needs no auth).
   - To PUSH again: generate a fresh key (`ssh-keygen -t ed25519 -f ~/.ssh/id_chripierre`),
     add the .pub to github.com/settings/keys while signed in as Chripierre, then create
     `~/.ssh/config` with:
       Host github-chripierre
         HostName github.com
         User git
         IdentityFile ~/.ssh/id_chripierre
   - Then apply the repo-local fixes in step 2 above and verify with step 1.
   - App data note: user data lives in each browser's localStorage (key gt_v1), not in
     the repo — Settings has Export/Import backup for moving it. The GitHub token
     (gt_gh_token) must simply be re-entered.
4. Privacy standing rule: the repo went public on 2026-07-06 after a scrub. Never commit
   third-party personal data (names, profiles) or private application-strategy notes.
   Private copies of the scrubbed data live OUTSIDE the repo in
   `%USERPROFILE%\Desktop\goal-tracker-private\`.

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
