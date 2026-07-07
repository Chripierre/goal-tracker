import { describe, expect, it } from 'vitest'
import { EXPLORE_TOPICS, QUOTES, TIPS } from '@/data/briefing'
import { dailyBriefing } from './briefing'

describe('dailyBriefing', () => {
  it('is deterministic per day and varies across days', () => {
    const a = dailyBriefing('2026-07-07')
    const b = dailyBriefing('2026-07-07')
    const c = dailyBriefing('2026-07-08')
    expect(a).toEqual(b)
    expect([a.quote.text, a.tip, a.explore.topic]).not.toEqual([
      c.quote.text,
      c.tip,
      c.explore.topic,
    ])
  })

  it('draws from non-empty, attributed pools', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(12)
    expect(QUOTES.every((q) => q.author.length > 2)).toBe(true)
    expect(TIPS.length).toBeGreaterThanOrEqual(12)
    expect(EXPLORE_TOPICS.every((t) => t.why.length > 10)).toBe(true)
  })
})
