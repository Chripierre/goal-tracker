export interface BriefingQuote {
  text: string
  author: string
}

export interface BriefingTopic {
  topic: string
  why: string
  source?: string
}

export const QUOTES: readonly BriefingQuote[] = [
  { text: 'He who has a why to live for can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche' },
  {
    text: 'No one can build you the bridge on which you, and only you, must cross the river of life.',
    author: 'Friedrich Nietzsche',
  },
  {
    text: 'Education is the passport to the future, for tomorrow belongs to those who prepare for it today.',
    author: 'Malcolm X',
  },
  {
    text: 'There is no better than adversity. Every defeat, every heartbreak, every loss, contains its own seed, its own lesson on how to improve your performance the next time.',
    author: 'Malcolm X',
  },
  { text: 'Stumbling is not falling.', author: 'Malcolm X' },
  { text: 'If there is no struggle, there is no progress.', author: 'Frederick Douglass' },
  { text: 'You may encounter many defeats, but you must not be defeated.', author: 'Maya Angelou' },
  {
    text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'",
    author: 'Muhammad Ali',
  },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  {
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'It is not what happens to you, but how you react to it that matters.',
    author: 'Epictetus',
  },
  {
    text: 'Not everything that is faced can be changed, but nothing can be changed until it is faced.',
    author: 'James Baldwin',
  },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
  },
]

export const TIPS: readonly string[] = [
  'Read the error message twice before touching the code — the answer is usually in it.',
  'When a bug resists you for 30 minutes, explain it out loud to a rubber duck (or a note). The act of explaining finds it.',
  'Commit small and often — a commit is a save point you will thank yourself for.',
  'Write the test that reproduces the bug BEFORE fixing it. The fix then proves itself.',
  'Name things for the person reading the code next year — that person is you.',
  'git bisect finds the commit that broke things in log₂(n) steps. Let the machine do the search.',
  'Timebox deep debugging: 45 minutes, then take a walk. The shower solves what the desk cannot.',
  'The third time you do something manually, automate it.',
  'Learn one editor deeply instead of five shallowly — keystrokes compound.',
  'Write the README first: if you cannot explain the tool, you do not understand the tool yet.',
  'Delete code fearlessly — git remembers everything so you do not have to.',
  'Use the Feynman technique on new topics: explain it simply, find the gap, study the gap.',
  'Spaced repetition beats cramming: touch a hard topic today, in 3 days, in a week.',
  'Read the source of the libraries you depend on — it is the best senior code you have free access to.',
  'Sleep on the hard bug. Tired debugging writes new bugs.',
  'Before optimizing, measure. Before measuring, ask if anyone will notice.',
  'When stuck between two designs, prototype the riskiest part of each for an hour.',
  'A pull request under 200 lines gets reviewed today; one over 1000 gets skimmed never.',
]

/** Refreshed 2026-07-07 from 2026 skills research (see WORKLOG Session 13). */
export const EXPLORE_TOPICS: readonly BriefingTopic[] = [
  {
    topic: 'AI-assisted development workflows',
    why: 'AI-skill mentions in job postings nearly doubled year over year — knowing how to direct coding copilots is becoming table stakes.',
    source: 'https://www.trifleck.com/blog/the-state-of-the-software-engineering-job-market-for-2026-trends-what-to-expect',
  },
  {
    topic: 'Prompt engineering patterns',
    why: 'Structured prompts, few-shot examples, and evals turn LLMs from toys into tools.',
  },
  {
    topic: 'Retrieval-augmented generation (RAG)',
    why: 'The standard architecture for grounding LLMs in your own data — chunking, embeddings, retrieval.',
  },
  {
    topic: 'Vector databases',
    why: 'The storage layer behind semantic search and RAG: HNSW indexes, similarity metrics, trade-offs.',
  },
  {
    topic: 'DevSecOps & security by design',
    why: 'Security moved from afterthought to core requirement — OWASP top 10 is the entry ticket.',
    source: 'https://www.refontelearning.com/blog/software-engineering-in-2026-top-5-trends-shaping-the-future',
  },
  {
    topic: 'Kubernetes & orchestration',
    why: 'Cloud platforms and orchestration are core competencies now, not specialties.',
    source: 'https://www.cio.com/article/4096592/the-10-hottest-it-skills-for-2026.html',
  },
  {
    topic: 'Observability: logs, metrics, traces',
    why: 'Systems you cannot see are systems you cannot fix — OpenTelemetry is the lingua franca.',
  },
  {
    topic: 'Event-driven architecture',
    why: 'Queues, streams, and eventual consistency power everything at scale — learn when NOT to use them too.',
  },
  {
    topic: 'WebAssembly (WASM)',
    why: 'Near-native speed in the browser and a portable runtime beyond it — plugins, edge, sandboxing.',
  },
  {
    topic: 'Edge computing & serverless',
    why: 'Compute is moving next to users; cold starts, regions, and pricing models change your designs.',
  },
  {
    topic: 'AI agent orchestration',
    why: 'Beyond single prompts: tool use, planning loops, and multi-agent patterns are an emerging discipline.',
    source: 'https://www.cio.com/article/4096592/the-10-hottest-it-skills-for-2026.html',
  },
  {
    topic: 'Postgres deep-dive',
    why: 'The database that quietly won — indexes, EXPLAIN, JSONB, and full-text search cover most real needs.',
  },
]
