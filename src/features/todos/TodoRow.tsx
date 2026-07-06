import type { ReactNode } from 'react'
import { CalendarPlus, Check, Pencil, Repeat, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { isOverdue } from '@/lib/todos/filter'
import { googleCalendarUrl } from '@/lib/todos/gcal'
import type { Todo } from '@/lib/storage/schema'
import { CATEGORY_LABEL, PRIORITY_META, formatDue } from './meta'

interface TodoRowProps {
  todo: Todo
  todayKey: string
  onToggle: (id: string, next: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onTagClick?: (tag: string) => void
  dragHandle?: ReactNode
}

export function TodoRow({
  todo,
  todayKey,
  onToggle,
  onEdit,
  onDelete,
  onTagClick,
  dragHandle,
}: TodoRowProps) {
  const done = !!todo.completedAt
  const overdue = isOverdue(todo, todayKey)
  const gcal = googleCalendarUrl(todo)

  return (
    <div className="group flex items-center gap-2 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-2/40">
      {dragHandle}
      <button
        type="button"
        aria-pressed={done}
        aria-label={`Mark "${todo.title}" ${done ? 'incomplete' : 'complete'}`}
        onClick={() => onToggle(todo.id, !done)}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
          done
            ? 'border-success bg-success/20 text-success'
            : 'border-border text-transparent hover:border-text-3'
        }`}
      >
        <Check className="size-3.5" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${done ? 'text-text-3 line-through' : ''}`}
        >
          {todo.title}
        </p>
        {todo.notes && <p className="truncate text-xs text-text-3">{todo.notes}</p>}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {todo.recurrence && (
          <Repeat className="size-3.5 text-text-3" aria-label={`Repeats ${todo.recurrence}`} />
        )}
        {todo.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick?.(tag)}
            className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-3 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
          >
            #{tag}
          </button>
        ))}
        {todo.dueDay && (
          <span
            className={`text-xs ${overdue ? 'font-medium text-danger' : 'text-text-3'}`}
          >
            {formatDue(todo.dueDay, todayKey)}
          </span>
        )}
        <Badge variant={PRIORITY_META[todo.priority].variant}>
          {PRIORITY_META[todo.priority].label}
        </Badge>
        <Badge>{CATEGORY_LABEL[todo.category]}</Badge>
        {gcal && (
          <a
            href={gcal}
            target="_blank"
            rel="noreferrer"
            aria-label={`Add "${todo.title}" to Google Calendar`}
            title="Add to Google Calendar"
            className="rounded-md p-1 text-text-3 opacity-0 outline-none transition-all group-hover:opacity-100 hover:text-text focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CalendarPlus className="size-4" aria-hidden />
          </a>
        )}
        <button
          type="button"
          aria-label={`Edit "${todo.title}"`}
          onClick={() => onEdit(todo)}
          className="rounded-md p-1 text-text-3 opacity-0 outline-none transition-all group-hover:opacity-100 hover:text-text focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Delete "${todo.title}"`}
          onClick={() => onDelete(todo.id)}
          className="rounded-md p-1 text-text-3 opacity-0 outline-none transition-all group-hover:opacity-100 hover:text-danger focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
