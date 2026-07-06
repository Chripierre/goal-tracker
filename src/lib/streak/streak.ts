import { addDays, localDayKey } from '../dates'

/**
 * Consecutive active days ending today or yesterday. A missed day breaks the
 * chain, but the day keys themselves (history) are never mutated — the streak
 * is always derived, per the event-log architecture.
 */
export function currentStreak(activeDays: ReadonlySet<string>, today: Date): number {
  let cursor = activeDays.has(localDayKey(today)) ? today : addDays(today, -1)
  let streak = 0
  while (activeDays.has(localDayKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function activeDaysFrom(timestamps: readonly number[]): Set<string> {
  return new Set(timestamps.map((ts) => localDayKey(new Date(ts))))
}

/** Longest run of consecutive active days anywhere in history. */
export function longestStreak(activeDays: ReadonlySet<string>): number {
  const sorted = [...activeDays].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const day of sorted) {
    run = prev !== null && localDayKey(addDays(new Date(`${prev}T00:00:00`), 1)) === day ? run + 1 : 1
    if (run > best) best = run
    prev = day
  }
  return best
}
