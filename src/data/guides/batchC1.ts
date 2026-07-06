import type { TopicGuide } from './types'

export const BATCH_C1: TopicGuide[] = [
  {
    slug: 'graphs',
    title: 'Graphs',
    batch: 'C',
    tagline: 'Model relationships, pick a representation, then every problem is a traversal variant.',
    intuition: [
      'Graph problems start before the algorithm: recognize the graph (grids ARE graphs; prerequisites, accounts, words one edit apart), then choose adjacency LIST (the default), matrix (dense, small n), or implicit neighbors (grid directions computed on the fly).',
      'Almost everything reduces to: traverse (DFS/BFS) with a visited set, count or connect components, detect cycles, or find paths. Weighted shortest paths escalate to Dijkstra (a heap-powered BFS).',
    ],
    patterns: [
      { name: 'Build adjacency list', when: 'Edge-list input: Map from node to neighbors, both directions if undirected.' },
      { name: 'Connected components', when: 'Islands, provinces: traverse from every unvisited node, count starts.' },
      { name: 'Grid as graph', when: 'Four-direction neighbors, bounds checks, mark visited in place.' },
      { name: 'Dijkstra', when: 'Weighted non-negative shortest paths: min-heap of (dist, node).' },
    ],
    template: {
      code: `function countComponents(n: number, edges: number[][]): number {
  const adj = new Map<number, number[]>()
  for (const [a, b] of edges) {
    adj.set(a, [...(adj.get(a) ?? []), b])
    adj.set(b, [...(adj.get(b) ?? []), a])
  }
  const seen = new Set<number>()
  let components = 0
  for (let start = 0; start < n; start++) {
    if (seen.has(start)) continue
    components++
    const stack = [start]
    seen.add(start)
    while (stack.length) {
      const node = stack.pop() as number
      for (const next of adj.get(node) ?? []) {
        if (!seen.has(next)) {
          seen.add(next)
          stack.push(next)
        }
      }
    }
  }
  return components
}`,
      note: 'The universal skeleton: adjacency map, visited set, traverse from every unseen start.',
    },
    mistakes: [
      'Adding directed edges when the graph is undirected (or vice versa).',
      'Marking visited on POP instead of on PUSH — nodes enter the queue twice.',
      'Forgetting isolated nodes that appear in n but not in the edge list.',
      'Recursion-depth overflow on big grids — prefer the iterative stack.',
    ],
    complexity: [
      'Traversal: O(V + E) time, O(V) space.',
      'Dijkstra with a binary heap: O((V + E) log V).',
    ],
    questions: [
      'Adjacency list vs matrix — costs of edge lookup and iteration?',
      'Why must Dijkstra edge weights be non-negative?',
      'How do you detect a cycle in a directed vs undirected graph?',
    ],
    problems: [
      { name: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
      { name: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium' },
      { name: 'Max Area of Island', slug: 'max-area-of-island', difficulty: 'Medium' },
      { name: 'Network Delay Time', slug: 'network-delay-time', difficulty: 'Medium' },
      { name: 'Graph Valid Tree', slug: 'graph-valid-tree', difficulty: 'Medium' },
    ],
    next: ['dfs', 'bfs', 'union-find'],
  },
  {
    slug: 'dfs',
    title: 'Depth-First Search',
    batch: 'C',
    tagline: 'Go deep, backtrack, exhaust — the traversal for existence, components, and cycles.',
    intuition: [
      'DFS commits to one neighbor completely before trying the next — recursion (or an explicit stack) does the bookkeeping. It answers "does a path EXIST", "what is reachable", and "is there a cycle", and it is the engine underneath backtracking and topological sort.',
      'The three-color trick for directed cycles: white (unvisited), gray (in the current path), black (done). Meeting a GRAY node means a cycle; meeting a black one is just a cross edge.',
    ],
    patterns: [
      { name: 'Flood fill', when: 'Regions in grids: recurse over four directions, mark as you go.' },
      { name: 'Path with backtrack', when: 'Word search: mark, recurse, UNMARK on the way out.' },
      { name: 'Gray/black cycle check', when: 'Directed graphs: course schedule feasibility.' },
      { name: 'Post-order exit times', when: 'Topological order = reverse of DFS finish order.' },
    ],
    template: {
      code: `function exist(board: string[][], word: string): boolean {
  const rows = board.length
  const cols = board[0].length
  function dfs(r: number, c: number, i: number): boolean {
    if (i === word.length) return true
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false
    const saved = board[r][c]
    board[r][c] = '#' // mark
    const found =
      dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) ||
      dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1)
    board[r][c] = saved // unmark — the backtracking step
    return found
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true
  return false
}`,
      note: 'Mark before recursing, restore after — the cell is only "used" along the current path.',
    },
    mistakes: [
      'Forgetting to unmark on backtrack, poisoning other paths.',
      'Using DFS for SHORTEST path in unweighted graphs (that is BFS’s job).',
      'Visited-set semantics: per-path (backtracking) vs global (reachability) — mixing them.',
      'Stack overflow on deep inputs; know the iterative rewrite.',
    ],
    complexity: [
      'O(V + E) on graphs; grid flood fill O(rows × cols).',
      'Word-search style with branching: exponential in path length — say it upfront.',
    ],
    questions: [
      'Why does DFS not guarantee shortest paths?',
      'Explain white/gray/black and what a gray-hit means.',
      'When must visited marks be undone, and when must they never be?',
    ],
    problems: [
      { name: 'Flood Fill', slug: 'flood-fill', difficulty: 'Easy' },
      { name: 'Word Search', slug: 'word-search', difficulty: 'Medium' },
      { name: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'Medium' },
      { name: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
    ],
    next: ['bfs', 'backtracking', 'topological-sort'],
  },
  {
    slug: 'bfs',
    title: 'Breadth-First Search',
    batch: 'C',
    tagline: 'Explore in rings — the first time you reach a node is the shortest way there.',
    intuition: [
      'BFS processes everything at distance d before anything at d+1, so in UNWEIGHTED graphs the first arrival is optimal. Any "minimum number of steps/moves/mutations" phrasing is BFS, even when the graph is implicit (word ladders, lock combinations).',
      'Two power-ups: LEVEL loops (snapshot the queue length to know where a distance ring ends) and MULTI-SOURCE starts (seed the queue with all sources — rotting oranges spread from every rotten cell at once).',
    ],
    patterns: [
      { name: 'Level-order loop', when: 'Anything phrased per-level or needing the distance number.' },
      { name: 'Multi-source BFS', when: 'Spread from many starts: rotting oranges, walls-and-gates.' },
      { name: 'Implicit state graph', when: 'Word ladder, sliding puzzle: states are nodes, moves are edges.' },
      { name: '0-1 BFS / deque', when: 'Edge weights of only 0 and 1 — push-front vs push-back.' },
    ],
    template: {
      code: `function shortestPath(grid: number[][], start: [number, number], goal: [number, number]): number {
  const rows = grid.length
  const cols = grid[0].length
  const queue: [number, number][] = [start]
  const seen = new Set<string>([start.join()])
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let dist = 0
  while (queue.length) {
    const levelSize = queue.length // snapshot: this ring only
    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift() as [number, number]
      if (r === goal[0] && c === goal[1]) return dist
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        const key = nr + ',' + nc
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === 0 && !seen.has(key)) {
          seen.add(key)
          queue.push([nr, nc])
        }
      }
    }
    dist++
  }
  return -1
}`,
      note: 'Snapshot the queue length per ring; mark seen on ENQUEUE so nothing enters twice.',
    },
    mistakes: [
      'Marking visited on dequeue — the same cell floods the queue.',
      'Reading queue.length inside the level loop after pushes (moving target).',
      'Using BFS on weighted graphs where Dijkstra is required.',
      'Building the full implicit graph up front instead of generating neighbors lazily.',
    ],
    complexity: [
      'O(V + E) time; space up to the widest frontier (O(V)).',
      'Implicit graphs: O(states × transition cost) — count the states honestly.',
    ],
    questions: [
      'Prove first-arrival-is-shortest for unweighted BFS.',
      'How does multi-source BFS change the initialization only?',
      'Why does the level-size snapshot give you the distance for free?',
    ],
    problems: [
      { name: 'Rotting Oranges', slug: 'rotting-oranges', difficulty: 'Medium' },
      { name: 'Shortest Path in Binary Matrix', slug: 'shortest-path-in-binary-matrix', difficulty: 'Medium' },
      { name: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard' },
      { name: 'Open the Lock', slug: 'open-the-lock', difficulty: 'Medium' },
    ],
    next: ['topological-sort', 'union-find'],
  },
  {
    slug: 'topological-sort',
    title: 'Topological Sort',
    batch: 'C',
    tagline: 'Order a DAG so every edge points forward — dependencies before dependents.',
    intuition: [
      'When tasks have prerequisites, a valid order exists exactly when the directed graph has NO cycle. Kahn’s algorithm makes this constructive: repeatedly take a node with zero unmet prerequisites (in-degree 0), emit it, and release its dependents.',
      'If the queue empties before every node is emitted, the leftovers form a cycle — so the same loop answers both "give me an order" and "is it even possible".',
    ],
    patterns: [
      { name: 'Kahn (BFS) ordering', when: 'Course schedule, build order — the default.' },
      { name: 'Cycle-or-order', when: 'Emitted count < n means a cycle exists.' },
      { name: 'DFS finish-order', when: 'Reverse post-order is also topological — handy mid-DFS.' },
      { name: 'Layered ordering', when: 'Process by levels: parallel course semesters, alien dictionary.' },
    ],
    template: {
      code: `function topoOrder(n: number, edges: [number, number][]): number[] {
  const adj = new Map<number, number[]>()
  const indeg = new Array<number>(n).fill(0)
  for (const [from, to] of edges) {
    adj.set(from, [...(adj.get(from) ?? []), to])
    indeg[to]++
  }
  const queue: number[] = []
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i)
  const order: number[] = []
  while (queue.length) {
    const node = queue.shift() as number
    order.push(node)
    for (const next of adj.get(node) ?? []) {
      if (--indeg[next] === 0) queue.push(next)
    }
  }
  return order.length === n ? order : [] // empty = cycle
}`,
      note: 'In-degree zero means "ready". Emitting a node releases its dependents.',
    },
    mistakes: [
      'Reversing edge direction when translating "a requires b" into the graph.',
      'Forgetting the cycle check (order shorter than n).',
      'Running topological sort on an undirected graph — it is a DAG concept.',
      'Assuming THE order is unique; usually many valid orders exist.',
    ],
    complexity: [
      'O(V + E) time, O(V) space — same as any traversal.',
    ],
    questions: [
      'Why does in-degree-zero processing produce a valid order?',
      'How does Kahn’s algorithm double as cycle detection?',
      'When would you want the DFS variant instead?',
    ],
    problems: [
      { name: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
      { name: 'Course Schedule II', slug: 'course-schedule-ii', difficulty: 'Medium' },
      { name: 'Alien Dictionary', slug: 'alien-dictionary', difficulty: 'Hard' },
      { name: 'Minimum Height Trees', slug: 'minimum-height-trees', difficulty: 'Medium' },
    ],
    next: ['union-find', 'dynamic-programming'],
  },
  {
    slug: 'union-find',
    title: 'Union-Find',
    batch: 'C',
    tagline: 'Merge sets and ask "same group?" in near-constant time — connectivity without traversal.',
    intuition: [
      'Union-Find (disjoint set union) maintains a forest where each set has a root representative. find(x) walks to the root; union(a, b) links two roots. With PATH COMPRESSION (point nodes straight at the root while finding) and UNION BY RANK/SIZE, both operations are effectively O(1).',
      'Reach for it when edges arrive INCREMENTALLY and you keep asking about connectivity: redundant connection, accounts merge, number of components as you add edges. Traversal answers a snapshot; union-find answers a stream.',
    ],
    patterns: [
      { name: 'Component counting', when: 'Start with n singletons; each successful union decrements the count.' },
      { name: 'Cycle detection (undirected)', when: 'An edge whose endpoints already share a root is redundant.' },
      { name: 'Group by equivalence', when: 'Accounts merge, similar sentences — union everything equivalent.' },
      { name: 'Kruskal MST', when: 'Sort edges, union unless it would form a cycle.' },
    ],
    template: {
      code: `class UnionFind {
  private parent: number[]
  private rank: number[]
  count: number
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array<number>(n).fill(0)
    this.count = n
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]] // path halving
      x = this.parent[x]
    }
    return x
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra
    else {
      this.parent[rb] = ra
      this.rank[ra]++
    }
    this.count--
    return true
  }
}`,
      note: 'union returns false when already connected — that IS the cycle signal.',
    },
    mistakes: [
      'Comparing nodes instead of their ROOTS when checking connectivity.',
      'Skipping path compression or rank and quietly becoming O(n) per op.',
      'Using union-find for directed reachability — it models undirected equivalence.',
      'Forgetting to map string ids to indices before unioning.',
    ],
    complexity: [
      'find/union: O(alpha(n)) amortized — inverse Ackermann, effectively constant.',
      'Space O(n).',
    ],
    questions: [
      'What do path compression and union by rank each optimize?',
      'How does union-find detect the redundant edge in a tree-plus-one-edge graph?',
      'Union-find vs DFS for connectivity — when does each win?',
    ],
    problems: [
      { name: 'Number of Provinces', slug: 'number-of-provinces', difficulty: 'Medium' },
      { name: 'Redundant Connection', slug: 'redundant-connection', difficulty: 'Medium' },
      { name: 'Accounts Merge', slug: 'accounts-merge', difficulty: 'Medium' },
      { name: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', difficulty: 'Medium' },
    ],
    next: ['dynamic-programming', 'greedy'],
  },
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming',
    batch: 'C',
    tagline: 'Define the state, write the recurrence, order the computation — optimal via subproblems.',
    intuition: [
      'DP applies when a problem has OPTIMAL SUBSTRUCTURE (the best answer builds from best sub-answers) and OVERLAPPING SUBPROBLEMS (the same sub-answers recur). The entire craft is defining the STATE precisely: "dp[i] = best answer considering the first i items" or "dp[i][j] = answer for prefix i of A and prefix j of B".',
      'Work the checklist: 1) state definition in words, 2) recurrence, 3) base cases, 4) iteration order (or memoized recursion), 5) where the final answer lives. Say the state definition OUT LOUD in interviews — it is most of the credit.',
    ],
    patterns: [
      { name: '1D linear', when: 'Climbing stairs, house robber: dp[i] from dp[i-1], dp[i-2].' },
      { name: 'Knapsack (choice)', when: 'Take or skip an item: coin change, target sum, subsets.' },
      { name: 'Two-sequence grid', when: 'Edit distance, LCS: dp[i][j] over prefixes of both inputs.' },
      { name: 'Interval DP', when: 'dp over [l, r] ranges: burst balloons, palindrome partitioning.' },
    ],
    template: {
      code: `// Coin change: fewest coins to reach amount (unbounded knapsack shape).
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity)
  dp[0] = 0 // zero coins make zero
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
      note: 'State: dp[a] = fewest coins for amount a. Recurrence: best over last-coin choices.',
    },
    mistakes: [
      'Coding before stating the state definition — the number one failure mode.',
      'Wrong iteration order so the recurrence reads values not yet computed.',
      'Conflating combinations vs permutations in coin-style counting (loop order matters).',
      'Missing base cases, especially the empty/zero state.',
    ],
    complexity: [
      'Time = number of states × transitions per state; space = states (often compressible one row).',
    ],
    questions: [
      'State the dp definition for edit distance and derive its recurrence.',
      'Why does loop order distinguish coin-combinations from coin-permutations?',
      'When can a 2D dp be compressed to 1D, and what ordering constraint appears?',
    ],
    problems: [
      { name: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy' },
      { name: 'House Robber', slug: 'house-robber', difficulty: 'Medium' },
      { name: 'Coin Change', slug: 'coin-change', difficulty: 'Medium' },
      { name: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium' },
      { name: 'Edit Distance', slug: 'edit-distance', difficulty: 'Medium' },
      { name: 'Longest Common Subsequence', slug: 'longest-common-subsequence', difficulty: 'Medium' },
    ],
    next: ['memoization', 'backtracking', 'greedy'],
  },
  {
    slug: 'memoization',
    title: 'Memoization',
    batch: 'C',
    tagline: 'Top-down DP: write the natural recursion, cache by arguments, exponential becomes polynomial.',
    intuition: [
      'Memoization is the lazy path into DP: keep the recursive solution you already believe in, and cache results keyed by the call arguments. If fib(n) branches into an exponential tree but only n distinct inputs exist, caching collapses the tree to n calls.',
      'It computes only REACHABLE states (a real win when the state space is sparse), at the cost of recursion depth. Tabulation (bottom-up) is the same math with explicit ordering — be able to convert between them.',
    ],
    patterns: [
      { name: 'Cache on args', when: 'Any pure recursion with repeated (small, hashable) inputs.' },
      { name: 'Map for composite keys', when: 'Multi-arg states: key "i,j" or nested maps.' },
      { name: 'Memo + choices', when: 'Word break, decode ways: recursion over suffixes with a cache.' },
      { name: 'Convert to tabulation', when: 'Depth limits or when iteration order is obvious.' },
    ],
    template: {
      code: `function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set(wordDict)
  const memo = new Map<number, boolean>()
  function canBreak(start: number): boolean {
    if (start === s.length) return true
    const cached = memo.get(start)
    if (cached !== undefined) return cached
    for (let end = start + 1; end <= s.length; end++) {
      if (words.has(s.slice(start, end)) && canBreak(end)) {
        memo.set(start, true)
        return true
      }
    }
    memo.set(start, false)
    return false
  }
  return canBreak(0)
}`,
      note: 'The state is just the start index — n states, each tried once, instead of 2^n paths.',
    },
    mistakes: [
      'Caching functions that depend on MUTABLE external state — the cache lies.',
      'Keying on objects/arrays by reference instead of a canonical string key.',
      'Forgetting to store the negative result (false/Infinity), re-exploring dead ends.',
      'Ignoring recursion depth limits that tabulation would avoid.',
    ],
    complexity: [
      'Time: O(distinct states × work per state). Space: cache + recursion stack.',
    ],
    questions: [
      'Memoization vs tabulation — trade-offs in space, order, and reachable states?',
      'What makes a function safe to memoize?',
      'Show how fib goes from O(2^n) to O(n) with a two-line change.',
    ],
    problems: [
      { name: 'Word Break', slug: 'word-break', difficulty: 'Medium' },
      { name: 'Decode Ways', slug: 'decode-ways', difficulty: 'Medium' },
      { name: 'Unique Paths', slug: 'unique-paths', difficulty: 'Medium' },
      { name: 'Partition Equal Subset Sum', slug: 'partition-equal-subset-sum', difficulty: 'Medium' },
    ],
    next: ['backtracking', 'divide-and-conquer'],
  },
]
