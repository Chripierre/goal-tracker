import { localDayKey } from '../dates'
import { currentStreak } from '../streak/streak'
import { generateAssignments } from '../assignments/generate'
import { effectiveAssignmentCompletions } from '../events/completion'
import { assignmentDays } from '../assignments/stats'
import type { ActivityEvent, Unlock } from '../storage/schema'

export interface AchievementContext {
  /** Effective (tombstone-resolved) completions, oldest first. */
  completions: ActivityEvent[]
  completedIds: ReadonlySet<string>
  streak: number
  todaysAssignmentIds: readonly string[]
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  check: (ctx: AchievementContext) => boolean
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'first-assignment',
    title: 'First step',
    description: 'Complete your first daily assignment.',
    check: (c) => c.completions.length >= 1,
  },
  {
    id: 'perfect-day',
    title: 'Perfect day',
    description: 'Complete every assignment in a single day.',
    check: (c) =>
      c.todaysAssignmentIds.length > 0 &&
      c.todaysAssignmentIds.every((id) => c.completedIds.has(id)),
  },
  {
    id: 'streak-3',
    title: 'Three in a row',
    description: 'Keep a 3-day assignment streak.',
    check: (c) => c.streak >= 3,
  },
  {
    id: 'streak-7',
    title: 'One week strong',
    description: 'Keep a 7-day assignment streak.',
    check: (c) => c.streak >= 7,
  },
  {
    id: 'streak-30',
    title: 'Habit formed',
    description: 'Keep a 30-day assignment streak.',
    check: (c) => c.streak >= 30,
  },
  {
    id: 'completions-100',
    title: 'Century',
    description: 'Complete 100 assignments in total.',
    check: (c) => c.completions.length >= 100,
  },
]

export const ACHIEVEMENTS_BY_ID: ReadonlyMap<string, AchievementDef> = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)

export function buildAchievementContext(
  events: readonly ActivityEvent[],
  now: Date,
): AchievementContext {
  const completions = effectiveAssignmentCompletions(events)
  return {
    completions,
    completedIds: new Set(completions.map((e) => e.refId as string)),
    streak: currentStreak(assignmentDays(events), now),
    todaysAssignmentIds: generateAssignments(localDayKey(now)).map((a) => a.id),
  }
}

/** Returns only NEW unlocks; existing unlocks are permanent and never re-earned. */
export function evaluateAchievements(
  events: readonly ActivityEvent[],
  unlocked: readonly Unlock[],
  now: Date,
): Unlock[] {
  const have = new Set(unlocked.map((u) => u.id))
  const ctx = buildAchievementContext(events, now)
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(ctx)).map((a) => ({
    id: a.id,
    unlockedAt: now.getTime(),
  }))
}
