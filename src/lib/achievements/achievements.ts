import { addDays, localDayKey } from '../dates'
import { currentStreak } from '../streak/streak'
import { generateAssignments, assignmentDayFromRefId } from '../assignments/generate'
import { effectiveAssignmentCompletions } from '../events/completion'
import { assignmentDays } from '../assignments/stats'
import { playedDays } from '../game/game'
import type {
  ActivityEvent,
  ChallengeRecord,
  GameResult,
  Todo,
  Unlock,
} from '../storage/schema'

export interface AchievementInput {
  events: readonly ActivityEvent[]
  todos: readonly Todo[]
  challenges: readonly ChallengeRecord[]
  gameResults: readonly GameResult[]
}

export interface AchievementContext {
  completions: ActivityEvent[]
  completedIds: ReadonlySet<string>
  streak: number
  todaysAssignmentIds: readonly string[]
  consecutivePerfectDays: number
  todosCompleted: number
  challengesCompleted: number
  hasPerfectChallenge: boolean
  gamesPlayed: number
  hasPerfectGame: boolean
  gameStreak: number
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  check: (ctx: AchievementContext) => boolean
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  // Assignments
  { id: 'first-assignment', title: 'First step', description: 'Complete your first daily assignment.', check: (c) => c.completions.length >= 1 },
  { id: 'perfect-day', title: 'Perfect day', description: 'Complete every assignment in a single day.', check: (c) => c.consecutivePerfectDays >= 1 },
  { id: 'streak-3', title: 'Three in a row', description: 'Keep a 3-day assignment streak.', check: (c) => c.streak >= 3 },
  { id: 'streak-7', title: 'One week strong', description: 'Keep a 7-day assignment streak.', check: (c) => c.streak >= 7 },
  { id: 'streak-30', title: 'Habit formed', description: 'Keep a 30-day assignment streak.', check: (c) => c.streak >= 30 },
  { id: 'completions-100', title: 'Century', description: 'Complete 100 assignments in total.', check: (c) => c.completions.length >= 100 },
  { id: 'perfect-week', title: 'Perfect week', description: 'Seven perfect assignment days in a row.', check: (c) => c.consecutivePerfectDays >= 7 },
  { id: 'perfect-month', title: 'Perfect month', description: 'Thirty perfect assignment days in a row.', check: (c) => c.consecutivePerfectDays >= 30 },
  // Todos
  { id: 'first-todo', title: 'List keeper', description: 'Complete your first personal todo.', check: (c) => c.todosCompleted >= 1 },
  { id: 'todos-50', title: 'List crusher', description: 'Complete 50 personal todos.', check: (c) => c.todosCompleted >= 50 },
  // Challenges
  { id: 'first-challenge', title: 'Shipped', description: 'Archive your first project challenge.', check: (c) => c.challengesCompleted >= 1 },
  { id: 'challenge-perfect', title: 'Flawless build', description: 'Archive a challenge with a 100% rubric score.', check: (c) => c.hasPerfectChallenge },
  { id: 'challenges-5', title: 'Serial shipper', description: 'Archive five project challenges.', check: (c) => c.challengesCompleted >= 5 },
  // Interview game
  { id: 'first-game', title: 'Warm-up round', description: 'Finish your first daily interview round.', check: (c) => c.gamesPlayed >= 1 },
  { id: 'interview-master', title: 'Interview Master', description: 'Answer all five questions correctly in one round.', check: (c) => c.hasPerfectGame },
  { id: 'game-streak-7', title: 'Question a day', description: 'Play the interview round seven days in a row.', check: (c) => c.gameStreak >= 7 },
]

export const ACHIEVEMENTS_BY_ID: ReadonlyMap<string, AchievementDef> = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)

function consecutivePerfectDays(events: readonly ActivityEvent[], now: Date): number {
  const byDay = new Map<string, number>()
  for (const e of effectiveAssignmentCompletions(events)) {
    const day = assignmentDayFromRefId(e.refId as string)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  let run = 0
  let cursor = now
  for (;;) {
    const day = localDayKey(cursor)
    if ((byDay.get(day) ?? 0) < generateAssignments(day).length) break
    run++
    cursor = addDays(cursor, -1)
  }
  return run
}

export function buildAchievementContext(input: AchievementInput, now: Date): AchievementContext {
  const completions = effectiveAssignmentCompletions(input.events)
  const done = input.challenges.filter((c) => c.status === 'completed')
  return {
    completions,
    completedIds: new Set(completions.map((e) => e.refId as string)),
    streak: currentStreak(assignmentDays(input.events), now),
    todaysAssignmentIds: generateAssignments(localDayKey(now)).map((a) => a.id),
    consecutivePerfectDays: consecutivePerfectDays(input.events, now),
    todosCompleted: input.todos.filter((t) => t.completedAt).length,
    challengesCompleted: done.length,
    hasPerfectChallenge: done.some((c) => (c.score ?? 0) >= 100),
    gamesPlayed: input.gameResults.length,
    hasPerfectGame: input.gameResults.some((r) => r.correct === r.total),
    gameStreak: currentStreak(playedDays(input.gameResults), now),
  }
}

/** Returns only NEW unlocks; existing unlocks are permanent and never re-earned. */
export function evaluateAchievements(
  input: AchievementInput,
  unlocked: readonly Unlock[],
  now: Date,
): Unlock[] {
  const have = new Set(unlocked.map((u) => u.id))
  const ctx = buildAchievementContext(input, now)
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(ctx)).map((a) => ({
    id: a.id,
    unlockedAt: now.getTime(),
  }))
}
