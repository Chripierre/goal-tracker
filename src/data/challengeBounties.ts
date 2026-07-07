import {
  MONTHLY_CHALLENGES,
  WEEKLY_CHALLENGES,
  type ChallengeItem,
  type ChallengeTemplate,
  type RubricItem,
} from './challengeTemplates'

export type BountyTier = 'low' | 'mid' | 'high'

export interface Bounty extends ChallengeTemplate {
  tier: BountyTier
  estimate: string
  /** Suited to building with other people. */
  collab?: boolean
  /** Idea provenance, when researched from the wild. */
  source?: string
}

function rubric(items: [string, string][]): RubricItem[] {
  return items.map(([id, label]) => ({ id, label, points: 25 }))
}

function ms(items: [string, string][]): ChallengeItem[] {
  return items.map(([id, label]) => ({ id, label }))
}

/** Legacy monthly templates that are really multi-month efforts. */
const HIGH_LEGACY = new Set(['oss-contribution', 'url-shortener-scale'])

const LEGACY_LOW: Bounty[] = WEEKLY_CHALLENGES.map((t) => ({
  ...t,
  tier: 'low' as const,
  estimate: 'about a week',
}))

const LEGACY_MID_HIGH: Bounty[] = MONTHLY_CHALLENGES.map((t) => ({
  ...t,
  tier: HIGH_LEGACY.has(t.slug) ? ('high' as const) : ('mid' as const),
  estimate: HIGH_LEGACY.has(t.slug) ? 'multi-month' : 'about a month',
  ...(t.slug === 'oss-contribution' ? { collab: true } : {}),
}))

