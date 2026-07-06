import { describe, expect, it } from 'vitest'
import type { ChallengeRecord } from '../storage/schema'
import {
  dueDayFor,
  isoWeek,
  milestonePct,
  monthChallengeId,
  repoNameFor,
  rubricScore,
  templateFor,
  weekChallengeId,
} from './challenges'

const monday = new Date(2026, 6, 6) // 2026-07-06, Monday of ISO week 28

describe('isoWeek and period ids', () => {
  it('computes known ISO weeks', () => {
    expect(isoWeek(monday)).toEqual({ year: 2026, week: 28 })
    expect(isoWeek(new Date(2026, 0, 1))).toEqual({ year: 2026, week: 1 })
    // 2027-01-01 is a Friday and belongs to 2026's week 53
    expect(isoWeek(new Date(2027, 0, 1))).toEqual({ year: 2026, week: 53 })
  })

  it('formats period ids', () => {
    expect(weekChallengeId(monday)).toBe('2026-W28')
    expect(monthChallengeId(monday)).toBe('2026-07')
  })

  it('due days land on Sunday and month end', () => {
    expect(dueDayFor('week', monday)).toBe('2026-07-12')
    expect(dueDayFor('month', monday)).toBe('2026-07-31')
  })
})

describe('template rotation', () => {
  it('is deterministic within a period and changes across periods', () => {
    expect(templateFor('week', monday).slug).toBe(templateFor('week', new Date(2026, 6, 10)).slug)
    expect(templateFor('week', monday).slug).not.toBe(
      templateFor('week', new Date(2026, 6, 13)).slug,
    )
    expect(templateFor('month', monday).slug).toBe(templateFor('month', new Date(2026, 6, 30)).slug)
    expect(templateFor('month', monday).slug).not.toBe(
      templateFor('month', new Date(2026, 7, 1)).slug,
    )
  })

  it('names repos per the brief', () => {
    expect(repoNameFor('week', monday, 'algo-visualizer')).toBe('week-28-algo-visualizer')
    expect(repoNameFor('month', monday, 'portfolio-site')).toBe('month-july-portfolio-site')
  })
})

describe('scoring', () => {
  const template = templateFor('week', monday)
  const base: ChallengeRecord = {
    id: '2026-W28',
    kind: 'week',
    templateSlug: template.slug,
    startedAt: 1,
    dueDay: '2026-07-12',
    milestonesDone: [],
    rubricChecked: [],
    status: 'active',
  }

  it('computes milestone percent', () => {
    expect(milestonePct(base, template)).toBe(0)
    const half = { ...base, milestonesDone: template.milestones.slice(0, 2).map((m) => m.id) }
    expect(milestonePct(half, template)).toBe(50)
    const all = { ...base, milestonesDone: template.milestones.map((m) => m.id) }
    expect(milestonePct(all, template)).toBe(100)
  })

  it('computes rubric score from points', () => {
    expect(rubricScore(base, template)).toBe(0)
    const some = { ...base, rubricChecked: template.rubric.slice(0, 3).map((r) => r.id) }
    expect(rubricScore(some, template)).toBe(75)
  })

  it('ignores unknown ids', () => {
    const junk = { ...base, milestonesDone: ['nope'], rubricChecked: ['nada'] }
    expect(milestonePct(junk, template)).toBe(0)
    expect(rubricScore(junk, template)).toBe(0)
  })
})
