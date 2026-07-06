import type { TopicGuide } from './types'

export const BATCH_B: TopicGuide[] = [
  {
    slug: 'linked-lists',
    title: 'Linked Lists',
    batch: 'B',
    tagline: 'Pointer surgery: O(1) splicing where arrays pay O(n), at the cost of random access.',
    intuition: [
      'A linked list trades indexing for cheap structural edits. Interview problems are rarely about the structure itself — they test whether you can rewire next-pointers without losing nodes. Draw boxes and arrows; update pointers in an order that never orphans the rest of the list.',
      'Two tools solve most of them: the DUMMY head (so the real head is not a special case) and FAST/SLOW pointers (middle of list, cycle detection, k-th from end).',
    ],
    patterns: [
      { name: 'Dummy head', when: 'Any insert/delete that might touch the head — merge, remove, partition.' },
      { name: 'Fast & slow pointers', when: 'Middle node, cycle detection (Floyd), k-th from the end.' },
      { name: 'Iterative reversal', when: 'Reverse whole/partial lists: prev/curr/next three-pointer dance.' },
      { name: 'Two-list weave', when: 'Merging sorted lists, reordering, adding numbers digit by digit.' },
    ],
    template: {
      code: `interface ListNode {
  val: number
  next: ListNode | null
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let curr = head
  while (curr) {
    const next = curr.next // save before overwriting
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}`,
      note: 'The reversal triple: save next, flip the pointer, advance both. prev ends as the new head.',
    },
    mistakes: [
      'Losing the rest of the list by overwriting next before saving it.',
      'Special-casing the head instead of using a dummy node.',
      'Off-by-one with fast/slow when the list has even length — decide which middle you want.',
      'Forgetting to null-terminate the tail after a re-wire (accidental cycle).',
    ],
    complexity: [
      'Traversal/reversal: O(n) time, O(1) space iteratively.',
      'Access by index is O(n) — if the problem needs random access, a list is the wrong tool.',
    ],
    questions: [
      'Prove Floyd’s cycle detection meets inside the cycle, and how you find the entry node.',
      'Reverse nodes between positions m and n in one pass.',
      'Why does merging two sorted lists not need extra space?',
    ],
    problems: [
      { name: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy' },
      { name: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy' },
      { name: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy' },
      { name: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium' },
      { name: 'Reorder List', slug: 'reorder-list', difficulty: 'Medium' },
      { name: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'Hard' },
    ],
    next: ['queues', 'monotonic-stack', 'recursion'],
  },
  {
    slug: 'queues',
    title: 'Queues & Deques',
    batch: 'B',
    tagline: 'FIFO order: the backbone of BFS, schedulers, and sliding-window maxima.',
    intuition: [
      'A queue processes items in arrival order — that is exactly what breadth-first search needs (explore level by level) and what rate limiters and schedulers model. If a problem says "first come first served" or "level by level", think queue.',
      'A deque (double-ended queue) additionally pops from both ends. Its star turn is the MONOTONIC DEQUE: maintain candidate indices in decreasing value order and the front is always the window maximum — O(n) for sliding window max.',
    ],
    patterns: [
      { name: 'BFS frontier', when: 'Level-order traversal, shortest path in unweighted graphs.' },
      { name: 'Monotonic deque', when: 'Sliding window max/min in O(n).' },
      { name: 'Queue via two stacks', when: 'The classic design question — amortized O(1).' },
      { name: 'Circular buffer', when: 'Fixed-capacity streams, design-a-queue problems.' },
    ],
    template: {
      code: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = [] // indices, values decreasing
  const out: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] <= i - k) deque.shift() // out of window
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop()
    deque.push(i)
    if (i >= k - 1) out.push(nums[deque[0]])
  }
  return out
}`,
      note: 'Store indices, evict from the back anything smaller than the new value — front stays the max.',
    },
    mistakes: [
      'Storing values instead of indices in the deque, losing window-expiry information.',
      'Using array.shift() in hot loops in JS without noting it is O(n) — mention a head pointer.',
      'Confusing queue (BFS) with stack (DFS) and silently changing traversal order.',
      'Forgetting to evict expired front elements before reading the max.',
    ],
    complexity: [
      'Enqueue/dequeue: O(1) (amortized with head-pointer arrays).',
      'Monotonic deque window max: O(n) total — each index enters and leaves once.',
    ],
    questions: [
      'Why is the monotonic deque linear despite the nested while loop?',
      'Implement a queue with two stacks and give the amortized argument.',
      'When does BFS guarantee shortest paths?',
    ],
    problems: [
      { name: 'Implement Queue using Stacks', slug: 'implement-queue-using-stacks', difficulty: 'Easy' },
      { name: 'Sliding Window Maximum', slug: 'sliding-window-maximum', difficulty: 'Hard' },
      { name: 'Design Circular Queue', slug: 'design-circular-queue', difficulty: 'Medium' },
      { name: 'Number of Recent Calls', slug: 'number-of-recent-calls', difficulty: 'Easy' },
    ],
    next: ['monotonic-stack', 'bfs'],
  },
  {
    slug: 'monotonic-stack',
    title: 'Stacks & Monotonic Stack',
    batch: 'B',
    tagline: 'LIFO matching — and the ordered stack that answers "next greater element" in O(n).',
    intuition: [
      'Plain stacks solve nesting: matched parentheses, undo history, call frames, evaluating expressions. The invariant is always "the top is the most recent unresolved thing".',
      'A MONOTONIC stack keeps elements in sorted order by popping everything the new element beats. Each pop RESOLVES a pending question — "what is the next warmer day?" — at the moment its answer walks in. Every element pushes once and pops once: O(n).',
    ],
    patterns: [
      { name: 'Matching/nesting', when: 'Valid parentheses, decode string, calculator problems.' },
      { name: 'Next greater/smaller', when: 'Daily temperatures, stock span — pop while beaten.' },
      { name: 'Histogram rectangles', when: 'Largest rectangle: smaller bar resolves taller bars’ extents.' },
      { name: 'Min-stack', when: 'O(1) getMin by stacking (value, minSoFar) pairs.' },
    ],
    template: {
      code: `function dailyTemperatures(temps: number[]): number[] {
  const out = new Array<number>(temps.length).fill(0)
  const stack: number[] = [] // indices with strictly decreasing temps
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop() as number
      out[j] = i - j // i is j's next warmer day
    }
    stack.push(i)
  }
  return out
}`,
      note: 'Indices wait on the stack until a bigger value arrives and answers them.',
    },
    mistakes: [
      'Wrong strictness (< vs <=) when duplicates matter — decide from the problem statement.',
      'Storing values when the answer needs distances (store indices).',
      'Forgetting elements left on the stack at the end (their answer is "none"/0).',
      'Reaching for a monotonic stack on non-"nearest element" problems where it proves nothing.',
    ],
    complexity: [
      'O(n) time — each element is pushed and popped at most once. O(n) space.',
    ],
    questions: [
      'Why is the total number of pops bounded by n?',
      'How does the histogram problem use smaller elements to finalize larger ones?',
      'Design a stack with O(1) push, pop, and getMin.',
    ],
    problems: [
      { name: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy' },
      { name: 'Min Stack', slug: 'min-stack', difficulty: 'Medium' },
      { name: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium' },
      { name: 'Car Fleet', slug: 'car-fleet', difficulty: 'Medium' },
      { name: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard' },
    ],
    next: ['recursion', 'trees'],
  },
  {
    slug: 'recursion',
    title: 'Recursion',
    batch: 'B',
    tagline: 'Trust the function to solve the smaller case — define base, reduce, combine.',
    intuition: [
      'A correct recursive function needs exactly three decisions: the BASE case (smallest input answered directly), the REDUCTION (call yourself on strictly smaller input), and the COMBINE step (build the answer from sub-answers). If you can state those three sentences, the code writes itself.',
      'The recursive leap of faith: assume the recursive call already works, and only verify the three decisions. Tracing every frame by hand is how people get lost. Recursion depth is real memory — each frame lives on the stack.',
    ],
    patterns: [
      { name: 'Structural recursion', when: 'Trees and lists: solve children, combine at the node.' },
      { name: 'Divide & combine', when: 'Split input in halves (merge sort, quick sort).' },
      { name: 'Choice recursion', when: 'Include/exclude branching — the gateway to backtracking.' },
      { name: 'Tail-call as loop', when: 'When the recursion just accumulates, rewrite iteratively.' },
    ],
    template: {
      code: `// The three-decision skeleton, shown on tree depth.
interface TreeNode {
  left: TreeNode | null
  right: TreeNode | null
}

function maxDepth(node: TreeNode | null): number {
  if (node === null) return 0 // base case
  const l = maxDepth(node.left) // reduce
  const r = maxDepth(node.right)
  return 1 + Math.max(l, r) // combine
}`,
      note: 'Base, reduce, combine — every structural recursion is this skeleton with different combine logic.',
    },
    mistakes: [
      'Missing or wrong base case — the classic stack overflow.',
      'Reducing on input that is not strictly smaller (infinite recursion).',
      'Mutating shared state across branches without undoing it (see backtracking).',
      'Recomputing overlapping subproblems — that is the cue for memoization.',
    ],
    complexity: [
      'Time = number of calls × work per call; depth = max stack usage.',
      'Binary branching without pruning is O(2^n) — say so before the interviewer asks.',
    ],
    questions: [
      'Walk through the three decisions for reversing a linked list recursively.',
      'When does recursion risk stack overflow, and what is the iterative escape?',
      'What signals that a recursion needs memoization?',
    ],
    problems: [
      { name: 'Pow(x, n)', slug: 'powx-n', difficulty: 'Medium' },
      { name: 'Fibonacci Number', slug: 'fibonacci-number', difficulty: 'Easy' },
      { name: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy' },
      { name: 'Subsets', slug: 'subsets', difficulty: 'Medium' },
    ],
    next: ['trees', 'divide-and-conquer', 'memoization'],
  },
  {
    slug: 'sorting',
    title: 'Sorting',
    batch: 'B',
    tagline: 'O(n log n) order as a preprocessing step — and knowing when counting beats comparing.',
    intuition: [
      'In interviews you rarely implement a sort — you USE sorting to unlock two-pointer scans, greedy choices, and interval sweeps. The question to ask: "if this were sorted, what becomes easy?" Then decide whether O(n log n) fits the budget.',
      'Know the landscape: comparison sorts cannot beat O(n log n); counting/bucket/radix beat it when keys are small integers or bounded. Know merge sort (stable, predictable, powers "count inversions") and quickselect (K-th element in O(n) average without full sorting).',
    ],
    patterns: [
      { name: 'Sort + sweep', when: 'Intervals: sort by start, merge overlaps in one pass.' },
      { name: 'Custom comparator', when: 'Order by derived keys — largest number, closest points.' },
      { name: 'Counting/bucket sort', when: 'Bounded keys (colors, frequencies) — O(n) beats comparison.' },
      { name: 'Quickselect', when: 'K-th largest without sorting everything.' },
    ],
    template: {
      code: `function mergeIntervals(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0])
  const out: number[][] = []
  for (const [start, end] of intervals) {
    const last = out[out.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else out.push([start, end])
  }
  return out
}`,
      note: 'Sorting by start makes overlap a purely local question against the last merged interval.',
    },
    mistakes: [
      'JS default sort is LEXICOGRAPHIC — always pass a numeric comparator.',
      'Assuming stability when the runtime does not guarantee it (modern JS does; say so).',
      'Sorting when a heap or quickselect answers the question cheaper (top-K).',
      'Comparator that violates transitivity — undefined behavior, subtle bugs.',
    ],
    complexity: [
      'Comparison sorts: O(n log n) time; merge sort O(n) extra space, heapsort O(1).',
      'Counting sort: O(n + k) for key range k. Quickselect: O(n) average, O(n²) worst.',
    ],
    questions: [
      'Why can no comparison sort beat O(n log n)?',
      'Merge sort vs quicksort: when do you prefer each?',
      'Sort an array of 0s, 1s, and 2s in one pass (Dutch national flag).',
    ],
    problems: [
      { name: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium' },
      { name: 'Sort Colors', slug: 'sort-colors', difficulty: 'Medium' },
      { name: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', difficulty: 'Medium' },
      { name: 'Largest Number', slug: 'largest-number', difficulty: 'Medium' },
      { name: 'Meeting Rooms II', slug: 'meeting-rooms-ii', difficulty: 'Medium' },
    ],
    next: ['heaps', 'greedy'],
  },
  {
    slug: 'trees',
    title: 'Trees',
    batch: 'B',
    tagline: 'Recursive structure made visible — pick a traversal and decide what each node returns.',
    intuition: [
      'Every tree problem is a recursion problem wearing a costume. The two design questions: WHICH traversal order (pre/in/post-order DFS, or BFS by level) and WHAT each call returns upward (a depth, a validity flag, a subtree answer). Post-order is the workhorse: children first, then combine.',
      'When information must flow DOWN (bounds, path so far), pass parameters. When it flows UP (heights, sums), return values. Diameter-style problems do both: return height upward while updating a global best.',
    ],
    patterns: [
      { name: 'Post-order combine', when: 'Height, balance, diameter, subtree sums.' },
      { name: 'Level-order BFS', when: 'Level averages, right-side view, zigzag order.' },
      { name: 'Path state down', when: 'Root-to-leaf sums, path existence with running totals.' },
      { name: 'Lowest common ancestor', when: 'Return found-node signals upward; the split point is the LCA.' },
    ],
    template: {
      code: `interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

