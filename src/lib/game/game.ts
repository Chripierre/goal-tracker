import { dayNumber } from '../assignments/generate'
import type { GameResult } from '../storage/schema'

export const QUESTIONS_PER_DAY = 5
export const QUESTION_SECONDS = 30
export const POINTS_CORRECT = 100
export const POINTS_TIME_BONUS_MAX = 50
export const HINT_PENALTY = 25

/** Deterministic, distinct question indices for a day. */
export function dailyQuestionIndices(
  dayKey: string,
  bankSize: number,
  count = QUESTIONS_PER_DAY,
): number[] {
  const seed = dayNumber(dayKey)
  const picked: number[] = []
  let i = 0
  while (picked.length < Math.min(count, bankSize)) {
    let idx = (seed * 7919 + i * 104729 + i * i * 31) % bankSize
    while (picked.includes(idx)) idx = (idx + 1) % bankSize
    picked.push(idx)
    i++
  }
  return picked
}

export function scoreQuestion(input: {
  correct: boolean
  remainingSec: number
  usedHint: boolean
}): number {
  if (!input.correct) return 0
  const bonus = Math.round(
    (Math.max(0, Math.min(input.remainingSec, QUESTION_SECONDS)) / QUESTION_SECONDS) *
      POINTS_TIME_BONUS_MAX,
  )
  return Math.max(0, POINTS_CORRECT + bonus - (input.usedHint ? HINT_PENALTY : 0))
}

export function playedDays(results: readonly GameResult[]): Set<string> {
  return new Set(results.map((r) => r.dayKey))
}

export function topResults(results: readonly GameResult[], n = 10): GameResult[] {
  return [...results].sort((a, b) => b.score - a.score || b.completedAt - a.completedAt).slice(0, n)
}
