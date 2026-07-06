import { describe, expect, it } from 'vitest'
import { addDays, localDayKey } from '../dates'
import { generateAssignments } from '../assignments/generate'
import type { ActivityEvent, Unlock } from '../storage/schema'
import { evaluateAchievements } from './achievements'

const now = new Date(2026, 6, 6, 15) // Monday 2026-07-06

function completionsForDay(day: Date, count?: number): ActivityEvent[] {
  const assignments = generateAssignments(localDayKey(day))
  return assignments.slice(0, count ?? assignments.length).map((a, i) => ({
    id: `${a.id}-e`,
    ts: day.getTime() + i,
    type: 'assignment_completed' as const,
    refId: a.id,
    label: a.title,
  }))
}

function ids(unlocks: Unlock[]): string[] {
  return unlocks.map((u) => u.id).sort()
}

describe('evaluateAchievements', () => {
  it('unlocks first-assignment on the first completion only', () => {
    const events = completionsForDay(now, 1)
    const first = evaluateAchievements(events, [], now)
    expect(ids(first)).toEqual(['first-assignment'])
    expect(evaluateAchievements(events, first, now)).toEqual([])
  })

  it('unlocks perfect-day when every assignment of today is done', () => {
    const events = completionsForDay(now)
    expect(ids(evaluateAchievements(events, [], now))).toContain('perfect-day')
  })

  it('does not unlock perfect-day with one assignment missing', () => {
    const events = completionsForDay(now, 4)
    expect(ids(evaluateAchievements(events, [], now))).not.toContain('perfect-day')
  })

  it('unlocks streak-3 after three consecutive days', () => {
    const events = [
      ...completionsForDay(addDays(now, -2), 1),
      ...completionsForDay(addDays(now, -1), 1),
      ...completionsForDay(now, 1),
    ]
    expect(ids(evaluateAchievements(events, [], now))).toContain('streak-3')
  })

  it('does not unlock streak-3 when a day is missed', () => {
    const events = [
      ...completionsForDay(addDays(now, -3), 1),
      ...completionsForDay(addDays(now, -1), 1),
      ...completionsForDay(now, 1),
    ]
    expect(ids(evaluateAchievements(events, [], now))).not.toContain('streak-3')
  })

  it('unlocks completions-100 at one hundred effective completions', () => {
    const events: ActivityEvent[] = []
    for (let d = 19; d >= 0; d--) {
      events.push(...completionsForDay(addDays(now, -d)))
    }
    expect(events.length).toBeGreaterThanOrEqual(100)
    expect(ids(evaluateAchievements(events, [], now))).toContain('completions-100')
  })

  it('does not count tombstoned completions', () => {
    const [c] = completionsForDay(now, 1)
    const events: ActivityEvent[] = [
      c,
      { id: 'undo', ts: c.ts + 1, type: 'assignment_uncompleted', refId: c.refId },
    ]
    expect(evaluateAchievements(events, [], now)).toEqual([])
  })
})
