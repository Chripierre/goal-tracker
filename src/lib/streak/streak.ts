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
