import type { ActivityEvent } from '../storage/schema'

/**
 * Resolves the complete/uncomplete tombstone pairs: the latest event per refId
 * decides. Returns the winning completed events, oldest first.
 */
export function effectiveAssignmentCompletions(
  events: readonly ActivityEvent[],
): ActivityEvent[] {
  const latest = new Map<string, ActivityEvent>()
  for (const e of events) {
    if (
      (e.type === 'assignment_completed' || e.type === 'assignment_uncompleted') &&
      e.refId
    ) {
      latest.set(e.refId, e)
    }
  }
  return [...latest.values()]
    .filter((e) => e.type === 'assignment_completed')
    .sort((a, b) => a.ts - b.ts)
}

export function completedAssignmentIds(events: readonly ActivityEvent[]): Set<string> {
  return new Set(effectiveAssignmentCompletions(events).map((e) => e.refId as string))
}
