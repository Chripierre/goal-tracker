export type AssignmentCategory = 'leetcode' | 'github' | 'project' | 'study' | 'career'

export interface AssignmentTemplate {
  id: string
  category: AssignmentCategory
  /** Static title; ignored when a pool is present (pool items are final titles). */
  title: string
  description: string
  /** Rotating titles, cycled deterministically by day. */
  pool?: readonly string[]
}

const STUDY_POOL = [
  'Study: arrays & two pointers (20 min)',
  'Study: hash maps & sets (20 min)',
  'Study: sliding window (20 min)',
  'Study: binary search (20 min)',
  'Study: linked lists (20 min)',
  'Study: stacks & queues (20 min)',
  'Study: trees & BST (20 min)',
  'Study: graphs — BFS & DFS (20 min)',
  'Study: dynamic programming basics (20 min)',
  'Study: SQL joins & aggregation (20 min)',
  'Study: Linux fundamentals (20 min)',
  'Study: REST API design (20 min)',
  'Study: Git internals (20 min)',
  'Study: testing fundamentals (20 min)',
  'Study: OOP & design patterns (20 min)',
  'Study: system design basics (20 min)',
] as const

const CAREER_POOL = [
  'Send one LinkedIn connection request with a personal note',
  'Review one job posting and list the gaps it exposes',
  'Improve one resume bullet with a concrete metric',
  'Read one engineering blog post and note one takeaway',
  'Update your skill-gap list with this week’s progress',
  'Research one target company and note why you fit',
] as const

export const ASSIGNMENT_TEMPLATES: readonly AssignmentTemplate[] = [
  {
    id: 'leetcode-daily',
    category: 'leetcode',
    title: 'Solve one LeetCode problem',
    description: 'Any difficulty counts. Consistency beats intensity.',
  },
  {
    id: 'github-commit',
    category: 'github',
    title: 'Push at least one commit',
    description: 'Real work on any repo — a project, exercises, or this tracker.',
  },
  {
    id: 'project-block',
    category: 'project',
    title: 'Spend 30 focused minutes on your current project',
    description: 'One uninterrupted block. Ship something visible.',
  },
  {
    id: 'study-topic',
    category: 'study',
    title: 'Study a core topic',
    description: 'Rotates daily through interview-relevant fundamentals.',
    pool: STUDY_POOL,
  },
  {
    id: 'career-action',
    category: 'career',
    title: 'Take one career action',
    description: 'Rotates daily through small high-leverage career moves.',
    pool: CAREER_POOL,
  },
]