// Diameter: return height, record best path through each node.
function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0
  function height(node: TreeNode | null): number {
    if (!node) return 0
    const l = height(node.left)
    const r = height(node.right)
    best = Math.max(best, l + r)
    return 1 + Math.max(l, r)
  }
  height(root)
  return best
}`,
      note: 'The return value serves the parent; the side effect records the answer that passes THROUGH nodes.',
    },
    mistakes: [
      'Confusing depth (root down) with height (leaf up) mid-solution.',
      'Using in-order when the combine step actually needs post-order.',
      'Recursing without a null base case on children.',
      'BFS level loops that read queue.length AFTER pushing children (snapshot it first).',
    ],
    complexity: [
      'Traversals: O(n) time; O(h) stack space (h = height, O(n) worst for a skewed tree).',
      'BFS space is the widest level — up to O(n).',
    ],
    questions: [
      'Which traversal visits a BST in sorted order, and why?',
      'Return the height while also computing the diameter — what flows up vs through?',
      'How do you serialize and deserialize a binary tree?',
    ],
    problems: [
      { name: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy' },
      { name: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy' },
      { name: 'Diameter of Binary Tree', slug: 'diameter-of-binary-tree', difficulty: 'Easy' },
      { name: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium' },
      { name: 'Lowest Common Ancestor of a Binary Tree', slug: 'lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium' },
      { name: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', difficulty: 'Hard' },
    ],
    next: ['bst', 'dfs', 'bfs'],
  },
  {
    slug: 'bst',
    title: 'Binary Search Trees',
    batch: 'B',
    tagline: 'The ordering invariant (left < node < right) turns tree walks into guided searches.',
    intuition: [
      'A BST is binary search as a data structure: at every node you know which side the target lives on. Search, insert, floor/ceiling — all O(h) by discarding a subtree per step. In-order traversal visits keys in sorted order, which is the key to validation and k-th smallest.',
      'The invariant is about ENTIRE subtrees, not just children. Validation must carry (min, max) bounds down — checking only node vs child is the classic trap.',
    ],
    patterns: [
      { name: 'Bound-carrying validation', when: 'Validate BST: each node must fit (lo, hi) from its ancestors.' },
      { name: 'In-order for order', when: 'K-th smallest, sorted output, successor problems.' },
      { name: 'Guided descent', when: 'Search/insert/LCA in O(h) by comparing and going one way.' },
      { name: 'Build from sorted input', when: 'Middle element as root keeps it balanced.' },
    ],
    template: {
      code: `interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

