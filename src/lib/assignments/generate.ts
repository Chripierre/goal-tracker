import {
  ASSIGNMENT_TEMPLATES,
  type AssignmentCategory,
} from '@/data/assignmentTemplates'

export interface DailyAssignment {
  /** Stable completion key: `${dayKey}/${templateId}` — events reference this. */
  id: string
  templateId: string
  dayKey: string
  category: AssignmentCategory
  title: string
  description: string
}

/** Integer day index for a local day key; stable across reruns, drives rotation. */
export function dayNumber(dayKey: string): number {
  return Math.round(Date.parse(`${dayKey}T00:00:00`) / 86_400_000)
}

/**
 * Pure: the same dayKey always yields the same assignments, so nothing about
 * a day's plan needs persisting — only completion events are stored.
 */
export function generateAssignments(dayKey: string): DailyAssignment[] {
  const n = dayNumber(dayKey)
  return ASSIGNMENT_TEMPLATES.map((t) => ({
    id: `${dayKey}/${t.id}`,
    templateId: t.id,
    dayKey,
    category: t.category,
    title: t.pool ? t.pool[n % t.pool.length] : t.title,
    description: t.description,
  }))
}

export function assignmentDayFromRefId(refId: string): string {
  return refId.slice(0, refId.indexOf('/'))
}
