import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CAREER } from '@/data/career'
import { useAppStore } from '@/lib/storage/store'
import { ExternalA, PRIORITY_VARIANT, StatusSelect, labelize } from './shared'

export function ChecklistTab() {
  const checks = useAppStore((s) => s.career.checks)
  const setCareerCheck = useAppStore((s) => s.setCareerCheck)
  const groups = [
    { key: 'urgent', label: 'Urgent' },
    { key: 'high', label: 'High priority' },
    { key: 'ongoing', label: 'Ongoing' },
  ] as const
  const done = CAREER.tasks.filter((t) => checks[t.id]).length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-3">
        {done}/{CAREER.tasks.length} complete — one-time career actions from your original plan.
      </p>
      {groups.map((g) => (
        <Card key={g.key} className="p-2">
          <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-text-3">
            {g.label}
          </p>
          {CAREER.tasks
            .filter((t) => t.priority === g.key)
            .map((t) => {
              const isDone = !!checks[t.id]
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={isDone}
                  onClick={() => setCareerCheck(t.id, !isDone)}
                  className="group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isDone
                        ? 'border-success bg-success/20 text-success'
                        : 'border-border text-transparent group-hover:border-text-3'
                    }`}
                  >
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${isDone ? 'text-text-3 line-through' : ''}`}>
                      {t.text}
                    </span>
                    {t.meta && <span className="block text-xs text-text-3">{t.meta}</span>}
                  </span>
                </button>
              )
            })}
        </Card>
      ))}
    </div>
  )
}

export function GapsTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {CAREER.gaps.map((g) => (
        <Card key={g.id} className="p-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm font-medium">{g.name}</span>
            <Badge variant={PRIORITY_VARIANT[g.severity]}>{labelize(g.severity)}</Badge>
          </div>
          <p className="mt-2 text-xs text-text-3">{g.idt}</p>
          <p className="mt-2 text-sm text-text-2">{g.howToClose}</p>
        </Card>
      ))}
    </div>
  )
}

export function CertsTab() {
  const variant = { yes: 'success', later: 'warning', verify: 'accent', no: 'neutral' } as const
  return (
    <Card className="divide-y divide-border-subtle">
      {CAREER.certs.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-text-3">
              {c.issuer} · {c.cost} · {c.timeline}
            </p>
            {c.notes && <p className="mt-1 max-w-2xl text-xs text-text-2">{c.notes}</p>}
          </div>
          <Badge variant={variant[c.recommended]}>{labelize(c.recommended)}</Badge>
          <StatusSelect kind="cert" id={c.id} />
        </div>
      ))}
    </Card>
  )
}

export function ProjectsTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {CAREER.projects.map((p) => (
        <Card key={p.id} className="p-4">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
            <StatusSelect kind="project" id={p.id} />
          </div>
          <p className="mt-1 text-xs text-text-3">
            {p.tech} · {p.timeline}
          </p>
          <p className="mt-2 text-sm text-text-2">{p.description}</p>
          {p.satisfies && (
            <p className="mt-2 text-xs text-text-3">Satisfies: {p.satisfies}</p>
          )}
          {p.github && <ExternalA href={p.github}>Repository</ExternalA>}
        </Card>
      ))}
    </div>
  )
}
