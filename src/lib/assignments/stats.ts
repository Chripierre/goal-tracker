import { effectiveAssignmentCompletions } from '../events/completion'
import { assignmentDayFromRefId } from './generate'
import type { ActivityEvent } from '../storage/schema'

/**
 * Days that count toward the streak — attributed to the assignment's OWN day
 * (from the refId), not the completion timestamp, so finishing the day's list
 * a minute after midnight still credits the right day.
 */
export function assignmentDays(events: readonly ActivityEvent[]): Set<string> {
  return new Set(
    effectiveAssignmentCompletions(events).map((e) =>
      assignmentDayFromRefId(e.refId as string),
    ),
  )
}

/** Effective completions whose assignment day is on/after fromDayKey (ISO keys compare lexically). */
export function completionsSinceDay(
  events: readonly ActivityEvent[],
  fromDayKey: string,
): ActivityEvent[] {
  return effectiveAssignmentCompletions(events).filter(
    (e) => assignmentDayFromRefId(e.refId as string) >= fromDayKey,
  )
}

/** Completed count per assignment day, for history views. */
export function completionsByDay(events: readonly ActivityEvent[]): Map<string, number> {
  const byDay = new Map<string, number>()
  for (const e of effectiveAssignmentCompletions(events)) {
    const day = assignmentDayFromRefId(e.refId as string)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  return byDay
}
