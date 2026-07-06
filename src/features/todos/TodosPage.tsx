import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, GripVertical, List, X } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { TextInput } from '@/components/ui/TextInput'
import { localDayKey } from '@/lib/dates'
import {
  DEFAULT_FILTERS,
  filterTodos,
  isOverdue,
  sortTodos,
  type TodoFilters,
  type TodoSortMode,
  type TodoStatusFilter,
} from '@/lib/todos/filter'
import { useAppStore, type NewTodoInput } from '@/lib/storage/store'
import type { Todo, TodoCategory, TodoPriority } from '@/lib/storage/schema'
import { CalendarView } from './CalendarView'
import { TodoComposer } from './TodoComposer'
import { TodoRow } from './TodoRow'
import { CATEGORIES, CATEGORY_LABEL, PRIORITIES, PRIORITY_META } from './meta'

type ViewMode = 'list' | 'calendar'

interface RowProps {
  todo: Todo
  todayKey: string
  onToggle: (id: string, next: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
}

function SortableRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.todo.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-70' : undefined}
    >
      <TodoRow
        {...props}
        dragHandle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="-ml-1 cursor-grab touch-none rounded p-1 text-text-3 opacity-0 outline-none transition-opacity hover:text-text focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing group-hover:opacity-100"
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        }
      />
    </div>
  )
}

export function TodosPage() {
  const todos = useAppStore((s) => s.todos)
  const addTodo = useAppStore((s) => s.addTodo)
  const updateTodo = useAppStore((s) => s.updateTodo)
  const deleteTodo = useAppStore((s) => s.deleteTodo)
  const completeTodo = useAppStore((s) => s.completeTodo)
  const uncompleteTodo = useAppStore((s) => s.uncompleteTodo)
  const moveTodo = useAppStore((s) => s.moveTodo)

  const [view, setView] = useState<ViewMode>('list')
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<TodoSortMode>('manual')
  const [editing, setEditing] = useState<Todo | null>(null)
  const [presetDueDay, setPresetDueDay] = useState<string | undefined>(undefined)
  const [calMonth, setCalMonth] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const todayKey = localDayKey(new Date())
  const open = todos.filter((t) => !t.completedAt)
  const overdueCount = open.filter((t) => isOverdue(t, todayKey)).length
  const doneToday = todos.filter(
    (t) => t.completedAt && localDayKey(new Date(t.completedAt)) === todayKey,
  ).length

  const visible = sortTodos(filterTodos(todos, filters), sort)
  const canDrag = sort === 'manual'

  function handleToggle(id: string, next: boolean) {
    if (next) completeTodo(id)
    else uncompleteTodo(id)
  }

  function handleSubmit(input: NewTodoInput) {
    if (editing) {
      updateTodo(editing.id, input)
    } else {
      addTodo(input)
    }
    setPresetDueDay(undefined)
  }

  function handleTagClick(tag: string) {
    setFilters((f) => ({ ...f, tag: f.tag === tag ? null : tag }))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) moveTodo(String(active.id), String(over.id))
  }

  const rowProps = {
    todayKey,
    onToggle: handleToggle,
    onEdit: setEditing,
    onDelete: deleteTodo,
    onTagClick: handleTagClick,
  }

  return (
    <>
      <PageHeader
        title="Todos"
        description={`${open.length} open · ${overdueCount} overdue · ${doneToday} done today`}
      >
        <div className="flex overflow-hidden rounded-md border border-border">
          {(
            [
              { mode: 'list' as const, icon: List, label: 'List view' },
              { mode: 'calendar' as const, icon: CalendarDays, label: 'Calendar view' },
            ]
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              aria-label={label}
              onClick={() => setView(mode)}
              className={`px-3 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                view === mode ? 'bg-surface-2 text-text' : 'text-text-2 hover:text-text'
              }`}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mb-4">
        <TodoComposer
          editing={editing}
          presetDueDay={presetDueDay}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditing(null)}
        />
      </div>

      {view === 'calendar' ? (
        <CalendarView
          todos={todos}
          month={calMonth}
          todayKey={todayKey}
          selectedDay={selectedDay}
          onMonthChange={setCalMonth}
          onSelectDay={(d) => setSelectedDay(d === selectedDay ? null : d)}
          onToggle={handleToggle}
          onAddForDay={(d) => {
            setSelectedDay(d)
            setPresetDueDay(d)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onEdit={setEditing}
          onDelete={deleteTodo}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <TextInput
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              placeholder="Search todos…"
              aria-label="Search todos"
              className="min-w-48 flex-1"
            />
            <div className="flex overflow-hidden rounded-md border border-border">
              {(['open', 'done', 'all'] as TodoStatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={filters.status === s}
                  onClick={() => setFilters((f) => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                    filters.status === s ? 'bg-surface-2 text-text' : 'text-text-2 hover:text-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as TodoSortMode)}
              aria-label="Sort"
            >
              <option value="manual">Manual order</option>
              <option value="priority">By priority</option>
              <option value="due">By due date</option>
              <option value="created">Newest first</option>
            </Select>
            <Select
              value={filters.priority}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priority: e.target.value as TodoPriority | 'all' }))
              }
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value as TodoCategory | 'all' }))
              }
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </div>

          {filters.tag && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, tag: null }))}
              className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent outline-none transition-colors hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
            >
              #{filters.tag}
              <X className="size-3" aria-hidden />
            </button>
          )}

          {todos.length === 0 ? (
            <Card className="px-6 py-12 text-center">
              <p className="text-sm text-text-2">No todos yet — add your first above.</p>
            </Card>
          ) : visible.length === 0 ? (
            <Card className="px-6 py-12 text-center">
              <p className="text-sm text-text-2">Nothing matches these filters.</p>
            </Card>
          ) : canDrag ? (
            <Card className="p-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visible.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visible.map((t) => (
                    <SortableRow key={t.id} todo={t} {...rowProps} />
                  ))}
                </SortableContext>
              </DndContext>
            </Card>
          ) : (
            <Card className="p-2">
              {visible.map((t) => (
                <TodoRow key={t.id} todo={t} {...rowProps} />
              ))}
            </Card>
          )}
        </>
      )}
    </>
  )
}
