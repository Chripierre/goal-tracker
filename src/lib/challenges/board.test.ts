import { describe, expect, it } from 'vitest'
import { BOUNTIES } from '@/data/challengeBounties'
import { bountyDueDay, weeklyBoard } from './board'

const monday = new Date(2026, 6, 6)

describe('bounty pool integrity', () => {
  it('has unique slugs and complete tiered entries', () => {
    const slugs = new Set<string>()
    for (const b of BOUNTIES) {
      expect(slugs.has(b.slug), `duplicate ${b.slug}`).toBe(false)
      slugs.add(b.slug)
      expect(['low', 'mid', 'high']).toContain(b.tier)
      expect(b.estimate.length, b.slug).toBeGreaterThan(3)
      expect(b.milestones.length, b.slug).toBeGreaterThanOrEqual(3)
      expect(b.rubric.length, b.slug).toBeGreaterThanOrEqual(3)
    }
    // legacy templates absorbed
    expect(slugs.has('cli-task-runner')).toBe(true)
    expect(slugs.has('oss-contribution')).toBe(true)
  })

  it('has collaborative options in the high tier', () => {
    expect(BOUNTIES.some((b) => b.tier === 'high' && b.collab)).toBe(true)
  })
})

describe('weeklyBoard', () => {
  it('posts 2 low, 2 mid, 1 high deterministically per week', () => {
    const a = weeklyBoard(monday, new Set())
    const b = weeklyBoard(new Date(2026, 6, 10), new Set()) // same ISO week
    expect(a.low).toHaveLength(2)
    expect(a.mid).toHaveLength(2)
    expect(a.high).toHaveLength(1)
    expect(a.low.map((x) => x.slug)).toEqual(b.low.map((x) => x.slug))
  })

  it('rotates across weeks and excludes claimed bounties', () => {
    const thisWeek = weeklyBoard(monday, new Set())
    const nextWeek = weeklyBoard(new Date(2026, 6, 13), new Set())
    expect(thisWeek.low.map((x) => x.slug)).not.toEqual(nextWeek.low.map((x) => x.slug))

    const excluded = new Set(thisWeek.low.map((x) => x.slug))
    const rerolled = weeklyBoard(monday, excluded)
    expect(rerolled.low.every((x) => !excluded.has(x.slug))).toBe(true)
  })

  it('degrades gracefully when a tier pool is nearly exhausted', () => {
    const allButOneHigh = new Set(
      BOUNTIES.filter((b) => b.tier === 'high').slice(1).map((b) => b.slug),
    )
    const board = weeklyBoard(monday, allButOneHigh)
    expect(board.high).toHaveLength(1)
    const allHigh = new Set(BOUNTIES.filter((b) => b.tier === 'high').map((b) => b.slug))
    expect(weeklyBoard(monday, allHigh).high).toHaveLength(0)
  })
})

describe('bountyDueDay', () => {
  it('maps tiers to their windows', () => {
    expect(bountyDueDay('low', monday)).toBe('2026-07-13')
    expect(bountyDueDay('mid', monday)).toBe('2026-08-05')
    expect(bountyDueDay('high', monday)).toBe('2026-10-04')
  })
})
