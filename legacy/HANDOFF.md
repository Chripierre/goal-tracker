# Christian Pierre — Goal Tracker: Agent Handoff

**Owner:** Christian Pierre  
**Last updated:** 2026-06-29  
**Purpose:** Zero-dependency, browser-based career and goal dashboard. Tracks tasks,
projects, certs, network contacts, job applications, skill gaps, scholarships, and
internship programs. Everything auto-saves to `localStorage`.

---

## How to Open

```
Option A (simplest): double-click index.html
Option B (local server): python serve.py  →  http://localhost:3400
```

The server option is optional. All features including status dropdowns and dark mode
work when opened directly as a local file.

---

## File Map

```
Goal Tracker/
  index.html    HTML shell — tabs, panels, modals. No inline JS or CSS.
  tracker.css   All styles — design tokens, component classes, dark theme.
  tracker.js    All logic + all pre-loaded data. Single source of truth.
  serve.py      Optional Python 3 local server (port 3400).
  README.txt    Brief end-user instructions.
  HANDOFF.md    This file.
```

**No build step. No npm. No CDN. No external dependencies of any kind.**

---

## Architecture

### State and storage

```js
const STORAGE_KEY = 'cp_tracker_v1';   // NEVER change this — breaks all saved data

let st = Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
}
```

`defaultState()` returns the full state shape with safe defaults. `Object.assign`
overlays saved values on top, so any new keys added to `defaultState()` are
automatically backfilled for existing users on first load. This is the migration
pattern — always add new state keys to `defaultState()` first, never mutate the
stored JSON directly.

### State shape (complete)

```js
{
  checks:       {},   // { taskId: true }  — built-in task checkbox state
  custom:       [],   // user-added tasks: { id, text, priority, meta, done }
  apps:         [],   // user-logged applications: { id, company, role, date, status, salary, location, notes }
  netStatus:    {},   // { prospectId: 'not_contacted'|'sent'|'connected'|'no_response'|'skip' }
  certStatus:   {},   // { certId: 'not_started'|'studying'|'scheduled'|'completed'|'skipped' }
  projStatus:   {},   // { projId: 'not_started'|'in_progress'|'deployed' }
  appStatus:    {},   // status overrides for BUILT_IN_APPS entries
  scholStatus:  {},   // { scholarshipId: 'not_started'|'in_progress'|'submitted'|'awarded'|'declined'|'ineligible' }
  internStatus: {},   // { internId: 'not_started'|'in_progress'|'applied'|'accepted'|'declined'|'ineligible' }
  theme:        'light',
  activeTab:    'tasks',
  netFilter:    'all',
  scholFilter:  'all',   // tier filter on Scholarships tab
  scholStage:   'all',   // stage filter on Scholarships tab
  internFilter: 'all',   // category filter on Internships tab
  internStage:  'all',   // stage filter on Internships tab
}
```

### Render pattern

Every tab has a `render*()` function that rebuilds the tab panel's `innerHTML` from
scratch. There is no virtual DOM or diffing — each call is a full re-render.

```js
function render(tab) {
  const t = tab || st.activeTab;
  if (t === 'tasks')        renderTasks();
  if (t === 'projects')     renderProjects();
  if (t === 'certs')        renderCerts();
  if (t === 'network')      renderNetwork();
  if (t === 'apply')        renderApps();
  if (t === 'gaps')         renderGaps();
  if (t === 'scholarships') renderScholarships();
  if (t === 'internships')  renderInternships();
}
```

`switchTab(tabName)` sets `st.activeTab`, saves, and calls `render(tabName)`.

### Tab switching

```js
// index.html — tab buttons
<button class="tab-btn" data-tab="tasks">Tasks</button>
// ...

// tracker.js — click handler (wired in init)
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
```

### Security

All dynamic data is passed through `escHtml()` before being inserted into HTML:

