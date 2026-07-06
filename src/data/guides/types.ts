export type GuideBatch = 'A' | 'B' | 'C'
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface GuidePattern {
  name: string
  when: string
}

export interface GuideProblem {
  name: string
  /** leetcode.com/problems/<slug>/ */
  slug: string
  difficulty: ProblemDifficulty
}

export interface TopicGuide {
  slug: string
  title: string
  batch: GuideBatch
  /** One line: what it is and when to reach for it. */
  tagline: string
  intuition: string[]
  patterns: GuidePattern[]
  /** TypeScript template solution(s), ready to adapt in an interview. */
  template: { code: string; note: string }
  mistakes: string[]
  complexity: string[]
  /** Conceptual questions an interviewer actually asks. */
  questions: string[]
  problems: GuideProblem[]
  /** Slugs to study next. */
  next: string[]
}

/** Every topic from the owner brief, in recommended study order. */
export const PLANNED_TOPICS: { slug: string; title: string; batch: GuideBatch }[] = [
  { slug: 'arrays', title: 'Arrays & Two Pointers', batch: 'A' },
  { slug: 'strings', title: 'Strings', batch: 'A' },
  { slug: 'hash-maps', title: 'Hash Maps & Sets', batch: 'A' },
  { slug: 'sliding-window', title: 'Sliding Window', batch: 'A' },
  { slug: 'binary-search', title: 'Binary Search', batch: 'A' },
  { slug: 'prefix-sum', title: 'Prefix Sum', batch: 'A' },
  { slug: 'linked-lists', title: 'Linked Lists', batch: 'B' },
  { slug: 'queues', title: 'Queues & Deques', batch: 'B' },
  { slug: 'monotonic-stack', title: 'Stacks & Monotonic Stack', batch: 'B' },
  { slug: 'recursion', title: 'Recursion', batch: 'B' },
  { slug: 'sorting', title: 'Sorting', batch: 'B' },
  { slug: 'trees', title: 'Trees', batch: 'B' },
  { slug: 'bst', title: 'Binary Search Trees', batch: 'B' },
  { slug: 'heaps', title: 'Heaps & Priority Queues', batch: 'B' },
  { slug: 'tries', title: 'Tries', batch: 'B' },
  { slug: 'graphs', title: 'Graphs', batch: 'C' },
  { slug: 'dfs', title: 'Depth-First Search', batch: 'C' },
  { slug: 'bfs', title: 'Breadth-First Search', batch: 'C' },
  { slug: 'topological-sort', title: 'Topological Sort', batch: 'C' },
  { slug: 'union-find', title: 'Union-Find', batch: 'C' },
  { slug: 'dynamic-programming', title: 'Dynamic Programming', batch: 'C' },
  { slug: 'memoization', title: 'Memoization', batch: 'C' },
  { slug: 'backtracking', title: 'Backtracking', batch: 'C' },
  { slug: 'greedy', title: 'Greedy', batch: 'C' },
  { slug: 'bit-manipulation', title: 'Bit Manipulation', batch: 'C' },
  { slug: 'divide-and-conquer', title: 'Divide & Conquer', batch: 'C' },
  { slug: 'math', title: 'Math', batch: 'C' },
  { slug: 'geometry', title: 'Geometry', batch: 'C' },
]
