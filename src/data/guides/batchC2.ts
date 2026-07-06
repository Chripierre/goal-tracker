import type { TopicGuide } from './types'

export const BATCH_C2: TopicGuide[] = [
  {
    slug: 'backtracking',
    title: 'Backtracking',
    batch: 'C',
    tagline: 'Systematic trial and error: choose, explore, un-choose — with pruning doing the real work.',
    intuition: [
      'Backtracking enumerates a decision tree: at each level make a choice, recurse, then UNDO the choice so the next branch starts clean. It is the tool for "all subsets / permutations / combinations / boards", where you must produce every valid configuration, not just count them.',
      'Raw enumeration is exponential by nature — the skill interviewers grade is PRUNING: abandon a branch the moment it cannot lead to a valid answer (sum exceeded, column already attacked, prefix not in dictionary).',
    ],
    patterns: [
      { name: 'Choose / explore / unchoose', when: 'The universal skeleton around a path array.' },
      { name: 'Start-index combinations', when: 'Subsets/combinations: only look forward to avoid duplicates.' },
      { name: 'Used-set permutations', when: 'Permutations: track what the current path consumed.' },
      { name: 'Sort + skip duplicates', when: 'Inputs with repeats: skip equal siblings at the same depth.' },
    ],
    template: {
      code: `function subsets(nums: number[]): number[][] {
  const out: number[][] = []
  const path: number[] = []
  function backtrack(start: number): void {
    out.push([...path]) // snapshot, not the live array
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choose
      backtrack(i + 1) // explore
      path.pop() // unchoose
    }
  }
  backtrack(0)
  return out
}`,
      note: 'Push a COPY of path into results — the live array keeps mutating.',
    },
    mistakes: [
      'Pushing the live path array into results and watching every answer mutate.',
      'Forgetting the un-choose step, corrupting sibling branches.',
      'No duplicate-skip after sorting, emitting the same subset twice.',
      'Pruning too late — test the constraint before recursing, not after.',
    ],
    complexity: [
      'Subsets: O(2^n · n). Permutations: O(n! · n). State the exponential honestly, then show pruning.',
    ],
    questions: [
      'Where exactly does the "undo" happen, and why must it?',
      'How does the start index prevent duplicate combinations?',
      'What prunings make N-Queens tractable?',
    ],
    problems: [
      { name: 'Subsets', slug: 'subsets', difficulty: 'Medium' },
      { name: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium' },
      { name: 'Permutations', slug: 'permutations', difficulty: 'Medium' },
      { name: 'Letter Combinations of a Phone Number', slug: 'letter-combinations-of-a-phone-number', difficulty: 'Medium' },
      { name: 'N-Queens', slug: 'n-queens', difficulty: 'Hard' },
    ],
    next: ['greedy', 'dynamic-programming'],
  },
  {
    slug: 'greedy',
    title: 'Greedy',
    batch: 'C',
    tagline: 'Take the locally best choice and never look back — valid only when you can argue why.',
    intuition: [
      'A greedy algorithm makes one irreversible choice per step. It is correct only when the problem has the EXCHANGE property: any optimal solution can be rewritten, without loss, to start with the greedy choice. That argument — not the code — is the interview.',
      'Classic tells: intervals (sort by END time and take what fits), jump/reach problems (track the farthest reachable index), and "max/min after sorting by the right key". If you cannot sketch the exchange argument, suspect DP instead.',
    ],
    patterns: [
      { name: 'Sort by end, take compatible', when: 'Max non-overlapping intervals, min arrows.' },
      { name: 'Farthest-reach sweep', when: 'Jump Game: extend max reach while i <= reach.' },
      { name: 'Running best / reset', when: 'Max subarray (Kadane), gas station start point.' },
      { name: 'Two-key sort trick', when: 'Queue reconstruction: sort one key desc, insert by the other.' },
    ],
    template: {
      code: `function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]) // earliest END first
  let kept = 0
  let lastEnd = -Infinity
  for (const [start, end] of intervals) {
    if (start >= lastEnd) {
      kept++
      lastEnd = end
    }
  }
  return intervals.length - kept
}`,
      note: 'Ending earliest leaves maximum room — the exchange argument in one sentence.',
    },
    mistakes: [
      'Sorting intervals by START when the argument needs END.',
      'Asserting greedy works without any exchange argument.',
      'Using greedy where choices interact (knapsack with values — that is DP).',
      'Missing the reset condition in running-best scans.',
    ],
    complexity: [
      'Usually O(n log n) for the sort plus a linear sweep; the win is O(1)/O(n) space.',
    ],
    questions: [
      'Give the exchange argument for earliest-end-time interval scheduling.',
      'Why does greedy fail 0/1 knapsack but solve fractional knapsack?',
      'Explain Kadane’s algorithm as a greedy decision.',
    ],
    problems: [
      { name: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium' },
      { name: 'Jump Game', slug: 'jump-game', difficulty: 'Medium' },
      { name: 'Non-overlapping Intervals', slug: 'non-overlapping-intervals', difficulty: 'Medium' },
      { name: 'Gas Station', slug: 'gas-station', difficulty: 'Medium' },
      { name: 'Partition Labels', slug: 'partition-labels', difficulty: 'Medium' },
    ],
    next: ['bit-manipulation', 'divide-and-conquer'],
  },
  {
    slug: 'bit-manipulation',
    title: 'Bit Manipulation',
    batch: 'C',
    tagline: 'Integers as 32 switches — XOR cancellation and n & (n−1) do surprising work.',
    intuition: [
      'Bits give O(1) set-like operations on small universes. The two facts that solve most problems: XOR of a pair is 0 (so XOR-ing everything leaves the unpaired element), and n & (n−1) clears the LOWEST set bit (so counting iterations counts set bits, and the result being 0 tests power-of-two).',
      'Know the toolbox cold: check bit (n >> i) & 1, set (n | (1 << i)), clear (n & ~(1 << i)), toggle (n ^ (1 << i)), lowest set bit (n & -n). In JS, bitwise ops coerce to SIGNED 32-bit — use >>> for unsigned shifts.',
    ],
    patterns: [
      { name: 'XOR cancellation', when: 'Single number among pairs, missing number.' },
      { name: 'n & (n−1)', when: 'Count set bits, power-of-two test.' },
      { name: 'Bitmask as set', when: 'Subsets of ≤ ~20 items, visited states in DP.' },
      { name: 'Bit-by-bit build', when: 'Reverse bits, add without +, max XOR with a trie.' },
    ],
    template: {
      code: `function singleNumber(nums: number[]): number {
  let acc = 0
  for (const x of nums) acc ^= x // pairs cancel to 0
  return acc
}

function hammingWeight(n: number): number {
  let count = 0
  while (n !== 0) {
    n &= n - 1 // drop the lowest set bit
    count++
  }
  return count
}`,
      note: 'Two idioms, most problems: XOR to cancel pairs, n & (n−1) to eat set bits.',
    },
    mistakes: [
      'Forgetting JS bitwise ops are signed 32-bit (use >>> 0 for unsigned views).',
      'Operator precedence: parenthesize (n >> i) & 1 — shifts bind loosely.',
      'Off-by-one masks: (1 << k) − 1 has k ones, not k+1.',
      'Using bitmask subsets past ~25 elements (2^n explodes).',
    ],
    complexity: [
      'Single ops O(1); bit loops O(bits); bitmask enumeration O(2^n).',
    ],
    questions: [
      'Why does XOR find the single non-duplicated number?',
      'Prove n & (n−1) removes exactly the lowest set bit.',
      'How would you iterate every subset of a bitmask?',
    ],
    problems: [
      { name: 'Single Number', slug: 'single-number', difficulty: 'Easy' },
      { name: 'Number of 1 Bits', slug: 'number-of-1-bits', difficulty: 'Easy' },
      { name: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy' },
      { name: 'Missing Number', slug: 'missing-number', difficulty: 'Easy' },
      { name: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium' },
    ],
    next: ['math', 'divide-and-conquer'],
  },
  {
    slug: 'divide-and-conquer',
    title: 'Divide & Conquer',
    batch: 'C',
    tagline: 'Split, solve halves, merge — and the merge step is where the cleverness lives.',
    intuition: [
      'Divide & conquer splits the input into independent parts, solves each recursively, and COMBINES. Its signature is the recurrence T(n) = 2T(n/2) + merge cost: linear merge gives O(n log n) (merge sort), constant-ish combine gives O(log n) (binary search, fast power).',
      'Unlike DP, the subproblems do not overlap — no cache needed. The interview skill is designing the merge: counting inversions rides along merge sort’s merge; closest-pair merges a strip; quickselect keeps only one side (decrease-and-conquer).',
    ],
    patterns: [
      { name: 'Merge-based', when: 'Merge sort, count inversions, merge K lists pairwise.' },
      { name: 'Halve the exponent', when: 'Fast power: x^n from x^(n/2) squared.' },
      { name: 'Keep one side', when: 'Binary search, quickselect — discard half, recurse once.' },
      { name: 'Tree construction', when: 'Build tree from traversals: root splits the array.' },
    ],
    template: {
      code: `function myPow(x: number, n: number): number {
  if (n < 0) return 1 / myPow(x, -n)
  if (n === 0) return 1 // base
  const half = myPow(x, Math.floor(n / 2)) // divide
  return n % 2 === 0 ? half * half : half * half * x // combine
}`,
      note: 'O(log n) because the exponent halves every call — the simplest honest D&C.',
    },
    mistakes: [
      'A merge step that quietly costs O(n²), destroying the recurrence.',
      'Not handling the odd/negative cases in fast power.',
      'Recursing on BOTH sides when the problem lets you discard one.',
      'Reaching for D&C on overlapping subproblems (that is DP).',
    ],
    complexity: [
      'Master theorem headlines: 2T(n/2)+O(n) = O(n log n); T(n/2)+O(1) = O(log n).',
    ],
    questions: [
      'Walk the merge-sort recurrence through the master theorem.',
      'How does counting inversions piggyback on merge?',
      'Why is quickselect O(n) average despite recursing?',
    ],
    problems: [
      { name: 'Pow(x, n)', slug: 'powx-n', difficulty: 'Medium' },
      { name: 'Sort an Array', slug: 'sort-an-array', difficulty: 'Medium' },
      { name: 'Search a 2D Matrix II', slug: 'search-a-2d-matrix-ii', difficulty: 'Medium' },
      { name: 'Construct Binary Tree from Preorder and Inorder', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium' },
    ],
    next: ['math', 'geometry'],
  },
  {
    slug: 'math',
    title: 'Math',
    batch: 'C',
    tagline: 'GCD, primes, modular arithmetic, and overflow awareness — small toolbox, frequent cameos.',
    intuition: [
      'Interview math is a short list used often: Euclid’s GCD (gcd(a,b) = gcd(b, a mod b)), the Sieve of Eratosthenes for primes up to n, modular arithmetic to keep numbers bounded, and digit manipulation (extract with % 10, shrink with / 10).',
      'The quiet trap is overflow and precision: JS numbers are safe only to 2^53 − 1, and reversing an int or multiplying counts can leave that range — mention Number.isSafeInteger or BigInt before the interviewer does.',
    ],
    patterns: [
      { name: 'Euclid GCD / LCM', when: 'Fractions, cycle lengths, array rotations; lcm = a / gcd(a,b) * b.' },
      { name: 'Sieve of Eratosthenes', when: 'All primes below n in O(n log log n).' },
      { name: 'Digit loops', when: 'Reverse integer, palindrome number, digit sums.' },
      { name: 'Modular arithmetic', when: 'Big counting answers: reduce mod p at every step.' },
    ],
    template: {
      code: `function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function sievePrimes(n: number): boolean[] {
  const isPrime = new Array<boolean>(n + 1).fill(true)
  isPrime[0] = isPrime[1] = false
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue
    for (let m = p * p; m <= n; m += p) isPrime[m] = false
  }
  return isPrime
}`,
      note: 'Sieve starts crossing out at p² — everything smaller was handled by smaller primes.',
    },
    mistakes: [
      'Ignoring negative operands with % (JS keeps the dividend’s sign).',
      'Computing lcm as a*b/gcd and overflowing before the division.',
      'Trial division to n instead of sqrt(n) for primality.',
      'Floating-point equality checks instead of epsilon or integer reformulation.',
    ],
    complexity: [
      'GCD: O(log min(a,b)). Sieve: O(n log log n). Primality by trial: O(sqrt n).',
    ],
    questions: [
      'Prove Euclid’s step gcd(a, b) = gcd(b, a mod b).',
      'Why does the sieve start at p² for each prime?',
      'How do you reverse an integer while respecting 32-bit bounds?',
    ],
    problems: [
      { name: 'Reverse Integer', slug: 'reverse-integer', difficulty: 'Medium' },
      { name: 'Palindrome Number', slug: 'palindrome-number', difficulty: 'Easy' },
      { name: 'Count Primes', slug: 'count-primes', difficulty: 'Medium' },
      { name: 'Happy Number', slug: 'happy-number', difficulty: 'Easy' },
      { name: 'Excel Sheet Column Number', slug: 'excel-sheet-column-number', difficulty: 'Easy' },
    ],
    next: ['geometry', 'bit-manipulation'],
  },
  {
    slug: 'geometry',
    title: 'Geometry',
    batch: 'C',
    tagline: 'Coordinates, distances, and overlap checks — kept honest by avoiding floating point.',
    intuition: [
      'Interview geometry stays coordinate-based: distances, overlap, containment, and simple sweeps. The golden rule is to dodge floats — compare SQUARED distances, use cross products for orientation, and reformulate to integer arithmetic whenever possible.',
      'Rectangle overlap is easiest inverted: two axis-aligned rectangles do NOT overlap iff one is entirely left/right/above/below the other. Negate that and you are done — no case analysis on corners.',
    ],
    patterns: [
      { name: 'Squared distance', when: 'K closest points: skip the sqrt, order is preserved.' },
      { name: 'Interval logic per axis', when: 'Rectangle overlap/area: x-overlap × y-overlap.' },
      { name: 'Cross product orientation', when: 'Turn direction, collinearity, convex hull steps.' },
      { name: 'Sweep line', when: 'Meeting rooms, skyline: sort events, process in order.' },
    ],
    template: {
      code: `function isRectangleOverlap(a: number[], b: number[]): boolean {
  // a = [x1, y1, x2, y2] with (x1, y1) bottom-left
  const separated =
    a[2] <= b[0] || // a left of b
    b[2] <= a[0] || // b left of a
    a[3] <= b[1] || // a below b
    b[3] <= a[1] // b below a
  return !separated
}`,
      note: 'Check separation, then negate — four comparisons, zero corner cases.',
    },
    mistakes: [
      'Taking sqrt just to compare distances (and inviting precision bugs).',
      'Touching edges counted as overlap (or not) — pin the boundary convention first.',
      'Slope comparisons with division instead of cross-multiplication.',
      'Missing degenerate inputs: zero-area rectangles, duplicate points, vertical lines.',
    ],
    complexity: [
      'Pairwise checks O(n²); sweep line brings interval/skyline problems to O(n log n).',
    ],
    questions: [
      'Why does squared distance preserve ordering, and when would it overflow?',
      'Derive the rectangle-overlap condition from separation.',
      'What does the sign of a 2D cross product tell you?',
    ],
    problems: [
      { name: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium' },
      { name: 'Rectangle Overlap', slug: 'rectangle-overlap', difficulty: 'Easy' },
      { name: 'Valid Square', slug: 'valid-square', difficulty: 'Medium' },
      { name: 'Max Points on a Line', slug: 'max-points-on-a-line', difficulty: 'Hard' },
    ],
    next: ['math'],
  },
]