```js
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

Never skip `escHtml()` when injecting user-visible strings into `innerHTML`.

---

## Tab Inventory

### 1. Tasks (`data-tab="tasks"`)

**Panel ID:** `tab-tasks`  
**Data array:** `TASKS` (28 entries, ids t01–t28)  
**State keys:** `st.checks` (built-in completions), `st.custom` (user-added tasks)

Each task object:
```js
{ id: 't01', priority: 'urgent'|'high'|'ongoing', text: '...', meta: '...' }
```

Tasks t01–t19 are career/resume actions. Tasks t20–t28 are scholarship action items
added in the session that built the Scholarships tab.

**Rule:** Never change a task's `id` after it is set — `st.checks` maps by id, so
renaming breaks saved checkbox state for the user.

Priority groups: `urgent` → `high` → `ongoing`. Each group gets a colored label
(`.priority-label.urgent` = red, `.priority-label.high` = amber,
`.priority-label.ongoing` = blue). Users can add custom tasks via the "+ Add task"
button which opens a modal.

---

### 2. Projects (`data-tab="projects"`)

**Panel ID:** `tab-projects`  
**Data array:** `PROJECTS` (6 entries, ids p01–p06)  
**State keys:** `st.projStatus` — `'not_started'|'in_progress'|'deployed'`

Each project object:
```js
{
  id: 'p01', name: '...', tech: '...', timeline: '...',
  description: '...', notes: '...', satisfies: ['...'], github: '',
}
```

`satisfies` is an array of skill strings used to cross-reference the Gaps tab.
`github` starts empty — fill it in when the repo goes public.

---

### 3. Certifications (`data-tab="certs"`)

**Panel ID:** `tab-certs`  
**Data array:** `CERTS` (8 entries, ids c01–c08)  
**State keys:** `st.certStatus` — `'not_started'|'studying'|'scheduled'|'completed'|'skipped'`

Each cert object:
```js
{
  id: 'c01', name: '...', issuer: '...', cost: '...', timeline: '...',
  recommended: 'yes'|'no'|'later'|'verify', lane: '...', notes: '...',
}
```

`recommended: 'yes'` → green left border (`.cert-card.recommended`)  
`recommended: 'later'` → amber left border (`.cert-card.verify`)  
`recommended: 'no'` → faded, dimmed (`.cert-card.not-recommended`)

---

### 4. Network (`data-tab="network"`)

**Panel ID:** `tab-network`  
**Data array:** `PROSPECTS` (22 entries, ids n01–n22)  
**State keys:** `st.netStatus` — `'not_contacted'|'sent'|'connected'|'no_response'|'skip'`

Each prospect object:
```js
{ id: 'n01', cat: 'QuestBridge'|'RSI'|'SAMS'|'MOSTEC', name: '...', headline: '...', match: '...', url: 'https://linkedin.com/in/...' }
```

Filter buttons in the toolbar let Christian filter by category. The table shows name,
headline, match area, link, and a status dropdown.

---

### 5. Applications (`data-tab="apply"`)

**Panel ID:** `tab-apply`  
**Data arrays:** `BUILT_IN_APPS` (pre-loaded applications), `st.apps` (user-logged)  
**State keys:** `st.apps` (user entries), `st.appStatus` (status overrides for built-in entries)

Built-in apps live in `BUILT_IN_APPS`. There is currently 1 pre-loaded entry: the IDT
Associate SWE posting (Mount Laurel, NJ, $72k–$114k, applied 2026-06-28).

User-added entries are logged via the "Log Application" modal and stored in `st.apps`.

---

### 6. Skill Gaps (`data-tab="gaps"`)

**Panel ID:** `tab-gaps`  
**Data array:** `GAPS` (9 entries, ids g01–g09)  
**State keys:** none (read-only display)

Each gap object:
```js
{
  id: 'g01', severity: 'critical'|'high'|'medium'|'low',
  name: '...', whyItMatters: '...', howToClose: '...', timeToClose: '...',
}
```

Left border color is set by severity: critical = red, high = amber, medium = blue,
low = neutral. The gaps represent the delta between Christian's current skills and the
IDT Associate SWE job requirements.

---

### 7. Scholarships (`data-tab="scholarships"`)

**Panel ID:** `tab-scholarships`  
**Data array:** `SCHOLARSHIPS` (21 entries, ids s01–s21)  
**State keys:** `st.scholStatus`, `st.scholFilter` (tier), `st.scholStage`

Each scholarship object:
```js
{
  id: 's01',
  tier: 'federal'|'nj_state'|'mccc'|'national'|'identity_black'|'identity_hispanic'|'stem',
  priority: 'critical'|'high'|'medium'|'low',
  stage: 'pre_mccc'|'year1'|'year2'|'post_transfer'|'anytime',
  name: '...', type: 'grant'|'scholarship'|'fellowship'|'program',
  amount: '...', deadline: '...', applyWhen: '...', url: '...',
  eligibility: '...', notes: '...',
}
```

Two filter rows (stage on top, tier below) use `.filter-btn` / `.filter-btn.active`
inside `.network-toolbar`. Clicking a stage pill resets the tier filter to 'all'.
Cards render in a `.card-grid` grouped by tier. Status dropdown per card saves to
`st.scholStatus[id]`.

**Stage values and meaning:**
- `pre_mccc` — do immediately, before first semester
- `year1` — fall 2026 through spring 2027
- `year2` — fall 2027 through spring 2028 (pre-transfer)
- `post_transfer` — after enrolling at a 4-year school
- `anytime` — rolling, no fixed window

---

### 8. Internships (`data-tab="internships"`)

**Panel ID:** `tab-internships`  
**Data array:** `INTERNSHIPS` (17 entries, ids i01–i17)  
**State keys:** `st.internStatus`, `st.internFilter` (category), `st.internStage`

Each internship object:
```js
{
  id: 'i01',
  cat: 'federal_gov'|'stem_research'|'tech_early'|'civic_tech'|'defense_contractor',
  stage: 'year1'|'year2'|'post_transfer'|'anytime',
  priority: 'critical'|'high'|'medium'|'low',
  name: '...', org: '...', pay: '...', duration: '...',
  deadline: '...', applyWhen: '...', url: '...', eligibility: '...', notes: '...',
}
```

Same two-filter layout as Scholarships (stage on top, category below). Same card
pattern: `.card-grid` → `.card` with left border colored by priority. Status dropdown
per card saves to `st.internStatus[id]`.

**Category values:**
- `federal_gov` — federal agencies, intelligence community, DoD
- `stem_research` — NSF REU, NIST SURF, LSAMP
- `tech_early` — Google STEP, Break Through Tech, Microsoft Explore, JPMorgan
- `civic_tech` — Coding it Forward, USDS
- `defense_contractor` — Lockheed Martin, Northrop Grumman, SAIC/GDIT/CACI/Leidos

---

## CSS Design System

**All styles are in `tracker.css`. Zero external stylesheets.**

### Design tokens (CSS custom properties on `:root`)

```
--bg             page background (#F6F8FA light / #0D1117 dark)
--surface        card/panel background (#FFFFFF / #161B22)
--surface-inset  subtle inset (#F0F2F4 / #21262D)
--border         primary border (#D0D7DE / #30363D)
--border-subtle  hairline border (#E8EAED / #21262D)
--text           primary text
--text-2         secondary text
--text-3         muted/placeholder text
--blue / --blue-bg
--green / --green-bg
--amber / --amber-bg
--red / --red-bg
--purple / --purple-bg
--orange / --orange-bg
--font           system font stack
--r / --r-md / --r-lg    border radii: 6/8/12px
```

Dark mode is applied via `[data-theme="dark"]` on `<html>`. Toggle button is in the
header and calls `applyTheme()`.

### Component classes (use these — do not invent new class names)

```
Layout / structure
  .section-header         flex row: title left, meta right
  .section-title          14px 600 heading
  .section-count          12px muted count label
  .priority-group         24px bottom margin wrapper
  .priority-label         inline pill label for a group
  .priority-label.urgent  red background
  .priority-label.high    amber background
  .priority-label.ongoing blue background
  .card-grid              auto-fill grid, min 280px columns, 12px gap
  .divider                1px hairline separator
  .empty                  centered empty state

Cards
  .card                   surface + border + r-md + flex column + 14px/16px padding
  .card-top               flex row: name left, badge right
  .card-name              13px 600 card title
  .card-tech              11px muted tech/subtitle text
  .card-desc              12px secondary description
  .card-meta              11px italic meta
  .card-tags              flex wrap gap-4px
  .card-footer            flex space-between aligned footer row
  .tag                    11px pill tag (neutral border/background)

Badges
  .badge                  inline 11px pill
  .badge-green            green tint
  .badge-red              red tint
  .badge-amber            amber tint
  .badge-blue             blue tint
  .badge-purple           purple tint
  .badge-orange           orange tint
  .badge-neutral          surface-inset with border

Certs
  .cert-card              card with left border (applied alongside .card)
  .cert-card.recommended  green left border
  .cert-card.verify       amber left border
  .cert-card.not-recommended  faded opacity
  .cert-header            flex row header
  .cert-name              13px 600
  .cert-issuer            11px muted
  .cert-detail            11px secondary detail row (strong = primary text)

Filters / Network toolbar
  .network-toolbar        flex wrap row with 10px gap
  .filter-btn             12px pill button, neutral
  .filter-btn.active      blue fill

Tasks
  .task-list              flex column 2px gap
  .task-item              surface card with checkbox
  .task-item.done         strikethrough + opacity
  .task-cb                checkbox (accent-color: --blue)
  .task-text / .task-meta text rows inside task item
  .task-actions           hover-reveal action buttons

Gaps
  .gap-card               .card with colored left border by severity
  .gap-card.critical      red border
  .gap-card.high          amber border
  .gap-card.medium        blue border

Forms / Modals
  .form-label / .form-input / .form-select
  .modal-overlay / .modal / .modal-header / .modal-body / .modal-footer
  .modal-overlay.hidden   display: none
  .btn / .btn-primary / .btn-secondary / .btn-icon / .btn-sm

Status selects
  .status-select          compact 11px inline dropdown (no label)
```

---

## How to Add Content

### Add a task

In `tracker.js`, find the `TASKS` array in the DATA SECTION. Append:

```js
{ id: 't29', priority: 'urgent'|'high'|'ongoing', text: 'What to do', meta: 'Context' },
```

**Never reuse or change an existing `id`.** The `id` is the key in `st.checks`.

### Add a scholarship

In `tracker.js`, find the `SCHOLARSHIPS` array. Append a new entry with all fields:
`id`, `tier`, `priority`, `stage`, `name`, `type`, `amount`, `deadline`,
`applyWhen`, `url`, `eligibility`, `notes`. Use the next sequential `s##` id.
Valid `tier` values: `federal`, `nj_state`, `mccc`, `national`, `identity_black`,
`identity_hispanic`, `stem`. Valid `stage` values: `pre_mccc`, `year1`, `year2`,
`post_transfer`, `anytime`.

### Add an internship/program

In `tracker.js`, find the `INTERNSHIPS` array. Append a new entry with all fields:
`id`, `cat`, `stage`, `priority`, `name`, `org`, `pay`, `duration`, `deadline`,
`applyWhen`, `url`, `eligibility`, `notes`. Use the next sequential `i##` id.
Valid `cat` values: `federal_gov`, `stem_research`, `tech_early`, `civic_tech`,
`defense_contractor`.

### Add a new tab

1. Add a `<button class="tab-btn" data-tab="newtab">Label</button>` in `index.html`
   inside `<nav class="tab-nav">`.
2. Add a `<section id="tab-newtab" class="tab-panel"></section>` inside
   `<main class="main-content">`.
3. Add any new state keys to `defaultState()` in `tracker.js`.
4. Write a `renderNewTab()` function following the same pattern as `renderScholarships`
   or `renderInternships`.
5. Add `if (t === 'newtab') renderNewTab();` to the `render()` dispatch function.

---

## Hard Constraints — Never Violate

1. **`STORAGE_KEY = 'cp_tracker_v1'` is immutable.** Changing it wipes all saved
   user data (checked tasks, statuses, custom tasks). New state fields go into
   `defaultState()` and get backfilled automatically.

2. **No external dependencies.** No CDN links, no `<script src="https://...">`,
   no npm packages, no Google Fonts. Every byte must be self-contained.

3. **No emojis anywhere** — not in UI text, not in code comments, not in data.
   Use text labels and SVG icons only.

4. **All dynamic content must go through `escHtml()`.** No raw interpolation of
   user-supplied or data-section strings into `innerHTML`.

5. **Never change an existing `id` field in any data array.** IDs map to `localStorage`
   keys. Changing them silently orphans saved user state.

6. **Always use existing CSS classes.** The file has a complete design system.
   Inventing new class names produces unstyled output. Check the class list above
   before writing any `innerHTML`.

7. **`var` vs `const/let`:** The file uses `const`/`let` (ES6+) throughout. Write
   new code in the same style.

---

## Subject Profile (Christian Pierre)

Context for personalizing recommendations and evaluating whether new content is
relevant:

- **Age/stage:** Graduated high school 2022. Entering MCCC (Mercer County Community
  College, West Windsor, NJ) fall 2026 as a CS student. Plans to transfer to a
  4-year school after MCCC.
- **Identity:** Black (Haitian and Dominican). FGLI (first-generation, low-income).
  Lives with father and two sisters. Father works a low-income job.
- **Career target:** Defense software engineering (SWE). Clearance-eligible U.S.
  citizen — a major competitive advantage for DoD/intelligence agency roles.
- **Current employment:** NJM Insurance Group, FNOL Claims Agent (Parsippany, NJ).
  JinGames, Software Developer (Remote, ongoing).
- **Honors/credentials:** QuestBridge Scholar. CMU SAMS Scholar (2021). Governor's
  STEM Scholars Team Lead. NJ constituent services (U.S. House, 2022–2023).
  Rowan bioengineering lab (2022).
- **Technical skills:** Java, JavaScript (ES5.1 + ES6), Python. Git/GitHub org admin.
  GIS (ArcGIS/QGIS). AI coding assistant fluency.
- **Resume file:** `%USERPROFILE%\Desktop\Hand off\Christian_Pierre_SWE_Resume.tex`
  — LaTeX. Compile on Overleaf. Still has `[YOUR-USERNAME]` placeholders on lines
  90–92 (LinkedIn and GitHub handles).
- **Known gaps:** Linux (WSL2), SQL depth, REST API hands-on, Docker, cloud (Azure),
  unit testing. See the Gaps tab for full detail.

---

## Known Placeholders / Open Items

These are unresolved items in the tracker data as of the last session:

| Location | Placeholder | What's needed |
|---|---|---|
| Resume .tex line 90 | `[your-username]` | Christian's LinkedIn handle |
| Resume .tex line 91 | `[your-username]` | Christian's GitHub handle |
| Resume .tex line 133 | `[X] students` | Official SAMS cohort size (look up CMU SAMS page) |
| t08 task | SAMS model type | Python library used, model type (CNN/RF/SVM?), accuracy metric |
| t09 task | SAMS cohort | Confirm exact cohort size for the honors line |
| t10 task | GIS tool | Confirm: ArcGIS vs QGIS or both at Watershed Institute |
| t11 task | STEM Scholars size | Number of scholars on Christian's team |
| p01 project | `github: ''` | URL of Boss AI repo once made public |
| All projects | `github: ''` | Fill in as repos are created/made public |

---

## Session History (what was built and when)

| Session | What was added |
|---|---|
| Session 1 | Full tracker rebuilt from scratch: 8 tabs (Tasks, Projects, Certs, Network, Apply, Gaps, Scholarships, Internships). 28 tasks, 6 projects, 8 certs, 22 network prospects, 9 gaps, 21 scholarships, 17 internships. Dark mode. Filter system on Scholarships and Internships tabs. |
| Session 1 | Scholarships tab: two filter rows (stage + tier), color-coded stage badges, status tracking per entry. |
| Session 1 | Internships tab: 17 programs across 5 categories. Same filter/card pattern as Scholarships. UI fixed to use existing CSS classes after initial render used non-existent class names. |

---

## Quick Reference: Data Array Sizes

| Array | Count | ID range |
|---|---|---|
| `TASKS` | 28 | t01–t28 |
| `PROJECTS` | 6 | p01–p06 |
| `CERTS` | 8 | c01–c08 |
| `PROSPECTS` | 22 | n01–n22 |
| `BUILT_IN_APPS` | 1 | ba01 |
| `GAPS` | 9 | g01–g09 |
| `SCHOLARSHIPS` | 21 | s01–s21 |
| `INTERNSHIPS` | 17 | i01–i17 |
