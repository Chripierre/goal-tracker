export interface ChallengeItem {
  id: string
  label: string
}

export interface RubricItem extends ChallengeItem {
  points: number
}

export interface ChallengeTemplate {
  slug: string
  title: string
  summary: string
  requirements: string[]
  milestones: ChallengeItem[]
  rubric: RubricItem[]
  deliverables: string[]
  testing: string
}

function rubric(items: [string, string][]): RubricItem[] {
  return items.map(([id, label]) => ({ id, label, points: 25 }))
}

function ms(items: [string, string][]): ChallengeItem[] {
  return items.map(([id, label]) => ({ id, label }))
}

export const WEEKLY_CHALLENGES: readonly ChallengeTemplate[] = [
  {
    slug: 'cli-task-runner',
    title: 'CLI task runner',
    summary: 'A command-line tool that manages tasks in a local JSON file.',
    requirements: [
      'Commands: add, list, done, remove',
      'Data persists between runs',
      'Helpful usage output on bad input',
    ],
    milestones: ms([
      ['scaffold', 'Project scaffolded with argument parsing'],
      ['crud', 'All four commands working'],
      ['persist', 'State persists to disk'],
      ['polish', 'Errors handled, README written'],
    ]),
    rubric: rubric([
      ['works', 'All commands work as documented'],
      ['code', 'Clean separation of parsing, logic, and storage'],
      ['errors', 'Bad input never crashes it'],
      ['docs', 'README lets a stranger use it'],
    ]),
    deliverables: ['Public repo with README', 'Demo GIF or asciinema'],
    testing: 'Unit tests for the task store operations.',
  },
  {
    slug: 'rest-notes-api',
    title: 'REST notes API',
    summary: 'A small HTTP API for notes with full CRUD and validation.',
    requirements: [
      'Endpoints: create, read (one/all), update, delete',
      'Input validation with proper status codes',
      'Persistence (file or embedded DB)',
    ],
    milestones: ms([
      ['routes', 'Routes stubbed and returning JSON'],
      ['crud', 'CRUD complete against storage'],
      ['validation', 'Validation and error responses'],
      ['docs', 'API documented with example curls'],
    ]),
    rubric: rubric([
      ['correct', 'Endpoints behave per REST conventions'],
      ['status', 'Status codes and errors are right'],
      ['structure', 'Handlers, service, and storage are separated'],
      ['docs', 'Docs include runnable examples'],
    ]),
    deliverables: ['Repo with run instructions', 'Endpoint documentation'],
    testing: 'Integration tests hitting each endpoint.',
  },
  {
    slug: 'algo-visualizer',
    title: 'Algorithm visualizer',
    summary: 'Animate one algorithm (sorting or pathfinding) step by step in the browser.',
    requirements: [
      'Play, pause, step, and reset controls',
      'Adjustable input size or grid',
      'Runs entirely client-side',
    ],
    milestones: ms([
      ['render', 'Static state renders'],
      ['steps', 'Algorithm produces step frames'],
      ['controls', 'Playback controls wired'],
      ['deploy', 'Deployed to Pages'],
    ]),
    rubric: rubric([
      ['correct', 'Algorithm is implemented correctly'],
      ['ux', 'Controls feel responsive and obvious'],
      ['code', 'Algorithm is separated from rendering'],
      ['live', 'Publicly deployed and linked'],
    ]),
    deliverables: ['Live URL', 'Repo with algorithm explanation in README'],
    testing: 'Unit tests on the step-generator function.',
  },
  {
    slug: 'chrome-extension',
    title: 'Browser extension',
    summary: 'A small Chrome extension that solves one daily annoyance.',
    requirements: [
      'Manifest v3',
      'One clear user-facing feature',
      'Options or popup UI',
    ],
    milestones: ms([
      ['manifest', 'Extension loads unpacked'],
      ['feature', 'Core feature works'],
      ['ui', 'Popup/options UI complete'],
      ['polish', 'Icons, description, README'],
    ]),
    rubric: rubric([
      ['works', 'Feature works on real pages'],
      ['scope', 'Permissions are minimal'],
      ['code', 'Background/content scripts cleanly split'],
      ['docs', 'Install and usage documented'],
    ]),
    deliverables: ['Repo with load instructions', 'Screenshot set'],
    testing: 'Manual test checklist committed to the repo.',
  },
  {
    slug: 'markdown-blog',
    title: 'Markdown blog engine',
    summary: 'Static blog generator: markdown files in, HTML site out.',
    requirements: [
      'Posts from a folder of .md files with frontmatter',
      'Index page + per-post pages',
      'One command builds the site',
    ],
    milestones: ms([
      ['parse', 'Markdown + frontmatter parsed'],
      ['render', 'Post pages render from a template'],
      ['index', 'Index with dates and titles'],
      ['build', 'Single build command outputs dist/'],
    ]),
    rubric: rubric([
      ['output', 'Generated site is valid and readable'],
      ['code', 'Parser, renderer, and CLI are separate'],
      ['dx', 'Adding a post requires zero code changes'],
      ['docs', 'README documents the workflow'],
    ]),
    deliverables: ['Repo', 'A generated demo site (Pages)'],
    testing: 'Unit tests for frontmatter parsing and slug generation.',
  },
  {
    slug: 'realtime-chat',
    title: 'Realtime chat room',
    summary: 'A minimal websocket chat with rooms and presence.',
    requirements: [
      'Join a room with a nickname',
      'Messages broadcast live to the room',
      'Presence list updates on join/leave',
    ],
    milestones: ms([
      ['socket', 'Echo over websocket works'],
      ['rooms', 'Rooms isolate messages'],
      ['presence', 'Presence list accurate'],
      ['ui', 'Usable minimal UI'],
    ]),
    rubric: rubric([
      ['works', 'Two browsers chat reliably'],
      ['state', 'Server state handles disconnects'],
      ['code', 'Message protocol is documented'],
      ['ux', 'UI communicates connection state'],
    ]),
    deliverables: ['Repo with run instructions', 'Short demo video/GIF'],
    testing: 'Tests for the room/presence state logic.',
  },
  {
    slug: 'sql-analytics',
    title: 'SQL analytics mini-project',
    summary: 'Load a public dataset into SQLite and answer 10 questions with SQL.',
    requirements: [
      'Reproducible load script',
      '10 questions of increasing difficulty, with answers',
      'At least two JOINs and one window function',
    ],
    milestones: ms([
      ['load', 'Dataset loads reproducibly'],
      ['easy', 'First five queries done'],
      ['hard', 'Five harder queries incl. window fn'],
      ['writeup', 'Findings written up'],
    ]),
    rubric: rubric([
      ['correct', 'Queries return correct results'],
      ['sql', 'Idiomatic SQL, no row-by-row hacks'],
      ['repro', 'One command reproduces everything'],
      ['writeup', 'Write-up explains the findings'],
    ]),
    deliverables: ['Repo with .sql files + write-up'],
    testing: 'A script that runs all queries and checks row counts.',
  },
  {
    slug: 'testing-dojo',
    title: 'Testing dojo',
    summary: 'Take an untested piece of your own code and bring it to 90% coverage.',
    requirements: [
      'Pick a real module you wrote',
      'Characterization tests first, then refactor',
      'Coverage report before and after',
    ],
    milestones: ms([
      ['baseline', 'Coverage baseline recorded'],
      ['characterize', 'Behavior pinned by tests'],
      ['refactor', 'One meaningful refactor, tests green'],
      ['report', 'Before/after write-up'],
    ]),
    rubric: rubric([
      ['coverage', 'Meaningful 90%+ coverage'],
      ['quality', 'Tests assert behavior, not implementation'],
      ['refactor', 'Code is measurably cleaner'],
      ['writeup', 'Write-up teaches the lesson learned'],
    ]),
    deliverables: ['Repo/PR with tests + write-up'],
    testing: 'This whole challenge is testing.',
  },
]

