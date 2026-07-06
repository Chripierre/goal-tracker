export type InterviewCategory =
  | 'Java'
  | 'Python'
  | 'C++'
  | 'JavaScript'
  | 'TypeScript'
  | 'React'
  | 'System Design'
  | 'Databases'
  | 'Networking'
  | 'Linux'
  | 'Git'
  | 'OOP'
  | 'Behavioral'
  | 'Algorithms'
  | 'Data Structures'

export interface InterviewQuestion {
  id: string
  category: InterviewCategory
  prompt: string
  options: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  hint: string
  explanation: string
}

export const INTERVIEW_QUESTIONS: readonly InterviewQuestion[] = [
  // Java
  {
    id: 'java-1',
    category: 'Java',
    prompt: 'If you override equals() in Java, what must you also override?',
    options: ['toString()', 'hashCode()', 'clone()', 'compareTo()'],
    answer: 1,
    hint: 'Think about how HashMap buckets objects.',
    explanation:
      'Equal objects must produce equal hash codes, or hash-based collections like HashMap and HashSet break their contract.',
  },
  {
    id: 'java-2',
    category: 'Java',
    prompt: 'What is the key difference between an interface and an abstract class in Java?',
    options: [
      'Interfaces cannot declare methods with bodies',
      'A class can implement many interfaces but extend only one class',
      'Abstract classes cannot have constructors',
      'Interfaces are faster at runtime',
    ],
    answer: 1,
    hint: 'It is about multiple inheritance.',
    explanation:
      'Java allows implementing multiple interfaces but only single class inheritance. Since Java 8, interfaces can even have default method bodies.',
  },
  {
    id: 'java-3',
    category: 'Java',
    prompt: 'Which statement about the JVM garbage collector is true?',
    options: [
      'It frees objects the moment their reference count hits zero',
      'It only runs when System.gc() is called',
      'It reclaims objects that are unreachable from GC roots',
      'It prevents all memory leaks',
    ],
    answer: 2,
    hint: 'Reference counting is not how the JVM does it.',
    explanation:
      'HotSpot uses reachability tracing from GC roots. Leaks still happen when unwanted objects stay reachable (e.g., static collections).',
  },
  // Python
  {
    id: 'py-1',
    category: 'Python',
    prompt: 'What does the GIL in CPython actually restrict?',
    options: [
      'All parallelism, including multiprocessing',
      'Only one thread executes Python bytecode at a time',
      'Async functions from running concurrently',
      'The number of open file handles',
    ],
    answer: 1,
    hint: 'It is per-process and about bytecode.',
    explanation:
      'The Global Interpreter Lock serializes bytecode execution per process. CPU-bound work scales with multiprocessing; I/O-bound work still benefits from threads.',
  },
  {
    id: 'py-2',
    category: 'Python',
    prompt: 'Which is a real difference between a list and a tuple?',
    options: [
      'Tuples are mutable, lists are not',
      'Lists can hold mixed types, tuples cannot',
      'Tuples are immutable and can be dict keys if their contents are hashable',
      'Lists are always faster to iterate',
    ],
    answer: 2,
    hint: 'Which one can be hashed?',
    explanation:
      'Tuples are immutable, so a tuple of hashable items is itself hashable and usable as a dictionary key; lists never are.',
  },
  {
    id: 'py-3',
    category: 'Python',
    prompt: 'What is a decorator in Python?',
    options: [
      'A comment that documents a function',
      'A callable that wraps another function to extend its behavior',
      'A class that cannot be instantiated',
      'A compiler directive',
    ],
    answer: 1,
    hint: '@ syntax is sugar for f = deco(f).',
    explanation:
      '@decorator replaces the function with decorator(function), letting you add behavior like caching, logging, or auth checks around it.',
  },
  // C++
  {
    id: 'cpp-1',
    category: 'C++',
    prompt: 'What problem does RAII solve in C++?',
    options: [
      'Slow compilation times',
      'Deterministic resource cleanup tied to object lifetime',
      'Lack of garbage collection for integers',
      'Template code bloat',
    ],
    answer: 1,
    hint: 'Destructors run when scope ends.',
    explanation:
      'Resource Acquisition Is Initialization ties resources (memory, files, locks) to object lifetimes, so destructors release them even when exceptions unwind the stack.',
  },
  {
    id: 'cpp-2',
    category: 'C++',
    prompt: 'After std::move(a) into b, what state is a in?',
    options: [
      'Unchanged — move copies',
      'Destroyed and unusable forever',
      'Valid but unspecified — safe to assign or destroy',
      'A dangling reference',
    ],
    answer: 2,
    hint: 'The standard says "valid but unspecified".',
    explanation:
      'A moved-from object must still be destructible and assignable; its value is unspecified, so do not read from it before reassigning.',
  },
  {
    id: 'cpp-3',
    category: 'C++',
    prompt: 'Why should a polymorphic base class declare a virtual destructor?',
    options: [
      'To make the class abstract',
      'So delete through a base pointer runs the derived destructor',
      'To speed up virtual calls',
      'It is required by the compiler',
    ],
    answer: 1,
    hint: 'Think about delete basePtr.',
    explanation:
      'Deleting a derived object through a base pointer without a virtual destructor is undefined behavior — the derived destructor never runs.',
  },
  // JavaScript
  {
    id: 'js-1',
    category: 'JavaScript',
    prompt: 'In the event loop, when do promise callbacks (microtasks) run?',
    options: [
      'Before the current synchronous code finishes',
      'After the current task completes, before the next macrotask like setTimeout',
      'Only when the call stack has been idle for one tick',
      'In a separate thread',
    ],
    answer: 1,
    hint: 'Microtask queue drains between tasks.',
    explanation:
      'The microtask queue (promises, queueMicrotask) fully drains after the current task and before timers — that is why Promise.resolve().then fires before setTimeout(0).',
  },
  {
    id: 'js-2',
    category: 'JavaScript',
    prompt: 'What is a closure?',
    options: [
      'A function bundled with the lexical scope it captured',
      'A way to close a WebSocket',
      'An immediately invoked function',
      'A private class field',
    ],
    answer: 0,
    hint: 'Inner functions remember where they were born.',
    explanation:
      'A closure keeps references to variables from its defining scope alive, enabling patterns like counters, memoization, and module privacy.',
  },
  {
    id: 'js-3',
    category: 'JavaScript',
    prompt: 'Why is === preferred over == ?',
    options: [
      'It is faster in all engines',
      'It compares without type coercion, avoiding surprising equalities',
      '== does not work with strings',
      '=== also compares object contents deeply',
    ],
    answer: 1,
    hint: "'' == 0 is true.",
    explanation:
      'Loose equality coerces types with counterintuitive rules ("" == 0, null == undefined). Strict equality checks type and value, no surprises.',
  },
  // TypeScript
  {
    id: 'ts-1',
    category: 'TypeScript',
    prompt: 'What is the difference between unknown and any?',
    options: [
      'They are aliases',
      'unknown must be narrowed before use; any disables checking entirely',
      'any is safer than unknown',
      'unknown only accepts null',
    ],
    answer: 1,
    hint: 'One keeps you honest.',
    explanation:
      'You can assign anything to both, but unknown forces a type check before you use it, while any silently opts out of the type system.',
  },
  {
    id: 'ts-2',
    category: 'TypeScript',
    prompt: 'TypeScript typing is structural. What does that mean?',
    options: [
      'Types match by declared name only',
      'Types are compatible if their shapes are compatible, regardless of names',
      'All types are classes',
      'Interfaces cannot extend each other',
    ],
    answer: 1,
    hint: 'Duck typing, checked at compile time.',
    explanation:
      'If an object has the right members, it satisfies the type — no explicit "implements" needed. Nominal languages like Java match by name instead.',
  },
  {
    id: 'ts-3',
    category: 'TypeScript',
    prompt: 'What does a type guard like `if (typeof x === "string")` do?',
    options: [
      'Throws if x is not a string',
      'Narrows the static type of x inside the block',
      'Converts x to a string',
      'Nothing — it is only a runtime check',
    ],
    answer: 1,
    hint: 'Control-flow analysis.',
    explanation:
      'TypeScript narrows union types through control flow: inside the branch, x is treated as string, so string methods typecheck.',
  },
  // React
  {
    id: 'react-1',
    category: 'React',
    prompt: 'Why do list items need a stable key prop?',
    options: [
      'For CSS styling hooks',
      'So React can match items across renders and preserve state correctly',
      'Keys make rendering synchronous',
      'It is only a lint convention',
    ],
    answer: 1,
    hint: 'What happens when the array reorders?',
    explanation:
      'Keys let reconciliation track identity. Using array indexes breaks state (inputs, animations) when items are inserted, removed, or reordered.',
  },
  {
    id: 'react-2',
    category: 'React',
    prompt: 'When does the cleanup function returned by useEffect run?',
    options: [
      'Never automatically',
      'Before the effect re-runs and when the component unmounts',
      'On every render, before paint',
      'Only on unmount',
    ],
    answer: 1,
    hint: 'Two moments, not one.',
    explanation:
      'React runs cleanup before applying the effect again (when deps change) and at unmount — that is how subscriptions and timers avoid leaking.',
  },
  {
    id: 'react-3',
    category: 'React',
    prompt: 'What defines a controlled input?',
    options: [
      'It validates itself',
      'Its value comes from state and changes flow through onChange',
      'It uses a ref instead of state',
      'It cannot be disabled',
    ],
    answer: 1,
    hint: 'Single source of truth.',
    explanation:
      'A controlled component renders value={state} and updates via onChange, making React state the single source of truth for the field.',
  },
  // System Design
  {
    id: 'sd-1',
    category: 'System Design',
    prompt: 'In the CAP theorem, what does a system give up during a network partition?',
    options: [
      'Either consistency or availability',
      'Both consistency and availability',
      'Durability',
      'Latency only',
    ],
    answer: 0,
    hint: 'P is not optional when the network fails.',
    explanation:
      'When partitions happen you must choose: refuse some requests (stay consistent) or serve possibly stale data (stay available).',
  },
  {
    id: 'sd-2',
    category: 'System Design',
    prompt: 'Why are stateless application servers easier to scale horizontally?',
    options: [
      'They use less CPU',
      'Any instance can serve any request, so you just add instances behind a load balancer',
      'They do not need databases',
      'They cache more aggressively',
    ],
    answer: 1,
    hint: 'Session data lives elsewhere.',
    explanation:
      'With no per-instance session state, requests can route anywhere; state moves to shared stores (DB, cache), so scaling is adding boxes.',
  },
  {
    id: 'sd-3',
    category: 'System Design',
    prompt: 'What is the main risk of cache-aside without careful invalidation?',
    options: [
      'The cache uses too much memory',
      'Serving stale data after the source of truth changes',
      'Cache stampedes are impossible to prevent',
      'The database is bypassed entirely',
    ],
    answer: 1,
    hint: 'Two copies of the truth drift.',
    explanation:
      'If writes do not invalidate or update cached entries, readers keep getting the old value until TTL expiry — the classic hard problem of caching.',
  },
  // Databases
  {
    id: 'db-1',
    category: 'Databases',
    prompt: 'What is the tradeoff of adding an index to a table?',
    options: [
      'Faster reads on indexed columns, slower writes and more storage',
      'Faster everything',
      'Slower reads, faster writes',
      'Indexes only affect backups',
    ],
    answer: 0,
    hint: 'Every INSERT must maintain it.',
    explanation:
      'Indexes accelerate lookups and sorts on their columns but must be updated on every write and consume disk/memory.',
  },
  {
    id: 'db-2',
    category: 'Databases',
    prompt: 'What is the N+1 query problem?',
    options: [
      'A query returning one extra row',
      'Running one query for a list, then one more per item for related data',
      'Having N indexes on one table',
      'A deadlock between N transactions',
    ],
    answer: 1,
    hint: 'ORMs make it easy to do by accident.',
    explanation:
      'Fetching a list then lazily loading each item’s relations issues N extra queries; a JOIN or batched IN query fixes it.',
  },
  {
    id: 'db-3',
    category: 'Databases',
    prompt: 'In ACID, what does isolation guarantee?',
    options: [
      'Data survives crashes',
      'Concurrent transactions behave as if executed one at a time (per isolation level)',
      'All writes are encrypted',
      'Transactions never fail',
    ],
    answer: 1,
    hint: 'It is about concurrency, not durability.',
    explanation:
      'Isolation controls what concurrent transactions can see of each other; levels (read committed, repeatable read, serializable) trade strictness for throughput.',
  },
  // Networking
  {
    id: 'net-1',
    category: 'Networking',
    prompt: 'Which is a real difference between TCP and UDP?',
    options: [
      'UDP guarantees ordering',
      'TCP provides ordered, reliable, connection-oriented delivery; UDP does not',
      'TCP is always faster',
      'UDP encrypts payloads',
    ],
    answer: 1,
    hint: 'Handshakes and retransmissions.',
    explanation:
      'TCP adds connections, acknowledgment, retransmission, and ordering. UDP is fire-and-forget — lower latency, no delivery guarantees.',
  },
  {
    id: 'net-2',
    category: 'Networking',
    prompt: 'Which HTTP methods are conventionally idempotent?',
    options: ['POST and PATCH', 'GET, PUT, DELETE', 'Only GET', 'All of them'],
    answer: 1,
    hint: 'Repeating them should not change the outcome further.',
    explanation:
      'GET, PUT, and DELETE are defined so repeating the request yields the same state; POST generally creates something new each time.',
  },
  {
    id: 'net-3',
    category: 'Networking',
    prompt: 'What does DNS primarily do?',
    options: [
      'Encrypts web traffic',
      'Resolves human-readable names to IP addresses',
      'Routes packets between networks',
      'Balances load across servers',
    ],
    answer: 1,
    hint: 'Phonebook of the internet.',
    explanation:
      'DNS translates names like example.com into IPs via a hierarchy of resolvers and authoritative servers, with caching at every layer.',
  },
  // Linux
  {
    id: 'linux-1',
    category: 'Linux',
    prompt: 'What permissions does chmod 754 grant?',
    options: [
      'Owner rwx, group r-x, others r--',
      'Owner rw-, group r--, others r--',
      'Everyone rwx',
      'Owner r--, group -w-, others --x',
    ],
    answer: 0,
    hint: '7=rwx, 5=r-x, 4=r--.',
    explanation: 'Each octal digit maps to rwx bits: 7 (111) rwx, 5 (101) r-x, 4 (100) r--.',
  },
  {
    id: 'linux-2',
    category: 'Linux',
    prompt: 'What does the | (pipe) operator do?',
    options: [
      'Runs commands in parallel with no relation',
      'Sends the stdout of one command into the stdin of the next',
      'Redirects errors to a file',
      'Runs the second command only if the first fails',
    ],
    answer: 1,
    hint: 'Data flows left to right.',
    explanation:
      'Pipes connect processes into streams — e.g., `ps aux | grep node` filters process output through grep.',
  },
  {
    id: 'linux-3',
    category: 'Linux',
    prompt: 'Why can a process ignore SIGTERM but not SIGKILL?',
    options: [
      'SIGKILL is sent twice',
      'SIGKILL is handled by the kernel and cannot be caught or ignored',
      'SIGTERM is only for root',
      'They are identical',
    ],
    answer: 1,
    hint: 'One is a request, one is an order.',
    explanation:
      'SIGTERM is catchable so processes can clean up; SIGKILL never reaches the process — the kernel just terminates it, which is why kill -9 is a last resort.',
  },
  // Git
  {
    id: 'git-1',
    category: 'Git',
    prompt: 'What is the practical difference between merge and rebase?',
    options: [
      'Rebase deletes commits',
      'Merge preserves history with a merge commit; rebase rewrites commits onto a new base for linear history',
      'Merge is only for remote branches',
      'Rebase cannot cause conflicts',
    ],
    answer: 1,
    hint: 'One rewrites, one records.',
    explanation:
      'Merge keeps the true branching history; rebase replays your commits on top of another branch — cleaner history, but never rebase shared branches.',
  },
  {
    id: 'git-2',
    category: 'Git',
    prompt: 'What is a detached HEAD state?',
    options: [
      'A corrupted repository',
      'HEAD points directly at a commit instead of a branch',
      'The remote is unreachable',
      'A branch with no commits',
    ],
    answer: 1,
    hint: 'You checked out a commit hash.',
    explanation:
      'Checking out a commit or tag detaches HEAD; new commits there are unreferenced by any branch and can be lost unless you create one.',
  },
  {
    id: 'git-3',
    category: 'Git',
    prompt: 'You must undo a commit that is already pushed and shared. Which is safest?',
    options: ['git reset --hard', 'git revert', 'Force push the branch', 'Delete the branch'],
    answer: 1,
    hint: 'Add history, do not rewrite it.',
    explanation:
      'Revert creates a new commit that inverses the change, preserving shared history. Reset/force-push rewrites history others may have based work on.',
  },
  // OOP
  {
    id: 'oop-1',
    category: 'OOP',
    prompt: 'Why is composition often preferred over inheritance?',
    options: [
      'It compiles faster',
      'It avoids fragile hierarchies and lets behavior be assembled and swapped at runtime',
      'Inheritance is deprecated',
      'Composition uses less memory',
    ],
    answer: 1,
    hint: 'has-a beats is-a when things change.',
    explanation:
      'Deep inheritance couples subclasses to parent internals. Composing small collaborators keeps units independent, testable, and swappable.',
  },
  {
    id: 'oop-2',
    category: 'OOP',
    prompt: 'What does the Liskov Substitution Principle require?',
    options: [
      'Every class needs an interface',
      'Subtypes must be usable anywhere their base type is expected without breaking behavior',
      'No class may have two parents',
      'All methods must be virtual',
    ],
    answer: 1,
    hint: 'The classic violation is Square extends Rectangle.',
    explanation:
      'If code works with the base type, handing it a subtype must not change correctness — strengthening preconditions or surprising side effects violates LSP.',
  },
  {
    id: 'oop-3',
    category: 'OOP',
    prompt: 'What is encapsulation actually for?',
    options: [
      'Hiding code from other developers',
      'Protecting invariants by controlling state changes through a defined interface',
      'Making fields private for style points',
      'Reducing binary size',
    ],
    answer: 1,
    hint: 'Think invariants, not secrecy.',
    explanation:
      'Encapsulation ensures an object’s state can only change in valid ways, so its invariants hold no matter who calls it.',
  },
  // Behavioral
  {
    id: 'beh-1',
    category: 'Behavioral',
    prompt: 'What does the STAR format stand for?',
    options: [
      'Skills, Talent, Ambition, Results',
      'Situation, Task, Action, Result',
      'Strategy, Tactics, Analysis, Review',
      'Story, Timing, Answer, Reflection',
    ],
    answer: 1,
    hint: 'It structures a story about your work.',
    explanation:
      'STAR keeps behavioral answers concrete: the context, your responsibility, what YOU did, and the measurable outcome.',
  },
  {
    id: 'beh-2',
    category: 'Behavioral',
    prompt: 'Asked about a conflict with a teammate, the strongest answers focus on…',
    options: [
      'Proving the other person was wrong',
      'How you understood their view, found shared goals, and resolved it professionally',
      'Escalating to a manager immediately',
      'Avoiding conflict altogether',
    ],
    answer: 1,
    hint: 'They are testing collaboration, not victory.',
    explanation:
      'Interviewers look for empathy, direct communication, and resolution — plus what you learned — not who won.',
  },
  {
    id: 'beh-3',
    category: 'Behavioral',
    prompt: 'The best way to handle the "tell me about a weakness" question is…',
    options: [
      '"I work too hard"',
      'A real, low-stakes weakness plus concrete steps you are taking to improve',
      'Claiming you cannot think of one',
      'A strength disguised as a weakness',
    ],
    answer: 1,
    hint: 'Self-awareness plus growth.',
    explanation:
      'A genuine weakness with an improvement plan shows self-awareness and coachability; clichés signal evasion.',
  },
  // Algorithms
  {
    id: 'algo-1',
    category: 'Algorithms',
    prompt: 'Binary search on a sorted array runs in…',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    answer: 1,
    hint: 'Halve the search space each step.',
    explanation: 'Each comparison discards half the remaining elements: log2(n) steps.',
  },
  {
    id: 'algo-2',
    category: 'Algorithms',
    prompt: 'What input drives quicksort to its O(n²) worst case (naive pivot)?',
    options: [
      'Random data',
      'Already-sorted data with first/last element as pivot',
      'All-equal data with three-way partitioning',
      'Small arrays',
    ],
    answer: 1,
    hint: 'The pivot keeps splitting 1 vs n-1.',
    explanation:
      'A first/last pivot on sorted input produces maximally unbalanced partitions. Random or median-of-three pivots avoid this in practice.',
  },
  {
    id: 'algo-3',
    category: 'Algorithms',
    prompt: 'The two-pointer technique typically requires the input to be…',
    options: ['A hash map', 'Sorted (or otherwise monotonic)', 'A power of two in length', 'Immutable'],
    answer: 1,
    hint: 'Why can you safely move a pointer inward?',
    explanation:
      'Moving pointers relies on monotonic behavior — e.g., in a sorted array, increasing the left pointer only increases the sum.',
  },
  // Data Structures
  {
    id: 'ds-1',
    category: 'Data Structures',
    prompt: 'Hash map lookups are O(1) average. What is the worst case and why?',
    options: [
      'O(1) always',
      'O(n), when many keys collide into one bucket',
      'O(log n), guaranteed by resizing',
      'O(n log n) after rehashing',
    ],
    answer: 1,
    hint: 'Everything lands in one bucket.',
    explanation:
      'Adversarial or degenerate hashing puts all keys in one chain: linear scan. (Java mitigates by treeifying hot buckets to O(log n).)',
  },
  {
    id: 'ds-2',
    category: 'Data Structures',
    prompt: 'A binary min-heap supports which operations at O(log n)?',
    options: [
      'Insert and extract-min',
      'Search for any element',
      'Merge two heaps',
      'Sort in place',
    ],
    answer: 0,
    hint: 'Bubble up, sift down.',
    explanation:
      'Insert bubbles up and extract-min sifts down — both bounded by tree height. Arbitrary search is O(n); peek-min is O(1).',
  },
  {
    id: 'ds-3',
    category: 'Data Structures',
    prompt: 'In-order traversal of a binary search tree visits nodes in…',
    options: ['Insertion order', 'Sorted (ascending) order', 'Level order', 'Random order'],
    answer: 1,
    hint: 'Left, node, right.',
    explanation:
      'BST invariant (left < node < right) means left-node-right traversal emits keys ascending — a common interview building block.',
  },
]