function isValidBST(
  node: TreeNode | null,
  lo = -Infinity,
  hi = Infinity,
): boolean {
  if (!node) return true
  if (node.val <= lo || node.val >= hi) return false
  return isValidBST(node.left, lo, node.val) && isValidBST(node.right, node.val, hi)
}`,
      note: 'Bounds tighten on the way down — the subtree invariant enforced with two parameters.',
    },
    mistakes: [
      'Validating only parent-vs-child instead of full-subtree bounds.',
      'Forgetting duplicate policy (usually strict <) and using <=.',
      'Assuming O(log n) when the tree may be a degenerate chain — say "O(h)".',
      'Deleting a node without handling the two-children case (swap with in-order successor).',
    ],
    complexity: [
      'Search/insert/delete: O(h) — O(log n) balanced, O(n) degenerate.',
      'In-order traversal: O(n).',
    ],
    questions: [
      'Why does in-order traversal of a BST yield sorted order?',
      'Find the LCA of two nodes in a BST without parent pointers.',
      'How do self-balancing trees keep h at O(log n) — at what cost?',
    ],
    problems: [
      { name: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium' },
      { name: 'Kth Smallest Element in a BST', slug: 'kth-smallest-element-in-a-bst', difficulty: 'Medium' },
      { name: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium' },
      { name: 'Convert Sorted Array to Binary Search Tree', slug: 'convert-sorted-array-to-binary-search-tree', difficulty: 'Easy' },
      { name: 'Insert into a Binary Search Tree', slug: 'insert-into-a-binary-search-tree', difficulty: 'Medium' },
    ],
    next: ['heaps', 'graphs'],
  },
  {
    slug: 'heaps',
    title: 'Heaps & Priority Queues',
    batch: 'B',
    tagline: 'Always know the current best in O(1), pay O(log n) to keep it that way.',
    intuition: [
      'A heap answers one question fast: "what is the min (or max) RIGHT NOW?" — while items keep arriving. That is why it powers top-K, merging K streams, schedulers, and Dijkstra. It is a complete binary tree stored in an array: parent at i, children at 2i+1 and 2i+2.',
      'The top-K idiom inverts intuition: to keep the K LARGEST items, use a MIN-heap of size K — the root is the smallest of the winners, and every newcomer only has to beat it.',
    ],
    patterns: [
      { name: 'Size-K heap for top-K', when: 'K largest/smallest/closest in O(n log k).' },
      { name: 'Two heaps', when: 'Streaming median: max-heap of lows, min-heap of highs, balanced.' },
      { name: 'K-way merge', when: 'Merge K sorted lists: heap of current heads.' },
      { name: 'Scheduling by priority', when: 'Task cooldowns, meeting rooms, Dijkstra frontier.' },
    ],
    template: {
      code: `class MinHeap {
  private a: number[] = []
  size(): number { return this.a.length }
  peek(): number { return this.a[0] }
  push(x: number): void {
    this.a.push(x)
    for (let i = this.a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1
      if (this.a[p] <= this.a[i]) break
      ;[this.a[p], this.a[i]] = [this.a[i], this.a[p]]
      i = p
    }
  }
  pop(): number {
    const top = this.a[0]
    const last = this.a.pop() as number
    if (this.a.length) {
      this.a[0] = last
      for (let i = 0; ; ) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < this.a.length && this.a[l] < this.a[m]) m = l
        if (r < this.a.length && this.a[r] < this.a[m]) m = r
        if (m === i) break
        ;[this.a[m], this.a[i]] = [this.a[i], this.a[m]]
        i = m
      }
    }
    return top
  }
}`,
      note: 'JS has no built-in heap — be ready to write bubble-up and sift-down from memory.',
    },
    mistakes: [
      'Max-heap of everything for top-K (O(n log n)) instead of a size-K min-heap (O(n log k)).',
      'Heapifying by n pushes (O(n log n)) when bottom-up heapify is O(n) — mention it.',
      'Letting the two-heaps median drift more than one element out of balance.',
      'Assuming heap iteration order is sorted — only the root is guaranteed.',
    ],
    complexity: [
      'push/pop: O(log n); peek: O(1); build-heap: O(n).',
      'Top-K over a stream: O(n log k) time, O(k) space.',
    ],
    questions: [
      'Why does a min-heap of size K keep the K largest elements?',
      'Explain the array index arithmetic for parent and children.',
      'Design the streaming-median structure and its rebalancing rule.',
    ],
    problems: [
      { name: 'Kth Largest Element in a Stream', slug: 'kth-largest-element-in-a-stream', difficulty: 'Easy' },
      { name: 'Last Stone Weight', slug: 'last-stone-weight', difficulty: 'Easy' },
      { name: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium' },
      { name: 'Task Scheduler', slug: 'task-scheduler', difficulty: 'Medium' },
      { name: 'Find Median from Data Stream', slug: 'find-median-from-data-stream', difficulty: 'Hard' },
    ],
    next: ['graphs', 'greedy'],
  },
  {
    slug: 'tries',
    title: 'Tries',
    batch: 'B',
    tagline: 'A tree of shared prefixes — search cost depends on word length, not dictionary size.',
    intuition: [
      'A trie stores strings character by character down a tree, so words sharing a prefix share a path. Lookup, insert, and prefix queries cost O(word length) regardless of how many words are stored — which is why autocomplete, spell checkers, and word games use them.',
      'Each node needs two things: children (map or 26-slot array) and an end-of-word flag. The flag matters: "car" being a path does not mean "ca" is a word.',
    ],
    patterns: [
      { name: 'Prefix search', when: 'startsWith, autocomplete, counting words by prefix.' },
      { name: 'Trie + DFS on grid', when: 'Word Search II: walk the board and trie together, prune dead prefixes.' },
      { name: 'Wildcard matching', when: '"." matches any letter: branch over all children at a dot.' },
      { name: 'Bitwise trie', when: 'Max XOR pair: store numbers bit by bit, greedily take opposite bits.' },
    ],
    template: {
      code: `class TrieNode {
  children = new Map<string, TrieNode>()
  isWord = false
}

