# Security model

This document is the honest threat model for Goal Tracker. Read it before assuming
the app needs (or has) a login.

## Architecture facts that drive everything

- **Static site, no backend.** GitHub Pages serves HTML/JS/CSS. There is no server,
  no database, and no account system anywhere.
- **All personal data is browser-local.** Streaks, todos, career tracking, game
  results — everything lives in `localStorage` of the browser that created it,
  under the site's origin. It never leaves the device unless the owner explicitly
  exports a backup file.
- **The repository is public by design** (GitHub Pages free tier). It contains
  source code and privacy-scrubbed reference data only.

## What an attacker gets from the public repo

Source code and public reference content. Nothing else exists in the repo: no
tokens, no user data, no secrets (CI scans and the commit history were scrubbed
before the repo went public). Reading the repo gives the same information as
viewing the deployed site's source — which is always public for any static site.

## The secrets that exist, and how each is protected

| Secret | Where it lives | Protection |
|---|---|---|
| GitHub personal access token | `localStorage` slot `gt_gh_token`, per browser | Excluded from exports/sync by construction. Optional **app lock** encrypts it at rest (PBKDF2 + AES-256-GCM); it is then decrypted only into memory, per session. Use a fine-grained, minimally-scoped token. |
| Google OAuth **Client ID** | App state | **Not a secret.** It identifies the app, not a user. Abuse from other sites is blocked by the authorized-origins allowlist in Google Cloud Console. |
| Google OAuth **access token** | Memory only | Never persisted; expires in one hour; scoped to `calendar.events` only. |

## Defense-in-depth in the deployed app

- **Content-Security-Policy** (meta tag, injected at build): scripts only from the
  site itself and `accounts.google.com`; network calls only to the enumerated APIs
  (GitHub, Google, the LeetCode proxy); no objects, no foreign frames except
  Google's consent flow. Even injected markup cannot exfiltrate to arbitrary hosts.
- React's default output encoding everywhere; no `dangerouslySetInnerHTML`;
  external links carry `rel="noreferrer"`.
- CI workflows run with minimal permissions; Dependabot watches npm and Actions
  dependencies weekly.

## If friends use the app

Everyone who opens the site gets their **own isolated data** in their own browser.
Nobody — including the repo owner — can see anyone else's todos, tokens, or stats.
There is nothing shared to steal and no privileged "admin" surface to hijack.

Consequently, a client-side "admin login" would be security theater: all client
code is public, any password gate in it can be bypassed in DevTools, and there is
no server-side resource behind it to protect. This project deliberately does not
ship one.

**If shared features are ever wanted** (shared leaderboards, synced group data),
that is the moment real authentication enters: a proper backend or BaaS
(e.g., Supabase/Firebase) with server-side authorization, per-user rows, and row-level
security. Treat it as its own phase with its own threat model — do not bolt a
password prompt onto the static site and call it security.

## Reporting

This is a personal project. If you spot a real vulnerability, open a GitHub issue
on the repository.
