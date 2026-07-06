import { describe, expect, it } from 'vitest'
import type { ActivityEvent, ActivityEventType } from '../storage/schema'
import { completedAssignmentIds, effectiveAssignmentCompletions } from './completion'

function ev(type: ActivityEventType, refId: string, ts: number): ActivityEvent {
  return { id: `${refId}-${ts}`, ts, type, refId, label: refId }
}

describe('effectiveAssignmentCompletions', () => {
  it('is empty with no events', () => {
    expect(effectiveAssignmentCompletions([])).toEqual([])
  })

  it('counts a plain completion', () => {
    const events = [ev('assignment_completed', 'd1/a', 1)]
    expect(effectiveAssignmentCompletions(events)).toHaveLength(1)
  })

  it('resolves complete + uncomplete to nothing', () => {
    const events = [
      ev('assignment_completed', 'd1/a', 1),
      ev('assignment_uncompleted', 'd1/a', 2),
    ]
    expect(effectiveAssignmentCompletions(events)).toEqual([])
  })

  it('lets the latest event win across repeated toggles', () => {
    const events = [
      ev('assignment_completed', 'd1/a', 1),
      ev('assignment_uncompleted', 'd1/a', 2),
      ev('assignment_completed', 'd1/a', 3),
    ]
    const effective = effectiveAssignmentCompletions(events)
    expect(effective).toHaveLength(1)
    expect(effective[0].ts).toBe(3)
  })

  it('keeps refIds independent and sorts oldest first', () => {
    const events = [
      ev('assignment_completed', 'd1/b', 5),
      ev('assignment_completed', 'd1/a', 2),
      ev('assignment_uncompleted', 'd1/b', 7),
      ev('assignment_completed', 'd1/c', 6),
    ]
    const effective = effectiveAssignmentCompletions(events)
    expect(effective.map((e) => e.refId)).toEqual(['d1/a', 'd1/c'])
    expect(completedAssignmentIds(events)).toEqual(new Set(['d1/a', 'd1/c']))
  })

  it('ignores unrelated event types', () => {
    const events: ActivityEvent[] = [
      { id: 'x', ts: 1, type: 'challenge_completed', refId: 'd1/a' },
      { id: 'y', ts: 2, type: 'practice_logged' },
    ]
    expect(effectiveAssignmentCompletions(events)).toEqual([])
  })
})
