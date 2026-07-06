import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { TextInput } from '@/components/ui/TextInput'
import type { NewTodoInput } from '@/lib/storage/store'
import type { RecurrenceFreq, Todo, TodoCategory, TodoPriority } from '@/lib/storage/schema'
import { CATEGORIES, CATEGORY_LABEL, PRIORITIES, PRIORITY_META } from './meta'

interface TodoComposerProps {
  editing: Todo | null
  /** Prefills the due date when adding from a calendar day. */
  presetDueDay?: string
  onSubmit: (input: NewTodoInput) => void
  onCancelEdit: () => void
}

export function TodoComposer({ editing, presetDueDay, onSubmit, onCancelEdit }: TodoComposerProps) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [category, setCategory] = useState<TodoCategory>('personal')
  const [dueDay, setDueDay] = useState('')
  const [recurrence, setRecurrence] = useState<RecurrenceFreq | ''>('')
  const [tagsText, setTagsText] = useState('')

  // Sync from props during render (not in effects), per the React
  // "adjusting state when props change" pattern.
  const [prevEditing, setPrevEditing] = useState<Todo | null>(null)
  if (editing !== prevEditing) {
    setPrevEditing(editing)
    if (editing) {
      setExpanded(true)
      setTitle(editing.title)
      setNotes(editing.notes ?? '')
      setPriority(editing.priority)
      setCategory(editing.category)
      setDueDay(editing.dueDay ?? '')
      setRecurrence(editing.recurrence ?? '')
      setTagsText(editing.tags.join(', '))
    }
  }

  const [prevPreset, setPrevPreset] = useState<string | undefined>(undefined)
  if (presetDueDay !== prevPreset) {
    setPrevPreset(presetDueDay)
    if (presetDueDay) {
      setExpanded(true)
      setDueDay(presetDueDay)
    }
  }

  function reset() {
    setExpanded(false)
    setTitle('')
    setNotes('')
    setPriority('medium')
    setCategory('personal')
    setDueDay('')
    setRecurrence('')
    setTagsText('')
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const tags = [...new Set(tagsText.split(',').map((t) => t.trim()).filter(Boolean))]
    // Keys are always present (undefined clears them on edit; persist drops undefined).
    onSubmit({
      title: trimmed,
      notes: notes.trim() || undefined,
      priority,
      category,
      tags,
      dueDay: dueDay || undefined,
      recurrence: recurrence && dueDay ? recurrence : undefined,
    })
    reset()
    if (editing) onCancelEdit()
  }

  function cancel() {
    reset()
    if (editing) onCancelEdit()
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-3">
      <TextInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') cancel()
        }}
        placeholder={editing ? 'Edit todo…' : 'Add a todo…'}
        aria-label={editing ? 'Edit todo title' : 'New todo title'}
        className="w-full"
      />
      {expanded && (
        <>
          <TextInput
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') cancel()
            }}
            placeholder="Notes (optional)"
            aria-label="Notes"
            className="mt-2 w-full"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              aria-label="Priority"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </Select>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as TodoCategory)}
              aria-label="Category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
            <TextInput
              type="date"
              value={dueDay}
              onChange={(e) => {
                setDueDay(e.target.value)
                if (!e.target.value) setRecurrence('')
              }}
              aria-label="Due date"
            />
            <Select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceFreq | '')}
              disabled={!dueDay}
              title={dueDay ? undefined : 'Set a due date to make this repeat'}
              aria-label="Repeat"
            >
              <option value="">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
            <TextInput
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              placeholder="tags, comma separated"
              aria-label="Tags"
              className="min-w-40 flex-1"
            />
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={cancel}
                className="rounded-md px-3 py-1.5 text-sm text-text-2 outline-none transition-colors hover:bg-surface-2 hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!title.trim()}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              >
                {editing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
