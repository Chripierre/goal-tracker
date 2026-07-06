import { startOfWeek } from '../dates'
import type { LcStats } from './client'

export function lcActiveDays(calendar: Record<string, number>): Set<string> {
  return new Set(Object.keys(calendar).filter((day) => calendar[day] > 0))
}

/** Accepted submissions per week for the last `weeks` weeks, oldest first. */
export function weeklyCounts(
  calendar: Record<string, number>,
  now: Date,
  weeks = 8,
): number[] {
  const out = new Array<number>(weeks).fill(0)
  const thisWeekStart = startOfWeek(now).getTime()
  const weekMs = 7 * 86_400_000
  for (const [day, count] of Object.entries(calendar)) {
    const weekStart = startOfWeek(new Date(`${day}T00:00:00`)).getTime()
    const diff = Math.round((thisWeekStart - weekStart) / weekMs)
    if (diff >= 0 && diff < weeks) out[weeks - 1 - diff] += count
  }
  return out
}

/** Difficulty with the weakest coverage — the honest v1 of weak-area analysis. */
export function weakestArea(stats: LcStats): { label: string; message: string } {
  const areas = [
    { label: 'Easy', solved: stats.easySolved, total: stats.easyTotal },
    { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal },
    { label: 'Hard', solved: stats.hardSolved, total: stats.hardTotal },
  ]
  const withPct = areas.map((a) => ({
    ...a,
    pct: a.total > 0 ? (a.solved / a.total) * 100 : 0,
  }))
  const weakest = withPct.reduce((min, a) => (a.pct < min.pct ? a : min))
  return {
    label: weakest.label,
    message: `${weakest.label} coverage is your thinnest at ${weakest.pct.toFixed(1)}% — bias this week's practice toward ${weakest.label.toLowerCase()} problems. Per-topic analysis arrives with the Resource Center.`,
  }
}
