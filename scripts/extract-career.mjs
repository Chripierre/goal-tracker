// One-time extraction: pull the legacy DATA SECTION arrays out of
// legacy/tracker.js into src/data/career.json without retyping anything.
import { readFile, writeFile } from 'node:fs/promises'
import vm from 'node:vm'

const src = await readFile('legacy/tracker.js', 'utf8')
const cut = src.indexOf('function uid()')
if (cut < 0) throw new Error('marker "function uid()" not found')

const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {} },
  JSON,
  Object,
  Date,
  Math,
}
vm.createContext(sandbox)
const result = vm.runInContext(
  src.slice(0, cut) +
    '\n;({ tasks: TASKS, projects: PROJECTS, certs: CERTS, jobs: JOB_LISTINGS, gaps: GAPS, scholarships: SCHOLARSHIPS, internships: INTERNSHIPS })',
  sandbox,
)

await writeFile('src/data/career.json', JSON.stringify(result, null, 2))

for (const [name, arr] of Object.entries(result)) {
  if (!Array.isArray(arr) || arr.length === 0) {
    console.log(`${name}: EMPTY`)
    continue
  }
  const keys = [...new Set(arr.flatMap((x) => Object.keys(x)))]
  console.log(`${name}: ${arr.length} items, keys: ${keys.join(', ')}`)
  for (const k of keys) {
    const values = [...new Set(arr.map((x) => x[k]).filter((v) => typeof v === 'string'))]
    if (values.length > 0 && values.length <= 8 && values.every((v) => v.length <= 24)) {
      console.log(`  ${k}: ${values.join(' | ')}`)
    }
  }
}
