import { describe, expect, it } from 'vitest'
import { generateAssignments } from '../assignments/generate'
import { longestStreak } from '../streak/streak'
import type { ActivityEvent, Todo } from '../storage/schema'
import { activeDayPct, challengeSummary, perfectDayCount, productiveDayCounts } from './analytics'

const now = new Date(2026, 6, 6, 15)

function assignmentEvent(dayKey: string, templateId: string, ts: number): ActivityEvent {
  return {
    id: `${dayKey}/${templateId}-e`,
    ts,
    type: 'assignment_completed',
    refId: `${dayKey}/${templateId}`,
  }
}

describe('productiveDayCounts', () => {
  it('merges assignments (by refId day), todos, and challenge events', () => {
    const events: ActivityEvent[] = [
      assignmentEvent('2026-07-06', 'a', new Date(2026, 6, 6, 9).getTime()),
      assignmentEvent('2026-07-06', 'b', new Date(2026, 6, 6, 10).getTime()),
      { id: 'c1', ts: new Date(2026, 6, 5, 12).getTime(), type: 'challenge_completed', refId: 'x' },
    ]
    const todos: Todo[] = [
      {
        id: 't1',
        title: 't',
        priority: 'low',
        category: 'personal',
        tags: [],
        createdAt: 1,
        completedAt: new Date(2026, 6, 6, 20).getTime(),
      },
    ]
    const counts = productiveDayCounts(events, todos)
    expect(counts['2026-07-06']).toBe(3)
    expect(counts['2026-07-05']).toBe(1)
  })
})

describe('activeDayPct / longestStreak / perfectDayCount', () => {
  it('computes the 30-day active percentage', () => {
    const counts = { '2026-07-06': 1, '2026-07-05': 2, '2026-06-30': 1 }
    expect(activeDayPct(counts, now, 30)).toBe(10)
  })

  it('finds the longest historical streak', () => {
    expect(longestStreak(new Set(['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-06']))).toBe(3)
    expect(longestStreak(new Set())).toBe(0)
  })

  it('counts perfect days against that day\'s generated set', () => {
    const day = '2026-07-06'
    const all = generateAssignments(day).map((a, i) =>
      assignmentEvent(day, a.templateId, 1000 + i),
    )
    expect(perfectDayCount(all)).toBe(1)
    expect(perfectDayCount(all.slice(0, 2))).toBe(0)
  })
})

describe('challengeSummary', () => {
  it('averages completed challenges only', () => {
    const summary = challengeSummary([
      { id: 'a', kind: 'week', templateSlug: 's', startedAt: 1, dueDay: 'x', milestonesDone: [], rubricChecked: [], status: 'completed', score: 100, completionPct: 50 },
      { id: 'b', kind: 'week', templateSlug: 's', startedAt: 1, dueDay: 'x', milestonesDone: [], rubricChecked: [], status: 'completed', score: 50, completionPct: 100 },
      { id: 'c', kind: 'week', templateSlug: 's', startedAt: 1, dueDay: 'x', milestonesDone: [], rubricChecked: [], status: 'active' },
    ])
    expect(summary).toEqual({ completed: 2, avgScore: 75, avgMilestones: 75 })
  })

  it('handles the empty case', () => {
    expect(challengeSummary([])).toEqual({ completed: 0, avgScore: 0, avgMilestones: 0 })
  })
})
