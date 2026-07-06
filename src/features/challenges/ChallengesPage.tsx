import { useState } from 'react'
import { Check, ExternalLink, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TextInput } from '@/components/ui/TextInput'
import {
  dueDayFor,
  milestonePct,
  monthChallengeId,
  newRepoUrl,
  repoNameFor,
  rubricScore,
  templateBySlug,
  templateFor,
  weekChallengeId,
} from '@/lib/challenges/challenges'
import { createRepo } from '@/lib/github/client'
import { useGithubToken } from '@/lib/github/token'
import { useAppStore } from '@/lib/storage/store'
import type { ChallengeTemplate } from '@/data/challengeTemplates'
import type { ChallengeKind, ChallengeRecord } from '@/lib/storage/schema'

function scoreVariant(score: number): BadgeVariant {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'neutral'
}

function CheckRow({
  checked,
  label,
  sub,
  onToggle,
}: {
  checked: boolean
  label: string
  sub?: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          checked
            ? 'border-success bg-success/20 text-success'
            : 'border-border text-transparent group-hover:border-text-3'
        }`}
      >
        <Check className="size-3" aria-hidden />
      </span>
      <span className={`flex-1 text-sm ${checked ? 'text-text-3 line-through' : ''}`}>{label}</span>
      {sub && <span className="shrink-0 text-xs text-text-3">{sub}</span>}
    </button>
  )
}

function ChallengeCard({
  kind,
  periodId,
  template,
  dueDay,
  record,
}: {
  kind: ChallengeKind
  periodId: string
  template: ChallengeTemplate
  dueDay: string
  record?: ChallengeRecord
}) {
  const startChallenge = useAppStore((s) => s.startChallenge)
  const toggleItem = useAppStore((s) => s.toggleChallengeItem)
  const setRepo = useAppStore((s) => s.setChallengeRepo)
  const completeChallenge = useAppStore((s) => s.completeChallenge)
  const token = useGithubToken((s) => s.token)

  const [repoInput, setRepoInput] = useState('')
  const [repoStatus, setRepoStatus] = useState('')

  const repoName = repoNameFor(kind, new Date(`${dueDay}T00:00:00`), template.slug)
  const dueText = new Date(`${dueDay}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  function handleCreateRepo() {
    setRepoStatus('Creating repository…')
    createRepo(repoName, template.summary, token)
      .then((r) => {
        setRepo(periodId, r.html_url)
        setRepoStatus('')
      })
      .catch((e: unknown) =>
        setRepoStatus(e instanceof Error ? `Could not create repo: ${e.message}` : 'Could not create repo.'),
      )
  }

  function handleComplete() {
    if (!record) return
    const score = rubricScore(record, template)
    const pct = milestonePct(record, template)
    if (
      !window.confirm(
        `Archive "${template.title}" with a rubric score of ${score}% and ${pct}% of milestones done?`,
      )
    )
      return
    completeChallenge(periodId, {
      score,
      completionPct: pct,
      label: `${template.title} (${periodId})`,
    })
  }

  const header = (
    <div className="flex items-center justify-between px-5 pt-4">
      <div className="flex items-center gap-2">
        <Badge variant="accent">{kind === 'week' ? 'Weekly' : 'Monthly'}</Badge>
        <span className="font-mono text-xs text-text-3">{periodId}</span>
      </div>
      <span className="text-xs text-text-3">Due {dueText}</span>
    </div>
  )

  if (!record) {
    return (
      <Card className="pb-5">
        {header}
        <div className="px-5 pt-3">
          <h2 className="font-medium">{template.title}</h2>
          <p className="mt-1 text-sm text-text-2">{template.summary}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-3">
            Requirements
          </p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-text-2">
            {template.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-text-3">
            Deliverables
          </p>
          <p className="mt-1 text-sm text-text-2">{template.deliverables.join(' · ')}</p>
          <p className="mt-3 text-xs text-text-3">Testing: {template.testing}</p>
          <Button
            className="mt-4"
            onClick={() => startChallenge({ id: periodId, kind, templateSlug: template.slug, dueDay })}
          >
            Start this challenge
          </Button>
        </div>
      </Card>
    )
  }

  if (record.status === 'completed') {
    return (
      <Card className="pb-5">
        {header}
        <div className="flex flex-col items-center gap-2 px-5 pt-6 text-center">
          <Trophy className="size-8 text-warning" aria-hidden />
          <h2 className="font-medium">{template.title} — completed</h2>
          <div className="flex items-center gap-2">
            <Badge variant={scoreVariant(record.score ?? 0)}>Score {record.score}%</Badge>
            <Badge>{record.completionPct}% milestones</Badge>
          </div>
          {record.repoUrl && (
            <a
              href={record.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
            >
              Repository
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
          <p className="text-xs text-text-3">
            The next {kind === 'week' ? 'weekly challenge arrives Monday' : 'monthly challenge arrives on the 1st'}.
          </p>
        </div>
      </Card>
    )
  }

  const pct = milestonePct(record, template)
  const score = rubricScore(record, template)

  return (
    <Card className="pb-5">
      {header}
      <div className="px-5 pt-3">
        <h2 className="font-medium">{template.title}</h2>
        <p className="mt-1 text-sm text-text-2">{template.summary}</p>

        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-3">Milestones</p>
          <ProgressBar value={pct} max={100} className="w-24" />
          <span className="font-mono text-xs tabular-nums text-text-3">{pct}%</span>
        </div>
        <div className="mt-1">
          {template.milestones.map((m) => (
            <CheckRow
              key={m.id}
              checked={record.milestonesDone.includes(m.id)}
              label={m.label}
              onToggle={() => toggleItem(periodId, 'milestonesDone', m.id)}
            />
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-3">Repository</p>
        {record.repoUrl ? (
          <a
            href={record.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            {record.repoUrl.replace('https://github.com/', '')}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {token ? (
              <Button onClick={handleCreateRepo}>Create {repoName}</Button>
            ) : (
              <a
                href={newRepoUrl(repoName, template.summary)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
              >
                Create {repoName} on GitHub
              </a>
            )}
            <TextInput
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="…or paste the repo URL"
              aria-label="Repository URL"
              className="min-w-52 flex-1"
            />
            <Button
              variant="ghost"
              disabled={!repoInput.trim()}
              onClick={() => {
                setRepo(periodId, repoInput.trim())
                setRepoInput('')
              }}
            >
              Save
            </Button>
          </div>
        )}
        {repoStatus && <p className="mt-1 text-xs text-text-2">{repoStatus}</p>}

        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-3">
            Rubric (self-score)
          </p>
          <span className="font-mono text-xs tabular-nums text-text-3">{score}%</span>
        </div>
        <div className="mt-1">
          {template.rubric.map((r) => (
            <CheckRow
              key={r.id}
              checked={record.rubricChecked.includes(r.id)}
              label={r.label}
              sub={`${r.points} pts`}
              onToggle={() => toggleItem(periodId, 'rubricChecked', r.id)}
            />
          ))}
        </div>

        <Button className="mt-4" onClick={handleComplete}>
          Complete and archive
        </Button>
      </div>
    </Card>
  )
}

export function ChallengesPage() {
  const challenges = useAppStore((s) => s.challenges)
  const now = new Date()

  const weekId = weekChallengeId(now)
  const monthId = monthChallengeId(now)
  const weekRecord = challenges.find((c) => c.id === weekId)
  const monthRecord = challenges.find((c) => c.id === monthId)

  const history = challenges
    .filter((c) => c.status === 'completed')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))

  return (
    <>
      <PageHeader
        title="Challenges"
        description="One project a week, one bigger build a month — scored and archived."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChallengeCard
          kind="week"
          periodId={weekId}
          template={weekRecord ? (templateBySlug(weekRecord.templateSlug) ?? templateFor('week', now)) : templateFor('week', now)}
          dueDay={weekRecord?.dueDay ?? dueDayFor('week', now)}
          record={weekRecord}
        />
        <ChallengeCard
          kind="month"
          periodId={monthId}
          template={monthRecord ? (templateBySlug(monthRecord.templateSlug) ?? templateFor('month', now)) : templateFor('month', now)}
          dueDay={monthRecord?.dueDay ?? dueDayFor('month', now)}
          record={monthRecord}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text-2">History</h2>
        {history.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="text-sm text-text-2">
              Completed challenges are archived here with their scores.
            </p>
          </Card>
        ) : (
          <Card className="divide-y divide-border-subtle">
            {history.map((c) => {
              const t = templateBySlug(c.templateSlug)
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Badge variant="accent">{c.kind === 'week' ? 'Weekly' : 'Monthly'}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {t?.title ?? c.templateSlug}
                  </span>
                  <span className="font-mono text-xs text-text-3">{c.id}</span>
                  <Badge variant={scoreVariant(c.score ?? 0)}>Score {c.score}%</Badge>
                  <span className="text-xs text-text-3">{c.completionPct}% milestones</span>
                  {c.repoUrl && (
                    <a
                      href={c.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open repository"
                      className="rounded-md p-1 text-text-3 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </section>
    </>
  )
}