const NEW_BOUNTIES: Bounty[] = [
  {
    slug: 'github-contrib-visualizer',
    title: 'GitHub contribution insights',
    tier: 'low',
    estimate: 'about a week',
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'Go beyond the green squares: fetch a user’s GitHub activity and surface real insights.',
    requirements: [
      'Input any username, fetch events/repos from the REST API',
      'At least three insights (streaks, language mix, active hours, repo focus)',
      'Sharable rendered summary card',
    ],
    milestones: ms([
      ['fetch', 'API data fetching with rate-limit handling'],
      ['insights', 'Three insight computations'],
      ['render', 'Insight dashboard renders'],
      ['share', 'Exportable/sharable summary'],
    ]),
    rubric: rubric([
      ['insightful', 'Insights say something the heatmap does not'],
      ['robust', 'Handles empty/huge accounts and rate limits'],
      ['code', 'API, analysis, and UI cleanly separated'],
      ['polish', 'Presentable enough to share publicly'],
    ]),
    deliverables: ['Live URL', 'Repo with README and screenshots'],
    testing: 'Unit tests on the insight computations with fixture data.',
  },
  {
    slug: 'ai-commit-summarizer',
    title: 'AI commit summarizer CLI',
    tier: 'low',
    estimate: 'about a week',
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'A CLI that reads a git diff or commit range and produces crisp summaries and changelog entries via an LLM API.',
    requirements: [
      'Reads staged diff or a commit range',
      'Produces a conventional-commit message and a changelog paragraph',
      'API key via env; graceful failure without one',
    ],
    milestones: ms([
      ['diff', 'Diff/commit-range extraction'],
      ['prompt', 'Prompting produces reliable summaries'],
      ['cli', 'Ergonomic CLI with flags'],
      ['docs', 'README with real examples'],
    ]),
    rubric: rubric([
      ['useful', 'You actually use it on this repo'],
      ['prompting', 'Handles large diffs (chunking/truncation) sensibly'],
      ['code', 'Git layer, LLM client, and CLI separated'],
      ['docs', 'Install-and-use in under a minute'],
    ]),
    deliverables: ['Repo', 'Demo GIF of it summarizing a real commit'],
    testing: 'Tests for diff parsing and prompt assembly (LLM mocked).',
  },
  {
    slug: 'rag-doc-qa',
    title: 'RAG document Q&A',
    tier: 'mid',
    estimate: 'about a month',
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'Ask questions over your own notes/PDFs: chunking, embeddings, retrieval, and cited answers.',
    requirements: [
      'Ingest a folder of markdown/PDF into chunked embeddings',
      'Retrieval + answer generation with SOURCE CITATIONS',
      'Honest "not in the documents" behavior',
    ],
    milestones: ms([
      ['ingest', 'Chunking + embedding pipeline'],
      ['retrieve', 'Relevant chunks retrieved for queries'],
      ['answer', 'Cited answers generated'],
      ['eval', 'Small eval set scoring retrieval quality'],
    ]),
    rubric: rubric([
      ['grounded', 'Answers cite real chunks; refuses when absent'],
      ['retrieval', 'Sensible chunking and top-k choices, justified'],
      ['code', 'Pipeline stages composable and testable'],
      ['eval', 'Eval set with before/after tuning numbers'],
    ]),
    deliverables: ['Repo', 'Write-up on retrieval quality findings'],
    testing: 'Retrieval eval harness with a fixture corpus.',
  },
  {
    slug: 'ai-code-reviewer',
    title: 'AI pull-request reviewer',
    tier: 'mid',
    estimate: 'about a month',
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'A GitHub Action or webhook bot that reviews PR diffs and comments with concrete, line-anchored suggestions.',
    requirements: [
      'Triggers on PR, reads the diff, posts review comments',
      'Suggestions are line-anchored and actionable, not generic',
      'Configurable rules/persona per repo',
    ],
    milestones: ms([
      ['plumbing', 'Action/webhook receives PRs and posts comments'],
      ['review', 'LLM review with line anchoring'],
      ['filters', 'Noise control: only high-confidence comments'],
      ['dogfood', 'Running on your own repos'],
    ]),
    rubric: rubric([
      ['signal', 'Comments you would actually accept in review'],
      ['anchoring', 'Comments land on the right lines'],
      ['safety', 'No secrets leave the environment; token scopes minimal'],
      ['dogfood', 'Evidence of real use on your PRs'],
    ]),
    deliverables: ['Repo', 'Screenshots of real reviews it wrote'],
    testing: 'Fixture diffs with expected-comment assertions (LLM mocked).',
  },
  {
    slug: 'mini-search-engine',
    title: 'Mini search engine',
    tier: 'mid',
    estimate: 'about a month',
    source: 'https://hackr.io/blog/full-stack-project-ideas',
    summary: 'Crawler, inverted index, and ranked search over a small corpus — no search library allowed.',
    requirements: [
      'Polite crawler over a bounded site set (or local corpus)',
      'Hand-built inverted index with TF-IDF or BM25 ranking',
      'Search UI with highlighted snippets under 100ms per query',
    ],
    milestones: ms([
      ['crawl', 'Corpus acquired and normalized'],
      ['index', 'Inverted index built and persisted'],
      ['rank', 'Ranked queries with scoring you can explain'],
      ['ui', 'Search page with snippets'],
    ]),
    rubric: rubric([
      ['correct', 'Relevant results for a test query set'],
      ['understanding', 'You can whiteboard the index and scoring'],
      ['perf', 'Query latency measured and documented'],
      ['code', 'Crawler/indexer/query engine separated'],
    ]),
    deliverables: ['Repo', 'DESIGN.md explaining index format and ranking'],
    testing: 'Golden-query tests asserting top results.',
  },
  {
    slug: 'resume-screener',
    title: 'Explainable resume screener',
    tier: 'mid',
    estimate: 'about a month',
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'Match resumes against a job posting with transparent, criterion-by-criterion explanations — the anti-black-box.',
    requirements: [
      'Parse resume text + job description into structured criteria',
      'Score with per-criterion evidence quotes',
      'Bias guardrails documented (what it ignores and why)',
    ],
    milestones: ms([
      ['parse', 'Both documents to structured form'],
      ['match', 'Criterion matching with evidence'],
      ['report', 'Readable match report UI'],
      ['ethics', 'Guardrails write-up'],
    ]),
    rubric: rubric([
      ['explainable', 'Every score traces to quoted evidence'],
      ['honest', 'Says what it cannot judge'],
      ['useful', 'Run against your own resume + real postings'],
      ['writeup', 'Bias/limits documented like you mean it'],
    ]),
    deliverables: ['Repo', 'Sample report on your own resume'],
    testing: 'Fixture resume/posting pairs with expected criterion hits.',
  },
  {
    slug: 'collab-editor',
    title: 'Collaborative markdown editor',
    tier: 'high',
    estimate: 'multi-month',
    collab: true,
    source: 'https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e',
    summary: 'Google-Docs-lite: real-time multi-cursor markdown editing that survives conflicts — CRDTs or OT for real.',
    requirements: [
      'Two browsers edit the same doc live with visible cursors',
      'Conflict-free merging (CRDT library or your own OT)',
      'Offline edits reconcile on reconnect',
    ],
    milestones: ms([
      ['sync', 'Two clients converge on one doc'],
      ['cursors', 'Presence + remote cursors'],
      ['offline', 'Disconnect/reconnect reconciliation'],
      ['persist', 'Documents persist server-side'],
    ]),
    rubric: rubric([
      ['converges', 'Concurrent edits never corrupt the doc'],
      ['understanding', 'You can explain WHY it converges'],
      ['ux', 'Presence and latency feel production-grade'],
      ['resilience', 'Kill a client mid-edit; nothing breaks'],
    ]),
    deliverables: ['Live URL', 'Repo', 'Write-up: CRDT/OT choice and trade-offs'],
    testing: 'Automated convergence tests: scripted concurrent edit sequences.',
  },
  {
    slug: 'collab-code-arena',
    title: 'Pair-programming rooms',
    tier: 'high',
    estimate: 'multi-month',
    collab: true,
    source: 'https://www.hackerearth.com/blog/hackathon-ideas',
    summary: 'Real-time collaborative code rooms: shared editor, live execution sandbox, and a practice-problem mode for interview prep with friends.',
    requirements: [
      'Room links; shared editor with syntax highlighting',
      'Sandboxed code execution with output streaming',
      'Problem mode: prompt + tests + timer for mock interviews',
    ],
    milestones: ms([
      ['rooms', 'Shared editing in rooms'],
      ['exec', 'Sandboxed run-code path'],
      ['problems', 'Problem mode with test results'],
      ['polish', 'Auth-light invites + session history'],
    ]),
    rubric: rubric([
      ['realtime', 'Editing and output feel instant across clients'],
      ['security', 'Execution is genuinely sandboxed (documented)'],
      ['product', 'A friend used it with you for a mock interview'],
      ['code', 'Transport, sandbox, and UI separated'],
    ]),
    deliverables: ['Live URL', 'Repo', 'A recorded mock-interview session'],
    testing: 'Sandbox escape checklist + integration tests on the run path.',
  },
  {
    slug: 'distributed-kv',
    title: 'Replicated key-value store',
    tier: 'high',
    estimate: 'multi-month',
    source: 'https://www.hackerearth.com/blog/hackathon-ideas',
    summary: 'A key-value store replicated across nodes with leader election and failover — distributed systems for real.',
    requirements: [
      'GET/SET over a simple protocol, three-node cluster',
      'Leader election + log replication (Raft-style, simplified is fine)',
      'Survives killing the leader without losing acknowledged writes',
    ],
    milestones: ms([
      ['single', 'Single-node store with persistence'],
      ['replicate', 'Log replication to followers'],
      ['elect', 'Leader election on failure'],
      ['chaos', 'Scripted kill-the-leader test passes'],
    ]),
    rubric: rubric([
      ['correct', 'Acknowledged writes survive failover'],
      ['understanding', 'You can whiteboard your election/replication rules'],
      ['observability', 'Cluster state visible via status endpoint/logs'],
      ['chaos', 'Failure tests are automated, not manual'],
    ]),
    deliverables: ['Repo', 'DESIGN.md', 'Chaos-test recording or logs'],
    testing: 'Deterministic simulation or scripted chaos tests.',
  },
]

export const BOUNTIES: readonly Bounty[] = [...LEGACY_LOW, ...LEGACY_MID_HIGH, ...NEW_BOUNTIES]
