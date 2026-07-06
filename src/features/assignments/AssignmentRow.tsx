import { Check } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { AssignmentCategory } from '@/data/assignmentTemplates'
import type { DailyAssignment } from '@/lib/assignments/generate'

const categoryVariant: Record<AssignmentCategory, BadgeVariant> = {
  leetcode: 'accent',
  github: 'success',
  project: 'warning',
  study: 'neutral',
  career: 'neutral',
}

const categoryLabel: Record<AssignmentCategory, string> = {
  leetcode: 'LeetCode',
  github: 'GitHub',
  project: 'Project',
  study: 'Study',
  career: 'Career',
}

interface AssignmentRowProps {
  assignment: DailyAssignment
  completed: boolean
  onToggle: (completed: boolean) => void
  compact?: boolean
}

export function AssignmentRow({
  assignment,
  completed,
  onToggle,
  compact = false,
}: AssignmentRowProps) {
  return (
    <button
      type="button"
      aria-pressed={completed}
      onClick={() => onToggle(!completed)}
      className="group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          completed
            ? 'border-success bg-success/20 text-success'
            : 'border-border text-transparent group-hover:border-text-3'
        }`}
      >
        <Check className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-medium transition-colors ${
            completed ? 'text-text-3 line-through' : ''
          }`}
        >
          {assignment.title}
        </span>
        {!compact && (
          <span className="mt-0.5 block text-xs text-text-3">{assignment.description}</span>
        )}
      </span>
      <Badge variant={categoryVariant[assignment.category]} className="shrink-0">
        {categoryLabel[assignment.category]}
      </Badge>
    </button>
  )
}