class Trie {
  private root = new TrieNode()
  insert(word: string): void {
    let node = this.root
    for (const ch of word) {
      let next = node.children.get(ch)
      if (!next) {
        next = new TrieNode()
        node.children.set(ch, next)
      }
      node = next
    }
    node.isWord = true
  }
  private walk(s: string): TrieNode | null {
    let node = this.root
    for (const ch of s) {
      const next = node.children.get(ch)
      if (!next) return null
      node = next
    }
    return node
  }
  search(word: string): boolean { return this.walk(word)?.isWord ?? false }
  startsWith(prefix: string): boolean { return this.walk(prefix) !== null }
}`,
      note: 'search and startsWith share the walk — only the end-of-word check differs.',
    },
    mistakes: [
      'Forgetting the isWord flag and treating every path as a word.',
      'Not pruning trie branches in Word Search II (the trick that makes it fast).',
      'Using a trie when a hash set suffices (exact membership only, no prefix queries).',
      'Recreating child maps per query instead of walking the existing structure.',
    ],
    complexity: [
      'Insert/search/prefix: O(L) for word length L.',
      'Space: O(total characters stored) — the price of prefix power.',
    ],
    questions: [
      'When does a trie beat a hash set, and when is it overkill?',
      'How does the wildcard "." search work and what is its worst case?',
      'Sketch the bitwise trie for maximum XOR of two numbers.',
    ],
    problems: [
      { name: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree', difficulty: 'Medium' },
      { name: 'Design Add and Search Words', slug: 'design-add-and-search-words-data-structure', difficulty: 'Medium' },
      { name: 'Word Search II', slug: 'word-search-ii', difficulty: 'Hard' },
      { name: 'Longest Common Prefix', slug: 'longest-common-prefix', difficulty: 'Easy' },
    ],
    next: ['graphs', 'backtracking'],
  },
]
