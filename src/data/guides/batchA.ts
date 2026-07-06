import type { TopicGuide } from './types'

export const BATCH_A: TopicGuide[] = [
  {
    slug: 'arrays',
    title: 'Arrays & Two Pointers',
    batch: 'A',
    tagline: 'The default container — and the pointer tricks that turn O(n²) scans into O(n).',
    intuition: [
      'Most array problems are about avoiding the naive double loop. The two big levers: exploit ORDER (sort it, or use the fact that it is sorted) and exploit INDEX ARITHMETIC (walk from both ends, or maintain a write pointer behind a read pointer).',
      'Two pointers works because of monotonicity: in a sorted array, moving the left pointer right can only increase a sum, moving the right pointer left can only decrease it. Every step discards candidates provably, so one pass suffices.',
    ],
    patterns: [
      { name: 'Opposite-end pointers', when: 'Sorted array + target pair/sum, container problems, palindromes.' },
      { name: 'Fast/slow (read/write) pointers', when: 'In-place removal, dedupe, moving zeroes — write lags read.' },
      { name: 'Sort first, then scan', when: 'When order unlocks the problem and O(n log n) is acceptable.' },
      { name: 'Index as hash', when: 'Values bounded to [0, n): mark visited by negating or swapping into place.' },
    ],
    template: {
      code: `function pairWithSum(sorted: number[], target: number): [number, number] | null {
  let lo = 0
  let hi = sorted.length - 1
  while (lo < hi) {
    const sum = sorted[lo] + sorted[hi]
    if (sum === target) return [lo, hi]
    if (sum < target) lo++
    else hi--
  }
  return null
}`,
      note: 'The two-pointer sum scan. Every branch moves a pointer, so it terminates in n steps.',
    },
    mistakes: [
      'Using two pointers on an UNSORTED array where monotonicity does not hold.',
      'Off-by-one in loop bounds: decide lo < hi vs lo <= hi from whether pointers may meet.',
      'Mutating an array while iterating it forward instead of using a write pointer.',
      'Forgetting duplicates: 3Sum-style problems need skip-equal logic after sorting.',
    ],
    complexity: [
      'Two-pointer scan: O(n) time, O(1) space.',
      'Sort-then-scan: O(n log n) time dominated by the sort.',
    ],
    questions: [
      'Why does the two-pointer sum scan never miss the answer pair?',
      'How do you remove an element in place with O(1) extra space?',
      'When is sorting first worth the O(n log n) cost?',
    ],
    problems: [
      { name: 'Two Sum II', slug: 'two-sum-ii-input-array-is-sorted', difficulty: 'Medium' },
      { name: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy' },
      { name: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium' },
      { name: 'Move Zeroes', slug: 'move-zeroes', difficulty: 'Easy' },
      { name: '3Sum', slug: '3sum', difficulty: 'Medium' },
      { name: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard' },
    ],
    next: ['strings', 'hash-maps', 'sliding-window'],
  },
  {
    slug: 'strings',
    title: 'Strings',
    batch: 'A',
    tagline: 'Arrays of characters — plus counting, canonical forms, and building efficiently.',
    intuition: [
      'Almost every string interview problem reduces to an array technique plus one string-specific idea: frequency counting (26 letters is a free O(1) hash), canonicalization (sort the letters or count them to compare anagrams), or expansion (grow a palindrome outward from each center).',
      'In JavaScript/TypeScript strings are immutable — repeated concatenation in a loop is O(n²). Collect parts in an array and join once.',
    ],
    patterns: [
      { name: 'Frequency count', when: 'Anagrams, permutation-in-string, character balance checks.' },
      { name: 'Canonical key', when: 'Group by sorted letters or count signature (group anagrams).' },
      { name: 'Expand around center', when: 'Longest palindromic substring: 2n-1 centers, expand outward.' },
      { name: 'Build with parts + join', when: 'Any transformation that assembles a new string.' },
    ],
    template: {
      code: `function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const count = new Array<number>(26).fill(0)
  const base = 'a'.charCodeAt(0)
  for (let i = 0; i < a.length; i++) {
    count[a.charCodeAt(i) - base]++
    count[b.charCodeAt(i) - base]--
  }
  return count.every((c) => c === 0)
}`,
      note: 'One counting array, increment for one string and decrement for the other — balance means anagram.',
    },
    mistakes: [
      'String concatenation in a loop (quadratic) instead of parts.push + join.',
      'Assuming ASCII when the input may hold unicode — charCodeAt vs codePointAt.',
      'Comparing sorted copies (O(n log n)) when a count signature is O(n).',
      'Forgetting the empty-string and single-character edge cases.',
    ],
    complexity: [
      'Frequency counting: O(n) time, O(1) space for a fixed alphabet.',
      'Expand-around-center palindromes: O(n²) time, O(1) space — fine up to ~10⁴.',
    ],
    questions: [
      'Why is repeated string concatenation quadratic, and what is the fix?',
      'How would you group anagrams in one pass over each word?',
      'What changes if the alphabet is unicode instead of a–z?',
    ],
    problems: [
      { name: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy' },
      { name: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium' },
      { name: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'Medium' },
      { name: 'String to Integer (atoi)', slug: 'string-to-integer-atoi', difficulty: 'Medium' },
      { name: 'Longest Common Prefix', slug: 'longest-common-prefix', difficulty: 'Easy' },
    ],
    next: ['hash-maps', 'sliding-window'],
  },
  {
    slug: 'hash-maps',
    title: 'Hash Maps & Sets',
    batch: 'A',
    tagline: 'Trade memory for time: O(1) average lookups that delete a whole loop from your solution.',
    intuition: [
      'Whenever the inner loop of a brute-force solution asks "have I seen X?" or "where is X?", a hash map answers in O(1) and removes that loop. Classic: Two Sum stores value→index and asks for target−current as it scans.',
      'Sets are maps without values — membership, dedupe, and cycle detection. Maps also shine as counters (value→frequency) and as grouping buckets (canonical key→list).',
    ],
    patterns: [
      { name: 'Complement lookup', when: 'Two Sum family: store what you have, query what you need.' },
      { name: 'Counter', when: 'Frequencies, majority element, top-K prep.' },
      { name: 'Seen set', when: 'Duplicates, cycle detection (happy number), visited states.' },
      { name: 'Group by key', when: 'Map from canonical form to bucket (group anagrams).' },
    ],
    template: {
      code: `function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const j = seen.get(need)
    if (j !== undefined) return [j, i]
    seen.set(nums[i], i)
  }
  return null
}`,
      note: 'Insert AFTER querying so an element cannot pair with itself.',
    },
    mistakes: [
      'Inserting before querying, letting an element match itself.',
      'Using objects as Map keys expecting value equality — JS compares by reference.',
      'Forgetting that worst-case lookup is O(n) if asked about adversarial inputs.',
      'Rebuilding the map inside a loop instead of maintaining it incrementally.',
    ],
    complexity: [
      'Average O(1) insert/lookup/delete; worst case O(n) on pathological collisions.',
      'Space O(n) — the memory you spend to buy the time.',
    ],
    questions: [
      'How does a hash map achieve O(1) average lookups internally?',
      'When would you choose a sorted structure over a hash map?',
      'Why is Two Sum with a map one pass instead of two?',
    ],
    problems: [
      { name: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' },
      { name: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy' },
      { name: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium' },
      { name: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', difficulty: 'Medium' },
      { name: 'LRU Cache', slug: 'lru-cache', difficulty: 'Medium' },
    ],
    next: ['sliding-window', 'prefix-sum'],
  },
  {
    slug: 'sliding-window',
    title: 'Sliding Window',
    batch: 'A',
    tagline: 'A moving subarray with an invariant — grow the right edge, shrink the left, never restart.',
    intuition: [
      'For contiguous subarray/substring problems, brute force re-examines overlapping ranges. A window keeps running state (sum, counts) and updates it incrementally: extend right by adding one element, shrink left by removing one. Each element enters and leaves once — O(n).',
      'Fixed-size windows slide; variable-size windows enforce an invariant ("at most K distinct", "sum < target") by shrinking from the left whenever it breaks. The window is always the best candidate ending at the current right edge.',
    ],
    patterns: [
      { name: 'Fixed window', when: 'Max/avg of every K-length subarray — add right, drop left, same size.' },
      { name: 'Grow-shrink (variable)', when: '"Longest substring with condition": expand, then shrink while invalid.' },
      { name: 'Window + counter map', when: 'Distinct characters, anagram windows, replacement budgets.' },
      { name: 'Shortest window', when: 'Minimum window substring: shrink while VALID and record.' },
    ],
    template: {
      code: `function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    const prev = last.get(ch)
    if (prev !== undefined && prev >= left) left = prev + 1
    last.set(ch, right)
    best = Math.max(best, right - left + 1)
  }
  return best
}`,
      note: 'The invariant: the window [left, right] never contains a repeat. left only moves forward.',
    },
    mistakes: [
      'Restarting the window from scratch instead of shrinking — that is O(n²) again.',
      'Updating the answer at the wrong moment (before the invariant is restored).',
      'Off-by-one in window length: it is right − left + 1.',
      'Using a window on a NON-contiguous problem (subsequence ≠ subarray).',
    ],
    complexity: [
      'O(n) time — each index enters and leaves the window at most once.',
      'O(k) space for the counter, where k is the alphabet/distinct bound.',
    ],
    questions: [
      'Why is the total work O(n) even though there are two nested-looking loops?',
      'How do you decide between longest-window and shortest-window shapes?',
      'What breaks if the array has negative numbers in a sum-based window?',
    ],
    problems: [
      { name: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy' },
      { name: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium' },
      { name: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', difficulty: 'Medium' },
      { name: 'Permutation in String', slug: 'permutation-in-string', difficulty: 'Medium' },
      { name: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard' },
    ],
    next: ['prefix-sum', 'binary-search'],
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    batch: 'A',
    tagline: 'Halve a monotonic search space — and recognize that "sorted array" is only the obvious case.',
    intuition: [
      'Binary search needs one thing: a predicate that flips once over the search space (false…false, true…true). Sorted arrays are the textbook case, but "smallest capacity that ships in D days" and "first bad version" are the same shape — search the ANSWER space, not just the array.',
      'The reliable mental model is the boundary: you are finding the first index where the predicate is true. Keep an invariant like "lo is always ≤ answer, hi is always ≥ answer" and every problem becomes the same loop.',
    ],
    patterns: [
      { name: 'Exact match', when: 'Classic sorted-array lookup.' },
      { name: 'Lower/upper bound', when: 'First element ≥ target / last element ≤ target — the boundary form.' },
      { name: 'Search on answer', when: 'Min speed/capacity/days satisfying a feasibility check.' },
      { name: 'Rotated/modified order', when: 'One half is always sorted — decide which and recurse.' },
    ],
    template: {
      code: `// First index where check(i) is true, or n if never true.
function lowerBound(n: number, check: (i: number) => boolean): number {
  let lo = 0
  let hi = n // hi is exclusive: the answer may be n (not found)
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (check(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}`,
      note: 'One template covers exact search, bounds, and answer-space search — only check() changes.',
    },
    mistakes: [
      'Mixing inclusive/exclusive hi conventions mid-problem — pick one and hold it.',
      'mid = (lo + hi) / 2 overflow in fixed-width languages; write lo + (hi − lo) / 2.',
      'Infinite loop from lo = mid (instead of mid + 1) when the range does not shrink.',
      'Binary searching a predicate that is not actually monotonic.',
    ],
    complexity: [
      'O(log n) time, O(1) space iteratively.',
      'Search-on-answer: O(log(range) × cost of check).',
    ],
    questions: [
      'What property must the predicate have for binary search to be valid?',
      'How do you find the first and last occurrence of a value?',
      'How would you find the minimum in a rotated sorted array?',
    ],
    problems: [
      { name: 'Binary Search', slug: 'binary-search', difficulty: 'Easy' },
      { name: 'First Bad Version', slug: 'first-bad-version', difficulty: 'Easy' },
      { name: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium' },
      { name: 'Koko Eating Bananas', slug: 'koko-eating-bananas', difficulty: 'Medium' },
      { name: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium' },
      { name: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard' },
    ],
    next: ['sorting', 'trees'],
  },
  {
    slug: 'prefix-sum',
    title: 'Prefix Sum',
    batch: 'A',
    tagline: 'Precompute running totals once, answer any range-sum question in O(1).',
    intuition: [
      'prefix[i] = sum of the first i elements. Then sum(l..r) = prefix[r+1] − prefix[l]: two lookups replace a loop. Build it once in O(n) and every range query is free.',
      'The killer combination is prefix sums + a hash map: "how many subarrays sum to K" becomes "how many earlier prefixes equal currentPrefix − K" — counting in one pass, negatives welcome (where sliding window fails).',
    ],
    patterns: [
      { name: 'Range sum query', when: 'Many sum(l..r) questions on a static array.' },
      { name: 'Prefix + hash map', when: 'Count subarrays with sum K, longest subarray summing to K.' },
      { name: 'Prefix of other ops', when: 'Products (with zero handling), XOR prefixes, 2D grids.' },
      { name: 'Difference array', when: 'Many range UPDATES then one final read — the inverse trick.' },
    ],
    template: {
      code: `function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]) // empty prefix
  let prefix = 0
  let count = 0
  for (const x of nums) {
    prefix += x
    count += seen.get(prefix - k) ?? 0
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1)
  }
  return count
}`,
      note: 'Seed the map with {0: 1} so subarrays starting at index 0 are counted.',
    },
    mistakes: [
      'Forgetting the empty-prefix seed (0 → 1), silently dropping answers.',
      'Off-by-one between prefix[i] conventions — define it as "sum of first i" and stick to it.',
      'Reaching for sliding window when negatives are present; prefix+map handles them.',
      'Recomputing prefixes per query instead of building the array once.',
    ],
    complexity: [
      'Build O(n); each range query O(1).',
      'Prefix + hash map counting: O(n) time, O(n) space.',
    ],
    questions: [
      'Derive sum(l..r) from prefix sums, watching the indices.',
      'Why does the hash-map variant work with negative numbers when windows do not?',
      'How do prefix sums extend to a 2D matrix?',
    ],
    problems: [
      { name: 'Range Sum Query - Immutable', slug: 'range-sum-query-immutable', difficulty: 'Easy' },
      { name: 'Subarray Sum Equals K', slug: 'subarray-sum-equals-k', difficulty: 'Medium' },
      { name: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium' },
      { name: 'Contiguous Array', slug: 'contiguous-array', difficulty: 'Medium' },
    ],
    next: ['binary-search', 'linked-lists'],
  },
]
