import type { BadgeVariant } from '@/components/ui/Badge'
import type { TodoCategory, TodoPriority } from '@/lib/storage/schema'

export const PRIORITIES: readonly TodoPriority[] = ['urgent', 'high', 'medium', 'low']
export const CATEGORIES: readonly TodoCategory[] = [
  'personal',
  'coding',
  'study',
  'career',
  'errand',
  'other',
]

export const PRIORITY_META: Record<TodoPriority, { label: string; variant: BadgeVariant }> = {
  urgent: { label: 'Urgent', variant: 'danger' },
  high: { label: 'High', variant: 'warning' },
  medium: { label: 'Medium', variant: 'accent' },
  low: { label: 'Low', variant: 'neutral' },
}

export const CATEGORY_LABEL: Record<TodoCategory, string> = {
  personal: 'Personal',
  coding: 'Coding',
  study: 'Study',
  career: 'Career',
  errand: 'Errand',
  other: 'Other',
}

export function formatDue(dueDay: string, todayKey: string): string {
  if (dueDay === todayKey) return 'Today'
  const due = new Date(`${dueDay}T00:00:00`)
  const today = new Date(`${todayKey}T00:00:00`)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 0) return `${-diffDays}d overdue`
  return due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
