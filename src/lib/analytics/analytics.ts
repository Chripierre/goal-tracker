import { generateAssignments, assignmentDayFromRefId } from '../assignments/generate'
import { effectiveAssignmentCompletions } from '../events/completion'
import { addDays, localDayKey } from '../dates'
import type { ActivityEvent, ChallengeRecord, Todo } from '../storage/schema'

/**
 * All productive completions per day: assignments (by their own day), personal
 * todos (by completion day), and archived challenges (by completion day).
 * Todos stay decoupled from the streak, but analytics may aggregate everything.
 */
export function productiveDayCounts(
  events: readonly ActivityEvent[],
  todos: readonly Todo[],
): Record<string, number> {
  const out: Record<string, number> = {}
  const bump = (day: string) => {
    out[day] = (out[day] ?? 0) + 1
  }
  for (const e of effectiveAssignmentCompletions(events)) {
    bump(assignmentDayFromRefId(e.refId as string))
  }
  for (const e of events) {
    if (e.type === 'challenge_completed') bump(localDayKey(new Date(e.ts)))
  }
  for (const t of todos) {
    if (t.completedAt) bump(localDayKey(new Date(t.completedAt)))
  }
  return out
}

/** Fraction (0-100) of the last `windowDays` days with any productive activity. */
export function activeDayPct(
  counts: Record<string, number>,
  now: Date,
  windowDays = 30,
): number {
  let active = 0
  for (let i = 0; i < windowDays; i++) {
    const day = localDayKey(addDays(now, -i))
    if ((counts[day] ?? 0) > 0) active++
  }
  return Math.round((active / windowDays) * 100)
}

/** Days where every generated assignment of that day was completed. */
export function perfectDayCount(events: readonly ActivityEvent[]): number {
  const byDay = new Map<string, number>()
  for (const e of effectiveAssignmentCompletions(events)) {
    const day = assignmentDayFromRefId(e.refId as string)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  let perfect = 0
  for (const [day, count] of byDay) {
    if (count >= generateAssignments(day).length) perfect++
  }
  return perfect
}

export function challengeSummary(challenges: readonly ChallengeRecord[]): {
  completed: number
  avgScore: number
  avgMilestones: number
} {
  const done = challenges.filter((c) => c.status === 'completed')
  if (done.length === 0) return { completed: 0, avgScore: 0, avgMilestones: 0 }
  const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
  return {
    completed: done.length,
    avgScore: avg(done.map((c) => c.score ?? 0)),
    avgMilestones: avg(done.map((c) => c.completionPct ?? 0)),
  }
}
