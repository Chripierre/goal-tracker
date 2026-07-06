import { describe, expect, it } from 'vitest'
import type { GameResult } from '../storage/schema'
import { dailyQuestionIndices, scoreQuestion, topResults } from './game'

describe('dailyQuestionIndices', () => {
  it('is deterministic per day and picks distinct indices', () => {
    const a = dailyQuestionIndices('2026-07-06', 45)
    const b = dailyQuestionIndices('2026-07-06', 45)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(5)
    expect(a.every((i) => i >= 0 && i < 45)).toBe(true)
  })

  it('differs across days and clamps to bank size', () => {
    expect(dailyQuestionIndices('2026-07-06', 45)).not.toEqual(
      dailyQuestionIndices('2026-07-07', 45),
    )
    expect(dailyQuestionIndices('2026-07-06', 3)).toHaveLength(3)
  })
})

describe('scoreQuestion', () => {
  it('scores wrong answers zero regardless of hints or time', () => {
    expect(scoreQuestion({ correct: false, remainingSec: 30, usedHint: false })).toBe(0)
  })

  it('adds a proportional time bonus', () => {
    expect(scoreQuestion({ correct: true, remainingSec: 30, usedHint: false })).toBe(150)
    expect(scoreQuestion({ correct: true, remainingSec: 15, usedHint: false })).toBe(125)
    expect(scoreQuestion({ correct: true, remainingSec: 0, usedHint: false })).toBe(100)
  })

  it('applies the hint penalty', () => {
    expect(scoreQuestion({ correct: true, remainingSec: 30, usedHint: true })).toBe(125)
  })
})

describe('topResults', () => {
  it('sorts by score then recency and limits', () => {
    const r = (dayKey: string, score: number, completedAt: number): GameResult => ({
      dayKey,
      score,
      correct: 3,
      total: 5,
      completedAt,
    })
    const sorted = topResults([r('a', 100, 1), r('b', 300, 2), r('c', 300, 3)], 2)
    expect(sorted.map((x) => x.dayKey)).toEqual(['c', 'b'])
  })
})