export const MONTHLY_CHALLENGES: readonly ChallengeTemplate[] = [
  {
    slug: 'portfolio-site',
    title: 'Portfolio site',
    summary: 'A fast, professional portfolio with projects, resume, and contact.',
    requirements: [
      'Home, projects, and resume sections',
      'Lighthouse 90+ on performance and accessibility',
      'Deployed on a real URL',
    ],
    milestones: ms([
      ['design', 'Layout and content plan'],
      ['build', 'All sections built'],
      ['perf', 'Lighthouse targets hit'],
      ['ship', 'Deployed with custom-ish URL'],
    ]),
    rubric: rubric([
      ['design', 'Looks intentional, not templated'],
      ['content', 'Projects presented with impact'],
      ['perf', 'Lighthouse evidence committed'],
      ['live', 'Publicly reachable and linked everywhere'],
    ]),
    deliverables: ['Live URL', 'Repo'],
    testing: 'Lighthouse CI or a recorded audit run.',
  },
  {
    slug: 'job-board',
    title: 'Full-stack job board',
    summary: 'Postings, search, and applications — a real CRUD app end to end.',
    requirements: [
      'Postings list with search and filters',
      'Create/edit posting flow',
      'Application submission with validation',
    ],
    milestones: ms([
      ['schema', 'Data model settled'],
      ['api', 'API complete'],
      ['ui', 'Frontend flows complete'],
      ['deploy', 'Deployed end to end'],
    ]),
    rubric: rubric([
      ['features', 'All flows work end to end'],
      ['arch', 'Clear API/frontend separation'],
      ['quality', 'Validation and error states throughout'],
      ['live', 'Deployed and seeded with demo data'],
    ]),
    deliverables: ['Live URL', 'Repo with architecture notes'],
    testing: 'API integration tests + one E2E happy path.',
  },
  {
    slug: 'oss-contribution',
    title: 'Open-source contribution',
    summary: 'Land a merged PR (or a substantive reviewed one) in a real project.',
    requirements: [
      'Pick an issue in a project you actually use',
      'Follow the project’s contribution guide',
      'Engage with review feedback',
    ],
    milestones: ms([
      ['scout', 'Issue picked and claimed'],
      ['setup', 'Dev environment running'],
      ['pr', 'PR opened'],
      ['review', 'Review addressed / merged'],
    ]),
    rubric: rubric([
      ['fit', 'Contribution solves a real issue'],
      ['quality', 'PR matches project conventions'],
      ['process', 'Communication was professional'],
      ['outcome', 'Merged or seriously reviewed'],
    ]),
    deliverables: ['PR link', 'Short write-up of the process'],
    testing: 'Whatever the project requires — pass their CI.',
  },
  {
    slug: 'url-shortener-scale',
    title: 'URL shortener, designed for scale',
    summary: 'Build the classic system-design interview answer for real.',
    requirements: [
      'Shorten + redirect with collision-safe IDs',
      'Hit counting without slowing redirects',
      'A written design doc: how this scales to 100M links',
    ],
    milestones: ms([
      ['core', 'Shorten + redirect working'],
      ['ids', 'ID scheme justified and tested'],
      ['stats', 'Async hit counting'],
      ['doc', 'Scale design doc written'],
    ]),
    rubric: rubric([
      ['works', 'Correct under concurrent use'],
      ['ids', 'ID design handles collisions provably'],
      ['doc', 'Design doc covers storage, cache, and failure'],
      ['tests', 'Load or property tests included'],
    ]),
    deliverables: ['Repo', 'DESIGN.md'],
    testing: 'Property tests on ID generation; a small load test.',
  },
]
