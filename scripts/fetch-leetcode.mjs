// Runs in the leetcode-data workflow: queries LeetCode GraphQL (no CORS
// server-side) and writes public/data/leetcode.json for the app to consume.
import { mkdir, writeFile } from 'node:fs/promises'

const username = process.env.LC_USERNAME?.trim()
if (!username) {
  console.log('LC_USERNAME is not set - skipping (set it in .github/workflows/leetcode-data.yml)')
  process.exit(0)
}

const query = `query($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    profile { ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { submissionCalendar }
  }
}`

const res = await fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
  body: JSON.stringify({ query, variables: { username } }),
})
if (!res.ok) {
  console.error(`LeetCode GraphQL HTTP ${res.status}`)
  process.exit(1)
}
const body = await res.json()
const user = body.data?.matchedUser
if (!user) {
  console.error(`No LeetCode user "${username}" (${JSON.stringify(body.errors ?? [])})`)
  process.exit(1)
}

const totals = Object.fromEntries(body.data.allQuestionsCount.map((q) => [q.difficulty, q.count]))
const solved = Object.fromEntries(
  user.submitStatsGlobal.acSubmissionNum.map((q) => [q.difficulty, q.count]),
)
const rawCalendar = JSON.parse(user.userCalendar?.submissionCalendar ?? '{}')
// Keys are epoch seconds (UTC-day buckets); convert to UTC day keys. The client
// treats them as day keys directly.
const calendar = {}
for (const [sec, count] of Object.entries(rawCalendar)) {
  const day = new Date(Number(sec) * 1000).toISOString().slice(0, 10)
  calendar[day] = (calendar[day] ?? 0) + count
}

const out = {
  username,
  fetchedAt: Date.now(),
  totalSolved: solved.All ?? 0,
  easySolved: solved.Easy ?? 0,
  easyTotal: totals.Easy ?? 0,
  mediumSolved: solved.Medium ?? 0,
  mediumTotal: totals.Medium ?? 0,
  hardSolved: solved.Hard ?? 0,
  hardTotal: totals.Hard ?? 0,
  ranking: user.profile?.ranking,
  calendar,
}

await mkdir('public/data', { recursive: true })
await writeFile('public/data/leetcode.json', JSON.stringify(out, null, 2))
console.log(`Wrote public/data/leetcode.json for ${username}: ${out.totalSolved} solved`)
