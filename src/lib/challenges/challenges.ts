import {
  MONTHLY_CHALLENGES,
  WEEKLY_CHALLENGES,
  type ChallengeTemplate,
} from '@/data/challengeTemplates'
import { addDays, localDayKey, startOfWeek } from '../dates'
import type { ChallengeKind, ChallengeRecord } from '../storage/schema'

export function isoWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return { year: date.getUTCFullYear(), week }
}

export function weekChallengeId(d: Date): string {
  const { year, week } = isoWeek(d)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function monthChallengeId(d: Date): string {
  return localDayKey(d).slice(0, 7)
}

/** Deterministic template for a period — same period always gets the same one. */
export function templateFor(kind: ChallengeKind, d: Date): ChallengeTemplate {
  if (kind === 'week') {
    const { year, week } = isoWeek(d)
    return WEEKLY_CHALLENGES[(year * 53 + week) % WEEKLY_CHALLENGES.length]
  }
  const months = d.getFullYear() * 12 + d.getMonth()
  return MONTHLY_CHALLENGES[months % MONTHLY_CHALLENGES.length]
}

export function templateBySlug(slug: string): ChallengeTemplate | undefined {
  return [...WEEKLY_CHALLENGES, ...MONTHLY_CHALLENGES].find((t) => t.slug === slug)
}

export function dueDayFor(kind: ChallengeKind, d: Date): string {
  if (kind === 'week') return localDayKey(addDays(startOfWeek(d), 6))
  return localDayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

/** Repo naming per the owner brief: week-28-algo-visualizer / month-july-portfolio-site. */
export function repoNameFor(kind: ChallengeKind, d: Date, slug: string): string {
  if (kind === 'week') return `week-${isoWeek(d).week}-${slug}`
  const month = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()
  return `month-${month}-${slug}`
}

export function newRepoUrl(name: string, description: string): string {
  return `https://github.com/new?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
}

export function milestonePct(record: ChallengeRecord, template: ChallengeTemplate): number {
  if (template.milestones.length === 0) return 0
  const done = template.milestones.filter((m) => record.milestonesDone.includes(m.id)).length
  return Math.round((done / template.milestones.length) * 100)
}

export function rubricScore(record: ChallengeRecord, template: ChallengeTemplate): number {
  const total = template.rubric.reduce((sum, r) => sum + r.points, 0)
  if (total === 0) return 0
  const earned = template.rubric
    .filter((r) => record.rubricChecked.includes(r.id))
    .reduce((sum, r) => sum + r.points, 0)
  return Math.round((earned / total) * 100)
}
