import { describe, expect, it } from 'vitest'
import { calendarFromEpochSeconds, type LcStats } from './client'
import { lcActiveDays, weakestArea, weeklyCounts } from './stats'

const now = new Date(2026, 6, 6, 15) // Monday 2026-07-06

describe('calendarFromEpochSeconds', () => {
  it('converts and merges epoch-second keys into local day keys', () => {
    const noon = Math.floor(new Date(2026, 6, 6, 12).getTime() / 1000)
    const evening = Math.floor(new Date(2026, 6, 6, 20).getTime() / 1000)
    const cal = calendarFromEpochSeconds({ [String(noon)]: 2, [String(evening)]: 1 })
    expect(cal['2026-07-06']).toBe(3)
  })
})

describe('weeklyCounts', () => {
  it('buckets by ISO-style Monday weeks, oldest first', () => {
    const cal = {
      '2026-07-06': 2, // this week (Monday)
      '2026-07-01': 3, // last week (Wednesday)
      '2026-06-29': 1, // last week (Monday)
      '2026-05-01': 9, // ~10 weeks ago, outside window
    }
    const counts = weeklyCounts(cal, now, 8)
    expect(counts).toHaveLength(8)
    expect(counts[7]).toBe(2)
    expect(counts[6]).toBe(4)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(6)
  })
})

describe('lcActiveDays / weakestArea', () => {
  it('collects only days with activity', () => {
    expect(lcActiveDays({ '2026-07-06': 1, '2026-07-05': 0 })).toEqual(new Set(['2026-07-06']))
  })

  it('picks the difficulty with the lowest coverage', () => {
    const stats: LcStats = {
      username: 'x',
      fetchedAt: 0,
      totalSolved: 60,
      easySolved: 40,
      easyTotal: 800,
      mediumSolved: 18,
      mediumTotal: 1700,
      hardSolved: 2,
      hardTotal: 750,
      calendar: {},
    }
    expect(weakestArea(stats).label).toBe('Hard')
  })
})
